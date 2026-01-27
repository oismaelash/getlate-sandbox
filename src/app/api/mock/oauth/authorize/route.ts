import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { socialAccountId, profileId } = body;

    if (!socialAccountId || typeof socialAccountId !== "string") {
      return NextResponse.json(
        { error: "socialAccountId is required" },
        { status: 400 }
      );
    }

    if (!profileId || typeof profileId !== "string") {
      return NextResponse.json(
        { error: "profileId is required" },
        { status: 400 }
      );
    }

    // Verify that the profile exists
    const profile = await db.profile.findUnique({
      where: { getlateId: profileId },
    });

    if (!profile) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      );
    }

    // Verify that the social account exists
    const socialAccount = await db.socialAccount.findUnique({
      where: { getlateId: socialAccountId },
    });

    if (!socialAccount) {
      return NextResponse.json(
        { error: "Social account not found" },
        { status: 404 }
      );
    }

    // Update the social account to assign it to the new profile
    const updatedAccount = await db.socialAccount.update({
      where: { getlateId: socialAccountId },
      data: {
        profileId: profileId,
        status: "active",
      },
    });

    // Return in GetLate format
    return NextResponse.json({
      success: true,
      account: {
        _id: updatedAccount.getlateId,
        platform: updatedAccount.platform,
        username: updatedAccount.username || "",
        profileId: updatedAccount.profileId,
        isActive: updatedAccount.status === "active",
      },
    });
  } catch (error) {
    console.error("[API] Error authorizing OAuth:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}


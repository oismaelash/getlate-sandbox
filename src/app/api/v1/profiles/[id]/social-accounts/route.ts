import { NextRequest, NextResponse } from "next/server";
import { validateApiKey } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await validateApiKey(request);
    if (!auth.valid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const profileId = id;

    const profile = await db.profile.findUnique({
      where: { getlateId: profileId },
      include: {
        socialAccounts: true,
      },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const social_accounts = profile.socialAccounts.map((account) => ({
      id: account.getlateId,
      platform: account.platform,
      username: account.username || undefined,
      status: account.status || "active",
      created_at: account.createdAt.toISOString(),
    }));

    return NextResponse.json({
      social_accounts,
    });
  } catch (error) {
    console.error("[API] Error listing social accounts:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


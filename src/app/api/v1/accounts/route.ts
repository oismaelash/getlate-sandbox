import { NextRequest, NextResponse } from "next/server";
import { validateApiKey } from "@/lib/auth";
import { db } from "@/lib/db";
import { randomBytes } from "crypto";
import { triggerWebhook } from "@/lib/webhooks";

export async function GET(request: NextRequest) {
  try {
    const auth = await validateApiKey(request);
    if (!auth.valid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const profileId = searchParams.get("profileId");

    let accounts;

    if (profileId) {
      const profile = await db.profile.findUnique({
        where: { getlateId: profileId },
        include: {
          socialAccounts: true,
        },
      });

      if (!profile) {
        return NextResponse.json({ error: "Profile not found" }, { status: 404 });
      }

      accounts = profile.socialAccounts;
    } else {
      accounts = await db.socialAccount.findMany();
    }

    const formattedAccounts = accounts.map((account) => ({
      _id: account.getlateId,
      platform: account.platform,
      username: account.username || "",
      profileId: account.profileId,
      isActive: account.status === "active",
    }));

    return NextResponse.json({
      accounts: formattedAccounts,
    });
  } catch (error) {
    console.error("[API] Error listing accounts:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await validateApiKey(request);
    if (!auth.valid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { profileId, platform, username, displayName, profilePicture, profileUrl } = body;

    if (!profileId || typeof profileId !== "string") {
      return NextResponse.json({ error: "profileId is required" }, { status: 400 });
    }

    if (!platform || typeof platform !== "string") {
      return NextResponse.json({ error: "platform is required" }, { status: 400 });
    }

    // Verificar se profile existe
    const profile = await db.profile.findUnique({
      where: { getlateId: profileId },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Gerar getlateId único
    const getlateId = `account_${randomBytes(16).toString("hex")}`;

    const account = await db.socialAccount.create({
      data: {
        getlateId,
        profileId: profile.getlateId,
        platform,
        username: username || null,
        status: "active",
        metadata: {
          displayName: displayName || null,
          profilePicture: profilePicture || null,
          profileUrl: profileUrl || null,
        },
      },
    });

    // Trigger account.connected webhook
    const metadata = account.metadata as {
      displayName?: string | null;
      profilePicture?: string | null;
      profileUrl?: string | null;
    } | null;

    triggerWebhook("account.connected", {
      account_id: account.getlateId,
      profile_id: account.profileId,
      platform: account.platform,
      platform_user_id: account.getlateId, // Mock - em produção seria o ID real da plataforma
      username: account.username || null,
      display_name: metadata?.displayName || null,
      profile_image_url: metadata?.profilePicture || null,
      account_type: "business", // Mock - em produção seria determinado pela plataforma
      connected_at: account.createdAt.toISOString(),
    });

    // Retornar no formato GetLate
    return NextResponse.json({
      account: {
        _id: account.getlateId,
        platform: account.platform,
        username: account.username || "",
        profileId: account.profileId,
        isActive: account.status === "active",
      },
    });
  } catch (error) {
    console.error("[API] Error creating account:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const accounts = await db.socialAccount.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        profile: true,
      },
    });

    // Mapear getlateId para _id para compatibilidade com frontend
    const mappedAccounts = accounts.map((a) => ({
      ...a,
      _id: a.getlateId,
      profile: a.profile ? {
        ...a.profile,
        _id: a.profile.getlateId,
      } : null,
    }));

    return NextResponse.json({ accounts: mappedAccounts });
  } catch (error) {
    console.error("[API] Error listing accounts:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { profileId, platform, username, displayName, profilePicture, profileUrl } = body;

    if (!profileId || typeof profileId !== "string") {
      return NextResponse.json({ error: "profileId is required" }, { status: 400 });
    }

    if (!platform || typeof platform !== "string") {
      return NextResponse.json({ error: "platform is required" }, { status: 400 });
    }

    // Usar a API GetLate para criar
    const apiKeys = await db.apiKey.findMany({ take: 1 });
    if (apiKeys.length === 0) {
      return NextResponse.json(
        { error: "Nenhuma API key encontrada. Crie uma API key primeiro." },
        { status: 400 }
      );
    }

    const apiKey = apiKeys[0].key;

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/v1/accounts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        profileId,
        platform,
        username,
        displayName,
        profilePicture,
        profileUrl,
      }),
    });

    if (!res.ok) {
      const error = await res.text();
      return NextResponse.json({ error }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json({ account: data.account });
  } catch (error) {
    console.error("[API] Error creating account:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


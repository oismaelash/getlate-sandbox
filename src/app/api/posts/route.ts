import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const posts = await db.post.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        socialAccount: {
          include: {
            profile: true,
          },
        },
      },
    });

    // Mapear getlateId para _id para compatibilidade com frontend
    const mappedPosts = posts.map((p) => ({
      ...p,
      _id: p.getlateId,
      socialAccount: p.socialAccount ? {
        ...p.socialAccount,
        _id: p.socialAccount.getlateId,
        profile: p.socialAccount.profile ? {
          ...p.socialAccount.profile,
          _id: p.socialAccount.profile.getlateId,
        } : null,
      } : null,
    }));

    return NextResponse.json({ posts: mappedPosts });
  } catch (error) {
    console.error("[API] Error listing posts:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, mediaItems, accountId, publishNow, scheduledAt, timezone } = body;

    if (!mediaItems || !Array.isArray(mediaItems) || mediaItems.length === 0) {
      return NextResponse.json({ error: "mediaItems is required" }, { status: 400 });
    }

    if (!accountId) {
      return NextResponse.json({ error: "accountId is required" }, { status: 400 });
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

    const platforms = [
      {
        platform: "instagram",
        accountId: accountId,
        platformSpecificData: {
          contentType: null, // Será inferido no backend
          collaborators: [],
          userTags: [],
        },
      },
    ];

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/v1/posts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        content,
        mediaItems,
        platforms,
        publishNow: publishNow === true,
        scheduledFor: scheduledAt || undefined,
        timezone: timezone || undefined,
      }),
    });

    if (!res.ok) {
      const error = await res.text();
      return NextResponse.json({ error }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json({ post: data.post });
  } catch (error) {
    console.error("[API] Error creating post:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


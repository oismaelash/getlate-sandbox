import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const profiles = await db.profile.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: {
            socialAccounts: true,
          },
        },
      },
    });

    // Mapear getlateId para _id para compatibilidade com frontend
    const mappedProfiles = profiles.map((p) => ({
      ...p,
      _id: p.getlateId,
    }));

    return NextResponse.json({ profiles: mappedProfiles });
  } catch (error) {
    console.error("[API] Error listing profiles:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description } = body;

    if (!name || typeof name !== "string") {
      return NextResponse.json({ error: "name is required" }, { status: 400 });
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

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/v1/profiles`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ name, description }),
    });

    if (!res.ok) {
      const error = await res.text();
      return NextResponse.json({ error }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json({ profile: data.profile });
  } catch (error) {
    console.error("[API] Error creating profile:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


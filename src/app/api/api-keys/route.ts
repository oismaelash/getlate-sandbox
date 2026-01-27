import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { randomBytes } from "crypto";

export async function GET() {
  try {
    const apiKeys = await db.apiKey.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ apiKeys });
  } catch (error) {
    console.error("[API] Error listing API keys:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name } = body;

    if (!name || typeof name !== "string") {
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    }

    // Gerar chave aleatória
    const key = `gl_${randomBytes(32).toString("hex")}`;

    const apiKey = await db.apiKey.create({
      data: {
        key,
        name,
      },
    });

    return NextResponse.json({ apiKey });
  } catch (error) {
    console.error("[API] Error creating API key:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


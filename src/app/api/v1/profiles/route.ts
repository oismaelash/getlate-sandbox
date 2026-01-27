import { NextRequest, NextResponse } from "next/server";
import { validateApiKey } from "@/lib/auth";
import { db } from "@/lib/db";
import { randomBytes } from "crypto";

export async function POST(request: NextRequest) {
  try {
    const auth = await validateApiKey(request);
    if (!auth.valid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, description } = body;

    if (!name || typeof name !== "string") {
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    }

    // Gerar getlateId único
    const getlateId = `profile_${randomBytes(16).toString("hex")}`;

    const profile = await db.profile.create({
      data: {
        getlateId,
        name,
        description: description || null,
      },
    });

    // Retornar no formato GetLate
    return NextResponse.json({
      profile: {
        _id: profile.getlateId,
        name: profile.name,
        description: profile.description,
        createdAt: profile.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("[API] Error creating profile:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


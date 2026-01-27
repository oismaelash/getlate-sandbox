import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// PUT handler for updating a profile by ID
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const profileId = id;
    const body = await request.json();
    const { name, description } = body;

    if (!name || typeof name !== "string") {
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    }

    // Usar a API GetLate para atualizar
    const apiKeys = await db.apiKey.findMany({ take: 1 });
    if (apiKeys.length === 0) {
      return NextResponse.json(
        { error: "Nenhuma API key encontrada. Crie uma API key primeiro." },
        { status: 400 }
      );
    }

    const apiKey = apiKeys[0].key;

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/v1/profiles/${profileId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ name, description }),
      }
    );

    if (!res.ok) {
      const error = await res.text();
      return NextResponse.json({ error }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json({ profile: data.profile });
  } catch (error) {
    console.error("[API] Error updating profile:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const profileId = id;

    // Usar a API GetLate para deletar
    const apiKeys = await db.apiKey.findMany({ take: 1 });
    if (apiKeys.length === 0) {
      return NextResponse.json(
        { error: "Nenhuma API key encontrada. Crie uma API key primeiro." },
        { status: 400 }
      );
    }

    const apiKey = apiKeys[0].key;

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/v1/profiles/${profileId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );

    if (!res.ok) {
      if (res.status === 404) {
        return NextResponse.json({ message: "Profile not found" }, { status: 404 });
      }
      // Tentar obter a mensagem de erro da resposta
      let errorMessage = "Erro ao deletar profile";
      try {
        const errorData = await res.json();
        errorMessage = errorData.error || errorMessage;
      } catch {
        // Se não conseguir parsear JSON, usar o texto da resposta
        const errorText = await res.text();
        if (errorText) {
          try {
            const parsed = JSON.parse(errorText);
            errorMessage = parsed.error || errorMessage;
          } catch {
            errorMessage = errorText || errorMessage;
          }
        }
      }
      return NextResponse.json({ error: errorMessage }, { status: res.status });
    }

    return NextResponse.json({ message: "Profile deleted successfully" });
  } catch (error) {
    console.error("[API] Error deleting profile:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


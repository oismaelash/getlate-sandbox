import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const postId = id;

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
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/v1/posts/${postId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );

    if (!res.ok && res.status !== 404) {
      const error = await res.text();
      return NextResponse.json({ error }, { status: res.status });
    }

    return NextResponse.json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("[API] Error deleting post:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


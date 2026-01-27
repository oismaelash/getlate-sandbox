import { NextRequest, NextResponse } from "next/server";
import { validateApiKey } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PUT(
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
    const body = await request.json();
    const { name, description } = body;

    if (!name || typeof name !== "string") {
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    }

    // Verificar se o profile existe
    const existingProfile = await db.profile.findUnique({
      where: { getlateId: profileId },
    });

    if (!existingProfile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Atualizar o profile diretamente no banco
    const profile = await db.profile.update({
      where: { getlateId: profileId },
      data: {
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
    console.error("[API] Error updating profile:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
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
        _count: {
          select: {
            socialAccounts: true,
          },
        },
      },
    });

    if (!profile) {
      // Idempotente - 404 é tratado como sucesso
      return NextResponse.json({ message: "Profile not found" }, { status: 404 });
    }

    // Verificar se há social accounts conectadas
    if (profile._count.socialAccounts > 0) {
      return NextResponse.json(
        { 
          error: "Não é possível excluir o profile. Exclua primeiro todas as contas sociais conectadas." 
        },
        { status: 400 }
      );
    }

    await db.profile.delete({
      where: { getlateId: profileId },
    });

    return NextResponse.json({ message: "Profile deleted successfully" });
  } catch (error) {
    console.error("[API] Error deleting profile:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


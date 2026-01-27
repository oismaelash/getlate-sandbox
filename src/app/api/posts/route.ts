import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  validateCharLimit,
  hasPdf,
  supportsPdf,
} from "@/lib/post-validation";
import type { MediaItem } from "@/lib/post-utils";

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
    const { content, mediaItems, profileIds, publishNow, scheduledAt, timezone } = body;

    // Validações básicas
    if (!mediaItems || !Array.isArray(mediaItems) || mediaItems.length === 0) {
      return NextResponse.json({ error: "mediaItems is required" }, { status: 400 });
    }

    if (!profileIds || !Array.isArray(profileIds) || profileIds.length === 0) {
      return NextResponse.json({ error: "profileIds is required and must be a non-empty array" }, { status: 400 });
    }

    // Validar agendamento
    if (!publishNow && (!scheduledAt || !timezone)) {
      return NextResponse.json(
        { error: "scheduledAt and timezone are required when publishNow is false" },
        { status: 400 }
      );
    }

    // Buscar API key
    const apiKeys = await db.apiKey.findMany({ take: 1 });
    if (apiKeys.length === 0) {
      return NextResponse.json(
        { error: "Nenhuma API key encontrada. Crie uma API key primeiro." },
        { status: 400 }
      );
    }
    const apiKey = apiKeys[0].key;

    // Buscar perfis e suas contas
    const profiles = await db.profile.findMany({
      where: {
        getlateId: { in: profileIds },
      },
      include: {
        socialAccounts: {
          where: {
            status: "active",
          },
        },
      },
    });

    if (profiles.length === 0) {
      return NextResponse.json(
        { error: "Nenhum perfil encontrado com os IDs fornecidos" },
        { status: 404 }
      );
    }

    // Coletar todas as contas dos perfis
    const allAccounts = profiles.flatMap((profile) =>
      profile.socialAccounts.map((account) => ({
        ...account,
        profileId: profile.getlateId,
      }))
    );

    if (allAccounts.length === 0) {
      return NextResponse.json(
        { error: "Nenhuma conta ativa encontrada nos perfis selecionados" },
        { status: 400 }
      );
    }

    // Verificar se há PDFs
    const hasPdfFiles = hasPdf(mediaItems as MediaItem[]);

    // Filtrar contas que não suportam PDF se houver PDFs
    let validAccounts = allAccounts;
    const skippedAccounts: Array<{ accountId: string; platform: string; reason: string }> = [];

    if (hasPdfFiles) {
      const beforeFilter = validAccounts.length;
      validAccounts = validAccounts.filter((account) => supportsPdf(account.platform));
      const filtered = allAccounts.filter((account) => !supportsPdf(account.platform));
      skippedAccounts.push(
        ...filtered.map((account) => ({
          accountId: account.getlateId,
          platform: account.platform,
          reason: "PDF not supported",
        }))
      );

      if (validAccounts.length === 0) {
        return NextResponse.json({
          success: false,
          error: "No valid accounts found",
          details: "All accounts were filtered out because they don't support PDF files",
          skipped: skippedAccounts,
        });
      }
    }

    // Validar limites de caracteres para cada conta
    const validationErrors: Array<{
      accountId: string;
      platform: string;
      error: string;
      details: { limit: number; actual: number; over: number };
    }> = [];

    if (content) {
      for (const account of validAccounts) {
        const validation = validateCharLimit(content, account.platform);
        if (!validation.valid && validation.limit !== null) {
          validationErrors.push({
            accountId: account.getlateId,
            platform: account.platform,
            error: "Content exceeds character limit",
            details: {
              limit: validation.limit,
              actual: validation.actual,
              over: validation.over,
            },
          });
        }
      }
    }

    // Remover contas com erros de validação
    const accountsToCreate = validAccounts.filter(
      (account) =>
        !validationErrors.some((error) => error.accountId === account.getlateId)
    );

    if (accountsToCreate.length === 0) {
      return NextResponse.json({
        success: false,
        error: "No valid accounts found",
        details: "All accounts failed validation (character limit exceeded)",
        errors: validationErrors,
        skipped: skippedAccounts,
      });
    }

    // Criar posts para cada conta válida
    const createdPosts: Array<{
      _id: string;
      accountId: string;
      platform: string;
      status: string;
    }> = [];
    const creationErrors: Array<{
      accountId: string;
      platform: string;
      error: string;
    }> = [];

    for (const account of accountsToCreate) {
      try {
        const platforms = [
          {
            platform: account.platform.toLowerCase(),
            accountId: account.getlateId,
            platformSpecificData: {
              contentType: null, // Será inferido no backend
              collaborators: [],
              userTags: [],
            },
          },
        ];

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/v1/posts`,
          {
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
          }
        );

        if (res.ok) {
          const data = await res.json();
          createdPosts.push({
            _id: data.post?.id || data.post?._id,
            accountId: account.getlateId,
            platform: account.platform,
            status: data.post?.status || "scheduled",
          });
        } else {
          const errorText = await res.text();
          let errorMessage = errorText;
          try {
            const errorJson = JSON.parse(errorText);
            errorMessage = errorJson.error || errorText;
          } catch {
            // Se não for JSON, usar o texto como está
          }

          creationErrors.push({
            accountId: account.getlateId,
            platform: account.platform,
            error: errorMessage,
          });
        }
      } catch (error) {
        creationErrors.push({
          accountId: account.getlateId,
          platform: account.platform,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    // Retornar resultados
    const allErrors = [...validationErrors, ...creationErrors];
    const success = createdPosts.length > 0 && allErrors.length === 0;

    return NextResponse.json({
      success,
      posts: createdPosts,
      ...(allErrors.length > 0 && { errors: allErrors }),
      ...(skippedAccounts.length > 0 && { skipped: skippedAccounts }),
    });
  } catch (error) {
    console.error("[API] Error creating posts:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


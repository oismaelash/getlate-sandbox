import { NextRequest, NextResponse } from "next/server";
import { validateApiKey } from "@/lib/auth";
import { db } from "@/lib/db";
import { inferContentType, type MediaItem } from "@/lib/post-utils";
import { getPostSchedulerQueue } from "@/lib/queue";
import { formatInTimeZone, fromZonedTime } from "date-fns-tz";
import { randomBytes } from "crypto";
import { Prisma } from "@prisma/client";
import { validateUploadUrl, parseUploadUrl, moveFilesToPostDir } from "@/lib/upload";

export async function POST(request: NextRequest) {
  try {
    const auth = await validateApiKey(request);
    if (!auth.valid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { content, mediaItems, platforms, scheduledFor, timezone, publishNow } = body;

    if (!mediaItems || !Array.isArray(mediaItems) || mediaItems.length === 0) {
      return NextResponse.json({ error: "mediaItems is required" }, { status: 400 });
    }

    // Validar URLs dos mediaItems
    for (const item of mediaItems) {
      if (typeof item === "object" && item !== null && "url" in item) {
        const url = item.url as string;
        if (!validateUploadUrl(url)) {
          return NextResponse.json(
            { error: `URL inválida ou não autorizada: ${url}` },
            { status: 400 }
          );
        }
      }
    }

    if (!platforms || !Array.isArray(platforms) || platforms.length === 0) {
      return NextResponse.json({ error: "platforms is required" }, { status: 400 });
    }

    // Extrair instagramAccountId do primeiro platform
    const firstPlatform = platforms[0];
    const instagramAccountId = firstPlatform?.accountId;

    if (!instagramAccountId) {
      return NextResponse.json({ error: "accountId is required in platforms[0]" }, { status: 400 });
    }

    // Verificar se account existe
    const account = await db.socialAccount.findUnique({
      where: { getlateId: instagramAccountId },
    });

    if (!account) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    // Inferir contentType
    let contentType: string;
    try {
      contentType = inferContentType(mediaItems as MediaItem[]);
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Invalid media items" },
        { status: 400 }
      );
    }

    // Determinar status e scheduledFor
    const shouldPublishNow = publishNow === true;
    let scheduledDate: Date | null = null;

    if (scheduledFor && !shouldPublishNow) {
      try {
        // Se timezone foi fornecido, converter o horário local para UTC
        if (timezone) {
          // scheduledFor vem como string datetime-local (ex: "2024-01-15T14:30")
          // Precisamos interpretá-la como estando no timezone especificado
          // Parsear a string manualmente para criar uma Date que representa o momento correto
          const dateMatch = scheduledFor.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?(?:\.(\d+))?/);
          if (!dateMatch) {
            return NextResponse.json(
              { error: "Formato de data inválido. Use YYYY-MM-DDTHH:mm" },
              { status: 400 }
            );
          }

          const [, year, month, day, hour, minute, second = "0", millisecond = "0"] = dateMatch;
          
          // Criar uma Date UTC que representa esse momento (ano, mês, dia, hora, minuto)
          // Usamos Date.UTC para criar uma Date que representa esse momento como se fosse UTC
          // Depois fromZonedTime vai interpretar essa Date como se estivesse no timezone especificado
          // e retornar a Date equivalente em UTC
          const utcDate = new Date(Date.UTC(
            parseInt(year, 10),
            parseInt(month, 10) - 1, // meses são 0-indexed
            parseInt(day, 10),
            parseInt(hour, 10),
            parseInt(minute, 10),
            parseInt(second, 10),
            parseInt(millisecond.padEnd(3, "0").substring(0, 3), 10)
          ));

          // Validar se a data é válida
          if (isNaN(utcDate.getTime())) {
            return NextResponse.json(
              { error: "Data de agendamento inválida" },
              { status: 400 }
            );
          }

          // fromZonedTime: recebe uma Date (que representa um momento) e um timezone
          // Interpreta a Date como se representasse um momento no timezone especificado
          // e retorna a Date equivalente em UTC
          // Exemplo: se utcDate representa "2024-01-15 14:30 UTC" e timezone é "America/Sao_Paulo",
          // fromZonedTime interpreta como "14:30 em America/Sao_Paulo" e retorna a Date UTC equivalente
          scheduledDate = fromZonedTime(utcDate, timezone);
        } else {
          // Se não há timezone, usar new Date diretamente (assume UTC ou timezone do servidor)
          scheduledDate = new Date(scheduledFor);
          
          // Validar se a data é válida
          if (isNaN(scheduledDate.getTime())) {
            return NextResponse.json(
              { error: "Data de agendamento inválida" },
              { status: 400 }
            );
          }
        }

        // Validar que a data não está no passado (com margem de 1 minuto para evitar problemas de timing)
        const now = new Date();
        const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);
        if (scheduledDate < oneMinuteAgo) {
          return NextResponse.json(
            { error: "A data de agendamento não pode estar no passado" },
            { status: 400 }
          );
        }
      } catch (error) {
        return NextResponse.json(
          {
            error:
              error instanceof Error
                ? `Erro ao processar data de agendamento: ${error.message}`
                : "Erro ao processar data de agendamento",
          },
          { status: 400 }
        );
      }
    }

    const postStatus = shouldPublishNow ? "published" : scheduledDate ? "scheduled" : "draft";

    // Gerar getlateId único
    const getlateId = `post_${randomBytes(16).toString("hex")}`;

    // Mover arquivos de diretórios temporários para o diretório do post
    const tempPostIds = new Set<string>();
    for (const item of mediaItems) {
      if (typeof item === "object" && item !== null && "url" in item) {
        const url = item.url as string;
        const parsed = parseUploadUrl(url);
        if (parsed && parsed.postId.startsWith("temp-")) {
          tempPostIds.add(parsed.postId);
        }
      }
    }

    // Mover arquivos de cada diretório temporário
    for (const tempPostId of tempPostIds) {
      await moveFilesToPostDir(tempPostId, getlateId);
    }

    // Atualizar URLs nos mediaItems para apontar para o novo diretório
    const updatedMediaItems = mediaItems.map((item: unknown) => {
      if (typeof item === "object" && item !== null && "url" in item) {
        const url = item.url as string;
        const parsed = parseUploadUrl(url);
        if (parsed && parsed.postId.startsWith("temp-")) {
          return {
            ...item,
            url: `/api/uploads/${getlateId}/${parsed.filename}`,
          };
        }
      }
      return item;
    });

    // Criar post
    const post = await db.post.create({
      data: {
        getlateId,
        socialAccountId: account.getlateId,
        content: content || null,
        scheduledFor: scheduledDate,
        timezone: timezone || null,
        status: postStatus,
        contentType,
        mediaItems: updatedMediaItems as Prisma.InputJsonValue,
        platforms: platforms as Prisma.InputJsonValue,
        publishNow: shouldPublishNow,
      },
    });

    // Se agendado, criar job no BullMQ
    if (postStatus === "scheduled" && scheduledDate) {
      const queue = getPostSchedulerQueue();
      const delay = scheduledDate.getTime() - Date.now();

      if (delay > 0) {
        await queue.add(
          "publish-post",
          { postId: post.getlateId },
          {
            delay,
            jobId: `post-${post.getlateId}`,
          }
        );
      } else {
        // Se a data já passou, publicar imediatamente
        await db.post.update({
          where: { getlateId: post.getlateId },
          data: { status: "published" },
        });
      }
    }

    // Retornar no formato GetLate
    return NextResponse.json({
      post: {
        id: post.getlateId,
        _id: post.getlateId,
        content: post.content || undefined,
        mediaItems: (post.mediaItems as unknown) || undefined,
        platforms: (post.platforms as unknown) || undefined,
        scheduledFor: post.scheduledFor?.toISOString() || undefined,
        timezone: post.timezone || undefined,
        status: post.status,
      },
    });
  } catch (error) {
    console.error("[API] Error creating post:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


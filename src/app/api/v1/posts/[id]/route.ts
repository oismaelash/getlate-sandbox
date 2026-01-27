import { NextRequest, NextResponse } from "next/server";
import { validateApiKey } from "@/lib/auth";
import { db } from "@/lib/db";
import { getPostSchedulerQueue } from "@/lib/queue";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await validateApiKey(request);
    if (!auth.valid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const postId = id;

    const post = await db.post.findUnique({
      where: { getlateId: postId },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
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
    console.error("[API] Error getting post:", error);
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
    const postId = id;

    const post = await db.post.findUnique({
      where: { getlateId: postId },
    });

    if (!post) {
      // Idempotente - 404 é tratado como sucesso
      return NextResponse.json({ message: "Post not found" }, { status: 404 });
    }

    // Se agendado, remover job do BullMQ
    if (post.status === "scheduled") {
      const queue = getPostSchedulerQueue();
      const job = await queue.getJob(`post-${post.getlateId}`);
      if (job) {
        await job.remove();
      }
    }

    await db.post.delete({
      where: { getlateId: postId },
    });

    return NextResponse.json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("[API] Error deleting post:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


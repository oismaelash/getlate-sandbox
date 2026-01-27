import { Worker } from "bullmq";
import { getRedisClient } from "../lib/redis";
import { db } from "../lib/db";
import { triggerWebhook } from "../lib/webhooks";

interface PostJobData {
  postId: string;
}

async function processPost(job: { data: PostJobData }) {
  const { postId } = job.data;

  console.log(`[PostScheduler] Processing post ${postId}`);

  try {
    const post = await db.post.findUnique({
      where: { getlateId: postId },
      include: {
        socialAccount: {
          include: {
            profile: true,
          },
        },
      },
    });

    if (!post) {
      console.error(`[PostScheduler] Post ${postId} not found`);
      return;
    }

    if (post.status === "published") {
      console.log(`[PostScheduler] Post ${postId} already published`);
      return;
    }

    // Simular publicação (mock)
    // Em um sistema real, aqui seria feita a publicação real nas plataformas
    const platforms = (post.platforms as Array<{
      platform: string;
      accountId: string;
      status?: string;
      platform_post_id?: string;
      url?: string;
      error?: { code: string; message: string };
    }>) || [];

    // Simular resultados de publicação
    const publishedPlatforms: Array<{
      platform: string;
      status: string;
      platform_post_id?: string;
      url?: string;
      error?: { code: string; message: string };
    }> = [];
    const failedPlatforms: Array<{
      platform: string;
      status: string;
      error: { code: string; message: string };
    }> = [];

    // Simular: 80% de sucesso, 20% de falha (para demonstrar partial/failed)
    for (const platform of platforms) {
      const success = Math.random() > 0.2; // 80% success rate
      if (success) {
        publishedPlatforms.push({
          platform: platform.platform,
          status: "published",
          platform_post_id: `mock_${Date.now()}_${Math.random().toString(36).substring(7)}`,
          url: `https://${platform.platform}.com/user/status/mock_${Date.now()}`,
        });
      } else {
        failedPlatforms.push({
          platform: platform.platform,
          status: "failed",
          error: {
            code: "MOCK_ERROR",
            message: `Simulated error for ${platform.platform}`,
          },
        });
      }
    }

    // Determinar status final
    if (publishedPlatforms.length === platforms.length) {
      // Todas as plataformas publicaram com sucesso
      await db.post.update({
        where: { getlateId: postId },
        data: {
          status: "published",
        },
      });

      // Trigger post.published
      triggerWebhook("post.published", {
        post_id: post.getlateId,
        profile_id: post.socialAccount.profile.getlateId,
        published_at: new Date().toISOString(),
        platforms: publishedPlatforms,
        status: "published",
      });

      console.log(`[PostScheduler] Post ${postId} published successfully`);
    } else if (publishedPlatforms.length > 0) {
      // Publicação parcial
      await db.post.update({
        where: { getlateId: postId },
        data: {
          status: "partial",
        },
      });

      // Trigger post.partial
      triggerWebhook("post.partial", {
        post_id: post.getlateId,
        profile_id: post.socialAccount.profile.getlateId,
        platforms: [...publishedPlatforms, ...failedPlatforms],
        status: "partial",
      });

      console.log(`[PostScheduler] Post ${postId} partially published`);
    } else {
      // Todas as plataformas falharam
      await db.post.update({
        where: { getlateId: postId },
        data: {
          status: "failed",
        },
      });

      // Trigger post.failed
      triggerWebhook("post.failed", {
        post_id: post.getlateId,
        profile_id: post.socialAccount.profile.getlateId,
        platforms: failedPlatforms,
        status: "failed",
      });

      console.log(`[PostScheduler] Post ${postId} failed to publish`);
    }
  } catch (error) {
    console.error(`[PostScheduler] Error processing post ${postId}:`, error);

    // Marcar post como failed
    try {
      const post = await db.post.findUnique({
        where: { getlateId: postId },
        include: {
          socialAccount: {
            include: {
              profile: true,
            },
          },
        },
      });

      if (post) {
        await db.post.update({
          where: { getlateId: postId },
          data: {
            status: "failed",
          },
        });

        // Trigger post.failed
        const platforms = (post.platforms as Array<{ platform: string }>) || [];
        triggerWebhook("post.failed", {
          post_id: post.getlateId,
          profile_id: post.socialAccount.profile.getlateId,
          platforms: platforms.map((p) => ({
            platform: p.platform,
            status: "failed",
            error: {
              code: "PROCESSING_ERROR",
              message: error instanceof Error ? error.message : "Unknown error",
            },
          })),
          status: "failed",
        });
      }
    } catch (updateError) {
      console.error(`[PostScheduler] Error updating post status:`, updateError);
    }

    throw error;
  }
}

const redis = getRedisClient();

const worker = new Worker<PostJobData>(
  "post-scheduler",
  async (job) => {
    await processPost(job);
  },
  {
    connection: redis,
    concurrency: 5,
  }
);

worker.on("completed", (job) => {
  console.log(`[PostScheduler] Job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
  console.error(`[PostScheduler] Job ${job?.id} failed:`, err);
});

worker.on("error", (err) => {
  console.error(`[PostScheduler] Worker error:`, err);
});

console.log("[PostScheduler] Worker started");

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("[PostScheduler] SIGTERM received, closing worker...");
  await worker.close();
  await redis.quit();
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("[PostScheduler] SIGINT received, closing worker...");
  await worker.close();
  await redis.quit();
  process.exit(0);
});


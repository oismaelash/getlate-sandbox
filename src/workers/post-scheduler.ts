import { Worker } from "bullmq";
import { getRedisClient } from "../lib/redis";
import { db } from "../lib/db";

interface PostJobData {
  postId: string;
}

async function processPost(job: { data: PostJobData }) {
  const { postId } = job.data;

  console.log(`[PostScheduler] Processing post ${postId}`);

  try {
    const post = await db.post.findUnique({
      where: { getlateId: postId },
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
    await db.post.update({
      where: { getlateId: postId },
      data: {
        status: "published",
      },
    });

    console.log(`[PostScheduler] Post ${postId} published successfully`);
  } catch (error) {
    console.error(`[PostScheduler] Error processing post ${postId}:`, error);

    // Marcar post como failed
    try {
      await db.post.update({
        where: { getlateId: postId },
        data: {
          status: "failed",
        },
      });
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


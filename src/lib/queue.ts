import { Queue } from "bullmq";
import { getRedisClient } from "./redis";

let postSchedulerQueue: Queue | null = null;

export function getPostSchedulerQueue(): Queue {
  if (!postSchedulerQueue) {
    const redis = getRedisClient();
    postSchedulerQueue = new Queue("post-scheduler", {
      connection: redis,
    });
  }
  return postSchedulerQueue;
}

export async function closeQueue(): Promise<void> {
  if (postSchedulerQueue) {
    await postSchedulerQueue.close();
    postSchedulerQueue = null;
  }
}


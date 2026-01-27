import { db } from "./db";
import { createHmac } from "crypto";

export type WebhookEvent =
  | "post.scheduled"
  | "post.published"
  | "post.failed"
  | "post.partial"
  | "post.partial_publish"
  | "account.connected"
  | "account.disconnected"
  | "message.received"
  | "webhook.test";

interface WebhookPayload {
  event: WebhookEvent;
  timestamp: string;
  data: Record<string, unknown>;
}

interface DeliveryResult {
  success: boolean;
  statusCode?: number;
  response?: string;
  responseTime: number;
  error?: string;
}

/**
 * Calculate HMAC-SHA256 signature for webhook payload
 */
export function calculateHMACSignature(
  payload: string,
  secretKey: string
): string {
  const hmac = createHmac("sha256", secretKey);
  hmac.update(payload);
  const digest = hmac.digest("hex");
  return `sha256=${digest}`;
}

/**
 * Deliver webhook to URL with retry logic
 */
export async function deliverWebhook(
  webhook: {
    getlateId: string;
    url: string;
    secretKey?: string | null;
    customHeaders?: unknown;
  },
  payload: WebhookPayload,
  attempt: number = 1,
  maxAttempts: number = 3
): Promise<DeliveryResult> {
  const startTime = Date.now();
  const payloadString = JSON.stringify(payload);

  try {
    // Prepare headers
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "User-Agent": "Late-Webhooks/1.0",
    };

    // Add custom headers
    if (webhook.customHeaders && Array.isArray(webhook.customHeaders)) {
      for (const header of webhook.customHeaders as Array<{
        key: string;
        value: string;
      }>) {
        if (header.key && header.value) {
          headers[header.key] = header.value;
        }
      }
    }

    // Add HMAC signature if secretKey exists
    if (webhook.secretKey) {
      headers["X-Late-Signature"] = calculateHMACSignature(
        payloadString,
        webhook.secretKey
      );
    }

    // Make HTTP request with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    try {
      const response = await fetch(webhook.url, {
        method: "POST",
        headers,
        body: payloadString,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const responseTime = Date.now() - startTime;
      const responseText = await response.text();

      return {
        success: response.ok,
        statusCode: response.status,
        response: responseText,
        responseTime,
      };
    } catch (fetchError) {
      clearTimeout(timeoutId);
      throw fetchError;
    }
  } catch (error) {
    const responseTime = Date.now() - startTime;
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    // Retry logic with exponential backoff
    if (attempt < maxAttempts) {
      const delay = Math.pow(2, attempt - 1) * 1000; // 1s, 2s, 4s
      await new Promise((resolve) => setTimeout(resolve, delay));

      return deliverWebhook(webhook, payload, attempt + 1, maxAttempts);
    }

    return {
      success: false,
      responseTime,
      error: errorMessage,
    };
  }
}

/**
 * Trigger webhooks for a specific event
 * This function finds all enabled webhooks that listen to the event and delivers the payload
 */
export async function triggerWebhook(
  event: WebhookEvent,
  data: Record<string, unknown>
): Promise<void> {
  try {
    // Find all enabled webhooks that listen to this event
    const webhooks = await db.webhook.findMany({
      where: {
        enabled: true,
      },
    });

    // Filter webhooks that listen to this event
    const relevantWebhooks = webhooks.filter((webhook) => {
      const events = webhook.events as string[];
      return events.includes(event);
    });

    if (relevantWebhooks.length === 0) {
      return;
    }

    // Create payload
    const payload: WebhookPayload = {
      event,
      timestamp: new Date().toISOString(),
      data,
    };

    // Deliver to each webhook (fire and forget - don't await)
    for (const webhook of relevantWebhooks) {
      // Execute in background without blocking
      deliverWebhook(webhook, payload).then(async (result) => {
        // Log delivery
        await db.webhookDeliveryLog.create({
          data: {
            webhookId: webhook.getlateId,
            event,
            status: result.success ? "success" : "failed",
            statusCode: result.statusCode || null,
            responseTime: result.responseTime,
            attempts: result.success ? 1 : 3, // Max attempts if failed
            requestPayload: payload as unknown as Record<string, unknown>,
            response: result.response || result.error || null,
            timestamp: new Date(),
          },
        });
      });
    }
  } catch (error) {
    console.error(`[Webhooks] Error triggering webhook for event ${event}:`, error);
    // Don't throw - webhooks should not break the main flow
  }
}

/**
 * Retry a failed webhook delivery
 */
export async function retryFailedWebhook(
  deliveryLogId: string
): Promise<DeliveryResult | null> {
  try {
    const log = await db.webhookDeliveryLog.findUnique({
      where: { id: deliveryLogId },
      include: { webhook: true },
    });

    if (!log || !log.webhook) {
      return null;
    }

    const payload = log.requestPayload as WebhookPayload;
    const result = await deliverWebhook(log.webhook, payload);

    // Update log
    await db.webhookDeliveryLog.update({
      where: { id: deliveryLogId },
      data: {
        status: result.success ? "success" : "failed",
        statusCode: result.statusCode || null,
        responseTime: result.responseTime,
        attempts: log.attempts + 1,
        response: result.response || result.error || null,
      },
    });

    return result;
  } catch (error) {
    console.error(`[Webhooks] Error retrying webhook delivery ${deliveryLogId}:`, error);
    return null;
  }
}

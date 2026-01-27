import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { calculateHMACSignature } from "@/lib/webhooks";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const webhookId = id;

    const webhook = await db.webhook.findUnique({
      where: { getlateId: webhookId },
    });

    if (!webhook) {
      return NextResponse.json({ error: "Webhook not found" }, { status: 404 });
    }

    // Create test payload exactly as specified
    const testPayload = {
      event: "webhook.test",
      message: "This is a test webhook from Late",
      timestamp: new Date().toISOString(),
    };

    const payloadString = JSON.stringify(testPayload);
    const startTime = Date.now();

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

    let result: {
      success: boolean;
      statusCode?: number;
      response?: string;
      responseTime: number;
      error?: string;
    };

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

      result = {
        success: response.ok,
        statusCode: response.status,
        response: responseText,
        responseTime,
      };
    } catch (fetchError) {
      clearTimeout(timeoutId);
      const responseTime = Date.now() - startTime;
      const errorMessage =
        fetchError instanceof Error ? fetchError.message : "Unknown error";

      result = {
        success: false,
        responseTime,
        error: errorMessage,
      };
    }

    // Log delivery
    await db.webhookDeliveryLog.create({
      data: {
        webhookId: webhook.getlateId,
        event: "webhook.test",
        status: result.success ? "success" : "failed",
        statusCode: result.statusCode || null,
        responseTime: result.responseTime,
        attempts: 1,
        requestPayload: testPayload as unknown as Record<string, unknown>,
        response: result.response || result.error || null,
        timestamp: new Date(),
      },
    });

    return NextResponse.json({
      message: "Test webhook triggered successfully",
    });
  } catch (error) {
    console.error("[API] Error testing webhook:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status"); // "all" | "success" | "failed"
    const webhookId = searchParams.get("webhookId");
    const event = searchParams.get("event");
    const limit = parseInt(searchParams.get("limit") || "50");

    // Build where clause
    const where: {
      status?: string;
      webhookId?: string;
      event?: string;
    } = {};

    if (status && status !== "all") {
      where.status = status;
    }

    if (webhookId) {
      where.webhookId = webhookId;
    }

    if (event) {
      where.event = event;
    }

    const logs = await db.webhookDeliveryLog.findMany({
      where,
      orderBy: { timestamp: "desc" },
      take: limit,
      include: {
        webhook: {
          select: {
            getlateId: true,
            name: true,
            url: true,
          },
        },
      },
    });

    const mappedLogs = logs.map((log) => ({
      id: log.id,
      webhookId: log.webhookId,
      webhook: log.webhook
        ? {
            id: log.webhook.getlateId,
            name: log.webhook.name,
            url: log.webhook.url,
          }
        : null,
      event: log.event,
      status: log.status,
      statusCode: log.statusCode,
      responseTime: log.responseTime,
      attempts: log.attempts,
      requestPayload: log.requestPayload,
      response: log.response,
      timestamp: log.timestamp.toISOString(),
      createdAt: log.createdAt.toISOString(),
    }));

    return NextResponse.json({ logs: mappedLogs });
  } catch (error) {
    console.error("[API] Error listing delivery logs:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

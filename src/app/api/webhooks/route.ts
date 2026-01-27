import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { randomBytes } from "crypto";

export async function GET() {
  try {
    const webhooks = await db.webhook.findMany({
      orderBy: { createdAt: "desc" },
    });

    const mappedWebhooks = webhooks.map((webhook) => ({
      id: webhook.getlateId,
      _id: webhook.getlateId,
      name: webhook.name,
      url: webhook.url,
      secretKey: webhook.secretKey ? "***" : undefined,
      customHeaders: webhook.customHeaders || [],
      events: webhook.events || [],
      enabled: webhook.enabled,
      createdAt: webhook.createdAt.toISOString(),
      updatedAt: webhook.updatedAt.toISOString(),
    }));

    return NextResponse.json({ webhooks: mappedWebhooks });
  } catch (error) {
    console.error("[API] Error listing webhooks:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, url, secretKey, customHeaders, events, enabled } = body;

    // Validation
    if (!name || typeof name !== "string") {
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    }

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "url is required" }, { status: 400 });
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return NextResponse.json({ error: "Invalid URL format" }, { status: 400 });
    }

    if (!events || !Array.isArray(events) || events.length === 0) {
      return NextResponse.json(
        { error: "events is required and must be a non-empty array" },
        { status: 400 }
      );
    }

    // Validate custom headers format
    if (customHeaders && !Array.isArray(customHeaders)) {
      return NextResponse.json(
        { error: "customHeaders must be an array" },
        { status: 400 }
      );
    }

    // Generate unique getlateId
    const getlateId = `webhook_${randomBytes(16).toString("hex")}`;

    const webhook = await db.webhook.create({
      data: {
        getlateId,
        name,
        url,
        secretKey: secretKey || null,
        customHeaders: (customHeaders || []) as unknown,
        events: events as unknown,
        enabled: enabled !== false, // Default to true
      },
    });

    return NextResponse.json({
      webhook: {
        id: webhook.getlateId,
        _id: webhook.getlateId,
        name: webhook.name,
        url: webhook.url,
        secretKey: webhook.secretKey ? "***" : undefined,
        customHeaders: webhook.customHeaders || [],
        events: webhook.events || [],
        enabled: webhook.enabled,
        createdAt: webhook.createdAt.toISOString(),
        updatedAt: webhook.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("[API] Error creating webhook:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

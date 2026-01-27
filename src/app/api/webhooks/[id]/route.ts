import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
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
    console.error("[API] Error getting webhook:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const webhookId = id;
    const body = await request.json();
    const { name, url, secretKey, customHeaders, events, enabled } = body;

    const webhook = await db.webhook.findUnique({
      where: { getlateId: webhookId },
    });

    if (!webhook) {
      return NextResponse.json({ error: "Webhook not found" }, { status: 404 });
    }

    // Validation
    if (name !== undefined && typeof name !== "string") {
      return NextResponse.json({ error: "name must be a string" }, { status: 400 });
    }

    if (url !== undefined) {
      if (typeof url !== "string") {
        return NextResponse.json({ error: "url must be a string" }, { status: 400 });
      }
      // Validate URL format
      try {
        new URL(url);
      } catch {
        return NextResponse.json({ error: "Invalid URL format" }, { status: 400 });
      }
    }

    if (events !== undefined) {
      if (!Array.isArray(events) || events.length === 0) {
        return NextResponse.json(
          { error: "events must be a non-empty array" },
          { status: 400 }
        );
      }
    }

    if (customHeaders !== undefined && !Array.isArray(customHeaders)) {
      return NextResponse.json(
        { error: "customHeaders must be an array" },
        { status: 400 }
      );
    }

    const updatedWebhook = await db.webhook.update({
      where: { getlateId: webhookId },
      data: {
        ...(name !== undefined && { name }),
        ...(url !== undefined && { url }),
        ...(secretKey !== undefined && { secretKey: secretKey || null }),
        ...(customHeaders !== undefined && { customHeaders: customHeaders as unknown }),
        ...(events !== undefined && { events: events as unknown }),
        ...(enabled !== undefined && { enabled }),
      },
    });

    return NextResponse.json({
      webhook: {
        id: updatedWebhook.getlateId,
        _id: updatedWebhook.getlateId,
        name: updatedWebhook.name,
        url: updatedWebhook.url,
        secretKey: updatedWebhook.secretKey ? "***" : undefined,
        customHeaders: updatedWebhook.customHeaders || [],
        events: updatedWebhook.events || [],
        enabled: updatedWebhook.enabled,
        createdAt: updatedWebhook.createdAt.toISOString(),
        updatedAt: updatedWebhook.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("[API] Error updating webhook:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
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

    await db.webhook.delete({
      where: { getlateId: webhookId },
    });

    return NextResponse.json({ message: "Webhook deleted successfully" });
  } catch (error) {
    console.error("[API] Error deleting webhook:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

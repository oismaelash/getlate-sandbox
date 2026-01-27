import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { triggerWebhook } from "@/lib/webhooks";

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

    // Trigger test webhook
    await triggerWebhook("webhook.test", {
      message: "This is a test webhook from Late",
    });

    return NextResponse.json({
      message: "Test webhook triggered successfully",
    });
  } catch (error) {
    console.error("[API] Error testing webhook:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { validateApiKey } from "@/lib/auth";
import { db } from "@/lib/db";
import { triggerWebhook } from "@/lib/webhooks";

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
    const accountId = id;

    const account = await db.socialAccount.findUnique({
      where: { getlateId: accountId },
      include: {
        profile: true,
      },
    });

    if (!account) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    // Trigger account.disconnected webhook before deleting
    triggerWebhook("account.disconnected", {
      account_id: account.getlateId,
      profile_id: account.profileId,
      platform: account.platform,
      username: account.username || null,
      reason: "manual_disconnect", // Could be "token_expired" in production
      disconnected_at: new Date().toISOString(),
      message: "Account disconnected manually",
    });

    await db.socialAccount.delete({
      where: { getlateId: accountId },
    });

    return NextResponse.json({ message: "Account deleted successfully" });
  } catch (error) {
    console.error("[API] Error deleting account:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


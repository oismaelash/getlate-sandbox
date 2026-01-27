import { NextRequest, NextResponse } from "next/server";
import { validateApiKey } from "@/lib/auth";
import { db } from "@/lib/db";

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
    });

    if (!account) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    await db.socialAccount.delete({
      where: { getlateId: accountId },
    });

    return NextResponse.json({ message: "Account deleted successfully" });
  } catch (error) {
    console.error("[API] Error deleting account:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


import { NextRequest } from "next/server";
import { db } from "./db";

export async function validateApiKey(request: NextRequest): Promise<{ valid: boolean; apiKey?: string }> {
  const authHeader = request.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { valid: false };
  }

  const apiKey = authHeader.substring(7);

  if (!apiKey) {
    return { valid: false };
  }

  const keyRecord = await db.apiKey.findUnique({
    where: { key: apiKey },
  });

  if (!keyRecord) {
    return { valid: false };
  }

  return { valid: true, apiKey };
}


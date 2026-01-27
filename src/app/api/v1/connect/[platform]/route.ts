import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ platform: string }> }
) {
  try {
    const { platform } = await params;
    const { searchParams } = new URL(request.url);
    
    const profileId = searchParams.get("profileId");
    const redirectUrl = searchParams.get("redirect_url");
    const headless = searchParams.get("headless");

    if (!profileId) {
      return NextResponse.json(
        { error: "profileId is required" },
        { status: 400 }
      );
    }

    // Build the mock OAuth URL
    // Always use the actual request URL origin (most reliable)
    // This ensures the OAuth URL points to the sandbox itself, not the calling app
    let origin = request.nextUrl.origin;

    // Only use fallback if nextUrl.origin is invalid (shouldn't happen in normal operation)
    if (!origin || origin.includes("0.0.0.0")) {
      // Fallback to environment variable or default sandbox port
      origin = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:4000";
    }
    
    const mockOAuthUrl = new URL("/mock/oauth", origin);
    mockOAuthUrl.searchParams.set("platform", platform);
    mockOAuthUrl.searchParams.set("profileId", profileId);
    
    if (redirectUrl) {
      mockOAuthUrl.searchParams.set("redirect_url", redirectUrl);
    }
    
    if (headless) {
      mockOAuthUrl.searchParams.set("headless", headless);
    }

    // Return in the same format that GetLate API would return
    return NextResponse.json({
      url: mockOAuthUrl.toString(),
    });
  } catch (error) {
    console.error("[API] Error generating connect URL:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}


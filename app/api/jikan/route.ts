import { NextRequest, NextResponse } from "next/server";
import { jikanClient } from "@/lib/api/jikan";
import { sanitizeSearchQuery, isValidInteger } from "@/lib/utils/validation";
import { checkRateLimit } from "@/lib/utils/rate-limit";

export async function GET(request: NextRequest) {
  try {
    // Rate limiting (Jikan has strict rate limits)
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
    if (!checkRateLimit(`api-jikan-${ip}`, 10, 60000)) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please try again later." },
        { status: 429 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    let query = searchParams.get("q");
    const limitParam = searchParams.get("limit") || "25";
    const pageParam = searchParams.get("page") || "1";

    // Validate and sanitize input
    if (!query) {
      return NextResponse.json(
        { error: "Query parameter 'q' is required" },
        { status: 400 }
      );
    }

    query = sanitizeSearchQuery(query);
    
    if (!isValidInteger(limitParam, 1, 25)) {
      return NextResponse.json(
        { error: "Limit must be between 1 and 25" },
        { status: 400 }
      );
    }

    if (!isValidInteger(pageParam, 1, 100)) {
      return NextResponse.json(
        { error: "Page must be between 1 and 100" },
        { status: 400 }
      );
    }

    const limit = parseInt(limitParam);
    const page = parseInt(pageParam);

    const results = await jikanClient.searchAnime(query, limit, page);

    return NextResponse.json({ data: results });
  } catch (error: any) {
    console.error("Jikan API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch from Jikan API" },
      { status: 500 }
    );
  }
}


import { NextRequest, NextResponse } from "next/server";
import { anilistClient } from "@/lib/api/anilist";
import { sanitizeSearchQuery, isValidInteger } from "@/lib/utils/validation";
import { checkRateLimit } from "@/lib/utils/rate-limit";

export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
    if (!checkRateLimit(`api-anilist-${ip}`, 30, 60000)) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please try again later." },
        { status: 429 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    let query = searchParams.get("q");
    const perPageParam = searchParams.get("perPage") || "20";
    const pageParam = searchParams.get("page") || "1";

    // Validate and sanitize input
    if (!query) {
      return NextResponse.json(
        { error: "Query parameter 'q' is required" },
        { status: 400 }
      );
    }

    query = sanitizeSearchQuery(query);
    
    if (!isValidInteger(perPageParam, 1, 50)) {
      return NextResponse.json(
        { error: "perPage must be between 1 and 50" },
        { status: 400 }
      );
    }

    if (!isValidInteger(pageParam, 1, 100)) {
      return NextResponse.json(
        { error: "Page must be between 1 and 100" },
        { status: 400 }
      );
    }

    const perPage = parseInt(perPageParam);
    const page = parseInt(pageParam);

    const results = await anilistClient.searchAnime(query, perPage, page);

    return NextResponse.json({ data: results });
  } catch (error: any) {
    console.error("AniList API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch from AniList API" },
      { status: 500 }
    );
  }
}


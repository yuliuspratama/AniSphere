import { NextRequest, NextResponse } from "next/server";
import { kitsuClient } from "@/lib/api/kitsu";
import { sanitizeSearchQuery, isValidInteger } from "@/lib/utils/validation";
import { checkRateLimit } from "@/lib/utils/rate-limit";

export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
    if (!checkRateLimit(`api-kitsu-${ip}`, 60, 60000)) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please try again later." },
        { status: 429 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    let query = searchParams.get("q");
    const type = searchParams.get("type") || "anime";
    const limitParam = searchParams.get("limit") || "20";

    // Validate and sanitize input
    if (!query) {
      return NextResponse.json(
        { error: "Query parameter 'q' is required" },
        { status: 400 }
      );
    }

    query = sanitizeSearchQuery(query);
    
    if (!isValidInteger(limitParam, 1, 50)) {
      return NextResponse.json(
        { error: "Limit must be between 1 and 50" },
        { status: 400 }
      );
    }

    const limit = parseInt(limitParam);

    // Validate type
    if (type !== "anime" && type !== "manga") {
      return NextResponse.json(
        { error: "Invalid type. Must be 'anime' or 'manga'" },
        { status: 400 }
      );
    }

    let results;
    if (type === "manga") {
      results = await kitsuClient.searchManga(query, limit);
    } else {
      results = await kitsuClient.searchAnime(query, limit);
    }

    return NextResponse.json({ data: results });
  } catch (error: any) {
    console.error("Kitsu API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch from Kitsu API" },
      { status: 500 }
    );
  }
}


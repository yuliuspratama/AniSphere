import { NextRequest, NextResponse } from "next/server";
import { katanimeClient } from "@/lib/api/katanime";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const anime = searchParams.get("anime");

    let result;

    if (anime) {
      result = await katanimeClient.getQuotesByAnime(anime);
    } else {
      result = await katanimeClient.getRandomQuote();
    }

    return NextResponse.json({ data: result });
  } catch (error: any) {
    console.error("Katanime API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch from Katanime API" },
      { status: 500 }
    );
  }
}


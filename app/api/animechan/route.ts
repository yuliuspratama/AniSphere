import { NextRequest, NextResponse } from "next/server";
import { animeChanClient } from "@/lib/api/animechan";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const count = parseInt(searchParams.get("count") || "1");
    const anime = searchParams.get("anime");
    const character = searchParams.get("character");

    let result;

    if (anime) {
      const page = parseInt(searchParams.get("page") || "1");
      result = await animeChanClient.getQuotesByAnime(anime, page);
    } else if (character) {
      const page = parseInt(searchParams.get("page") || "1");
      result = await animeChanClient.getQuotesByCharacter(character, page);
    } else if (count === 1) {
      result = await animeChanClient.getRandomQuote();
    } else {
      result = await animeChanClient.getRandomQuotes(count);
    }

    return NextResponse.json({ data: result });
  } catch (error: any) {
    console.error("AnimeChan API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch from AnimeChan API" },
      { status: 500 }
    );
  }
}


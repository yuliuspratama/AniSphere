import { NextRequest, NextResponse } from "next/server";
import { animeFactsClient } from "@/lib/api/anime-facts";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const animeName = searchParams.get("anime");
    const factId = searchParams.get("factId");

    if (!animeName) {
      // Return all available anime
      const allAnime = await animeFactsClient.getAllAnime();
      return NextResponse.json({ data: allAnime });
    }

    if (factId) {
      // Get specific fact
      const fact = await animeFactsClient.getSpecificFact(
        animeName,
        parseInt(factId)
      );
      return NextResponse.json({ data: fact });
    } else {
      // Get all facts for anime
      const facts = await animeFactsClient.getAnimeFacts(animeName);
      return NextResponse.json({ data: facts });
    }
  } catch (error: any) {
    console.error("Anime Facts API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch from Anime Facts API" },
      { status: 500 }
    );
  }
}


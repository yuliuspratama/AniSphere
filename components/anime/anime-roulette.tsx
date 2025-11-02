"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AnimeCard } from "./anime-card";
import { useAddToWatchlist } from "@/lib/hooks/useAddToWatchlist";
import { jikanClient } from "@/lib/api/jikan";
import { animeChanClient } from "@/lib/api/animechan";
import type { JikanAnime } from "@/lib/api/jikan";
import type { Anime } from "@/types/anime.types";
import { Dice6, Sparkles } from "lucide-react";
import { toast } from "sonner";

export function AnimeRoulette() {
  const { addToWatchlist } = useAddToWatchlist();
  const [result, setResult] = useState<Anime | null>(null);
  const [quote, setQuote] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleSpin = async () => {
    setLoading(true);
    try {
      // Get random top anime
      const topAnime = await jikanClient.getTopAnime("favorite", 50);
      const randomAnime = topAnime[Math.floor(Math.random() * topAnime.length)];
      
      // Get random quote
      try {
        const randomQuote = await animeChanClient.getRandomQuote();
        setQuote(`"${randomQuote.quote}" - ${randomQuote.character} (${randomQuote.anime})`);
      } catch (error) {
        console.error("Error fetching quote:", error);
      }

      const converted = convertJikanToAnime(randomAnime);
      setResult(converted);
      toast.success("Roulette berhasil! Coba anime ini!");
    } catch (error) {
      console.error("Error spinning roulette:", error);
      toast.error("Gagal memutar roulette. Coba lagi nanti.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="relative overflow-hidden">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Dice6 className="h-5 w-5 text-primary" />
          <CardTitle>Anime Roulette</CardTitle>
        </div>
        <CardDescription>
          Biarkan keberuntungan memilih anime berikutnya untuk Anda!
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          onClick={handleSpin}
          disabled={loading}
          className="w-full"
          size="lg"
        >
          {loading ? (
            <>
              <Sparkles className="mr-2 h-4 w-4 animate-spin" />
              Memutar...
            </>
          ) : (
            <>
              <Dice6 className="mr-2 h-4 w-4" />
              Putar Roulette
            </>
          )}
        </Button>

        {result && (
          <div className="space-y-4 rounded-lg border bg-muted/50 p-4">
            <h3 className="font-semibold">Hasil Roulette:</h3>
            <AnimeCard
              anime={result}
              showAddButton={true}
              onAdd={(animeId) => addToWatchlist(animeId)}
            />
            {quote && (
              <div className="rounded-lg bg-background p-3 italic text-muted-foreground">
                {quote}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function convertJikanToAnime(jikan: JikanAnime): Anime {
  return {
    id: String(jikan.mal_id),
    title: jikan.title,
    title_en: jikan.title_english,
    title_japanese: jikan.title_japanese,
    synopsis: jikan.synopsis,
    poster_image: jikan.images?.jpg?.large_image_url || jikan.images?.jpg?.image_url,
    cover_image: jikan.images?.jpg?.large_image_url,
    type: "anime",
    status: jikan.status,
    episode_count: jikan.episodes,
    rating: jikan.rating,
    score: jikan.score,
    popularity: jikan.popularity,
    genres: jikan.genres?.map((g) => ({ id: g.mal_id, name: g.name })),
    studios: jikan.studios?.map((s) => ({ id: s.mal_id, name: s.name })),
    start_date: jikan.aired?.from,
    end_date: jikan.aired?.to,
    season: jikan.season,
    year: jikan.year,
  };
}


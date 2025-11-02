"use client";

import { useEffect, useState } from "react";
import { useAddToWatchlist } from "@/lib/hooks/useAddToWatchlist";
import { AnimeCarousel } from "./anime-carousel";
import { CarouselSkeleton } from "./carousel-skeleton";
import { jikanClient } from "@/lib/api/jikan";
import { getCurrentSeason } from "@/lib/utils/recommendations";
import type { JikanAnime } from "@/lib/api/jikan";
import type { Anime } from "@/types/anime.types";

export function TrendingThisSeason() {
  const { addToWatchlist } = useAddToWatchlist();
  const [trending, setTrending] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);
  const [season, setSeason] = useState<{ season: string; year: number } | null>(null);

  useEffect(() => {
    async function fetchTrending() {
      try {
        const currentSeason = getCurrentSeason();
        setSeason(currentSeason);

        const seasonal = await jikanClient.getSeasonalAnime(
          currentSeason.year,
          currentSeason.season
        );

        const mapped = seasonal.data
          .sort((a, b) => (b.score || 0) - (a.score || 0))
          .slice(0, 20)
          .map(convertJikanToAnime);

        setTrending(mapped);
      } catch (error) {
        console.error("Error fetching trending anime:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchTrending();
  }, []);

  if (loading) {
    const seasonName = season
      ? `${season.season.charAt(0).toUpperCase() + season.season.slice(1)} ${season.year}`
      : "Musim Ini";
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Sedang Tren Musim Ini</h2>
        <CarouselSkeleton title={`Sedang Tren ${seasonName}`} count={5} />
      </div>
    );
  }

  const seasonName = season
    ? `${season.season.charAt(0).toUpperCase() + season.season.slice(1)} ${season.year}`
    : "Musim Ini";

  return (
    <AnimeCarousel
      title={`Sedang Tren ${seasonName}`}
      anime={trending}
      showAddButton={true}
      onAdd={(animeId) => addToWatchlist(animeId)}
    />
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


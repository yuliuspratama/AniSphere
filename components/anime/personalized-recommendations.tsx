"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { useAnimeList } from "@/lib/hooks/useAnimeList";
import { useAddToWatchlist } from "@/lib/hooks/useAddToWatchlist";
import { AnimeCarousel } from "./anime-carousel";
import { CarouselSkeleton } from "./carousel-skeleton";
import { jikanClient } from "@/lib/api/jikan";
import type { JikanAnime } from "@/lib/api/jikan";
import type { Anime } from "@/types/anime.types";

export function PersonalizedRecommendations() {
  const { user } = useAuth();
  const { lists } = useAnimeList(user?.id);
  const { addToWatchlist } = useAddToWatchlist();
  const [recommendations, setRecommendations] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRecommendations() {
      if (!user || lists.length === 0) {
        // If no user list, show trending anime instead
        try {
          const trending = await jikanClient.getTopAnime("bypopularity", 10);
          const mapped = trending.map(convertJikanToAnime);
          setRecommendations(mapped);
        } catch (error) {
          console.error("Error fetching recommendations:", error);
        } finally {
          setLoading(false);
        }
        return;
      }

      // Simple recommendation: get top-rated anime from genres user likes
      // In production, this would be more sophisticated
      try {
        const topAnime = await jikanClient.getTopAnime("favorite", 10);
        const mapped = topAnime.map(convertJikanToAnime);
        setRecommendations(mapped);
      } catch (error) {
        console.error("Error fetching recommendations:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchRecommendations();
  }, [user, lists]);

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Untuk Anda</h2>
        <CarouselSkeleton title="Untuk Anda" count={5} />
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Untuk Anda</h2>
        <p className="text-muted-foreground">
          Mulai tambahkan anime ke daftar Anda untuk mendapatkan rekomendasi personal!
        </p>
      </div>
    );
  }

  return (
    <AnimeCarousel
      title="Untuk Anda"
      anime={recommendations}
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


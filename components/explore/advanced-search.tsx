"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, User, Film, Building2, Users } from "lucide-react";
import { jikanClient } from "@/lib/api/jikan";
import { kitsuClient } from "@/lib/api/kitsu";
import { anilistClient } from "@/lib/api/anilist";
import { AnimeCard } from "@/components/anime/anime-card";
import { useAddToWatchlist } from "@/lib/hooks/useAddToWatchlist";
import { toast } from "sonner";
import type { Anime } from "@/types/anime.types";

type SearchType = "anime" | "manga" | "seiyuu" | "director" | "studio" | "character";

export function AdvancedSearch() {
  const [searchType, setSearchType] = useState<SearchType>("anime");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { addToWatchlist } = useAddToWatchlist();

  const handleSearch = async () => {
    if (!query.trim()) {
      toast.error("Masukkan kata kunci pencarian");
      return;
    }

    setLoading(true);
    try {
      let searchResults: any[] = [];

      switch (searchType) {
        case "anime":
          const jikanAnime = await jikanClient.searchAnime(query, 20);
          searchResults = jikanAnime.map(convertJikanToAnime);
          break;

        case "manga":
          const kitsuManga = await kitsuClient.searchManga(query, 20);
          searchResults = kitsuManga.map(convertKitsuMangaToAnime);
          break;

        case "seiyuu":
        case "director":
          const people = await jikanClient.searchPeople(query, 20);
          searchResults = people.map((person) => ({
            id: String(person.mal_id),
            title: person.name,
            type: searchType,
            image: person.images?.jpg?.image_url,
            name_japanese: person.given_name || person.family_name,
            about: person.about,
          }));
          break;

        case "studio":
          const kitsuStudio = await kitsuClient.searchByStudio(query, 20);
          searchResults = kitsuStudio.map(convertKitsuAnimeToAnime);
          break;

        case "character":
          const jikanCharacters = await jikanClient.searchCharacters(query, 20);
          searchResults = jikanCharacters.map((char) => ({
            id: String(char.mal_id),
            title: char.name,
            type: "character",
            image: char.images?.jpg?.image_url,
            name_japanese: char.name_kanji,
            about: char.about,
          }));
          break;
      }

      setResults(searchResults);
      if (searchResults.length === 0) {
        toast.info("Tidak ada hasil ditemukan");
      }
    } catch (error: any) {
      console.error("Search error:", error);
      toast.error(error.message || "Gagal melakukan pencarian");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Pencarian Cerdas
        </CardTitle>
        <CardDescription>
          Cari anime, manga, seiyuu, sutradara, studio, atau karakter
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs value={searchType} onValueChange={(v) => setSearchType(v as SearchType)}>
          <TabsList className="grid w-full grid-cols-3 md:grid-cols-6">
            <TabsTrigger value="anime">Anime</TabsTrigger>
            <TabsTrigger value="manga">Manga</TabsTrigger>
            <TabsTrigger value="seiyuu">
              <User className="h-4 w-4 md:mr-1" />
              <span className="hidden md:inline">Seiyuu</span>
            </TabsTrigger>
            <TabsTrigger value="director">
              <Film className="h-4 w-4 md:mr-1" />
              <span className="hidden md:inline">Sutradara</span>
            </TabsTrigger>
            <TabsTrigger value="studio">
              <Building2 className="h-4 w-4 md:mr-1" />
              <span className="hidden md:inline">Studio</span>
            </TabsTrigger>
            <TabsTrigger value="character">
              <Users className="h-4 w-4 md:mr-1" />
              <span className="hidden md:inline">Karakter</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex gap-2">
          <Input
            placeholder={`Cari ${searchType}...`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <Button onClick={handleSearch} disabled={loading}>
            {loading ? "Mencari..." : "Cari"}
          </Button>
        </div>

        {results.length > 0 && (
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Ditemukan {results.length} hasil
            </div>
            {searchType === "anime" || searchType === "manga" ? (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-5">
                {results.map((anime) => (
                  <AnimeCard
                    key={anime.id}
                    anime={anime}
                    showAddButton={searchType === "anime"}
                    onAdd={searchType === "anime" ? addToWatchlist : undefined}
                  />
                ))}
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {results.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 rounded-lg border p-4"
                  >
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.title}
                        className="h-16 w-12 object-cover rounded"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold">{item.title}</h3>
                      {item.name_japanese && (
                        <p className="text-sm text-muted-foreground">
                          {item.name_japanese}
                        </p>
                      )}
                      {item.about && (
                        <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
                          {item.about}
                        </p>
                      )}
                    </div>
                    <Button size="sm" variant="outline" asChild>
                      <a href={`/jelajah/${searchType}/${item.id}`}>Detail</a>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function convertJikanToAnime(jikan: any): Anime {
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
    genres: jikan.genres?.map((g: any) => ({ id: g.mal_id, name: g.name })),
    studios: jikan.studios?.map((s: any) => ({ id: s.mal_id, name: s.name })),
    start_date: jikan.aired?.from,
    end_date: jikan.aired?.to,
    season: jikan.season,
    year: jikan.year,
  };
}

function convertKitsuAnimeToAnime(kitsu: any): Anime {
  return {
    id: String(kitsu.id),
    title: kitsu.attributes?.canonicalTitle || kitsu.attributes?.titles?.en || "Unknown",
    title_en: kitsu.attributes?.titles?.en,
    title_japanese: kitsu.attributes?.titles?.ja_jp,
    synopsis: kitsu.attributes?.synopsis,
    poster_image: kitsu.attributes?.posterImage?.large,
    cover_image: kitsu.attributes?.coverImage?.large,
    type: "anime",
    status: kitsu.attributes?.status,
    episode_count: kitsu.attributes?.episodeCount,
    score: parseFloat(kitsu.attributes?.averageRating || "0") / 10,
    popularity: kitsu.attributes?.popularityRank,
    year: kitsu.attributes?.startDate
      ? new Date(kitsu.attributes.startDate).getFullYear()
      : undefined,
  };
}

function convertKitsuMangaToAnime(kitsu: any): Anime {
  return {
    id: String(kitsu.id),
    title: kitsu.attributes?.canonicalTitle || kitsu.attributes?.titles?.en || "Unknown",
    title_en: kitsu.attributes?.titles?.en,
    title_japanese: kitsu.attributes?.titles?.ja_jp,
    synopsis: kitsu.attributes?.synopsis,
    poster_image: kitsu.attributes?.posterImage?.large,
    cover_image: kitsu.attributes?.coverImage?.large,
    type: "manga",
    status: kitsu.attributes?.status,
    chapter_count: kitsu.attributes?.chapterCount,
    score: parseFloat(kitsu.attributes?.averageRating || "0") / 10,
    popularity: kitsu.attributes?.popularityRank,
    year: kitsu.attributes?.startDate
      ? new Date(kitsu.attributes.startDate).getFullYear()
      : undefined,
  };
}


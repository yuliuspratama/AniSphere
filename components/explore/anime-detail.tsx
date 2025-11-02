"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star, Calendar, Users, Film, BookOpen, Play, Plus } from "lucide-react";
import { jikanClient } from "@/lib/api/jikan";
import { useAddToWatchlist } from "@/lib/hooks/useAddToWatchlist";
import { animeChanClient } from "@/lib/api/animechan";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { staggerContainer, slideUp, fadeIn, scale } from "@/lib/utils/animations";
import { ImageSkeleton } from "@/components/ui/image-skeleton";
import { Skeleton } from "@/components/ui/skeleton";
import type { Anime } from "@/types/anime.types";

interface AnimeDetailProps {
  animeId: string;
}

export function AnimeDetail({ animeId }: AnimeDetailProps) {
  const [anime, setAnime] = useState<Anime | null>(null);
  const [episodes, setEpisodes] = useState<any[]>([]);
  const [characters, setCharacters] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [quotes, setQuotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToWatchlist } = useAddToWatchlist();

  useEffect(() => {
    async function fetchDetails() {
      try {
        const [animeData, episodesData, charactersData, staffData] = await Promise.all([
          jikanClient.getAnimeById(parseInt(animeId)),
          jikanClient.getAnimeEpisodes(parseInt(animeId)),
          jikanClient.getAnimeCharacters(parseInt(animeId)),
          jikanClient.getAnimeStaff(parseInt(animeId)),
        ]);

        const convertedAnime: Anime = {
          id: String(animeData.mal_id),
          title: animeData.title,
          title_en: animeData.title_english,
          title_japanese: animeData.title_japanese,
          synopsis: animeData.synopsis,
          poster_image: animeData.images?.jpg?.large_image_url,
          cover_image: animeData.images?.jpg?.large_image_url,
          type: "anime",
          status: animeData.status,
          episode_count: animeData.episodes,
          rating: animeData.rating,
          score: animeData.score,
          popularity: animeData.popularity,
          genres: animeData.genres?.map((g) => ({ id: g.mal_id, name: g.name })),
          studios: animeData.studios?.map((s) => ({ id: s.mal_id, name: s.name })),
          start_date: animeData.aired?.from,
          end_date: animeData.aired?.to,
          season: animeData.season,
          year: animeData.year,
        };

        setAnime(convertedAnime);
        setEpisodes(episodesData.slice(0, 20)); // Limit to first 20 episodes
        setCharacters(charactersData.slice(0, 10)); // Limit to 10 characters
        setStaff(staffData.slice(0, 10)); // Limit to 10 staff

        // Try to fetch quotes for this anime
        try {
          const animeQuotes = await animeChanClient.getQuotesByAnime(animeData.title);
          setQuotes(animeQuotes.slice(0, 5));
        } catch (error) {
          // Quotes not available for this anime
          console.log("Quotes not available");
        }
      } catch (error) {
        console.error("Error fetching anime details:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchDetails();
  }, [animeId]);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 space-y-6">
          <div className="flex gap-6">
            <ImageSkeleton aspectRatio="portrait" className="h-64 w-44 flex-shrink-0" />
            <div className="flex-1 space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-2/3" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-20" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!anime) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">Anime tidak ditemukan</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Hero Section */}
      <motion.div
        variants={slideUp}
        className="relative overflow-hidden rounded-lg border shadow-lg"
      >
        {anime.cover_image && (
          <div className="absolute inset-0">
            <Image
              src={anime.cover_image}
              alt={anime.title}
              fill
              className="object-cover opacity-20"
              priority
            />
          </div>
        )}
        <div className="relative flex gap-6 p-6 bg-background/80 backdrop-blur-sm">
          {anime.poster_image && (
            <motion.div
              variants={scale}
              initial="hidden"
              animate="visible"
              className="relative h-64 w-44 flex-shrink-0 overflow-hidden rounded-lg shadow-xl ring-2 ring-primary/20"
            >
              <Image
                src={anime.poster_image}
                alt={anime.title}
                fill
                className="object-cover"
                sizes="176px"
                priority
              />
            </motion.div>
          )}
          <div className="flex-1 space-y-4">
            <div>
              <h1 className="text-3xl font-bold">{anime.title}</h1>
              {anime.title_japanese && (
                <p className="text-lg text-muted-foreground">{anime.title_japanese}</p>
              )}
              {anime.title_en && anime.title_en !== anime.title && (
                <p className="text-muted-foreground">{anime.title_en}</p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-4">
              {anime.score && (
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">{anime.score.toFixed(1)}</span>
                </div>
              )}
              {anime.popularity && (
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">#{anime.popularity} Popularitas</span>
                </div>
              )}
              {anime.episode_count && (
                <div className="flex items-center gap-2">
                  <Film className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{anime.episode_count} Episode</span>
                </div>
              )}
              {anime.year && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{anime.year}</span>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button onClick={() => addToWatchlist(String(anime.id))}>
                <Plus className="mr-2 h-4 w-4" />
                Tambah ke Daftar
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Content Tabs */}
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Ringkasan</TabsTrigger>
          <TabsTrigger value="episodes">Episode</TabsTrigger>
          <TabsTrigger value="characters">Karakter</TabsTrigger>
          <TabsTrigger value="staff">Staf</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4 space-y-4">
          <Card>
            <CardContent className="p-6">
              <h2 className="mb-4 text-xl font-semibold">Sinopsis</h2>
              <p className="text-muted-foreground whitespace-pre-line">
                {anime.synopsis || "Tidak ada sinopsis tersedia."}
              </p>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardContent className="p-6">
                <h3 className="mb-4 font-semibold">Genre</h3>
                <div className="flex flex-wrap gap-2">
                  {anime.genres?.map((genre) => (
                    <span
                      key={genre.id}
                      className="rounded-full bg-primary/10 px-3 py-1 text-sm"
                    >
                      {genre.name}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="mb-4 font-semibold">Studio</h3>
                <div className="space-y-2">
                  {anime.studios?.map((studio) => (
                    <Link
                      key={studio.id}
                      href={`/jelajah/studio/${String(studio.id)}`}
                      className="block text-primary hover:underline"
                    >
                      {studio.name}
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {quotes.length > 0 && (
            <Card>
              <CardContent className="p-6">
                <h3 className="mb-4 font-semibold">Kutipan Populer</h3>
                <div className="space-y-3">
                  {quotes.map((quote, index) => (
                    <div key={index} className="rounded-lg border p-4 italic">
                      &quot;{quote.quote}&quot;
                      <div className="mt-2 text-sm text-muted-foreground">
                        - {quote.character}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="episodes" className="mt-4">
          <Card>
            <CardContent className="p-6">
              <h2 className="mb-4 text-xl font-semibold">Episode</h2>
              {episodes.length === 0 ? (
                <p className="text-muted-foreground">Data episode tidak tersedia</p>
              ) : (
                <div className="space-y-2">
                  {episodes.map((episode) => (
                    <div
                      key={episode.mal_id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div>
                        <div className="font-medium">
                          Episode {episode.number}: {episode.title || "Untitled"}
                        </div>
                        {episode.aired && (
                          <div className="text-sm text-muted-foreground">
                            {new Date(episode.aired).toLocaleDateString("id-ID")}
                          </div>
                        )}
                      </div>
                      <Button size="sm" variant="outline">
                        <Play className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="characters" className="mt-4">
          <Card>
            <CardContent className="p-6">
              <h2 className="mb-4 text-xl font-semibold">Karakter</h2>
              {characters.length === 0 ? (
                <p className="text-muted-foreground">Data karakter tidak tersedia</p>
              ) : (
                <motion.div
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                  className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
                >
                  {characters.map((character, index) => (
                    <Link
                      key={character.mal_id}
                      href={`/jelajah/character/${character.mal_id}`}
                    >
                      <motion.div
                        variants={slideUp}
                        whileHover={{ scale: 1.02, y: -2 }}
                        className="flex items-center gap-3 rounded-lg border p-3 transition-shadow hover:shadow-md cursor-pointer"
                      >
                        {character.images?.jpg?.image_url ? (
                          <div className="relative h-16 w-12 flex-shrink-0 overflow-hidden rounded">
                            <Image
                              src={character.images.jpg.image_url}
                              alt={character.name}
                              fill
                              className="object-cover"
                              sizes="48px"
                            />
                          </div>
                        ) : (
                          <div className="h-16 w-12 flex-shrink-0 rounded bg-muted" />
                        )}
                        <div>
                          <div className="font-medium">{character.name}</div>
                          {character.name_kanji && (
                            <div className="text-sm text-muted-foreground">
                              {character.name_kanji}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    </Link>
                  ))}
                </motion.div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="staff" className="mt-4">
          <Card>
            <CardContent className="p-6">
              <h2 className="mb-4 text-xl font-semibold">Staf Produksi</h2>
              {staff.length === 0 ? (
                <p className="text-muted-foreground">Data staf tidak tersedia</p>
              ) : (
                <motion.div
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                  className="space-y-3"
                >
                  {staff.map((person) => (
                    <motion.div
                      key={person.mal_id}
                      variants={slideUp}
                      whileHover={{ scale: 1.01, x: 4 }}
                      className="flex items-center gap-3 rounded-lg border p-3 transition-shadow hover:shadow-md"
                    >
                      {person.images?.jpg?.image_url ? (
                        <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-full ring-2 ring-primary/20">
                          <Image
                            src={person.images.jpg.image_url}
                            alt={person.name}
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                        </div>
                      ) : (
                        <div className="h-12 w-12 flex-shrink-0 rounded-full bg-muted" />
                      )}
                      <div className="flex-1">
                        <Link
                          href={`/jelajah/seiyuu/${person.mal_id}`}
                          className="font-medium text-primary hover:underline transition-colors"
                        >
                          {person.name}
                        </Link>
                        {person.given_name && (
                          <div className="text-sm text-muted-foreground">
                            {person.given_name} {person.family_name}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}


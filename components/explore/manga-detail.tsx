"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star, Calendar, Users, BookOpen, Plus } from "lucide-react";
import { kitsuClient } from "@/lib/api/kitsu";
import { useAddToWatchlist } from "@/lib/hooks/useAddToWatchlist";
import Image from "next/image";
import Link from "next/link";
import type { Manga } from "@/types/anime.types";

interface MangaDetailProps {
  mangaId: string;
}

export function MangaDetail({ mangaId }: MangaDetailProps) {
  const [manga, setManga] = useState<Manga | null>(null);
  const [loading, setLoading] = useState(true);
  const { addToWatchlist } = useAddToWatchlist();

  useEffect(() => {
    async function fetchDetails() {
      try {
        const mangaData = await kitsuClient.getMangaById(mangaId);

        const convertedManga: Manga = {
          id: String(mangaData.id),
          title: mangaData.attributes?.canonicalTitle || "Unknown",
          title_en: mangaData.attributes?.titles?.en,
          title_japanese: mangaData.attributes?.titles?.ja_jp,
          synopsis: mangaData.attributes?.synopsis,
          poster_image: mangaData.attributes?.posterImage?.large,
          cover_image: mangaData.attributes?.coverImage?.large,
          type: "manga",
          status: mangaData.attributes?.status,
          chapter_count: mangaData.attributes?.chapterCount,
          volume_count: mangaData.attributes?.volumeCount,
          score: parseFloat(mangaData.attributes?.averageRating || "0") / 10,
          popularity: mangaData.attributes?.popularityRank,
          year: mangaData.attributes?.startDate
            ? new Date(mangaData.attributes.startDate).getFullYear()
            : undefined,
        };

        setManga(convertedManga);
      } catch (error) {
        console.error("Error fetching manga details:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchDetails();
  }, [mangaId]);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">Memuat detail manga...</p>
        </CardContent>
      </Card>
    );
  }

  if (!manga) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">Manga tidak ditemukan</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-lg">
        {manga.cover_image && (
          <div className="absolute inset-0">
            <Image
              src={manga.cover_image}
              alt={manga.title}
              fill
              className="object-cover opacity-20"
            />
          </div>
        )}
        <div className="relative flex gap-6 p-6">
          {manga.poster_image && (
            <div className="relative h-64 w-44 flex-shrink-0 overflow-hidden rounded-lg">
              <Image
                src={manga.poster_image}
                alt={manga.title}
                fill
                className="object-cover"
              />
            </div>
          )}
          <div className="flex-1 space-y-4">
            <div>
              <h1 className="text-3xl font-bold">{manga.title}</h1>
              {manga.title_japanese && (
                <p className="text-lg text-muted-foreground">{manga.title_japanese}</p>
              )}
              {manga.title_en && manga.title_en !== manga.title && (
                <p className="text-muted-foreground">{manga.title_en}</p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-4">
              {manga.score && (
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">{manga.score.toFixed(1)}</span>
                </div>
              )}
              {manga.popularity && (
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">#{manga.popularity} Popularitas</span>
                </div>
              )}
              {manga.chapter_count && (
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{manga.chapter_count} Chapter</span>
                </div>
              )}
              {manga.volume_count && (
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{manga.volume_count} Volume</span>
                </div>
              )}
              {manga.year && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{manga.year}</span>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button onClick={() => addToWatchlist(String(manga.id), "manga")}>
                <Plus className="mr-2 h-4 w-4" />
                Tambah ke Daftar
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <Card>
        <CardContent className="p-6">
          <h2 className="mb-4 text-xl font-semibold">Sinopsis</h2>
          <p className="text-muted-foreground whitespace-pre-line">
            {manga.synopsis || "Tidak ada sinopsis tersedia."}
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="p-6">
            <h3 className="mb-4 font-semibold">Status</h3>
            <p className="capitalize">{manga.status || "Tidak diketahui"}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="mb-4 font-semibold">Informasi</h3>
            <div className="space-y-2 text-sm">
              {manga.chapter_count && (
                <div>Chapter: {manga.chapter_count}</div>
              )}
              {manga.volume_count && (
                <div>Volume: {manga.volume_count}</div>
              )}
              {manga.year && <div>Tahun: {manga.year}</div>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


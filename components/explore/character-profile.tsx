"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ImageSkeleton } from "@/components/ui/image-skeleton";
import { jikanClient } from "@/lib/api/jikan";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { fadeIn, slideUp, staggerContainer } from "@/lib/utils/animations";
import { Film, Users, Heart, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface CharacterProfileProps {
  characterId: string;
}

export function CharacterProfile({ characterId }: CharacterProfileProps) {
  const [character, setCharacter] = useState<any>(null);
  const [anime, setAnime] = useState<any[]>([]);
  const [manga, setManga] = useState<any[]>([]);
  const [voiceActors, setVoiceActors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchCharacter() {
      try {
        const characterData = await jikanClient.getCharacterById(parseInt(characterId));
        setCharacter(characterData);

        // Fetch anime and manga appearances
        if (characterData.anime) {
          setAnime(characterData.anime.slice(0, 10));
        }
        if (characterData.manga) {
          setManga(characterData.manga.slice(0, 10));
        }
        if (characterData.voices) {
          setVoiceActors(characterData.voices.slice(0, 10));
        }
      } catch (error) {
        console.error("Error fetching character:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchCharacter();
  }, [characterId]);

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
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!character) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">Karakter tidak ditemukan</p>
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
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Kembali
      </Button>

      {/* Hero Section */}
      <motion.div
        variants={slideUp}
        className="relative overflow-hidden rounded-lg border shadow-lg"
      >
        <div className="relative flex gap-6 p-6 bg-background/80 backdrop-blur-sm">
          {character.images?.jpg?.image_url && (
            <motion.div
              variants={fadeIn}
              initial="hidden"
              animate="visible"
              className="relative h-64 w-44 flex-shrink-0 overflow-hidden rounded-lg shadow-xl ring-2 ring-primary/20"
            >
              <Image
                src={character.images.jpg.image_url}
                alt={character.name}
                fill
                className="object-cover"
                sizes="176px"
                priority
              />
            </motion.div>
          )}
          <div className="flex-1 space-y-4">
            <div>
              <h1 className="text-3xl font-bold">{character.name}</h1>
              {character.name_kanji && (
                <p className="text-lg text-muted-foreground">{character.name_kanji}</p>
              )}
              {character.nicknames && character.nicknames.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {character.nicknames.map((nickname: string, index: number) => (
                    <span
                      key={index}
                      className="rounded-full bg-primary/10 px-3 py-1 text-sm text-primary"
                    >
                      {nickname}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-4">
              {character.favorites && (
                <div className="flex items-center gap-2">
                  <Heart className="h-5 w-5 fill-red-400 text-red-400" />
                  <span className="font-semibold">{character.favorites.toLocaleString()} Favorit</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* About Section */}
      {character.about && (
        <motion.div variants={slideUp}>
          <Card>
            <CardContent className="p-6">
              <h2 className="mb-4 text-xl font-semibold">Tentang</h2>
              <p className="text-muted-foreground whitespace-pre-line">
                {character.about}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Anime Appearances */}
      {anime.length > 0 && (
        <motion.div variants={slideUp}>
          <Card>
            <CardContent className="p-6">
              <h2 className="mb-4 text-xl font-semibold flex items-center gap-2">
                <Film className="h-5 w-5" />
                Anime
              </h2>
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="space-y-2"
              >
                {anime.map((item: any) => (
                  <motion.div
                    key={item.anime.mal_id}
                    variants={slideUp}
                    whileHover={{ scale: 1.01, x: 4 }}
                    className="flex items-center gap-3 rounded-lg border p-3 transition-shadow hover:shadow-md"
                  >
                    {item.anime.images?.jpg?.image_url && (
                      <div className="relative h-16 w-12 flex-shrink-0 overflow-hidden rounded">
                        <Image
                          src={item.anime.images.jpg.image_url}
                          alt={item.anime.title}
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <Link
                        href={`/jelajah/anime/${item.anime.mal_id}`}
                        className="font-medium text-primary hover:underline transition-colors"
                      >
                        {item.anime.title}
                      </Link>
                      {item.role && (
                        <div className="text-sm text-muted-foreground">
                          {item.role}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Manga Appearances */}
      {manga.length > 0 && (
        <motion.div variants={slideUp}>
          <Card>
            <CardContent className="p-6">
              <h2 className="mb-4 text-xl font-semibold flex items-center gap-2">
                <Film className="h-5 w-5" />
                Manga
              </h2>
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="space-y-2"
              >
                {manga.map((item: any) => (
                  <motion.div
                    key={item.manga.mal_id}
                    variants={slideUp}
                    whileHover={{ scale: 1.01, x: 4 }}
                    className="flex items-center gap-3 rounded-lg border p-3 transition-shadow hover:shadow-md"
                  >
                    {item.manga.images?.jpg?.image_url && (
                      <div className="relative h-16 w-12 flex-shrink-0 overflow-hidden rounded">
                        <Image
                          src={item.manga.images.jpg.image_url}
                          alt={item.manga.title}
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <Link
                        href={`/jelajah/manga/${item.manga.mal_id}`}
                        className="font-medium text-primary hover:underline transition-colors"
                      >
                        {item.manga.title}
                      </Link>
                      {item.role && (
                        <div className="text-sm text-muted-foreground">
                          {item.role}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Voice Actors */}
      {voiceActors.length > 0 && (
        <motion.div variants={slideUp}>
          <Card>
            <CardContent className="p-6">
              <h2 className="mb-4 text-xl font-semibold flex items-center gap-2">
                <Users className="h-5 w-5" />
                Pengisi Suara
              </h2>
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="space-y-2"
              >
                {voiceActors.map((item: any) => (
                  <motion.div
                    key={item.person.mal_id}
                    variants={slideUp}
                    whileHover={{ scale: 1.01, x: 4 }}
                    className="flex items-center gap-3 rounded-lg border p-3 transition-shadow hover:shadow-md"
                  >
                    {item.person.images?.jpg?.image_url && (
                      <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-full ring-2 ring-primary/20">
                        <Image
                          src={item.person.images.jpg.image_url}
                          alt={item.person.name}
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <Link
                        href={`/jelajah/seiyuu/${item.person.mal_id}`}
                        className="font-medium text-primary hover:underline transition-colors"
                      >
                        {item.person.name}
                      </Link>
                      {item.language && (
                        <div className="text-sm text-muted-foreground">
                          {item.language}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}


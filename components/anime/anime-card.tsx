"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, Calendar, Users } from "lucide-react";
import { ImageSkeleton } from "@/components/ui/image-skeleton";
import { scale, cardHover } from "@/lib/utils/animations";
import type { Anime } from "@/types/anime.types";

interface AnimeCardProps {
  anime: Anime;
  showAddButton?: boolean;
  onAdd?: (animeId: string) => void;
}

export function AnimeCard({ anime, showAddButton = false, onAdd }: AnimeCardProps) {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const imageUrl = anime.poster_image || anime.cover_image || "/placeholder-anime.jpg";
  const title = anime.title_en || anime.title || "Unknown Title";

  return (
    <motion.div
      variants={scale}
      initial="hidden"
      animate="visible"
      whileHover={cardHover}
      className="h-full"
    >
      <Card className="group relative flex h-full flex-col overflow-hidden border-0 bg-transparent shadow-md transition-all duration-300 hover:shadow-xl hover:shadow-primary/20">
        <Link href={`/jelajah/anime/${anime.id}`}>
          <div className="relative aspect-[2/3] w-full overflow-hidden rounded-lg bg-gradient-to-br from-muted to-muted/50">
            {imageLoading && !imageError && (
              <div className="absolute inset-0 z-10">
                <ImageSkeleton aspectRatio="portrait" className="h-full w-full" />
              </div>
            )}
            {!imageError && (
              <Image
                src={imageUrl}
                alt={title}
                fill
                className={`object-cover transition-transform duration-500 ${
                  imageLoading ? "opacity-0" : "opacity-100 group-hover:scale-105"
                }`}
                sizes="(max-width: 768px) 150px, (max-width: 1200px) 180px, 200px"
                onLoad={() => setImageLoading(false)}
                onError={() => {
                  setImageError(true);
                  setImageLoading(false);
                }}
              />
            )}
            {imageError && (
              <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                <div className="text-center text-muted-foreground">
                  <Calendar className="mx-auto h-8 w-8 mb-2" />
                  <p className="text-xs">Image not available</p>
                </div>
              </div>
            )}
            
            {/* Gradient overlay for better text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            
            {/* Glassmorphism overlay on hover */}
            <div className="absolute inset-0 bg-background/10 backdrop-blur-sm opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            
            {/* Score badge */}
            {anime.score && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="absolute right-2 top-2 z-20 flex items-center gap-1 rounded-full bg-black/80 backdrop-blur-md px-2.5 py-1 text-xs font-semibold text-white shadow-lg ring-1 ring-white/10"
              >
                <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                <span>{anime.score.toFixed(1)}</span>
              </motion.div>
            )}

            {/* Hover info overlay */}
            <div className="absolute bottom-0 left-0 right-0 z-10 translate-y-full p-3 transition-transform duration-300 group-hover:translate-y-0">
              <h3 className="line-clamp-2 text-sm font-bold text-white drop-shadow-lg">
                {title}
              </h3>
            </div>
          </div>
        </Link>
        
        <CardContent className="flex min-h-[100px] flex-col p-3">
          <Link href={`/jelajah/anime/${anime.id}`}>
            <motion.h3
              whileHover={{ scale: 1.02 }}
              className="line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-tight transition-colors hover:text-primary"
            >
              {title}
            </motion.h3>
          </Link>
          
          <div className="mt-2 flex min-h-[1.25rem] flex-wrap items-center gap-2 text-xs text-muted-foreground">
            {anime.type && (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 capitalize text-primary">
                {anime.type}
              </span>
            )}
            {anime.year && (
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{anime.year}</span>
              </div>
            )}
            {anime.popularity && (
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                <span>#{anime.popularity}</span>
              </div>
            )}
          </div>
          
          {showAddButton && onAdd && (
            <motion.div className="mt-auto pt-2" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                size="sm"
                className="w-full"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onAdd(String(anime.id));
                }}
              >
                Tambah ke Daftar
              </Button>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}


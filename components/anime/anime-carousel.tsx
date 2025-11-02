"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimeCard } from "./anime-card";
import type { Anime } from "@/types/anime.types";
import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { staggerContainer, slideUp } from "@/lib/utils/animations";

interface AnimeCarouselProps {
  title: string;
  anime: Anime[];
  showAddButton?: boolean;
  onAdd?: (animeId: string) => void;
}

export function AnimeCarousel({ title, anime, showAddButton, onAdd }: AnimeCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);

  const checkScrollability = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
      
      // Calculate scroll progress (0 to 1)
      const maxScroll = scrollWidth - clientWidth;
      setScrollProgress(maxScroll > 0 ? scrollLeft / maxScroll : 0);
    }
  };

  useEffect(() => {
    checkScrollability();
    const scrollElement = scrollRef.current;
    if (scrollElement) {
      scrollElement.addEventListener("scroll", checkScrollability);
      window.addEventListener("resize", checkScrollability);
      return () => {
        scrollElement.removeEventListener("scroll", checkScrollability);
        window.removeEventListener("resize", checkScrollability);
      };
    }
  }, [anime]);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.clientWidth * 0.8;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="relative space-y-4"
    >
      <div className="flex items-center justify-between">
        <motion.h2 variants={slideUp} className="text-2xl font-bold">
          {title}
        </motion.h2>
        <div className="flex items-center gap-3">
          {/* Scroll progress indicator */}
          <div className="hidden h-1 w-24 overflow-hidden rounded-full bg-muted md:block">
            <motion.div
              className="h-full bg-primary"
              style={{ width: `${scrollProgress * 100}%` }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          </div>
          <div className="flex gap-2">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="outline"
                size="icon"
                onClick={() => scroll("left")}
                disabled={!canScrollLeft}
                className="transition-opacity disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="outline"
                size="icon"
                onClick={() => scroll("right")}
                disabled={!canScrollRight}
                className="transition-opacity disabled:opacity-40"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
      
      {/* Fade edges */}
      <div className="relative">
        {canScrollLeft && (
          <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-16 bg-gradient-to-r from-background to-transparent" />
        )}
        {canScrollRight && (
          <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-16 bg-gradient-to-l from-background to-transparent" />
        )}
        
        <div
          ref={scrollRef}
          onScroll={checkScrollability}
          className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide scroll-smooth"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            scrollSnapType: "x proximity",
          }}
        >
          {anime.map((item, index) => (
            <motion.div
              key={item.id}
              variants={slideUp}
              className="flex w-[150px] flex-shrink-0 flex-col md:w-[180px]"
              style={{ scrollSnapAlign: "start" }}
            >
              <AnimeCard anime={item} showAddButton={showAddButton} onAdd={onAdd} />
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}


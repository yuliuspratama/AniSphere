"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { AnimeCardSkeleton } from "./anime-card-skeleton";

interface CarouselSkeletonProps {
  title?: string;
  count?: number;
}

export function CarouselSkeleton({ 
  title = "Loading...", 
  count = 5 
}: CarouselSkeletonProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-10 rounded-md" />
          <Skeleton className="h-10 w-10 rounded-md" />
        </div>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="min-w-[150px] flex-shrink-0 md:min-w-[180px]">
            <AnimeCardSkeleton />
          </div>
        ))}
      </div>
    </div>
  );
}


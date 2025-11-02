"use client";

import { Card, CardContent } from "@/components/ui/card";
import { ImageSkeleton } from "@/components/ui/image-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export function AnimeCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <ImageSkeleton aspectRatio="portrait" />
      <CardContent className="p-3">
        <Skeleton className="h-4 w-3/4 mb-2" />
        <Skeleton className="h-3 w-1/2" />
        <div className="mt-2 flex items-center gap-3">
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-14" />
        </div>
      </CardContent>
    </Card>
  );
}


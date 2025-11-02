"use client";

import { Skeleton } from "./skeleton";
import { cn } from "@/lib/utils/cn";

interface ImageSkeletonProps {
  aspectRatio?: "square" | "portrait" | "landscape";
  className?: string;
}

export function ImageSkeleton({ 
  aspectRatio = "portrait",
  className 
}: ImageSkeletonProps) {
  const aspectClasses = {
    square: "aspect-square",
    portrait: "aspect-[2/3]",
    landscape: "aspect-video",
  };

  return (
    <Skeleton
      className={cn(
        "w-full overflow-hidden rounded-lg",
        aspectClasses[aspectRatio],
        className
      )}
    />
  );
}


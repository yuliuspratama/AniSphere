"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, MessageSquare, ThumbsUp } from "lucide-react";
import Link from "next/link";

interface Review {
  id: string;
  anime_id?: string;
  manga_id?: string;
  title: string;
  content: string;
  rating: number;
  likes: number;
  created_at: string;
  anime_title?: string;
}

export function ReviewWall({ userId }: { userId: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchReviews() {
      try {
        const { data, error } = await supabase
          .from("user_reviews")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(20);

        if (error) throw error;

        setReviews((data || []) as Review[]);
      } catch (error) {
        console.error("Error fetching reviews:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchReviews();
  }, [userId, supabase]);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">Memuat ulasan...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Dinding Ulasan
        </CardTitle>
        <CardDescription>
          {reviews.length} ulasan ditulis
        </CardDescription>
      </CardHeader>
      <CardContent>
        {reviews.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            Belum ada ulasan yang ditulis
          </p>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="rounded-lg border p-4"
              >
                <div className="mb-2 flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{review.title}</h3>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < review.rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-muted-foreground"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    {review.anime_id && (
                      <Link
                        href={`/jelajah/anime/${review.anime_id}`}
                        className="text-sm text-primary hover:underline"
                      >
                        Lihat Anime
                      </Link>
                    )}
                    {review.manga_id && (
                      <Link
                        href={`/jelajah/manga/${review.manga_id}`}
                        className="text-sm text-primary hover:underline"
                      >
                        Lihat Manga
                      </Link>
                    )}
                  </div>
                </div>
                <p className="mb-3 text-sm text-muted-foreground line-clamp-3">
                  {review.content}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>
                      {new Date(review.created_at).toLocaleDateString("id-ID")}
                    </span>
                    <div className="flex items-center gap-1">
                      <ThumbsUp className="h-3 w-3" />
                      <span>{review.likes}</span>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" asChild>
                    <Link href={`/reviews/${review.id}`}>Baca Lengkap</Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}


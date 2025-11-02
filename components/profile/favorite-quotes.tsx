"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Quote, Plus, Trash2 } from "lucide-react";
import { animeChanClient } from "@/lib/api/animechan";
import { katanimeClient } from "@/lib/api/katanime";
import { toast } from "sonner";

interface FavoriteQuote {
  id?: string;
  quote: string;
  character: string;
  anime: string;
  source: "animechan" | "katanime";
  created_at?: string;
}

export function FavoriteQuotes({ userId }: { userId: string }) {
  const [quotes, setQuotes] = useState<FavoriteQuote[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  // Note: We'll store quotes in a simple JSON column in profiles table
  // In a real app, you might want a separate table for this

  useEffect(() => {
    async function fetchQuotes() {
      try {
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("preferences")
          .eq("user_id", userId)
          .single();

        if (error && error.code !== "PGRST116") throw error;

        const savedQuotes = (profile?.preferences as any)?.favorite_quotes || [];
        setQuotes(savedQuotes);
      } catch (error) {
        console.error("Error fetching quotes:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchQuotes();
  }, [userId, supabase]);

  const handleAddRandomQuote = async (source: "animechan" | "katanime") => {
    try {
      let newQuote: FavoriteQuote;

      if (source === "animechan") {
        const quote = await animeChanClient.getRandomQuote();
        newQuote = {
          quote: quote.quote,
          character: quote.character,
          anime: quote.anime,
          source: "animechan",
        };
      } else {
        const quote = await katanimeClient.getRandomQuote();
        newQuote = {
          quote: quote.quote,
          character: quote.character,
          anime: quote.anime,
          source: "katanime",
        };
      }

      const updatedQuotes = [...quotes, newQuote];

      const { error } = await supabase
        .from("profiles")
        .update({
          preferences: {
            favorite_quotes: updatedQuotes,
          },
        })
        .eq("user_id", userId);

      if (error) throw error;

      setQuotes(updatedQuotes);
      toast.success("Kutipan berhasil ditambahkan!");
    } catch (error: any) {
      toast.error(error.message || "Gagal menambahkan kutipan");
    }
  };

  const handleRemoveQuote = async (index: number) => {
    try {
      const updatedQuotes = quotes.filter((_, i) => i !== index);

      const { error } = await supabase
        .from("profiles")
        .update({
          preferences: {
            favorite_quotes: updatedQuotes,
          },
        })
        .eq("user_id", userId);

      if (error) throw error;

      setQuotes(updatedQuotes);
      toast.success("Kutipan dihapus");
    } catch (error: any) {
      toast.error(error.message || "Gagal menghapus kutipan");
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">Memuat kutipan favorit...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Quote className="h-5 w-5" />
              Kutipan Favorit
            </CardTitle>
            <CardDescription>
              Kumpulkan kutipan anime favorit Anda
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleAddRandomQuote("animechan")}
            >
              <Plus className="mr-2 h-4 w-4" />
              EN
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleAddRandomQuote("katanime")}
            >
              <Plus className="mr-2 h-4 w-4" />
              ID
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {quotes.length === 0 ? (
          <div className="space-y-4 text-center">
            <p className="text-muted-foreground py-8">
              Belum ada kutipan favorit. Tambahkan kutipan acak untuk memulai!
            </p>
            <div className="flex justify-center gap-2">
              <Button
                variant="outline"
                onClick={() => handleAddRandomQuote("animechan")}
              >
                Tambah Kutipan (English)
              </Button>
              <Button
                variant="outline"
                onClick={() => handleAddRandomQuote("katanime")}
              >
                Tambah Kutipan (Indonesia)
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {quotes.map((quote, index) => (
              <div
                key={index}
                className="relative rounded-lg border bg-muted/50 p-4"
              >
                <div className="mb-2 text-4xl text-primary opacity-20">"</div>
                <p className="mb-3 italic text-foreground">{quote.quote}</p>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">— {quote.character}</div>
                    <div className="text-sm text-muted-foreground">
                      {quote.anime}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRemoveQuote(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="absolute right-4 top-4 text-xs text-muted-foreground">
                  {quote.source === "animechan" ? "EN" : "ID"}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}


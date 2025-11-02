"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export function useAddToWatchlist() {
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const addToWatchlist = async (
    animeId: string,
    mediaType: "anime" | "manga" = "anime",
    status: "watching" | "completed" | "on_hold" | "dropped" | "plan_to_watch" = "plan_to_watch"
  ) => {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast.error("Anda harus login terlebih dahulu");
        return false;
      }

      // Check if already exists
      const { data: existing } = await supabase
        .from("user_anime_list")
        .select("id")
        .eq("user_id", user.id)
        .eq("anime_id", animeId)
        .eq("media_type", mediaType)
        .single();

      if (existing) {
        toast.info("Anime sudah ada di daftar Anda");
        return false;
      }

      const { error } = await supabase.from("user_anime_list").insert({
        user_id: user.id,
        anime_id: animeId,
        media_type: mediaType,
        status,
        progress: 0,
      });

      if (error) throw error;

      toast.success("Berhasil ditambahkan ke daftar!");
      return true;
    } catch (error: any) {
      console.error("Error adding to watchlist:", error);
      toast.error(error.message || "Gagal menambahkan ke daftar");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { addToWatchlist, loading };
}


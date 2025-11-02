"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { UserAnimeList } from "@/types/anime.types";

export function useAnimeList(userId?: string) {
  const [lists, setLists] = useState<UserAnimeList[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    async function fetchLists() {
      try {
        const { data, error } = await supabase
          .from("user_anime_list")
          .select("*")
          .eq("user_id", userId)
          .order("updated_at", { ascending: false });

        if (error) throw error;

        setLists(data || []);
      } catch (error) {
        console.error("Error fetching anime list:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchLists();

    // Subscribe to real-time updates
    const channel = supabase
      .channel("anime-list-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "user_anime_list",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          fetchLists();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, supabase]);

  return { lists, loading };
}


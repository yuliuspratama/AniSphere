"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Star } from "lucide-react";
import { getCurrentLeagueSeason } from "@/lib/utils/league-scoring";

interface LeagueTeam {
  season: string;
  year: number;
  team_name?: string;
  anime_ids: string[];
  total_points: number;
}

export function LeagueTeam({ userId }: { userId: string }) {
  const [team, setTeam] = useState<LeagueTeam | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const currentSeason = getCurrentLeagueSeason();

  useEffect(() => {
    async function fetchTeam() {
      try {
        const { data, error } = await supabase
          .from("anime_season_league")
          .select("*")
          .eq("user_id", userId)
          .eq("season", currentSeason.season)
          .eq("year", currentSeason.year)
          .single();

        if (error && error.code !== "PGRST116") {
          throw error;
        }

        setTeam(data || null);
      } catch (error) {
        console.error("Error fetching league team:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchTeam();
  }, [userId, currentSeason, supabase]);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">Memuat tim liga...</p>
        </CardContent>
      </Card>
    );
  }

  if (!team || team.anime_ids.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Tim Liga Musiman
          </CardTitle>
          <CardDescription>
            Anda belum memiliki tim untuk musim ini. Ikuti liga di Arena!
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const seasonName = `${team.season.charAt(0).toUpperCase() + team.season.slice(1)} ${team.year}`;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Tim Liga {seasonName}
        </CardTitle>
        <CardDescription>
          {team.team_name || "Tim tanpa nama"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex items-center justify-between rounded-lg border p-4">
          <div>
            <div className="text-sm text-muted-foreground">Total Poin</div>
            <div className="text-2xl font-bold">{team.total_points.toFixed(1)}</div>
          </div>
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            <span className="text-sm">{team.anime_ids.length} Anime</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-sm font-semibold">Anime dalam Tim:</div>
          <div className="grid gap-2 md:grid-cols-2">
            {team.anime_ids.map((animeId, index) => (
              <div
                key={index}
                className="flex items-center gap-3 rounded-lg border p-3"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-bold">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="font-medium">Anime ID: {animeId}</div>
                  <div className="text-xs text-muted-foreground">
                    <a
                      href={`/jelajah/anime/${animeId}`}
                      className="text-primary hover:underline"
                    >
                      Lihat Detail
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


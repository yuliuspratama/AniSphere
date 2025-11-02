"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { useAnimeList } from "@/lib/hooks/useAnimeList";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, CheckCircle2, Clock, Star, TrendingUp, Calendar } from "lucide-react";

interface UserStats {
  totalAnime: number;
  completed: number;
  watching: number;
  onHold: number;
  dropped: number;
  planToWatch: number;
  averageScore: number;
  totalEpisodes: number;
  favoriteGenres: string[];
  daysActive: number;
}

export function ProfileStats({ userId }: { userId: string }) {
  const { user: currentUser } = useAuth();
  const { lists } = useAnimeList(userId);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchStats() {
      try {
        // Calculate basic stats from watchlist
        const completed = lists.filter((item) => item.status === "completed").length;
        const watching = lists.filter((item) => item.status === "watching").length;
        const onHold = lists.filter((item) => item.status === "on_hold").length;
        const dropped = lists.filter((item) => item.status === "dropped").length;
        const planToWatch = lists.filter((item) => item.status === "plan_to_watch").length;

        const totalAnime = lists.length;
        const scoredAnime = lists.filter((item) => item.score).length;
        const avgScore =
          scoredAnime > 0
            ? lists
                .filter((item) => item.score)
                .reduce((sum, item) => sum + (item.score || 0), 0) / scoredAnime
            : 0;

        const totalEpisodes = lists.reduce(
          (sum, item) => sum + (item.progress || 0),
          0
        );

        // Fetch profile creation date for days active
        const { data: profile } = await supabase
          .from("profiles")
          .select("created_at")
          .eq("user_id", userId)
          .single();

        const daysActive = profile?.created_at
          ? Math.floor(
              (Date.now() - new Date(profile.created_at).getTime()) /
                (1000 * 60 * 60 * 24)
            )
          : 0;

        // Fetch watch history for total episodes watched
        const { data: watchHistory } = await supabase
          .from("watch_history")
          .select("episode_number")
          .eq("user_id", userId);

        const totalWatchedEpisodes = watchHistory?.length || 0;

        setStats({
          totalAnime,
          completed,
          watching,
          onHold,
          dropped,
          planToWatch,
          averageScore: avgScore,
          totalEpisodes: totalWatchedEpisodes || totalEpisodes,
          favoriteGenres: [], // Would need to fetch from anime details
          daysActive,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [userId, lists, supabase]);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">Memuat statistik...</p>
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return null;
  }

  const statCards = [
    {
      label: "Total Anime",
      value: stats.totalAnime,
      icon: BookOpen,
      color: "text-blue-500",
    },
    {
      label: "Selesai",
      value: stats.completed,
      icon: CheckCircle2,
      color: "text-green-500",
    },
    {
      label: "Sedang Ditonton",
      value: stats.watching,
      icon: Clock,
      color: "text-yellow-500",
    },
    {
      label: "Rata-rata Skor",
      value: stats.averageScore > 0 ? stats.averageScore.toFixed(1) : "-",
      icon: Star,
      color: "text-purple-500",
    },
    {
      label: "Episode Ditonton",
      value: stats.totalEpisodes,
      icon: TrendingUp,
      color: "text-orange-500",
    },
    {
      label: "Hari Aktif",
      value: stats.daysActive,
      icon: Calendar,
      color: "text-pink-500",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Statistik Pengguna</CardTitle>
        <CardDescription>Ringkasan aktivitas dan pencapaian</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="flex flex-col items-center gap-2 rounded-lg border p-4"
              >
                <Icon className={`h-6 w-6 ${stat.color}`} />
                <div className="text-center">
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border p-4">
            <h3 className="mb-3 font-semibold">Distribusi Status</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Selesai</span>
                <span className="font-semibold">{stats.completed}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Sedang Ditonton</span>
                <span className="font-semibold">{stats.watching}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Ditunda</span>
                <span className="font-semibold">{stats.onHold}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Ditinggalkan</span>
                <span className="font-semibold">{stats.dropped}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Ingin Ditonton</span>
                <span className="font-semibold">{stats.planToWatch}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/components/providers/auth-provider";
import { useAnimeList } from "@/lib/hooks/useAnimeList";
import { BookOpen, CheckCircle2, Clock, Star } from "lucide-react";

export function QuickStats() {
  const { user } = useAuth();
  const { lists, loading } = useAnimeList(user?.id);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Statistik Cepat</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Memuat statistik...</p>
        </CardContent>
      </Card>
    );
  }

  const completed = lists.filter((item) => item.status === "completed").length;
  const watching = lists.filter((item) => item.status === "watching").length;
  const planToWatch = lists.filter((item) => item.status === "plan_to_watch").length;
  const avgScore =
    lists
      .filter((item) => item.score)
      .reduce((acc, item) => acc + (item.score || 0), 0) /
    lists.filter((item) => item.score).length || 0;

  const stats = [
    {
      label: "Selesai",
      value: completed,
      icon: CheckCircle2,
      color: "text-green-500",
    },
    {
      label: "Sedang Ditonton",
      value: watching,
      icon: Clock,
      color: "text-blue-500",
    },
    {
      label: "Ingin Ditonton",
      value: planToWatch,
      icon: BookOpen,
      color: "text-purple-500",
    },
    {
      label: "Rata-rata Skor",
      value: avgScore > 0 ? avgScore.toFixed(1) : "-",
      icon: Star,
      color: "text-yellow-500",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Statistik Cepat</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="flex flex-col items-center gap-2">
                <Icon className={`h-6 w-6 ${stat.color}`} />
                <div className="text-center">
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}


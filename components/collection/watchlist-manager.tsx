"use client";

import { useState } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { useAnimeList } from "@/lib/hooks/useAnimeList";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AnimeCard } from "@/components/anime/anime-card";
import { CheckCircle2, Clock, BookOpen, Pause, XCircle, Plus } from "lucide-react";
import { toast } from "sonner";
import type { UserAnimeList } from "@/types/anime.types";

const statusConfig = {
  watching: { label: "Sedang Ditonton", icon: Clock, color: "text-blue-500" },
  completed: { label: "Selesai", icon: CheckCircle2, color: "text-green-500" },
  on_hold: { label: "Ditunda", icon: Pause, color: "text-yellow-500" },
  dropped: { label: "Ditinggalkan", icon: XCircle, color: "text-red-500" },
  plan_to_watch: { label: "Ingin Ditonton", icon: BookOpen, color: "text-purple-500" },
};

export function WatchlistManager() {
  const { user } = useAuth();
  const { lists, loading } = useAnimeList(user?.id);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const supabase = createClient();

  const filteredLists = selectedStatus === "all"
    ? lists
    : lists.filter((item) => item.status === selectedStatus);

  const groupedByStatus = lists.reduce((acc, item) => {
    if (!acc[item.status]) {
      acc[item.status] = [];
    }
    acc[item.status].push(item);
    return acc;
  }, {} as Record<string, UserAnimeList[]>);

  const handleStatusChange = async (listId: string, newStatus: UserAnimeList["status"]) => {
    try {
      const { error } = await supabase
        .from("user_anime_list")
        .update({ status: newStatus })
        .eq("id", listId);

      if (error) throw error;

      toast.success("Status berhasil diubah");
    } catch (error: any) {
      toast.error(error.message || "Gagal mengubah status");
    }
  };

  const handleProgressUpdate = async (listId: string, progress: number) => {
    try {
      const { error } = await supabase
        .from("user_anime_list")
        .update({ progress })
        .eq("id", listId);

      if (error) throw error;

      toast.success("Progress berhasil diperbarui");
    } catch (error: any) {
      toast.error(error.message || "Gagal memperbarui progress");
    }
  };

  const handleRemove = async (listId: string) => {
    if (!confirm("Yakin ingin menghapus dari daftar?")) return;

    try {
      const { error } = await supabase
        .from("user_anime_list")
        .delete()
        .eq("id", listId);

      if (error) throw error;

      toast.success("Berhasil dihapus dari daftar");
    } catch (error: any) {
      toast.error(error.message || "Gagal menghapus");
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">Memuat daftar Anda...</p>
        </CardContent>
      </Card>
    );
  }

  if (lists.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Daftar Tonton</CardTitle>
          <CardDescription>Mulai tambahkan anime ke daftar Anda</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <a href="/jelajah">
              <Plus className="mr-2 h-4 w-4" />
              Jelajahi Anime
            </a>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daftar Tonton</CardTitle>
        <CardDescription>
          Kelola anime dan manga yang ingin Anda tonton atau baca
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" onValueChange={setSelectedStatus}>
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="all">Semua ({lists.length})</TabsTrigger>
            <TabsTrigger value="watching">
              {statusConfig.watching.label} ({groupedByStatus.watching?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="completed">
              {statusConfig.completed.label} ({groupedByStatus.completed?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="on_hold">
              {statusConfig.on_hold.label} ({groupedByStatus.on_hold?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="dropped">
              {statusConfig.dropped.label} ({groupedByStatus.dropped?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="plan_to_watch">
              {statusConfig.plan_to_watch.label} ({groupedByStatus.plan_to_watch?.length || 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={selectedStatus} className="mt-4">
            {filteredLists.length === 0 ? (
              <p className="text-center text-muted-foreground">
                Tidak ada anime dalam kategori ini
              </p>
            ) : (
              <div className="space-y-4">
                {filteredLists.map((item) => {
                  const StatusIcon = statusConfig[item.status].icon;
                  return (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 rounded-lg border p-4"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <StatusIcon className={`h-4 w-4 ${statusConfig[item.status].color}`} />
                          <span className="font-semibold">Anime ID: {item.anime_id}</span>
                        </div>
                        <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Progress: {item.progress}</span>
                          {item.score && (
                            <span>Skor: {item.score}/10</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Select
                          value={item.status}
                          onValueChange={(value) =>
                            handleStatusChange(item.id, value as UserAnimeList["status"])
                          }
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(statusConfig).map(([key, config]) => (
                              <SelectItem key={key} value={key}>
                                {config.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRemove(item.id)}
                        >
                          Hapus
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}


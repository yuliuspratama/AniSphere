"use client";

import { useState } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { useAnimeList } from "@/lib/hooks/useAnimeList";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Play, Check, TrendingUp } from "lucide-react";
import { toast } from "sonner";

export function ProgressTracker() {
  const { user } = useAuth();
  const { lists } = useAnimeList(user?.id);
  const supabase = createClient();

  const watchingItems = lists.filter((item) => item.status === "watching");

  const handleProgressIncrement = async (listId: string, currentProgress: number) => {
    try {
      const { error } = await supabase
        .from("user_anime_list")
        .update({ progress: currentProgress + 1 })
        .eq("id", listId);

      if (error) throw error;

      // Record watch history
      const listItem = lists.find((item) => item.id === listId);
      if (listItem) {
        await supabase.from("watch_history").insert({
          user_id: user!.id,
          anime_id: listItem.anime_id,
          episode_number: currentProgress + 1,
        });
      }

      toast.success("Progress diperbarui!");
    } catch (error: any) {
      toast.error(error.message || "Gagal memperbarui progress");
    }
  };

  const handleProgressSet = async (listId: string, progress: number) => {
    if (progress < 0) {
      toast.error("Progress tidak boleh negatif");
      return;
    }

    try {
      const { error } = await supabase
        .from("user_anime_list")
        .update({ progress })
        .eq("id", listId);

      if (error) throw error;

      toast.success("Progress diperbarui!");
    } catch (error: any) {
      toast.error(error.message || "Gagal memperbarui progress");
    }
  };

  if (watchingItems.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Pelacak Progress
          </CardTitle>
          <CardDescription>
            Mulai menonton anime untuk melacak progress Anda
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Pelacak Progress
        </CardTitle>
        <CardDescription>
          Lacak episode yang sudah Anda tonton
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {watchingItems.map((item) => (
            <ProgressItem
              key={item.id}
              item={item}
              onIncrement={handleProgressIncrement}
              onSet={handleProgressSet}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

interface ProgressItemProps {
  item: {
    id: string;
    anime_id: number;
    progress: number;
  };
  onIncrement: (listId: string, currentProgress: number) => void;
  onSet: (listId: string, progress: number) => void;
}

function ProgressItem({ item, onIncrement, onSet }: ProgressItemProps) {
  const [editingProgress, setEditingProgress] = useState(false);
  const [newProgress, setNewProgress] = useState(item.progress);

  return (
    <div className="flex items-center gap-4 rounded-lg border p-4">
      <div className="flex-1">
        <div className="font-semibold">Anime ID: {item.anime_id}</div>
        {editingProgress ? (
          <div className="mt-2 flex items-center gap-2">
            <Input
              type="number"
              value={newProgress}
              onChange={(e) => setNewProgress(parseInt(e.target.value) || 0)}
              className="w-24"
              min={0}
            />
            <Button
              size="sm"
              onClick={() => {
                onSet(item.id, newProgress);
                setEditingProgress(false);
              }}
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setNewProgress(item.progress);
                setEditingProgress(false);
              }}
            >
              Batal
            </Button>
          </div>
        ) : (
          <div className="mt-2 flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Episode {item.progress}
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setEditingProgress(true)}
            >
              Edit
            </Button>
          </div>
        )}
      </div>
      <Button
        size="sm"
        onClick={() => onIncrement(item.id, item.progress)}
        disabled={editingProgress}
      >
        <Play className="mr-2 h-4 w-4" />
        +1 Episode
      </Button>
    </div>
  );
}


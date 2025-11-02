"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckSquare, Square, Trophy } from "lucide-react";
import { toast } from "sonner";

interface BingoTask {
  id: string;
  description: string;
  completed: boolean;
}

interface BingoChallenge {
  id: string;
  title: string;
  description?: string;
  tasks: BingoTask[];
  points: number;
  start_date: string;
  end_date: string;
  completed?: boolean;
}

export function BingoChallenges() {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState<BingoChallenge[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchChallenges() {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const now = new Date().toISOString().split("T")[0];

        // Fetch active challenges
        const { data: activeChallenges, error: challengesError } = await supabase
          .from("bingo_challenges")
          .select("*")
          .lte("start_date", now)
          .gte("end_date", now)
          .order("start_date", { ascending: false });

        if (challengesError) throw challengesError;

        // Fetch user progress for each challenge
        const { data: userProgress } = await supabase
          .from("user_bingo_progress")
          .select("challenge_id, completed_tasks")
          .eq("user_id", user.id);

        const progressMap = new Map(
          userProgress?.map((p) => [
            p.challenge_id,
            p.completed_tasks as string[],
          ]) || []
        );

        const challengesWithProgress = (activeChallenges || []).map((challenge) => {
          const completedTasks = progressMap.get(challenge.id) || [];
          const tasks = (challenge.tasks as any[]).map((task: any, index: number) => ({
            id: String(index),
            description: task.description || task,
            completed: completedTasks.includes(String(index)),
          }));

          const allCompleted = tasks.every((t) => t.completed);

          return {
            ...challenge,
            tasks,
            completed: allCompleted,
          };
        });

        setChallenges(challengesWithProgress);
      } catch (error) {
        console.error("Error fetching challenges:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchChallenges();
  }, [user, supabase]);

  const handleToggleTask = async (challengeId: string, taskId: string) => {
    if (!user) return;

    const challenge = challenges.find((c) => c.id === challengeId);
    if (!challenge) return;

    const task = challenge.tasks.find((t) => t.id === taskId);
    if (!task) return;

    const newCompleted = task.completed
      ? challenge.tasks
          .filter((t) => t.completed && t.id !== taskId)
          .map((t) => t.id)
      : [...challenge.tasks.filter((t) => t.completed).map((t) => t.id), taskId];

    try {
      // Check if progress exists
      const { data: existing } = await supabase
        .from("user_bingo_progress")
        .select("id")
        .eq("challenge_id", challengeId)
        .eq("user_id", user.id)
        .single();

      if (existing) {
        const { error } = await supabase
          .from("user_bingo_progress")
          .update({ completed_tasks: newCompleted })
          .eq("id", existing.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from("user_bingo_progress").insert({
          challenge_id: challengeId,
          user_id: user.id,
          completed_tasks: newCompleted,
        });

        if (error) throw error;
      }

      // Update local state
      setChallenges(
        challenges.map((c) =>
          c.id === challengeId
            ? {
                ...c,
                tasks: c.tasks.map((t) =>
                  t.id === taskId ? { ...t, completed: !t.completed } : t
                ),
              }
            : c
        )
      );

      // Check if bingo completed
      const allCompleted =
        challenge.tasks.length === newCompleted.length + (task.completed ? 1 : 0) &&
        !task.completed;

      if (allCompleted) {
        toast.success("Bingo! Tantangan selesai!");
      }
    } catch (error: any) {
      toast.error(error.message || "Gagal memperbarui progress");
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">Memuat tantangan bingo...</p>
        </CardContent>
      </Card>
    );
  }

  if (challenges.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Tantangan Bingo
          </CardTitle>
          <CardDescription>
            Tidak ada tantangan bingo aktif saat ini
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {challenges.map((challenge) => {
        const completedCount = challenge.tasks.filter((t) => t.completed).length;
        const totalTasks = challenge.tasks.length;
        const gridSize = Math.ceil(Math.sqrt(totalTasks));

        return (
          <Card key={challenge.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{challenge.title}</CardTitle>
                  {challenge.description && (
                    <CardDescription>{challenge.description}</CardDescription>
                  )}
                </div>
                {challenge.completed && (
                  <Trophy className="h-5 w-5 text-yellow-500" />
                )}
              </div>
              <div className="text-sm text-muted-foreground">
                {completedCount}/{totalTasks} selesai • {challenge.points} poin
              </div>
            </CardHeader>
            <CardContent>
              <div
                className="grid gap-2"
                style={{
                  gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
                }}
              >
                {challenge.tasks.map((task) => (
                  <button
                    key={task.id}
                    onClick={() => handleToggleTask(challenge.id, task.id)}
                    className={`flex aspect-square items-center justify-center rounded border p-2 transition-colors ${
                      task.completed
                        ? "bg-green-500/20 border-green-500"
                        : "hover:bg-muted"
                    }`}
                  >
                    {task.completed ? (
                      <CheckSquare className="h-6 w-6 text-green-500" />
                    ) : (
                      <Square className="h-6 w-6 text-muted-foreground" />
                    )}
                  </button>
                ))}
              </div>
              <div className="mt-4 text-xs text-muted-foreground">
                {challenge.tasks.map((task, index) => (
                  <div
                    key={task.id}
                    className={`py-1 ${
                      task.completed ? "line-through opacity-50" : ""
                    }`}
                  >
                    {index + 1}. {task.description}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}


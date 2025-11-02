"use client";

import { useEffect } from "react";
import { redirect } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/components/providers/auth-provider";
import { SeasonalLeague } from "@/components/community/seasonal-league";
import { LeagueLeaderboard } from "@/components/community/league-leaderboard";
import { WeeklyQuiz } from "@/components/community/weekly-quiz";
import { BadgeCollection } from "@/components/community/badge-collection";
import { BingoChallenges } from "@/components/community/bingo-challenges";
import { ClubsList } from "@/components/community/clubs-list";
import { staggerContainer, slideUp } from "@/lib/utils/animations";

export default function ArenaPage() {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      redirect("/auth/login");
    }
  }, [user, loading]);

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex h-screen items-center justify-center">
          <p className="text-muted-foreground">Memuat...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="container mx-auto space-y-8 p-4 pb-20 md:pb-4"
    >
      <motion.div variants={slideUp} className="space-y-2">
        <h1 className="text-3xl font-bold">Arena Komunitas</h1>
        <p className="text-muted-foreground">
          Ikuti liga anime, kuis, tantangan bingo, dan bergabung dengan klub diskusi
        </p>
      </motion.div>

      <motion.div variants={slideUp} className="grid gap-6 md:grid-cols-2">
        <SeasonalLeague />
        <LeagueLeaderboard />
      </motion.div>

      <motion.div variants={slideUp} className="grid gap-6 md:grid-cols-2">
        <WeeklyQuiz />
        <BadgeCollection />
      </motion.div>

      <motion.div variants={slideUp}>
        <BingoChallenges />
      </motion.div>

      <motion.div variants={slideUp}>
        <ClubsList />
      </motion.div>
    </motion.div>
  );
}

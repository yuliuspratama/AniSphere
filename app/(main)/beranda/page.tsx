"use client";

import { useEffect } from "react";
import { redirect } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/components/providers/auth-provider";
import { PersonalizedRecommendations } from "@/components/anime/personalized-recommendations";
import { TrendingThisSeason } from "@/components/anime/trending-season";
import { AnimeRoulette } from "@/components/anime/anime-roulette";
import { WatchOrderGuide } from "@/components/anime/watch-order-guide";
import { QuickStats } from "@/components/anime/quick-stats";
import { staggerContainer, slideUp } from "@/lib/utils/animations";

export default function BerandaPage() {
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
        <h1 className="text-3xl font-bold">Beranda</h1>
        <p className="text-muted-foreground">
          Temukan anime terbaik dan rekomendasi personal untuk Anda
        </p>
      </motion.div>

      <motion.div variants={slideUp}>
        <QuickStats />
      </motion.div>

      <motion.div variants={slideUp}>
        <PersonalizedRecommendations />
      </motion.div>

      <motion.div variants={slideUp}>
        <TrendingThisSeason />
      </motion.div>

      <motion.div variants={slideUp} className="grid gap-6 md:grid-cols-2">
        <AnimeRoulette />
        <WatchOrderGuide />
      </motion.div>
    </motion.div>
  );
}

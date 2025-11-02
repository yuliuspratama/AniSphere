"use client";

import { useEffect } from "react";
import { redirect } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/components/providers/auth-provider";
import { WatchlistManager } from "@/components/collection/watchlist-manager";
import { ReleaseCalendar } from "@/components/collection/release-calendar";
import { ProgressTracker } from "@/components/collection/progress-tracker";
import { WatchTogetherLists } from "@/components/collection/watch-together-lists";
import { staggerContainer, slideUp } from "@/lib/utils/animations";

export default function KoleksikuPage() {
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
        <h1 className="text-3xl font-bold">Koleksiku</h1>
        <p className="text-muted-foreground">
          Kelola daftar tonton, progress, dan kalender rilis Anda
        </p>
      </motion.div>

      <motion.div variants={slideUp}>
        <WatchlistManager />
      </motion.div>

      <motion.div variants={slideUp} className="grid gap-6 md:grid-cols-2">
        <ReleaseCalendar />
        <ProgressTracker />
      </motion.div>

      <motion.div variants={slideUp}>
        <WatchTogetherLists />
      </motion.div>
    </motion.div>
  );
}

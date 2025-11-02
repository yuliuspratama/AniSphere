"use client";

import { useEffect } from "react";
import { redirect } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/components/providers/auth-provider";
import { AdvancedSearch } from "@/components/explore/advanced-search";
import { TrendDashboard } from "@/components/explore/trend-dashboard";
import { staggerContainer, slideUp } from "@/lib/utils/animations";

export default function JelajahPage() {
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
        <h1 className="text-3xl font-bold">Jelajah</h1>
        <p className="text-muted-foreground">
          Cari dan temukan anime, manga, serta jelajahi profil staf dan studio
        </p>
      </motion.div>

      <motion.div variants={slideUp}>
        <AdvancedSearch />
      </motion.div>
      
      <motion.div variants={slideUp}>
        <TrendDashboard />
      </motion.div>
    </motion.div>
  );
}

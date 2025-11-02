"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, Trophy, Star, Target } from "lucide-react";

interface Badge {
  id: string;
  name: string;
  description?: string;
  icon_url?: string;
  badge_type: string;
  earned_at?: string;
}

export function BadgeCollection() {
  const { user } = useAuth();
  const [badges, setBadges] = useState<Badge[]>([]);
  const [earnedBadges, setEarnedBadges] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchBadges() {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Fetch all available badges
        const { data: allBadges, error: badgesError } = await supabase
          .from("badges")
          .select("*")
          .order("name");

        if (badgesError) throw badgesError;

        // Fetch user's earned badges
        const { data: userBadges, error: userBadgesError } = await supabase
          .from("user_badges")
          .select("badge_id")
          .eq("user_id", user.id);

        if (userBadgesError) throw userBadgesError;

        const earnedSet = new Set(userBadges?.map((ub) => ub.badge_id) || []);
        setEarnedBadges(earnedSet);
        setBadges((allBadges || []) as Badge[]);
      } catch (error) {
        console.error("Error fetching badges:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchBadges();
  }, [user, supabase]);

  const getBadgeIcon = (badgeType: string) => {
    switch (badgeType) {
      case "quiz":
        return <Target className="h-6 w-6" />;
      case "league":
        return <Trophy className="h-6 w-6" />;
      case "bingo":
        return <Star className="h-6 w-6" />;
      case "community":
        return <Award className="h-6 w-6" />;
      default:
        return <Award className="h-6 w-6" />;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">Memuat lencana...</p>
        </CardContent>
      </Card>
    );
  }

  const earnedCount = badges.filter((b) => earnedBadges.has(b.id)).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5" />
          Koleksi Lencana
        </CardTitle>
        <CardDescription>
          {earnedCount} dari {badges.length} lencana terkumpul
        </CardDescription>
      </CardHeader>
      <CardContent>
        {badges.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">
            Belum ada lencana tersedia
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {badges.map((badge) => {
              const isEarned = earnedBadges.has(badge.id);
              return (
                <div
                  key={badge.id}
                  className={`relative flex flex-col items-center gap-2 rounded-lg border p-4 ${
                    isEarned
                      ? "bg-primary/10 border-primary"
                      : "opacity-50 bg-muted"
                  }`}
                >
                  {isEarned && (
                    <div className="absolute right-2 top-2">
                      <Award className="h-4 w-4 text-primary" />
                    </div>
                  )}
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-background">
                    {badge.icon_url ? (
                      <img
                        src={badge.icon_url}
                        alt={badge.name}
                        className="h-8 w-8"
                      />
                    ) : (
                      getBadgeIcon(badge.badge_type)
                    )}
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-semibold">{badge.name}</div>
                    {badge.description && (
                      <div className="text-xs text-muted-foreground">
                        {badge.description}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}


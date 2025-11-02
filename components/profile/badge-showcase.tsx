"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, Trophy, Target, Star, Users } from "lucide-react";

interface Badge {
  id: string;
  name: string;
  description?: string;
  icon_url?: string;
  badge_type: string;
  earned_at: string;
}

export function BadgeShowcase({ userId }: { userId: string }) {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchBadges() {
      try {
        const { data, error } = await supabase
          .from("user_badges")
          .select("badge_id, earned_at")
          .eq("user_id", userId)
          .order("earned_at", { ascending: false });

        if (error) throw error;

        const badgeIds = data?.map((b) => b.badge_id) || [];

        if (badgeIds.length === 0) {
          setBadges([]);
          setLoading(false);
          return;
        }

        const { data: badgesData, error: badgesError } = await supabase
          .from("badges")
          .select("*")
          .in("id", badgeIds);

        if (badgesError) throw badgesError;

        // Merge with earned dates
        const earnedMap = new Map(data?.map((b) => [b.badge_id, b.earned_at]) || []);

        const badgesWithDates = (badgesData || []).map((badge) => ({
          ...badge,
          earned_at: earnedMap.get(badge.id) || "",
        }));

        setBadges(badgesWithDates as Badge[]);
      } catch (error) {
        console.error("Error fetching badges:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchBadges();
  }, [userId, supabase]);

  const getBadgeIcon = (badgeType: string) => {
    switch (badgeType) {
      case "quiz":
        return <Target className="h-8 w-8" />;
      case "league":
        return <Trophy className="h-8 w-8" />;
      case "bingo":
        return <Star className="h-8 w-8" />;
      case "community":
        return <Users className="h-8 w-8" />;
      default:
        return <Award className="h-8 w-8" />;
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5" />
          Koleksi Lencana
        </CardTitle>
        <CardDescription>
          {badges.length} lencana terkumpul
        </CardDescription>
      </CardHeader>
      <CardContent>
        {badges.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            Belum ada lencana yang diperoleh
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {badges.map((badge) => (
              <div
                key={badge.id}
                className="group relative flex flex-col items-center gap-3 rounded-lg border bg-primary/5 p-4 transition-all hover:bg-primary/10 hover:shadow-md"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  {badge.icon_url ? (
                    <img
                      src={badge.icon_url}
                      alt={badge.name}
                      className="h-12 w-12"
                    />
                  ) : (
                    getBadgeIcon(badge.badge_type)
                  )}
                </div>
                <div className="text-center">
                  <div className="font-semibold">{badge.name}</div>
                  {badge.description && (
                    <div className="mt-1 text-xs text-muted-foreground">
                      {badge.description}
                    </div>
                  )}
                  <div className="mt-2 text-xs text-muted-foreground">
                    {new Date(badge.earned_at).toLocaleDateString("id-ID")}
                  </div>
                </div>
                <div className="absolute right-2 top-2">
                  <Award className="h-4 w-4 text-primary" />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}


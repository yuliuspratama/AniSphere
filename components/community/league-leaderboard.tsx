"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Medal, Award, Users } from "lucide-react";
import { getCurrentLeagueSeason } from "@/lib/utils/league-scoring";

interface LeaderboardEntry {
  user_id: string;
  username?: string;
  avatar_url?: string;
  total_points: number;
  rank: number;
  anime_count: number;
}

export function LeagueLeaderboard() {
  const { user } = useAuth();
  const [globalRankings, setGlobalRankings] = useState<LeaderboardEntry[]>([]);
  const [friendRankings, setFriendRankings] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const currentSeason = getCurrentLeagueSeason();

  useEffect(() => {
    async function fetchRankings() {
      try {
        // Fetch all teams for current season
        const { data: teams, error: teamsError } = await supabase
          .from("anime_season_league")
          .select("*")
          .eq("season", currentSeason.season)
          .eq("year", currentSeason.year)
          .order("total_points", { ascending: false })
          .limit(100);

        if (teamsError) throw teamsError;

        // Fetch user profiles
        const userIds = teams?.map((t) => t.user_id) || [];
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, username, avatar_url")
          .in("user_id", userIds);

        const profileMap = new Map(
          profiles?.map((p) => [p.user_id, p]) || []
        );

        // Build global rankings
        const global = (teams || []).map((team, index) => ({
          user_id: team.user_id,
          username: profileMap.get(team.user_id)?.username || "Unknown",
          avatar_url: profileMap.get(team.user_id)?.avatar_url,
          total_points: team.total_points,
          rank: index + 1,
          anime_count: team.anime_ids?.length || 0,
        }));

        setGlobalRankings(global);

        // Fetch friends if user is logged in
        if (user) {
          const { data: friendships } = await supabase
            .from("friends")
            .select("friend_id")
            .eq("user_id", user.id)
            .eq("status", "accepted");

          const friendIds = friendships?.map((f) => f.friend_id) || [user.id];
          const friendRankings = global.filter((entry) =>
            friendIds.includes(entry.user_id)
          );

          setFriendRankings(friendRankings);
        }
      } catch (error) {
        console.error("Error fetching rankings:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchRankings();
  }, [user, currentSeason, supabase]);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <Award className="h-5 w-5 text-amber-600" />;
    return <span className="w-5 text-center text-sm font-semibold">#{rank}</span>;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">Memuat peringkat...</p>
        </CardContent>
      </Card>
    );
  }

  const seasonName = `${currentSeason.season.charAt(0).toUpperCase() + currentSeason.season.slice(1)} ${currentSeason.year}`;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Papan Peringkat Liga {seasonName}
        </CardTitle>
        <CardDescription>
          Lihat peringkat tim liga global dan teman Anda
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="global">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="global">Global</TabsTrigger>
            <TabsTrigger value="friends">Teman</TabsTrigger>
          </TabsList>
          <TabsContent value="global" className="mt-4">
            {globalRankings.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                Belum ada peserta liga
              </p>
            ) : (
              <div className="space-y-2">
                {globalRankings.slice(0, 20).map((entry) => (
                  <div
                    key={entry.user_id}
                    className={`flex items-center gap-3 rounded-lg border p-3 ${
                      entry.user_id === user?.id ? "bg-primary/10" : ""
                    }`}
                  >
                    {getRankIcon(entry.rank)}
                    <div className="flex-1">
                      <div className="font-semibold">{entry.username}</div>
                      <div className="text-xs text-muted-foreground">
                        {entry.anime_count} anime
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{entry.total_points.toFixed(1)}</div>
                      <div className="text-xs text-muted-foreground">poin</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
          <TabsContent value="friends" className="mt-4">
            {friendRankings.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                Belum ada teman yang berpartisipasi atau Anda belum memiliki teman
              </p>
            ) : (
              <div className="space-y-2">
                {friendRankings.map((entry) => (
                  <div
                    key={entry.user_id}
                    className={`flex items-center gap-3 rounded-lg border p-3 ${
                      entry.user_id === user?.id ? "bg-primary/10" : ""
                    }`}
                  >
                    {getRankIcon(entry.rank)}
                    <div className="flex-1">
                      <div className="font-semibold">{entry.username}</div>
                      <div className="text-xs text-muted-foreground">
                        {entry.anime_count} anime
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{entry.total_points.toFixed(1)}</div>
                      <div className="text-xs text-muted-foreground">poin</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}


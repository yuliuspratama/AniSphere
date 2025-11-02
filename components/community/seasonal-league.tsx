"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trophy, Plus, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import { getCurrentLeagueSeason } from "@/lib/utils/league-scoring";
import { jikanClient } from "@/lib/api/jikan";

interface LeagueTeam {
  id?: string;
  season: string;
  year: number;
  user_id: string;
  team_name?: string;
  anime_ids: string[];
  total_points: number;
}

export function SeasonalLeague() {
  const { user } = useAuth();
  const [team, setTeam] = useState<LeagueTeam | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const supabase = createClient();
  const currentSeason = getCurrentLeagueSeason();

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    async function fetchTeam() {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("anime_season_league")
          .select("*")
          .eq("user_id", user.id)
          .eq("season", currentSeason.season)
          .eq("year", currentSeason.year)
          .single();

        if (error && error.code !== "PGRST116") {
          throw error;
        }

        setTeam(data || null);
      } catch (error: any) {
        console.error("Error fetching team:", error);
        toast.error("Gagal memuat tim liga");
      } finally {
        setLoading(false);
      }
    }

    fetchTeam();
  }, [user, currentSeason, supabase]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setSearching(true);
    try {
      const results = await jikanClient.searchAnime(searchQuery, 10);
      setSearchResults(results.map((anime) => ({
        id: String(anime.mal_id),
        title: anime.title,
        score: anime.score,
        image: anime.images?.jpg?.large_image_url,
      })));
    } catch (error) {
      console.error("Error searching:", error);
      toast.error("Gagal mencari anime");
    } finally {
      setSearching(false);
    }
  };

  const handleAddAnime = async (animeId: string) => {
    if (!user) return;

    const newAnimeIds = team ? [...team.anime_ids, animeId] : [animeId];

    if (newAnimeIds.length > 10) {
      toast.error("Maksimal 10 anime per tim");
      return;
    }

    try {
      const teamData = {
        season: currentSeason.season,
        year: currentSeason.year,
        user_id: user.id,
        anime_ids: newAnimeIds,
        total_points: 0, // Will be calculated later
      };

      let updatedTeam;
      if (team?.id) {
        const { data, error } = await supabase
          .from("anime_season_league")
          .update(teamData)
          .eq("id", team.id)
          .select()
          .single();

        if (error) throw error;
        updatedTeam = data;
      } else {
        const { data, error } = await supabase
          .from("anime_season_league")
          .insert(teamData)
          .select()
          .single();

        if (error) throw error;
        updatedTeam = data;
      }

      setTeam(updatedTeam);
      setSearchQuery("");
      setSearchResults([]);
      toast.success("Anime ditambahkan ke tim!");
    } catch (error: any) {
      toast.error(error.message || "Gagal menambahkan anime");
    }
  };

  const handleRemoveAnime = async (animeId: string) => {
    if (!team) return;

    const newAnimeIds = team.anime_ids.filter((id) => id !== animeId);

    try {
      const { data, error } = await supabase
        .from("anime_season_league")
        .update({ anime_ids: newAnimeIds })
        .eq("id", team.id)
        .select()
        .single();

      if (error) throw error;

      setTeam(data);
      toast.success("Anime dihapus dari tim");
    } catch (error: any) {
      toast.error(error.message || "Gagal menghapus anime");
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">Memuat tim liga...</p>
        </CardContent>
      </Card>
    );
  }

  const seasonName = `${currentSeason.season.charAt(0).toUpperCase() + currentSeason.season.slice(1)} ${currentSeason.year}`;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Liga Anime Musiman {seasonName}
        </CardTitle>
        <CardDescription>
          Pilih 10 anime musim ini untuk tim fantasi Anda. Poin diberikan berdasarkan performa anime.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Cari anime..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <Button onClick={handleSearch} disabled={searching}>
            {searching ? "Mencari..." : "Cari"}
          </Button>
        </div>

        {searchResults.length > 0 && (
          <div className="space-y-2 rounded-lg border p-3">
            <div className="text-sm font-semibold">Hasil Pencarian:</div>
            <div className="space-y-2">
              {searchResults.map((anime) => (
                <div
                  key={anime.id}
                  className="flex items-center justify-between rounded border p-2"
                >
                  <div className="flex items-center gap-3">
                    {anime.image && (
                      <img
                        src={anime.image}
                        alt={anime.title}
                        className="h-12 w-8 object-cover rounded"
                      />
                    )}
                    <div>
                      <div className="font-medium">{anime.title}</div>
                      {anime.score && (
                        <div className="text-xs text-muted-foreground">
                          Skor: {anime.score}
                        </div>
                      )}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleAddAnime(anime.id)}
                    disabled={team?.anime_ids.includes(anime.id) || (team?.anime_ids.length || 0) >= 10}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold">
              Tim Anda ({team?.anime_ids.length || 0}/10)
            </div>
            <div className="text-sm text-muted-foreground">
              Total Poin: {team?.total_points || 0}
            </div>
          </div>
          {team && team.anime_ids.length > 0 ? (
            <div className="space-y-2">
              {team.anime_ids.map((animeId) => (
                <div
                  key={animeId}
                  className="flex items-center justify-between rounded border p-2"
                >
                  <span className="text-sm">Anime ID: {animeId}</span>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleRemoveAnime(animeId)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              Belum ada anime dalam tim. Cari dan tambahkan anime musim ini!
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}


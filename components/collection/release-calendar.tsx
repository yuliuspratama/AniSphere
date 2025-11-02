"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { useAnimeList } from "@/lib/hooks/useAnimeList";
import { jikanClient } from "@/lib/api/jikan";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock } from "lucide-react";
import { format, parseISO, isToday, isTomorrow, isThisWeek } from "date-fns";
import { id } from "date-fns/locale";

interface EpisodeRelease {
  anime_id: string;
  anime_title: string;
  episode_number: number;
  episode_title: string;
  release_date: string;
  day_of_week?: string;
}

export function ReleaseCalendar() {
  const { user } = useAuth();
  const { lists } = useAnimeList(user?.id);
  const [releases, setReleases] = useState<EpisodeRelease[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReleases() {
      if (!user || lists.length === 0) {
        setLoading(false);
        return;
      }

      try {
        // Get watching anime from user list
        const watchingAnime = lists.filter((item) => item.status === "watching");

        // Fetch episodes for each anime
        const releasePromises = watchingAnime.map(async (item) => {
          try {
            const episodes = await jikanClient.getAnimeEpisodes(parseInt(item.anime_id));
            // Get next unwatched episode
            // JikanEpisode uses mal_id as episode identifier
            const nextEpisode = episodes.find((ep, idx) => (idx + 1) > item.progress);
            if (nextEpisode && nextEpisode.aired) {
              return {
                anime_id: item.anime_id,
                anime_title: `Anime ${item.anime_id}`, // Would need to fetch actual title
                episode_number: nextEpisode.mal_id || episodes.indexOf(nextEpisode) + 1,
                episode_title: nextEpisode.title || "Untitled",
                release_date: nextEpisode.aired,
              };
            }
          } catch (error) {
            console.error(`Error fetching episodes for ${item.anime_id}:`, error);
          }
          return null;
        });

        const results = await Promise.all(releasePromises);
        const validReleases = results.filter((r): r is EpisodeRelease => {
          return r !== null && r !== undefined && r.release_date !== undefined && r.release_date !== "";
        });

        // Sort by release date
        validReleases.sort((a, b) => {
          return new Date(a.release_date).getTime() - new Date(b.release_date).getTime();
        });

        setReleases(validReleases);
      } catch (error) {
        console.error("Error fetching releases:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchReleases();
  }, [user, lists]);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">Memuat kalender rilis...</p>
        </CardContent>
      </Card>
    );
  }

  if (releases.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Kalender Rilis
          </CardTitle>
          <CardDescription>
            Episode baru akan muncul di sini saat Anda menambahkan anime ke daftar tonton
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const upcomingReleases = releases
    .filter((r) => r.release_date && new Date(r.release_date) >= new Date())
    .slice(0, 10);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Kalender Rilis
        </CardTitle>
        <CardDescription>
          Episode baru dari anime yang sedang Anda tonton
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {upcomingReleases.map((release, index) => {
            if (!release.release_date) return null;

            const releaseDate = parseISO(release.release_date);
            const isReleaseToday = isToday(releaseDate);
            const isReleaseTomorrow = isTomorrow(releaseDate);
            const isReleaseThisWeek = isThisWeek(releaseDate);

            let dateLabel = "";
            if (isReleaseToday) {
              dateLabel = "Hari Ini";
            } else if (isReleaseTomorrow) {
              dateLabel = "Besok";
            } else if (isReleaseThisWeek) {
              dateLabel = format(releaseDate, "EEEE", { locale: id });
            } else {
              dateLabel = format(releaseDate, "dd MMM yyyy", { locale: id });
            }

            return (
              <div
                key={index}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="flex-1">
                  <div className="font-semibold">{release.anime_title}</div>
                  <div className="text-sm text-muted-foreground">
                    Episode {release.episode_number}
                    {release.episode_title && `: ${release.episode_title}`}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className={isReleaseToday ? "font-semibold text-primary" : ""}>
                    {dateLabel}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}


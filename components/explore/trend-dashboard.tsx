"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { TrendingUp, Calendar, Award, Users, Building2 } from "lucide-react";
import { jikanClient } from "@/lib/api/jikan";

interface TrendData {
  name: string;
  value: number;
}

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#00ff00"];

export function TrendDashboard() {
  const [topGenres, setTopGenres] = useState<TrendData[]>([]);
  const [topStudios, setTopStudios] = useState<TrendData[]>([]);
  const [seasonalTrends, setSeasonalTrends] = useState<TrendData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTrendData() {
      try {
        setError(null);
        setLoading(true);
        
        // Initialize empty arrays to prevent undefined errors
        setTopGenres([]);
        setTopStudios([]);
        setSeasonalTrends([]);
        
        // Fetch top anime to analyze trends - try multiple types as fallback
        let topAnime: any[] = [];
        let errorMessage = "";
        
        try {
          topAnime = await jikanClient.getTopAnime("bypopularity", 50);
          console.log("Fetched bypopularity:", topAnime?.length || 0);
        } catch (err: any) {
          console.warn("Failed to fetch bypopularity, trying 'all':", err);
          errorMessage = err?.message || "";
          try {
            topAnime = await jikanClient.getTopAnime("all", 50);
            console.log("Fetched 'all' type:", topAnime?.length || 0);
          } catch (err2: any) {
            console.error("Failed to fetch 'all' type:", err2);
            throw new Error(`Gagal mengambil data: ${errorMessage || err2?.message || "Unknown error"}`);
          }
        }
        
        // Validate response
        if (!topAnime) {
          setError("Tidak ada data anime ditemukan dari API. Response kosong.");
          setLoading(false);
          return;
        }

        const animeArray = Array.isArray(topAnime) ? topAnime : [];
        console.log("Final anime array length:", animeArray.length);
        console.log("Sample anime:", animeArray[0]);

        if (animeArray.length === 0) {
          setError("Data anime kosong. API mungkin sedang dalam maintenance atau rate limit tercapai.");
          setLoading(false);
          return;
        }

        // Analyze genres
        const genreCount: Record<string, number> = {};
        animeArray.forEach((anime: any) => {
          try {
            if (anime && anime.genres && Array.isArray(anime.genres)) {
              anime.genres.forEach((genre: any) => {
                if (genre) {
                  const genreName = (typeof genre === 'object' && genre?.name) 
                    ? genre.name 
                    : (typeof genre === 'string' ? genre : String(genre));
                  if (genreName) {
                    genreCount[genreName] = (genreCount[genreName] || 0) + 1;
                  }
                }
              });
            }
          } catch (err) {
            console.warn("Error processing genre:", err);
          }
        });

        const topGenresData = Object.entries(genreCount)
          .map(([name, value]) => ({ name: String(name), value: Number(value) }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 10)
          .filter(item => item.name && item.value > 0);

        setTopGenres(topGenresData);

        // Analyze studios
        const studioCount: Record<string, number> = {};
        animeArray.forEach((anime: any) => {
          try {
            if (anime && anime.studios && Array.isArray(anime.studios)) {
              anime.studios.forEach((studio: any) => {
                if (studio) {
                  const studioName = (typeof studio === 'object' && studio?.name) 
                    ? studio.name 
                    : (typeof studio === 'string' ? studio : String(studio));
                  if (studioName) {
                    studioCount[studioName] = (studioCount[studioName] || 0) + 1;
                  }
                }
              });
            }
          } catch (err) {
            console.warn("Error processing studio:", err);
          }
        });

        const topStudiosData = Object.entries(studioCount)
          .map(([name, value]) => ({ name: String(name), value: Number(value) }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 10)
          .filter(item => item.name && item.value > 0);

        setTopStudios(topStudiosData);

        // Seasonal trends
        const seasonCount: Record<string, number> = {};
        animeArray.forEach((anime: any) => {
          try {
            if (anime && anime.season && anime.year) {
              const seasonName = typeof anime.season === 'string' 
                ? anime.season.charAt(0).toUpperCase() + anime.season.slice(1)
                : String(anime.season);
              const year = anime.year ? String(anime.year) : '';
              if (seasonName && year) {
                const key = `${seasonName} ${year}`;
                seasonCount[key] = (seasonCount[key] || 0) + 1;
              }
            }
          } catch (err) {
            console.warn("Error processing season:", err);
          }
        });

        const seasonalData = Object.entries(seasonCount)
          .map(([name, value]) => ({ name: String(name), value: Number(value) }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 8)
          .filter(item => item.name && item.value > 0);

        setSeasonalTrends(seasonalData);
      } catch (error: any) {
        console.error("Error fetching trend data:", error);
        setError(error?.message || "Gagal memuat data tren. Silakan coba lagi nanti.");
      } finally {
        setLoading(false);
      }
    }

    fetchTrendData();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">Memuat dashboard tren...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Dasbor Tren
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <p className="text-destructive">{error}</p>
        </CardContent>
      </Card>
    );
  }

  const hasData = (Array.isArray(topGenres) && topGenres.length > 0) || 
                  (Array.isArray(topStudios) && topStudios.length > 0) || 
                  (Array.isArray(seasonalTrends) && seasonalTrends.length > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Dasbor Tren
        </CardTitle>
        <CardDescription>
          Visualisasi data tren anime berdasarkan popularitas
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <div className="p-6 text-center text-muted-foreground">
            <p>Tidak ada data tren tersedia saat ini.</p>
          </div>
        ) : (
          <Tabs defaultValue="genres">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="genres">Genre Populer</TabsTrigger>
              <TabsTrigger value="studios">Studio Produktif</TabsTrigger>
              <TabsTrigger value="seasons">Trend Musiman</TabsTrigger>
            </TabsList>

            <TabsContent value="genres" className="mt-4">
              {Array.isArray(topGenres) && topGenres.length > 0 ? (
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topGenres || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="name"
                        angle={-45}
                        textAnchor="end"
                        height={100}
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                  Tidak ada data genre tersedia
                </div>
              )}
            </TabsContent>

            <TabsContent value="studios" className="mt-4">
              {Array.isArray(topStudios) && topStudios.length > 0 ? (
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={topStudios || []}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }: any) => {
                          const displayName = name || "Unknown";
                          const displayPercent = percent ? (percent * 100).toFixed(0) : "0";
                          return `${displayName}: ${displayPercent}%`;
                        }}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {(topStudios || []).map((_entry: any, index: number) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length] || COLORS[0]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                  Tidak ada data studio tersedia
                </div>
              )}
            </TabsContent>

            <TabsContent value="seasons" className="mt-4">
              {Array.isArray(seasonalTrends) && seasonalTrends.length > 0 ? (
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={seasonalTrends || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} tick={{ fontSize: 12 }} />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                  Tidak ada data tren musiman tersedia
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}

        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="rounded-lg border p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Award className="h-4 w-4" />
              Genre Teratas
            </div>
            <div className="mt-2 text-2xl font-bold">
              {Array.isArray(topGenres) && topGenres[0]?.name ? topGenres[0].name : "N/A"}
            </div>
          </div>
          <div className="rounded-lg border p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Building2 className="h-4 w-4" />
              Studio Teratas
            </div>
            <div className="mt-2 text-2xl font-bold">
              {Array.isArray(topStudios) && topStudios[0]?.name ? topStudios[0].name : "N/A"}
            </div>
          </div>
          <div className="rounded-lg border p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              Musim Teratas
            </div>
            <div className="mt-2 text-2xl font-bold">
              {Array.isArray(seasonalTrends) && seasonalTrends[0]?.name ? seasonalTrends[0].name : "N/A"}
            </div>
          </div>
          <div className="rounded-lg border p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              Total Data
            </div>
            <div className="mt-2 text-2xl font-bold">
              {Array.isArray(topGenres) ? topGenres.length : 0}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Film, Calendar, Star } from "lucide-react";
import { jikanClient } from "@/lib/api/jikan";
import { AnimeCard } from "@/components/anime/anime-card";
import { useAddToWatchlist } from "@/lib/hooks/useAddToWatchlist";
import Image from "next/image";

interface StaffProfileProps {
  staffId: string;
  type: "seiyuu" | "director" | "studio";
}

export function StaffProfile({ staffId, type }: StaffProfileProps) {
  const [staff, setStaff] = useState<any>(null);
  const [works, setWorks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToWatchlist } = useAddToWatchlist();

  useEffect(() => {
    async function fetchStaff() {
      try {
        if (type === "seiyuu" || type === "director") {
          const person = await jikanClient.getPersonById(parseInt(staffId));
          setStaff(person);

          // Fetch their works (this would need additional API calls)
          // For now, we'll show placeholder
          setWorks([]);
        } else if (type === "studio") {
          // Studio info would come from a different source
          setStaff({
            id: staffId,
            name: "Studio Name",
            type: "studio",
          });
        }
      } catch (error) {
        console.error("Error fetching staff:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchStaff();
  }, [staffId, type]);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">Memuat profil...</p>
        </CardContent>
      </Card>
    );
  }

  if (!staff) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">Profil tidak ditemukan</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start gap-6">
          {staff.images?.jpg?.image_url && (
            <div className="relative h-32 w-24 flex-shrink-0 overflow-hidden rounded-lg">
              <Image
                src={staff.images.jpg.image_url}
                alt={staff.name}
                fill
                className="object-cover"
              />
            </div>
          )}
          <div className="flex-1">
            <CardTitle>{staff.name}</CardTitle>
            {staff.name_kanji && (
              <CardDescription className="mt-1">{staff.name_kanji}</CardDescription>
            )}
            {staff.about && (
              <p className="mt-3 text-sm text-muted-foreground line-clamp-3">
                {staff.about}
              </p>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 grid grid-cols-2 gap-4 md:grid-cols-4">
          {staff.birthday && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-xs text-muted-foreground">Tanggal Lahir</div>
                <div className="text-sm font-medium">{staff.birthday}</div>
              </div>
            </div>
          )}
          {staff.favorites && (
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-xs text-muted-foreground">Favorit</div>
                <div className="text-sm font-medium">{staff.favorites}</div>
              </div>
            </div>
          )}
        </div>

        <Tabs defaultValue="anime">
          <TabsList>
            <TabsTrigger value="anime">Karya Anime</TabsTrigger>
            <TabsTrigger value="manga">Karya Manga</TabsTrigger>
          </TabsList>

          <TabsContent value="anime" className="mt-4">
            {works.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Tidak ada data karya tersedia
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-5">
                {works.map((work) => (
                  <AnimeCard
                    key={work.id}
                    anime={work}
                    showAddButton={true}
                    onAdd={addToWatchlist}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="manga" className="mt-4">
            <p className="text-center text-muted-foreground py-8">
              Data manga belum tersedia
            </p>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}


"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, Plus, Search } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface Club {
  id: string;
  name: string;
  description?: string;
  cover_image?: string;
  anime_id?: string;
  is_public: boolean;
  created_by: string;
  member_count?: number;
}

export function ClubsList() {
  const { user } = useAuth();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const supabase = createClient();

  useEffect(() => {
    async function fetchClubs() {
      try {
        let query = supabase
          .from("clubs")
          .select("*")
          .eq("is_public", true)
          .order("created_at", { ascending: false })
          .limit(50);

        const { data, error } = await query;

        if (error) throw error;

        // Fetch member counts
        const clubIds = (data || []).map((c) => c.id);
        if (clubIds.length > 0) {
          const { data: memberCounts } = await supabase
            .from("club_members")
            .select("club_id")
            .in("club_id", clubIds);

          const countMap = new Map<string, number>();
          memberCounts?.forEach((mc) => {
            countMap.set(mc.club_id, (countMap.get(mc.club_id) || 0) + 1);
          });

          setClubs(
            (data || []).map((club) => ({
              ...club,
              member_count: countMap.get(club.id) || 0,
            }))
          );
        } else {
          setClubs(data || []);
        }
      } catch (error) {
        console.error("Error fetching clubs:", error);
        toast.error("Gagal memuat klub");
      } finally {
        setLoading(false);
      }
    }

    fetchClubs();
  }, [supabase]);

  const handleJoinClub = async (clubId: string) => {
    if (!user) {
      toast.error("Anda harus login terlebih dahulu");
      return;
    }

    try {
      const { error } = await supabase.from("club_members").insert({
        club_id: clubId,
        user_id: user.id,
        role: "member",
      });

      if (error) throw error;

      toast.success("Berhasil bergabung dengan klub!");
      // Refresh clubs to update member count
      window.location.reload();
    } catch (error: any) {
      if (error.code === "23505") {
        toast.info("Anda sudah menjadi anggota klub ini");
      } else {
        toast.error(error.message || "Gagal bergabung dengan klub");
      }
    }
  };

  const filteredClubs = clubs.filter((club) =>
    club.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    club.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">Memuat klub...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Klub Anime
            </CardTitle>
            <CardDescription>
              Bergabung dengan komunitas penggemar anime
            </CardDescription>
          </div>
          {user && (
            <Button size="sm" asChild>
              <Link href="/arena/clubs/create">
                <Plus className="mr-2 h-4 w-4" />
                Buat Klub
              </Link>
            </Button>
          )}
        </div>
        <div className="mt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Cari klub..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredClubs.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">
            {searchQuery ? "Tidak ada klub yang cocok" : "Belum ada klub tersedia"}
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {filteredClubs.map((club) => (
              <div
                key={club.id}
                className="flex flex-col gap-3 rounded-lg border p-4"
              >
                {club.cover_image && (
                  <img
                    src={club.cover_image}
                    alt={club.name}
                    className="h-32 w-full rounded object-cover"
                  />
                )}
                <div>
                  <h3 className="font-semibold">{club.name}</h3>
                  {club.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {club.description}
                    </p>
                  )}
                  <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {club.member_count || 0} anggota
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild className="flex-1">
                    <Link href={`/arena/clubs/${club.id}`}>Lihat</Link>
                  </Button>
                  {user && (
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => handleJoinClub(club.id)}
                    >
                      Bergabung
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}


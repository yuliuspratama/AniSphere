"use client";

import { useEffect, useState } from "react";
import { redirect } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";
import { createClient } from "@/lib/supabase/client";
import { ProfileStats } from "@/components/profile/profile-stats";
import { BadgeShowcase } from "@/components/profile/badge-showcase";
import { LeagueTeam } from "@/components/profile/league-team";
import { ReviewWall } from "@/components/profile/review-wall";
import { FavoriteQuotes } from "@/components/profile/favorite-quotes";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Settings } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface UserProfile {
  id: string;
  username: string;
  avatar_url?: string;
  bio?: string;
  created_at: string;
}

export default function ProfilePage({
  params,
}: {
  params: { userId: string };
}) {
  const { user: currentUser, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (!authLoading && !currentUser) {
      redirect("/auth/login");
    }
  }, [currentUser, authLoading]);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", params.userId)
          .single();

        if (error && error.code !== "PGRST116") {
          throw error;
        }

        if (data) {
          setProfile({
            id: data.id,
            username: data.username,
            avatar_url: data.avatar_url,
            bio: data.bio,
            created_at: data.created_at,
          });
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    }

    if (params.userId) {
      fetchProfile();
    }
  }, [params.userId, supabase]);

  if (authLoading || loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex h-screen items-center justify-center">
          <p className="text-muted-foreground">Memuat...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return null;
  }

  const isOwnProfile = currentUser.id === params.userId;

  return (
    <div className="container mx-auto space-y-8 p-4 pb-20 md:pb-4">
      {/* Profile Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-6">
            <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-full border-4 border-background">
              {profile?.avatar_url ? (
                <Image
                  src={profile.avatar_url}
                  alt={profile.username}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-primary/10">
                  <User className="h-12 w-12 text-primary" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold">
                    {profile?.username || "Pengguna"}
                  </h1>
                  {profile?.bio && (
                    <p className="mt-2 text-muted-foreground">{profile.bio}</p>
                  )}
                  <p className="mt-1 text-sm text-muted-foreground">
                    Bergabung{" "}
                    {profile?.created_at
                      ? new Date(profile.created_at).toLocaleDateString("id-ID", {
                          year: "numeric",
                          month: "long",
                        })
                      : "tidak diketahui"}
                  </p>
                </div>
                {isOwnProfile && (
                  <Button variant="outline" asChild>
                    <Link href="/profile/settings">
                      <Settings className="mr-2 h-4 w-4" />
                      Pengaturan
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Content */}
      <ProfileStats userId={params.userId} />
      <BadgeShowcase userId={params.userId} />
      <LeagueTeam userId={params.userId} />
      <ReviewWall userId={params.userId} />
      <FavoriteQuotes userId={params.userId} />
    </div>
  );
}

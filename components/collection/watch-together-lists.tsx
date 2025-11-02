"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface WatchTogetherList {
  id: string;
  name: string;
  created_by: string;
  created_at: string;
  members: Array<{ user_id: string; username?: string }>;
  items: Array<{ anime_id: string }>;
}

export function WatchTogetherLists() {
  const { user } = useAuth();
  const [lists, setLists] = useState<WatchTogetherList[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newListName, setNewListName] = useState("");
  const supabase = createClient();

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    async function fetchLists() {
      if (!user) return;
      
      try {
        // Fetch lists where user is a member
        const { data: memberships, error: membershipError } = await supabase
          .from("watch_together_list_members")
          .select("list_id")
          .eq("user_id", user.id);

        if (membershipError) throw membershipError;

        const listIds = memberships?.map((m) => m.list_id) || [];

        if (listIds.length === 0) {
          setLists([]);
          setLoading(false);
          return;
        }

        // Fetch list details
        const { data: listsData, error: listsError } = await supabase
          .from("watch_together_lists")
          .select("*")
          .in("id", listIds);

        if (listsError) throw listsError;

        // Fetch members for each list
        const listsWithMembers = await Promise.all(
          (listsData || []).map(async (list) => {
            const { data: members } = await supabase
              .from("watch_together_list_members")
              .select("user_id")
              .eq("list_id", list.id);

            const { data: items } = await supabase
              .from("watch_together_list_items")
              .select("anime_id")
              .eq("list_id", list.id);

            return {
              ...list,
              members: members || [],
              items: items || [],
            };
          })
        );

        setLists(listsWithMembers);
      } catch (error) {
        console.error("Error fetching watch together lists:", error);
        toast.error("Gagal memuat daftar");
      } finally {
        setLoading(false);
      }
    }

    fetchLists();
  }, [user, supabase]);

  const handleCreateList = async () => {
    if (!newListName.trim()) {
      toast.error("Nama daftar tidak boleh kosong");
      return;
    }

    if (!user) return;

    try {
      const { data: listData, error: listError } = await supabase
        .from("watch_together_lists")
        .insert({
          name: newListName,
          created_by: user.id,
        })
        .select()
        .single();

      if (listError) throw listError;

      // Add creator as member
      const { error: memberError } = await supabase
        .from("watch_together_list_members")
        .insert({
          list_id: listData.id,
          user_id: user.id,
        });

      if (memberError) throw memberError;

      toast.success("Daftar berhasil dibuat!");
      setNewListName("");
      setShowCreateForm(false);
      
      // Refresh lists
      window.location.reload();
    } catch (error: any) {
      toast.error(error.message || "Gagal membuat daftar");
    }
  };

  const handleDeleteList = async (listId: string) => {
    if (!confirm("Yakin ingin menghapus daftar ini?")) return;

    try {
      const { error } = await supabase
        .from("watch_together_lists")
        .delete()
        .eq("id", listId)
        .eq("created_by", user!.id);

      if (error) throw error;

      toast.success("Daftar berhasil dihapus");
      setLists(lists.filter((list) => list.id !== listId));
    } catch (error: any) {
      toast.error(error.message || "Gagal menghapus daftar");
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">Memuat daftar bersama...</p>
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
              Daftar Tonton Bersama
            </CardTitle>
            <CardDescription>
              Buat dan bagikan daftar anime dengan teman
            </CardDescription>
          </div>
          <Button
            size="sm"
            onClick={() => setShowCreateForm(!showCreateForm)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {showCreateForm && (
          <div className="flex gap-2 rounded-lg border p-4">
            <Input
              placeholder="Nama daftar"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
            />
            <Button onClick={handleCreateList}>Buat</Button>
            <Button
              variant="ghost"
              onClick={() => {
                setShowCreateForm(false);
                setNewListName("");
              }}
            >
              Batal
            </Button>
          </div>
        )}

        {lists.length === 0 ? (
          <p className="text-center text-muted-foreground">
            Belum ada daftar tonton bersama. Buat yang pertama!
          </p>
        ) : (
          <div className="space-y-3">
            {lists.map((list) => (
              <div
                key={list.id}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div className="flex-1">
                  <div className="font-semibold">{list.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {list.members.length} anggota • {list.items.length} anime
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <a href={`/koleksiku/list/${list.id}`}>Lihat</a>
                  </Button>
                  {list.created_by === user?.id && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteList(list.id)}
                    >
                      <Trash2 className="h-4 w-4" />
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


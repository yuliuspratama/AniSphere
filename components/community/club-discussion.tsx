"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Send, Pin } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface ClubPost {
  id: string;
  club_id: string;
  user_id: string;
  title: string;
  content: string;
  pinned: boolean;
  created_at: string;
  updated_at: string;
  username?: string;
  avatar_url?: string;
  comment_count?: number;
}

interface ClubComment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  username?: string;
  avatar_url?: string;
}

export function ClubDiscussion({ clubId }: { clubId: string }) {
  const { user } = useAuth();
  const [posts, setPosts] = useState<ClubPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const supabase = createClient();

  useEffect(() => {
    async function fetchPosts() {
      try {
        const { data, error } = await supabase
          .from("club_posts")
          .select("*")
          .eq("club_id", clubId)
          .order("pinned", { ascending: false })
          .order("created_at", { ascending: false });

        if (error) throw error;

        // Fetch user profiles
        const userIds = [
          ...new Set((data || []).map((p) => p.user_id)),
        ];
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, username, avatar_url")
          .in("user_id", userIds);

        const profileMap = new Map(
          profiles?.map((p) => [p.user_id, p]) || []
        );

        // Fetch comment counts
        const postIds = (data || []).map((p) => p.id);
        const { data: comments } = await supabase
          .from("club_comments")
          .select("post_id")
          .in("post_id", postIds);

        const commentCountMap = new Map<string, number>();
        comments?.forEach((c) => {
          commentCountMap.set(
            c.post_id,
            (commentCountMap.get(c.post_id) || 0) + 1
          );
        });

        setPosts(
          (data || []).map((post) => ({
            ...post,
            username: profileMap.get(post.user_id)?.username || "Unknown",
            avatar_url: profileMap.get(post.user_id)?.avatar_url,
            comment_count: commentCountMap.get(post.id) || 0,
          }))
        );
      } catch (error) {
        console.error("Error fetching posts:", error);
        toast.error("Gagal memuat diskusi");
      } finally {
        setLoading(false);
      }
    }

    fetchPosts();
  }, [clubId, supabase]);

  const handleCreatePost = async () => {
    if (!user || !newPostTitle.trim() || !newPostContent.trim()) {
      toast.error("Judul dan konten tidak boleh kosong");
      return;
    }

    // Validate input length
    if (newPostTitle.length > 200) {
      toast.error("Judul tidak boleh lebih dari 200 karakter");
      return;
    }

    if (newPostContent.length > 5000) {
      toast.error("Konten tidak boleh lebih dari 5000 karakter");
      return;
    }

    try {
      const { error } = await supabase.from("club_posts").insert({
        club_id: clubId,
        user_id: user.id,
        title: newPostTitle.trim().slice(0, 200),
        content: newPostContent.trim().slice(0, 5000),
      });

      if (error) throw error;

      toast.success("Post berhasil dibuat!");
      setNewPostTitle("");
      setNewPostContent("");
      setShowCreateForm(false);
      window.location.reload();
    } catch (error: any) {
      toast.error(error.message || "Gagal membuat post");
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">Memuat diskusi...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Diskusi Klub
          </CardTitle>
          {user && (
            <Button size="sm" onClick={() => setShowCreateForm(!showCreateForm)}>
              Buat Post
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {showCreateForm && (
          <div className="space-y-3 rounded-lg border p-4">
            <input
              type="text"
              placeholder="Judul post"
              value={newPostTitle}
              onChange={(e) => setNewPostTitle(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
            <Textarea
              placeholder="Tulis konten post..."
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              rows={4}
            />
            <div className="flex gap-2">
              <Button onClick={handleCreatePost}>Kirim</Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowCreateForm(false);
                  setNewPostTitle("");
                  setNewPostContent("");
                }}
              >
                Batal
              </Button>
            </div>
          </div>
        )}

        {posts.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">
            Belum ada post dalam klub ini
          </p>
        ) : (
          <div className="space-y-3">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/arena/clubs/${clubId}/posts/${post.id}`}
                className="block rounded-lg border p-4 transition-colors hover:bg-muted"
              >
                <div className="flex items-start gap-3">
                  {post.pinned && <Pin className="h-4 w-4 text-primary" />}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{post.title}</h3>
                      {post.pinned && (
                        <span className="text-xs text-primary">[Terpilih]</span>
                      )}
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                      {post.content}
                    </p>
                    <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{post.username}</span>
                      <span>{new Date(post.created_at).toLocaleDateString("id-ID")}</span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        {post.comment_count || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}


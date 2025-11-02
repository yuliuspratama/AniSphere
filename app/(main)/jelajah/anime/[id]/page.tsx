import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AnimeDetail } from "@/components/explore/anime-detail";

export default async function AnimeDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <div className="container mx-auto p-4 pb-20 md:pb-4">
      <AnimeDetail animeId={params.id} />
    </div>
  );
}


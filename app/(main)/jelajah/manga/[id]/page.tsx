import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MangaDetail } from "@/components/explore/manga-detail";

export default async function MangaDetailPage({
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
      <MangaDetail mangaId={params.id} />
    </div>
  );
}


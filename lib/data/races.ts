import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getPublicStorageUrl } from "@/lib/supabase/publicUrl";

export type RaceRow = {
  id: string;
  slug: string;
  name: string;
  art_bucket: string | null;
  art_path: string | null;
  initiative: number | null;
  created_at?: string;
};

export type RaceListItem = RaceRow & {
  artUrl: string;
};

export async function getRaces(): Promise<RaceListItem[]> {
  const supabase = getSupabaseServerClient();

  const { data, error } = await supabase
    .from("races")
    .select("id, slug, name, art_bucket, art_path, initiative, created_at")
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);

  const rows = (data ?? []) as RaceRow[];
  return rows.map((r) => ({
    ...r,
    artUrl: getPublicStorageUrl(r.art_bucket, r.art_path),
  }));
}

export async function getRaceBySlug(slug: string): Promise<RaceListItem | null> {
  const supabase = getSupabaseServerClient();

  const { data, error } = await supabase
    .from("races")
    .select("id, slug, name, art_bucket, art_path, initiative, created_at")
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;

  const r = data as RaceRow;
  return {
    ...r,
    artUrl: getPublicStorageUrl(r.art_bucket, r.art_path),
  };
}

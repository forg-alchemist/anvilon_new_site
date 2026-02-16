import { getSupabaseServerClient } from "@/lib/supabase/server";

export type RaceInfoRow = {
  id: string;
  created_at: string;
  slug: string;
  tags: string | null;

  description: string | null;
  peculiarities: string | null;
  physiology: string | null;

  origin_tags: string | null;
  origin: string | null;

  sociality: string | null;

  archetype_tags: string | null;
  archetype: string | null;

  relationships_tags: string | null;
  relationships: string | null;

  names: string | null;
  surname: string | null;
  name_features: string | null;

  character: string | null;
};

export async function getRaceInfoBySlug(slug: string): Promise<RaceInfoRow | null> {
  const supabase = getSupabaseServerClient();
  const raceDb = supabase.schema("race");

  const { data, error } = await raceDb
    .from("race_info")
    .select(
      "id, created_at, slug, tags, description, peculiarities, physiology, origin_tags, origin, sociality, archetype_tags, archetype, relationships_tags, relationships, names, surname, name_features, character"
    )
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    // In server components we prefer to fail soft and allow the page to render.
    console.error("[getRaceInfoBySlug] supabase error:", error.message);
    return null;
  }

  return (data as RaceInfoRow) ?? null;
}

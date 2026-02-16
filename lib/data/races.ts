import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getPublicStorageUrl } from "@/lib/supabase/publicUrl";
import { DEFAULT_LANG, pickLocalizedText, type AppLang } from "@/lib/i18n/shared";

export type RaceRow = {
  id: string;
  slug: string;
  name_ru: string | null;
  name_en: string | null;
  art_bucket: string | null;
  art_path: string | null;
  initiative: number | null;
  available?: boolean | null;
  created_at?: string;
};

export type RaceListItem = {
  id: string;
  slug: string;
  name: string;
  art_bucket: string | null;
  art_path: string | null;
  initiative: number | null;
  available?: boolean | null;
  created_at?: string;
  artUrl: string;
};

function mapRaceRow(row: RaceRow, lang: AppLang): RaceListItem {
  return {
    id: row.id,
    slug: row.slug,
    name: pickLocalizedText(row.name_ru, row.name_en, lang, row.slug),
    art_bucket: row.art_bucket,
    art_path: row.art_path,
    initiative: row.initiative,
    available: row.available ?? null,
    created_at: row.created_at,
    artUrl: getPublicStorageUrl(row.art_bucket, row.art_path),
  };
}

export async function getRaces(lang: AppLang = DEFAULT_LANG): Promise<RaceListItem[]> {
  const supabase = getSupabaseServerClient();
  const raceDb = supabase.schema("race");

  const { data, error } = await raceDb
    .from("races")
    .select("id, slug, name_ru, name_en, art_bucket, art_path, initiative, available, created_at")
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  const rows = (data ?? []) as RaceRow[];
  return rows.map((r) => mapRaceRow(r, lang));
}

export async function getRaceBySlug(slug: string, lang: AppLang = DEFAULT_LANG): Promise<RaceListItem | null> {
  const supabase = getSupabaseServerClient();
  const raceDb = supabase.schema("race");

  const { data, error } = await raceDb
    .from("races")
    .select("id, slug, name_ru, name_en, art_bucket, art_path, initiative, available, created_at")
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;
  return mapRaceRow(data as RaceRow, lang);
}

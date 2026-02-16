import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getPublicStorageUrl } from "@/lib/supabase/publicUrl";

/**
 * RAW-строка из Supabase (таблица public.race_map)
 */
export type RaceMapRow = {
  slug: string;
  bucket: string | null;
  map_path: string | null;
};

/**
 * Нормализованная модель для UI
 */
export type RaceMap = {
  slug: string;
  mapUrl: string;
};

/**
 * Получить карту владений расы по slug.
 * Возвращает null, если записи нет или map_path пустой.
 */
export async function getRaceMapBySlug(slug: string): Promise<RaceMap | null> {
  const supabase = getSupabaseServerClient();
  const raceDb = supabase.schema("race");

  const { data, error } = await raceDb
    .from("race_map")
    .select("slug, bucket, map_path")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    console.error("getRaceMapBySlug error:", error);
    throw new Error(error.message);
  }

  if (!data || !data.map_path) return null;

  return {
    slug: data.slug,
    mapUrl: getPublicStorageUrl(data.bucket, data.map_path),
  };
}

import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getPublicStorageUrl } from "@/lib/supabase/publicUrl";

/**
 * RAW-строка из Supabase
 */
export type RaceSkillRow = {
  slug: string;
  skill_num: number | null;
  name_skill: string | null;
  description_skill: string | null;
  art_path: string | null;
  bucket: string | null;
};

/**
 * Нормализованная модель для UI
 */
export type RaceSkill = {
  slug: string;
  skillNum: number;
  name: string;
  description: string;
  /** Готовый public URL для <img src /> */
  artPath: string;
};

/**
 * Получить расовые навыки по slug расы
 */
export async function getRaceSkillsBySlug(
  raceSlug: string
): Promise<RaceSkill[]> {
  const supabase = getSupabaseServerClient();
  const raceDb = supabase.schema("race");

  const { data, error } = await raceDb
    .from("race_skill")
    .select("slug, skill_num, name_skill, description_skill, art_path, bucket")
    .eq("slug", raceSlug)
    .order("skill_num", { ascending: true });

  if (error) {
    console.error("getRaceSkillsBySlug error:", error);
    throw new Error(error.message);
  }

  return (data ?? []).map((row: RaceSkillRow) => ({
    slug: row.slug,
    skillNum: row.skill_num ?? 0,
    name: row.name_skill ?? "",
    description: row.description_skill ?? "",
    artPath: getPublicStorageUrl(row.bucket, row.art_path),
  }));
}

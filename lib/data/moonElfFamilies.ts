import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getPublicStorageUrl } from "@/lib/supabase/publicUrl";

export type MoonElfFamilyItem = {
  id: string; // uuid from DB
  slugMoonFam: string;
  name: string | null;
  artUrl: string | null;

  description: string | null;

  bonusArtUrl: string | null;
  bonus: string | null;

  story: string | null;
  tradition: string | null;
};

/**
 * В БД колонка со slug'ом исторически "плавала" по названию.
 * Чтобы не ловить runtime error из-за отсутствующей колонки, берём все поля
 * и подхватываем slug из первого найденного варианта.
 */
type MoonElfFamilyRow = {
  id: string;
  created_at?: string;
  // возможные варианты названия slug-колонки
  slug_moon_fam?: string | null;
  slug_moon_fan?: string | null;
  slug?: string | null;

  name?: string | null;
  bucket?: string | null;
  art_path?: string | null;

  description?: string | null;

  bonus_art_path?: string | null;
  bonus?: string | null;

  story?: string | null;
  tradition?: string | null;
};

export async function getMoonElfFamilies(): Promise<MoonElfFamilyItem[]> {
  const supabase = getSupabaseServerClient();
  const raceDb = supabase.schema("race");

  // IMPORTANT: include `id` in select, иначе клики не будут открывать карточку
  const res = await raceDb
    .from("moon_elf_fam")
    .select("*")
    .order("created_at", { ascending: true });

  if (res.error) throw new Error(res.error.message);

  const rows = (res.data ?? []) as MoonElfFamilyRow[];

  return rows.map((r) => {
    const bucket = (r.bucket ?? "art").toString();
    const artUrl = r.art_path ? getPublicStorageUrl(bucket, r.art_path) : null;

    // бонус-арт обычно лежит в art + отдельной папке, но bucket в БД тоже используем
    const bonusArtUrl = r.bonus_art_path
      ? getPublicStorageUrl(bucket, r.bonus_art_path)
      : null;

    const slugMoonFam =
      (r.slug_moon_fam ?? r.slug_moon_fan ?? r.slug ?? "")?.toString() ?? "";

    return {
      id: r.id,
      slugMoonFam,
      name: (r.name ?? null) as string | null,
      artUrl,
      description: (r.description ?? null) as string | null,
      bonusArtUrl,
      bonus: (r.bonus ?? null) as string | null,
      story: (r.story ?? null) as string | null,
      tradition: (r.tradition ?? null) as string | null,
    };
  });
}

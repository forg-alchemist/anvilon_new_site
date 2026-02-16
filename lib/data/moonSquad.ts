import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getPublicStorageUrl } from "@/lib/supabase/publicUrl";

/**
 * Связка таблиц:
 * - moon_elf_squad   (отряды)
 * - moon_squad_pers  (члены отрядов)
 *
 * В обеих таблицах колонки одинаковые (bucket, art_path, name, description, slug_squad).
 * Любое неосторожное объединение через `{ ...a, ...b }` может затирать `bucket/art_path`.
 * Поэтому:
 *  - держим поля как в БД (snake_case)
 *  - добавляем вычисленный `artUrl`
 *  - связываем только по ключу `slug_squad`
 */

export type MoonSquadRow = {
  id: string;
  created_at?: string;
  slug_squad: string | null;
  name: string | null;
  bucket: string | null;
  art_path: string | null;
  description: string | null;
};

export type MoonSquadPersonRow = {
  id: string;
  created_at?: string;
  slug_squad: string | null;
  name: string | null;
  bucket: string | null;
  art_path: string | null;
  description: string | null;
  character: string | null;
};

export type MoonSquadItem = MoonSquadRow & {
  artUrl: string;
};

export type MoonSquadPersonItem = MoonSquadPersonRow & {
  artUrl: string;
};

export type MoonSquadWithPersons = MoonSquadItem & {
  persons: MoonSquadPersonItem[];
};

function keySlug(v?: string | null) {
  return (v ?? "").toString().trim();
}

export async function getMoonSquads(): Promise<MoonSquadItem[]> {
  const supabase = getSupabaseServerClient();
  const raceDb = supabase.schema("race");

  const res = await raceDb
    .from("moon_elf_squad")
    .select("id, created_at, slug_squad, name, bucket, art_path, description")
    .order("created_at", { ascending: true });

  if (res.error) {
    // moon_elf_squad can be absent in the current schema layout.
    if (res.error.code === "PGRST205" || res.error.code === "42P01") {
      const persons = await getMoonSquadPersons();
      const derived = new Map<string, MoonSquadItem>();
      for (const p of persons) {
        const slug = keySlug(p.slug_squad);
        if (!slug || derived.has(slug)) continue;
        derived.set(slug, {
          id: `derived-${slug}`,
          created_at: p.created_at ?? "",
          slug_squad: slug,
          name: slug.replace(/[-_]+/g, " "),
          bucket: p.bucket ?? null,
          art_path: p.art_path ?? null,
          description: "",
          artUrl: p.artUrl,
        });
      }
      return Array.from(derived.values());
    }
    throw new Error(res.error.message);
  }

  const rows = (res.data ?? []) as MoonSquadRow[];

  return rows.map((r) => ({
    ...r,
    // Важно: используем ту же функцию, что и в других секциях (greatHouses / families)
    artUrl: getPublicStorageUrl(r.bucket, r.art_path),
  }));
}

export async function getMoonSquadPersons(): Promise<MoonSquadPersonItem[]> {
  const supabase = getSupabaseServerClient();
  const raceDb = supabase.schema("race");

  const res = await raceDb
    .from("moon_squad_pers")
    .select("id, created_at, slug_squad, name, bucket, art_path, description, character")
    .order("created_at", { ascending: true });

  if (res.error) throw new Error(res.error.message);

  const rows = (res.data ?? []) as MoonSquadPersonRow[];

  return rows.map((r) => ({
    ...r,
    artUrl: getPublicStorageUrl(r.bucket, r.art_path),
  }));
}

export async function getMoonSquadsWithPersons(): Promise<MoonSquadWithPersons[]> {
  const [squads, persons] = await Promise.all([getMoonSquads(), getMoonSquadPersons()]);

  const bySlug = new Map<string, MoonSquadPersonItem[]>();
  for (const p of persons) {
    const slug = keySlug(p.slug_squad);
    if (!slug) continue;
    const list = bySlug.get(slug) ?? [];
    list.push(p);
    bySlug.set(slug, list);
  }

  return squads.map((s) => {
    const slug = keySlug(s.slug_squad);
    return {
      ...s,
      persons: slug ? bySlug.get(slug) ?? [] : [],
    };
  });
}

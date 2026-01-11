import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getPublicStorageUrl } from "@/lib/supabase/publicUrl";

function parseTags(raw?: string | null): string[] {
  if (!raw) return [];
  // ✅ единый разделитель тегов по проекту — ';'
  return raw
    .split(";")
    .map((t) => t.trim())
    .filter(Boolean);
}

export type CouncilRow = {
  id: string;
  created_at?: string;

  bucket: string | null;
  art_path: string | null;

  house: string | null;
  number: number | null;

  name: string | null;
  description: string | null;
  character: string | null;

  policy_direction_tags: string | null;
  allies_tags: string | null;
};

export type CouncilMemberItem = CouncilRow & {
  artUrl: string;
  policyDirectionTags: string[];
  alliesTags: string[];
};

export type GreatHouseRow = {
  id: string;
  created_at?: string;

  // identifiers / naming
  house: string | null;
  name_house: string | null;

  // art
  bucket: string | null;
  art_path: string | null;
  bonus_art_path: string | null;

  // content
  description: string | null;
  bonus: string | null;
  tradition: string | null;
};

export type GreatHouseItem = GreatHouseRow & {
  artUrl: string;
  bonusArtUrl: string;
  council: CouncilMemberItem[];
};

/**
 * Великие дома + Совет (представители), связанные по ключу `house`.
 *
 * - great_houses: описание дома, бонусы, традиции
 * - council: представители дома в совете (сортировка внутри дома по number ASC)
 */
export async function getGreatHouses(): Promise<GreatHouseItem[]> {
  const supabase = getSupabaseServerClient();

  const [housesRes, councilRes] = await Promise.all([
    supabase
      .from("great_houses")
      .select(
        "id, created_at, house, name_house, bucket, art_path, description, bonus_art_path, bonus, tradition"
      )
      .order("created_at", { ascending: true }),

    supabase
      .from("council")
      .select(
        "id, created_at, bucket, art_path, house, number, name, description, character, policy_direction_tags, allies_tags"
      )
      .order("number", { ascending: true }),
  ]);

  if (housesRes.error) throw new Error(housesRes.error.message);
  if (councilRes.error) throw new Error(councilRes.error.message);

  const houses = (housesRes.data ?? []) as GreatHouseRow[];
  const councilRows = (councilRes.data ?? []) as CouncilRow[];

  // group council by house
  const councilByHouse = new Map<string, CouncilMemberItem[]>();
  for (const m of councilRows) {
    const key = (m.house ?? "").toString();
    if (!key) continue;

    const item: CouncilMemberItem = {
      ...m,
      artUrl: getPublicStorageUrl(m.bucket, m.art_path),
      policyDirectionTags: parseTags(m.policy_direction_tags),
      alliesTags: parseTags(m.allies_tags),
    };

    const list = councilByHouse.get(key) ?? [];
    list.push(item);
    councilByHouse.set(key, list);
  }

  // ensure sort by number within each house (defensive)
  for (const [k, list] of councilByHouse) {
    list.sort((a, b) => (a.number ?? 0) - (b.number ?? 0));
    councilByHouse.set(k, list);
  }

  return houses.map((h) => {
    const key = (h.house ?? "").toString();
    return {
      ...h,
      artUrl: getPublicStorageUrl(h.bucket, h.art_path),
      bonusArtUrl: getPublicStorageUrl(h.bucket, h.bonus_art_path),
      council: key ? councilByHouse.get(key) ?? [] : [],
    };
  });
}

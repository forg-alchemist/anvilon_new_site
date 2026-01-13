import { PageShell } from "@/components/PageShell";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getPublicStorageUrl } from "@/lib/supabase/publicUrl";

import RaceDetailClient from "./RaceDetailClient";
import type { RaceDetail, RaceSkill } from "./types";
import { getRaceSkillsBySlug } from "@/lib/data/raceSkills";
import { getRaceMapBySlug } from "@/lib/data/raceMap";
import { getRaceInfoBySlug } from "@/lib/data/raceInfo";
import { getGreatHouses } from "@/lib/data/greatHouses";
import { getRaceHistoryBySlug } from "@/lib/data/raceHistory";
import { getRaceClassesWithSkills } from "@/lib/data/classes";

function parseTags(raw?: string | null): string[] {
  if (!raw) return [];
  // ✅ Единый разделитель тегов по проекту — ';'
  return raw
    .split(";")
    .map((t) => t.trim())
    .filter(Boolean);
}

type RaceRow = {
  id: string;
  slug: string;
  name: string;
  art_bucket: string | null;
  art_path: string | null;
  initiative: number | null;
  available?: boolean | null;
};

export const dynamic = "force-dynamic";

/**
 * Next.js 15+: params is async (Promise). We MUST unwrap it with await.
 */
export default async function RacePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const supabase = getSupabaseServerClient();

  // 1) races (база страницы)
  const { data: race, error: raceErr } = await supabase
    .from("races")
    .select("id, slug, name, art_bucket, art_path, initiative, available")
    .eq("slug", slug)
    .maybeSingle();

  if (raceErr) {
    return (
      <PageShell
        title="Раса"
        backHref="/library/inhabitants/races"
        backLabel="Жители Анвилона"
      >
        <div className="rounded-2xl border border-red-500/25 bg-red-500/10 p-4 text-red-200">
          Ошибка загрузки races по slug <b>{slug}</b>: {raceErr.message}
        </div>
      </PageShell>
    );
  }

  if (!race) {
    return (
      <PageShell
        title="Раса не найдена"
        backHref="/library/inhabitants/races"
        backLabel="Жители Анвилона"
      >
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
          В таблице <b>races</b> нет записи со slug <b>{slug}</b>.
        </div>
      </PageShell>
    );
  }

  const r = race as RaceRow;
  const artUrl = getPublicStorageUrl(r.art_bucket, r.art_path);

  // 2) race_info (текстовые блоки) — НЕ валим страницу, если нет/ошибка
  const info = await getRaceInfoBySlug(slug).catch(() => null);

  // 3) skills — мягко
  let raceSkills: RaceSkill[] = [];
  try {
    raceSkills = await getRaceSkillsBySlug(slug);
  } catch {
    raceSkills = [];
  }

  // 4) history — мягко
  let history: Awaited<ReturnType<typeof getRaceHistoryBySlug>> = [];
  try {
    history = await getRaceHistoryBySlug(slug);
  } catch {
    history = [];
  }

  // 5) great houses — пока только для высших эльфов
  let greatHouses: Awaited<ReturnType<typeof getGreatHouses>> = [];
  if (slug === "high-elf") {
    try {
      greatHouses = await getGreatHouses();
    } catch {
      greatHouses = [];
    }
  }

  // 6) расовые классы (class + class_skill) — мягко
  let raceClasses: Awaited<ReturnType<typeof getRaceClassesWithSkills>> = [];
  try {
    raceClasses = await getRaceClassesWithSkills(slug);
  } catch {
    raceClasses = [];
  }

  // 7) map — мягко
  let mapUrl = "";
  try {
    const mapRow = await getRaceMapBySlug(slug);
    mapUrl = mapRow?.mapUrl ?? "";
  } catch {
    mapUrl = "";
  }

  const detail: RaceDetail = {
    slug: r.slug,
    name: r.name,
    artUrl,
    initiative: r.initiative ?? 0,
    mapUrl,

    // ======= вкладки “О расе” из race_info =======
    about: {
      description: info?.description ?? "",
      descriptionTags: parseTags(info?.tags),
      features: info?.peculiarities ?? "",
      physiology: info?.physiology ?? "",
      origin: info?.origin ?? "",
      originTags: parseTags(info?.origin_tags),
      sociality: info?.sociality ?? "",
      archetypes: info?.archetype ?? "",
      relations: info?.relationships ?? "",

      // ✅ теги и доп. текстовые поля (все TEXT в БД)
      archetypeTags: parseTags(info?.archetype_tags),
      character: info?.character ?? "",
      relationshipsTags: parseTags(info?.relationships_tags),

      // ✅ Имена — по порядку: names → surname → name_features
      names: info?.names ?? "",
      surname: info?.surname ?? "",
      nameFeatures: info?.name_features ?? "",
    },
  };

  return (
    <PageShell
      title={r.name}
      backHref="/library/inhabitants/races"
      backLabel="Жители Анвилона"
    >
      <RaceDetailClient
        detail={detail}
        raceSkills={raceSkills}
        raceClasses={raceClasses}
        greatHouses={greatHouses}
        history={history}
      />
    </PageShell>
  );
}

import { PageShell } from "@/components/PageShell";
import RaceDetailClient from "./RaceDetailClient";
import type { RaceDetail, RaceSkill } from "./types";
import { getRaceBySlug } from "@/lib/data/races";
import { getRaceSkillsBySlug } from "@/lib/data/raceSkills";
import { getRaceMapBySlug } from "@/lib/data/raceMap";
import { getRaceInfoBySlug } from "@/lib/data/raceInfo";
import { getGreatHouses } from "@/lib/data/greatHouses";
import { getRaceHistoryBySlug } from "@/lib/data/raceHistory";
import { getRaceClassesWithSkills } from "@/lib/data/classes";
import { getMoonElfFamilies } from "@/lib/data/moonElfFamilies";
import { getMoonSquadsWithPersons } from "@/lib/data/moonSquad";
import { getServerLang } from "@/lib/i18n/server";

function parseTags(raw?: string | null): string[] {
  if (!raw) return [];
  return raw
    .split(";")
    .map((t) => t.trim())
    .filter(Boolean);
}

export const dynamic = "force-dynamic";

export default async function RacePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const lang = await getServerLang();
  const isEn = lang === "en";

  let race: Awaited<ReturnType<typeof getRaceBySlug>>;
  try {
    race = await getRaceBySlug(slug, lang);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return (
      <PageShell
        title={isEn ? "Race" : "Раса"}
        backHref="/library/inhabitants/races"
        backLabel={isEn ? "Races" : "Расы"}
      >
        <div className="rounded-2xl border border-red-500/25 bg-red-500/10 p-4 text-red-200">
          {isEn ? "Loading error for race slug" : "Ошибка загрузки расы по slug"} <b>{slug}</b>: {message}
        </div>
      </PageShell>
    );
  }

  if (!race) {
    return (
      <PageShell
        title={isEn ? "Race not found" : "Раса не найдена"}
        backHref="/library/inhabitants/races"
        backLabel={isEn ? "Races" : "Расы"}
      >
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
          {isEn ? "No race found with slug" : "В таблице races нет записи со slug"} <b>{slug}</b>.
        </div>
      </PageShell>
    );
  }

  const info = await getRaceInfoBySlug(slug).catch(() => null);

  let raceSkills: RaceSkill[] = [];
  try {
    raceSkills = await getRaceSkillsBySlug(slug);
  } catch {
    raceSkills = [];
  }

  let history: Awaited<ReturnType<typeof getRaceHistoryBySlug>> = [];
  try {
    history = await getRaceHistoryBySlug(slug);
  } catch {
    history = [];
  }

  let greatHouses: Awaited<ReturnType<typeof getGreatHouses>> = [];
  if (slug === "high-elf") {
    try {
      greatHouses = await getGreatHouses();
    } catch {
      greatHouses = [];
    }
  }

  let raceClasses: Awaited<ReturnType<typeof getRaceClassesWithSkills>> = [];
  try {
    raceClasses = await getRaceClassesWithSkills(slug, lang);
  } catch {
    raceClasses = [];
  }

  let mapUrl = "";
  try {
    const mapRow = await getRaceMapBySlug(slug);
    mapUrl = mapRow?.mapUrl ?? "";
  } catch {
    mapUrl = "";
  }

  const moonFamilies = slug === "moon-elf" ? await getMoonElfFamilies().catch(() => []) : [];
  const moonSquads = slug === "moon-elf" ? await getMoonSquadsWithPersons().catch(() => []) : [];

  const detail: RaceDetail = {
    slug: race.slug,
    name: race.name,
    artUrl: race.artUrl,
    initiative: race.initiative ?? 0,
    mapUrl,
    about: {
      tags: parseTags(info?.tags),
      description: info?.description ?? "",
      features: info?.peculiarities ?? "",
      physiology: info?.physiology ?? "",
      origin: info?.origin ?? "",
      originTags: parseTags(info?.origin_tags),
      sociality: info?.sociality ?? "",
      archetypes: info?.archetype ?? "",
      relations: info?.relationships ?? "",
      archetypeTags: parseTags(info?.archetype_tags),
      character: info?.character ?? "",
      relationshipsTags: parseTags(info?.relationships_tags),
      names: info?.names ?? "",
      surname: info?.surname ?? "",
      nameFeatures: info?.name_features ?? "",
    },
  };

  return (
    <PageShell
      title={race.name}
      backHref="/library/inhabitants/races"
      backLabel={isEn ? "Races" : "Расы"}
    >
      <RaceDetailClient
        detail={detail}
        raceSkills={raceSkills}
        raceClasses={raceClasses}
        greatHouses={greatHouses}
        history={history}
        moonFamilies={moonFamilies}
        moonSquads={moonSquads}
        lang={lang}
      />
    </PageShell>
  );
}

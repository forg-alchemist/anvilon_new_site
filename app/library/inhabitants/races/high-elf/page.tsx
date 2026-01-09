import { PageShell } from "@/components/PageShell";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getPublicStorageUrl } from "@/lib/supabase/publicUrl";
import { getRaceSkillsBySlug } from "@/lib/data/raceSkills";
import { getRaceMapBySlug } from "@/lib/data/raceMap";

import RaceDetailClient, {
  type RaceDetail,
  type RaceSkill,
} from "./RaceDetailClient";

type RaceRow = {
  slug: string;
  name: string;
  art_bucket: string | null;
  art_path: string | null;
  initiative: number | null;
};

const SLUG = "high-elf";

export default async function HighElfRacePage() {
  const supabase = getSupabaseServerClient();

  // 1) race
  const { data, error } = await supabase
    .from("races")
    .select("slug, name, art_bucket, art_path, initiative")
    .eq("slug", SLUG)
    .maybeSingle();

  if (error) {
    return (
      <PageShell
        title="Высший эльф"
        backHref="/library/inhabitants/races"
        backLabel="Жители Анвилона"
      >
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-red-200">
          Ошибка загрузки: {error.message}
        </div>
      </PageShell>
    );
  }

  const row = (data ?? {
    slug: SLUG,
    name: "Высший эльф",
    art_bucket: null,
    art_path: null,
    initiative: null,
  }) as RaceRow;

  const artUrl = getPublicStorageUrl(row.art_bucket, row.art_path);

  // 2) race skills
  let raceSkills: RaceSkill[] = [];
  try {
    raceSkills = await getRaceSkillsBySlug(SLUG);
  } catch {
    raceSkills = [];
  }

  // 3) race map (не ломаем страницу, но показываем ошибку, если RLS/таблица не пускает)
  let raceMapUrl = "";
  let raceMapError: string | null = null;

  try {
    const mapRow = await getRaceMapBySlug(SLUG);
    raceMapUrl = mapRow?.mapUrl ?? "";
  } catch (e) {
    raceMapUrl = "";
    raceMapError = e instanceof Error ? e.message : "Неизвестная ошибка";
  }

  const detail: RaceDetail = {
    slug: row.slug,
    name: row.name,
    artUrl,
    initiative: row.initiative ?? 0,
    mapUrl: raceMapUrl,
    about: {
      description:
        "Элита народа Авэй, чьи истоки уходят в самые ранние эпохи мира. В древности они были жрецами и правителями объединённого народа, и даже спустя века сохраняют амбиции, чувство избранности и привычку мыслить масштабами поколений. Их кажущееся безразличие - следствие опыта: они знают, как дорого стоит ошибка и что иногда стоит принимать тяжелые решения. Это раса, которая слишком рано стала взрослой - и так и не позволила себе быть наивной",

      features:
        "Высшие эльфы тесно связаны с магией и используют её в быту, ремёслах, войне и развлечениях. Магия - сущность их общества: одновременно цель и инструмент. Они особенно продуктивны днём - солнечный свет будто добавляет им сил",

      physiology:
        "Продолжительность жизни - 2000 лет\nРост - от 175 см до 210 см \nТелосложение - худощавое и спортивное, как у легкоатлета\nЦвет кожи - телесный\nЦвет глаз - стандартный цвет глаз. Очень редко бывают уникальные случаи цвета, когда обычный цвет очень насыщен и меняет оттенок на более глубокий\nЦвет волос - от стального до белоснежного \nСовершеннолетие - 60 лет",

      origin:
        "Авэй вышли из магического колодца Авэлир в центре будущего Альквамарэ в начале эры Света и стали одной из древнейших рас Арантира - наравне с дварфами и другими ветвями Авэй",

      originTags: [
        "Ветвь: Авэй",
        "Родство: лунные эльфы, лесные эльфы, темные эльфы",
      ],

      sociality:
        "Столица - Альквамарэ (Арантир)\nЯзыки — Амэй (эльфийский общий)",

      archetypes:
        "Игрок за высшего эльфа чаще всего воплощает холодную уверенность и стратегическое мышление: дипломат, визирь, магистр, разведчик в высших кругах, хранитель тайн дома. Их сильная сторона — контроль, план, расчёт и выдержка",

      relations:
        "Друзья и враги зависят от дома и политики, но в целом высшие эльфы уважают силу, знания и древность — и презирают хаос, простоту и слабость. Они умеют сотрудничать, но редко доверяют",
    },
  };

  return (
    <PageShell
      title={row.name}
      backHref="/library/inhabitants/races"
      backLabel="Жители Анвилона"
    >
      {raceMapError ? (
        <div className="mb-4 rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4 text-amber-100">
          Карта владений не загрузилась: {raceMapError}
        </div>
      ) : null}

      <RaceDetailClient detail={detail} raceSkills={raceSkills} />
    </PageShell>
  );
}

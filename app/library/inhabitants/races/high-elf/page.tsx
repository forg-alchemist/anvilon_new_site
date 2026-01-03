import { PageShell } from "@/components/PageShell";
import { supabase } from "@/lib/supabaseClient";

import RaceDetailClient, { type RaceDetail } from "./RaceDetailClient";

function publicImageUrl(bucket?: string | null, path?: string | null) {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base || !bucket || !path) return "";
  return `${base}/storage/v1/object/public/${bucket}/${path}`;
}

type RaceRow = {
  slug: string;
  name: string;
  art_bucket: string | null;
  art_path: string | null;
};

const SLUG = "high-elf";

export default async function HighElfRacePage() {
  const { data, error } = await supabase
    .from("races")
    .select("slug, name, art_bucket, art_path")
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
  }) as RaceRow;

  const artUrl = publicImageUrl(row.art_bucket, row.art_path);

  // Контент “О расе” — пока заполняем только это, остальное (разделы) оставляем пустым.
  const detail: RaceDetail = {
    slug: row.slug,
    name: row.name,
    artUrl,
    about: {
      description:
        "Самые мудрые представители народа Авэй. В древности они были жрецами и правителями объединённого народа, и даже сейчас сохраняют амбиции и высокомерие. Это раса, которая слишком рано стала взрослой — и так и не позволила себе быть наивной.",
      origin:
        "Авэй вышли из магического колодца Авэлир в центре будущего Альквамарэ в начале эры Света и стали одной из древнейших рас Арантира — наравне с дварфами и другими ветвями Авэй.",
      features:
        "Высшие эльфы тесно связаны с магией и используют её в быту, ремёслах, войне и развлечениях. Магия — сущность их общества: одновременно цель и инструмент. Они особенно продуктивны днём — солнечный свет будто добавляет им сил.",
      archetypes:
        "Игрок за высшего эльфа чаще всего воплощает холодную уверенность и стратегическое мышление: дипломат, визирь, магистр, разведчик в высших кругах, хранитель тайн дома. Их сильная сторона — контроль, план, расчёт и выдержка.",
      relations:
        "Друзья и враги зависят от дома и политики, но в целом высшие эльфы уважают силу, знания и древность — и презирают хаос, простоту и слабость. Они умеют сотрудничать, но редко доверяют.",
    },
  };

  return (
    <PageShell
      title={row.name}
      backHref="/library/inhabitants/races"
      backLabel="Жители Анвилона"
    >
      <RaceDetailClient detail={detail} />
    </PageShell>
  );
}

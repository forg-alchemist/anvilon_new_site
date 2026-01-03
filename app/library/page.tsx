// app/library/page.tsx
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

function publicImageUrl(bucket?: string | null, path?: string | null) {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base || !bucket || !path) return "";
  return `${base}/storage/v1/object/public/${bucket}/${path}`;
}

type PageArtRow = {
  page: string; // у тебя это primary key
  art_bucket: string | null;
  art_page: string | null;
};

type CardDef = {
  key: string; // значение в БД page_art.page
  title: string;
  href?: string;
  enabled: boolean;
  note?: string;
};

const CARDS: CardDef[] = [
  { key: "Rules", title: "Правила", enabled: false, note: "Скоро" },
  { key: "World", title: "О мире", enabled: false, note: "Скоро" },

  // Активна только эта — ведём сразу на Расы
  {
    key: "Residents",
    title: "Жители Анвилона",
    href: "/library/inhabitants",
    enabled: true,
  },
];

export default async function LibraryPage() {
  const { data, error } = await supabase
    .from("page_art")
    .select("page, art_bucket, art_page");

  const rows = (data ?? []) as PageArtRow[];
  const artByKey = new Map(rows.map((r) => [r.page, r]));

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <header className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight">Библиотека знаний</h1>
      </header>

      {error ? (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-red-200">
          Ошибка Supabase: {error.message}
        </div>
      ) : null}

      <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {CARDS.map((card) => {
          const art = artByKey.get(card.key);
          const img = publicImageUrl(art?.art_bucket, art?.art_page);

          const Inner = (
            <div
              className={[
                "group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-[0_18px_50px_rgba(0,0,0,.25)]",
                card.enabled ? "hover:border-white/20" : "opacity-55",
              ].join(" ")}
            >
              {/* ART */}
              <div className="relative aspect-[16/9] w-full">
                {img ? (
                  <img
                    src={img}
                    alt={card.title}
                    className="h-full w-full object-cover"
                    draggable={false}
                  />
                ) : (
                  <div className="h-full w-full bg-white/5" />
                )}

                {/* лёгкое затемнение, чтобы подпись читалась */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/25 to-black/60" />
              </div>

              {/* CAPTION (внутри той же кнопки/карты) */}
              <div className="absolute inset-x-0 bottom-0 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-lg font-semibold tracking-tight text-white">
                    {card.title}
                  </div>

                  {card.enabled ? null : (
                    <span className="rounded-full border border-white/15 bg-black/25 px-3 py-1 text-xs text-white/80">
                      {card.note ?? "Скоро"}
                    </span>
                  )}
                </div>
              </div>

              {/* hover glow только для активной */}
              {card.enabled ? (
                <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <div className="absolute -left-24 -top-24 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                </div>
              ) : null}
            </div>
          );

          if (!card.enabled || !card.href) {
            return (
              <div key={card.key} className="cursor-not-allowed">
                {Inner}
              </div>
            );
          }

          return (
            <Link key={card.key} href={card.href} className="block">
              {Inner}
            </Link>
          );
        })}
      </section>
    </main>
  );
}

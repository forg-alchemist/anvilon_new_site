// app/library/page.tsx
import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { supabase } from "@/lib/supabaseClient";

function publicImageUrl(bucket?: string | null, path?: string | null) {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base || !bucket || !path) return "";
  return `${base}/storage/v1/object/public/${bucket}/${path}`;
}

type PageArtRow = {
  page: string; // "Rules" | "World" | "Residents"
  art_bucket: string | null;
  art_page: string | null;
};

const CARDS: Array<{
  pageKey: PageArtRow["page"];
  title: string;
  href?: string;
  enabled: boolean;
}> = [
  { pageKey: "Rules", title: "Правила", enabled: false },
  { pageKey: "World", title: "О мире", enabled: false },
  {
    pageKey: "Residents",
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
  const artByPage = new Map(rows.map((r) => [r.page, r]));

  return (
    <PageShell title="Библиотека знаний" backHref="/" backLabel="На главную">
      {error && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-red-200">
          Ошибка загрузки: {error.message}
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {CARDS.map((card) => {
          const art = artByPage.get(card.pageKey);
          const img = publicImageUrl(
            art?.art_bucket ?? null,
            art?.art_page ?? null
          );

          const Inner = (
            <div
              className="
                group
                relative
                overflow-hidden
                rounded-3xl
                border border-white/10
                bg-white/[0.03]
                shadow-[0_18px_40px_rgba(0,0,0,0.35)]
                transition-all duration-200
                hover:border-white/20
                hover:translate-y-[-1px]
                hover:shadow-[0_22px_60px_rgba(0,0,0,0.45)]
                h-[clamp(210px,19vw,300px)]
              "
            >
              {img ? (
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage: `url(${img})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                />
              ) : null}

              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/10" />
              <div className="absolute inset-0 bg-black/10" />

              <div className="relative flex h-full flex-col justify-end p-[clamp(18px,1.8vw,26px)]">
                <div className="flex items-end justify-between gap-4">
                  <div
                    className="text-[clamp(20px,2vw,30px)] tracking-tight normal-case"
                    style={{
                      fontFamily: "var(--font-buttons)",
                      color: "var(--button-foreground)",
                      textTransform: "none",
                    }}
                  >
                    {card.title}
                  </div>

                  {!card.enabled && (
                    <div
                      className="rounded-full border border-white/15 bg-black/30 px-3 py-1 text-xs normal-case"
                      style={{
                        fontFamily: "var(--font-buttons)",
                        color: "var(--button-foreground)",
                        textTransform: "none",
                      }}
                    >
                      Скоро
                    </div>
                  )}
                </div>
              </div>
            </div>
          );

          if (!card.enabled || !card.href) {
            return <div key={card.pageKey}>{Inner}</div>;
          }

          return (
            <Link key={card.pageKey} href={card.href} className="block">
              {Inner}
            </Link>
          );
        })}
      </div>
    </PageShell>
  );
}

"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

export type Race = {
  id: string;
  slug: string;
  name: string;
  art_bucket: string | null;
  art_path: string | null;
  initiative: number | null;
};

function getPublicImageUrl(bucket?: string | null, path?: string | null) {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base || !bucket || !path) return "";
  return `${base}/storage/v1/object/public/${bucket}/${path}`;
}

function CornerArrow({ dir }: { dir: "left" | "right" }) {
  const rotate = dir === "right" ? "rotate(180deg)" : "none";
  return (
    <svg
      width="30"
      height="30"
      viewBox="0 0 24 24"
      fill="none"
      style={{ transform: rotate }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M15.8 5.7L7.6 12l8.2 6.3"
        stroke="currentColor"
        strokeWidth="3.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function RaceCard({ race }: { race: Race }) {
  const img = getPublicImageUrl(race.art_bucket, race.art_path);

  // Сейчас доступна только “High Elf” — оставляем твою логику.
  // Если у тебя другой slug — поменяй тут.
  const isActive = race.slug === "high-elf";
  const href = `/library/inhabitants/races/${race.slug}`;

  // ====== LAYOUT (9:16 строго) ======
  const artHeightCss = "min(62vh, 720px)";
  const cardWidthCss = `calc(${artHeightCss} * 9 / 16)`;

  // ====== COSMIC THEME ======
  const base1 = "#0f1424";
  const base2 = "#141a33";

  const ether = "rgba(125,211,252,0.55)";
  const astral = "rgba(167,139,250,0.45)";
  const stargold = "rgba(250,204,21,0.22)";

  const textMain = "rgba(235, 245, 255, 0.92)";

  const borderLine = "rgba(255,255,255,0.08)";
  const borderGlow = "rgba(125,211,252,0.18)";

  const fontTitle = 'var(--font-buttons), "Ruslan Display", serif';
  const fontUI = 'var(--font-buttons), "Ruslan Display", serif';

  // ====== GOLD FRAME ======
  const goldFrameBg = `
    linear-gradient(
      135deg,
      rgba(105, 78, 22, 0.98) 0%,
      rgba(230, 200, 115, 0.98) 18%,
      rgba(255, 246, 210, 0.96) 34%,
      rgba(210, 160, 70, 0.98) 52%,
      rgba(120, 90, 30, 0.98) 72%,
      rgba(255, 246, 210, 0.94) 100%
    )
  `;

  const goldFrameShadow = `
    0 0 0 1px rgba(255,255,255,0.06) inset,
    0 0 20px rgba(250, 204, 21, 0.14),
    0 0 58px rgba(250, 204, 21, 0.08),
    0 18px 44px rgba(0,0,0,0.55)
  `;

  const innerCtaBg = `
    radial-gradient(120% 180% at 50% 140%, rgba(125,211,252,0.18), rgba(0,0,0,0) 58%),
    radial-gradient(110% 170% at 10% 30%, rgba(167,139,250,0.14), rgba(0,0,0,0) 55%),
    linear-gradient(180deg, rgba(18, 22, 40, 0.88), rgba(7, 9, 18, 0.92))
  `;

  const innerCtaInset = `
    inset 0 1px 0 rgba(255,255,255,0.06),
    inset 0 -18px 36px rgba(0,0,0,0.42)
  `;

  // ====== STRONG HOVER GOLD GLOW (edge -> center, center weaker) ======
  const edgeGlowBg = `
    radial-gradient(70% 220% at 0% 50%, rgba(250,204,21,0.95), rgba(250,204,21,0) 62%),
    radial-gradient(70% 220% at 100% 50%, rgba(250,204,21,0.95), rgba(250,204,21,0) 62%),
    radial-gradient(120% 260% at 50% 50%, rgba(250,204,21,0.22), rgba(250,204,21,0) 58%)
  `;

  // Дополнительная «искра» по краям: тонкая линия, чтобы hover был максимально считываем
  const edgeRim = `
    linear-gradient(90deg,
      rgba(250,204,21,0.0) 0%,
      rgba(250,204,21,0.9) 10%,
      rgba(250,204,21,0.2) 28%,
      rgba(250,204,21,0.0) 50%,
      rgba(250,204,21,0.2) 72%,
      rgba(250,204,21,0.9) 90%,
      rgba(250,204,21,0.0) 100%
    )
  `;

  return (
    <div
      className="relative"
      style={{
        width: cardWidthCss,
        maxWidth: "92vw",
      }}
    >
      <div
        className="relative overflow-hidden rounded-[30px] border"
        style={{
          borderColor: borderLine,
          background: `linear-gradient(180deg, ${base2}, ${base1})`,
          boxShadow:
            "0 30px 110px rgba(0,0,0,0.70), 0 0 0 1px rgba(255,255,255,0.04) inset",
        }}
      >
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: `
              radial-gradient(120% 90% at 50% -10%, ${astral}, rgba(0,0,0,0) 52%),
              radial-gradient(120% 110% at 10% 30%, ${ether}, rgba(0,0,0,0) 48%),
              radial-gradient(120% 110% at 90% 70%, ${stargold}, rgba(0,0,0,0) 56%)
            `,
            opacity: 0.55,
          }}
        />

        <div
          className="pointer-events-none absolute inset-0 opacity-[0.22]"
          style={{
            backgroundImage: `
              radial-gradient(circle at 12% 18%, rgba(255,255,255,0.28) 0 1px, rgba(255,255,255,0) 2px),
              radial-gradient(circle at 84% 22%, rgba(255,255,255,0.22) 0 1px, rgba(255,255,255,0) 2px),
              radial-gradient(circle at 28% 66%, rgba(255,255,255,0.18) 0 1px, rgba(255,255,255,0) 2px),
              radial-gradient(circle at 72% 78%, rgba(255,255,255,0.20) 0 1px, rgba(255,255,255,0) 2px),
              radial-gradient(circle at 46% 40%, rgba(255,255,255,0.14) 0 1px, rgba(255,255,255,0) 2px)
            `,
          }}
        />

        <div
          className="pointer-events-none absolute inset-0 rounded-[30px]"
          style={{
            boxShadow: `
              inset 0 0 0 1px rgba(255,255,255,0.06),
              inset 0 0 0 2px rgba(125,211,252,0.06),
              inset 0 0 60px rgba(125,211,252,0.10),
              inset 0 0 120px rgba(167,139,250,0.08)
            `,
          }}
        />

        <div className="relative flex flex-col">
          {/* TITLE BAR */}
          <div
            className="h-14 flex items-center justify-center rounded-t-[30px] relative overflow-hidden"
            style={{
              background: `
                radial-gradient(120% 140% at 50% -20%, rgba(167,139,250,0.35), rgba(0,0,0,0) 58%),
                linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))
              `,
            }}
          >
            <div
              className="pointer-events-none absolute left-6 right-6 bottom-[10px] h-[1px]"
              style={{
                background: `linear-gradient(90deg, rgba(255,255,255,0), ${borderGlow}, rgba(255,255,255,0))`,
                opacity: 0.7,
              }}
            />

            <div
              className="text-[18px] whitespace-nowrap"
              style={{
                fontFamily: fontTitle,
                color: textMain,
                textTransform: "uppercase",
                letterSpacing: "0.34em",
                textShadow: `
                  0 0 14px rgba(125,211,252,0.22),
                  0 0 26px rgba(167,139,250,0.18),
                  0 2px 18px rgba(0,0,0,0.70)
                `,
                transform: "translateY(1px)",
              }}
            >
              {race.name}
            </div>
          </div>

          {/* ART */}
          <div className="relative" style={{ height: artHeightCss }}>
            <div
              className="w-full h-full"
              style={{
                backgroundImage: img ? `url(${img})` : undefined,
                backgroundSize: "cover",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
                backgroundColor: "rgba(0,0,0,0.35)",
              }}
            />

            <div className="pointer-events-none absolute inset-0">
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-black/18" />
              <div
                className="absolute inset-0"
                style={{
                  boxShadow:
                    "inset 0 0 110px rgba(0,0,0,0.70), inset 0 0 0 1px rgba(255,255,255,0.05)",
                }}
              />
              <div
                className="absolute left-0 right-0 bottom-0 h-[46%]"
                style={{
                  background:
                    "radial-gradient(120% 90% at 50% 110%, rgba(125,211,252,0.18), rgba(0,0,0,0) 65%)",
                  opacity: 0.75,
                }}
              />
            </div>
          </div>

          {/* CTA BAR */}
          {isActive ? (
            <div
              className="relative w-full rounded-b-[30px] overflow-hidden group"
              style={{
                padding: "2px",
                borderBottomLeftRadius: 30,
                borderBottomRightRadius: 30,
                background: goldFrameBg,
                boxShadow: goldFrameShadow,
              }}
            >
              {/* СИЛЬНОЕ свечение: края яркие, центр слабее */}
              <div
                className="
                  pointer-events-none absolute inset-[-10px]
                  opacity-0
                  transition-opacity duration-200
                  group-hover:opacity-100
                "
                style={{
                  background: edgeGlowBg,
                  filter: "blur(10px)",
                }}
              />

              {/* Яркий «ободок»/искры по периметру на hover */}
              <div
                className="
                  pointer-events-none absolute inset-0
                  opacity-0
                  transition-opacity duration-200
                  group-hover:opacity-100
                "
                style={{
                  boxShadow: `
                    inset 0 0 0 1px rgba(255, 244, 200, 0.55),
                    inset 0 0 0 2px rgba(250, 204, 21, 0.22),
                    0 0 28px rgba(250,204,21,0.28),
                    0 0 80px rgba(250,204,21,0.18)
                  `,
                }}
              />

              {/* Тонкая линия по низу/верху рамки — максимально читаемый hover */}
              <div
                className="
                  pointer-events-none absolute left-0 right-0 top-0 h-[2px]
                  opacity-0 transition-opacity duration-200
                  group-hover:opacity-100
                "
                style={{ background: edgeRim, filter: "blur(0.3px)" }}
              />
              <div
                className="
                  pointer-events-none absolute left-0 right-0 bottom-0 h-[2px]
                  opacity-0 transition-opacity duration-200
                  group-hover:opacity-100
                "
                style={{ background: edgeRim, filter: "blur(0.3px)" }}
              />

              {/* Лёгкая реакция самой кнопки на hover (без перебора) */}
              <Link
                href={href}
                className="
                  relative
                  h-14 w-full
                  flex items-center justify-center
                  rounded-b-[28px]
                  transition
                  active:scale-[0.99]
                "
                style={{
                  fontFamily: fontUI,
                  textTransform: "uppercase",
                  letterSpacing: "0.30em",
                  color: "rgba(255, 250, 235, 0.95)",
                  background: innerCtaBg,
                  boxShadow: innerCtaInset,
                  textShadow: `
                    0 0 18px rgba(250, 204, 21, 0.26),
                    0 0 28px rgba(125,211,252,0.18),
                    0 2px 16px rgba(0,0,0,0.74)
                  `,
                  borderTop: "1px solid rgba(255,255,255,0.06)",
                }}
                onMouseEnter={(e) => {
                  // чуть усиливаем “прямой” glow у текста/кнопки,
                  // чтобы hover был заметен даже на ярком арте.
                  (e.currentTarget as HTMLAnchorElement).style.boxShadow = `${innerCtaInset}, 0 0 26px rgba(250,204,21,0.22), 0 0 64px rgba(250,204,21,0.14)`;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.boxShadow =
                    innerCtaInset;
                }}
              >
                ВЫБРАТЬ РАСУ
              </Link>
            </div>
          ) : (
            <div
              className="relative w-full rounded-b-[30px] overflow-hidden"
              style={{
                padding: "2px",
                borderBottomLeftRadius: 30,
                borderBottomRightRadius: 30,
                background: goldFrameBg,
                boxShadow: `
                  0 0 0 1px rgba(255,255,255,0.05) inset,
                  0 0 10px rgba(250, 204, 21, 0.06),
                  0 14px 34px rgba(0,0,0,0.55)
                `,
                opacity: 0.55,
              }}
              title="Скоро"
            >
              <div
                className="h-14 w-full flex items-center justify-center rounded-b-[28px]"
                style={{
                  fontFamily: fontUI,
                  textTransform: "uppercase",
                  letterSpacing: "0.30em",
                  color: "rgba(235, 245, 255, 0.38)",
                  background: `
                    radial-gradient(120% 180% at 50% 140%, rgba(167,139,250,0.10), rgba(0,0,0,0) 60%),
                    linear-gradient(180deg, rgba(18, 22, 40, 0.70), rgba(7, 9, 18, 0.78))
                  `,
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)",
                  borderTop: "1px solid rgba(255,255,255,0.05)",
                  textShadow: "0 2px 14px rgba(0,0,0,0.75)",
                }}
              >
                СКОРО
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function RaceSlider({ races }: { races: Race[] }) {
  const list = useMemo(() => (races ?? []).filter(Boolean), [races]);
  const [start, setStart] = useState(0);

  if (!list.length) {
    return (
      <div className="mx-auto w-full max-w-[520px] rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-white/70">
        Пока нет рас в базе данных.
      </div>
    );
  }

  const pageSize = 3;

  const prevPage = () => {
    setStart((s) => {
      const next = s - pageSize;
      if (next >= 0) return next;
      const lastStart = Math.max(
        0,
        Math.floor((list.length - 1) / pageSize) * pageSize
      );
      return lastStart;
    });
  };

  const nextPage = () => {
    setStart((s) => {
      const next = s + pageSize;
      if (next < list.length) return next;
      return 0;
    });
  };

  const visible = useMemo(() => {
    const arr: Race[] = [];
    for (let i = 0; i < pageSize; i++) {
      arr.push(list[(start + i) % list.length]);
    }
    return arr;
  }, [list, start]);

  const GRID_SIDE_PAD_PX = 24;
  const arrowsTopCss = `calc(56px + (min(62vh, 720px) / 2))`;

  const arrowFg = "rgba(198, 228, 255, 0.90)";
  const ring = "rgba(255,255,255,0.08)";
  const ringGlow = "rgba(125,211,252,0.22)";
  const ringGlow2 = "rgba(167,139,250,0.18)";

  return (
    <div className="mx-auto w-full flex justify-center">
      <div className="w-full max-w-[1400px] flex justify-center">
        <div className="relative inline-block">
          <div
            className="
              grid
              gap-10
              items-start
              justify-items-center
              px-6
              grid-cols-1
              md:grid-cols-2
              xl:grid-cols-3
            "
          >
            {visible.map((r) => (
              <RaceCard key={`${r.id}-${start}`} race={r} />
            ))}
          </div>

          <button
            type="button"
            onClick={prevPage}
            aria-label="Предыдущие расы"
            className="absolute z-10 rounded-full border transition active:scale-[0.98]"
            style={{
              width: 66,
              height: 66,
              top: arrowsTopCss,
              left: GRID_SIDE_PAD_PX,
              transform: "translate(-50%, -50%)",
              color: arrowFg,
              borderColor: ring,
              background: `
                radial-gradient(120% 120% at 30% 20%, rgba(125,211,252,0.18), rgba(0,0,0,0) 55%),
                radial-gradient(120% 120% at 70% 80%, rgba(167,139,250,0.16), rgba(0,0,0,0) 55%),
                linear-gradient(180deg, rgba(0,0,0,0.62), rgba(0,0,0,0.26))
              `,
              boxShadow: `
                0 22px 54px rgba(0,0,0,0.65),
                0 0 18px ${ringGlow},
                0 0 32px ${ringGlow2},
                inset 0 0 0 1px rgba(255,255,255,0.05)
              `,
              backdropFilter: "blur(10px)",
              display: "grid",
              placeItems: "center",
            }}
          >
            <CornerArrow dir="left" />
          </button>

          <button
            type="button"
            onClick={nextPage}
            aria-label="Следующие расы"
            className="absolute z-10 rounded-full border transition active:scale-[0.98]"
            style={{
              width: 66,
              height: 66,
              top: arrowsTopCss,
              right: GRID_SIDE_PAD_PX,
              transform: "translate(50%, -50%)",
              color: arrowFg,
              borderColor: ring,
              background: `
                radial-gradient(120% 120% at 30% 20%, rgba(125,211,252,0.18), rgba(0,0,0,0) 55%),
                radial-gradient(120% 120% at 70% 80%, rgba(167,139,250,0.16), rgba(0,0,0,0) 55%),
                linear-gradient(180deg, rgba(0,0,0,0.62), rgba(0,0,0,0.26))
              `,
              boxShadow: `
                0 22px 54px rgba(0,0,0,0.65),
                0 0 18px ${ringGlow},
                0 0 32px ${ringGlow2},
                inset 0 0 0 1px rgba(255,255,255,0.05)
              `,
              backdropFilter: "blur(10px)",
              display: "grid",
              placeItems: "center",
            }}
          >
            <CornerArrow dir="right" />
          </button>
        </div>
      </div>
    </div>
  );
}

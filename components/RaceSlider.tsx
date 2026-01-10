"use client";

import Link from "next/link";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

export type Race = {
  id: string;
  slug: string;
  name: string;
  artUrl: string;
  initiative: number | null;
  /** Если TRUE — раса кликабельна. Если FALSE — "Скоро" и без перехода */
  available?: boolean | null;
};

// На старых данных поле available могло отсутствовать — тогда используем fallback.
const READY_SLUGS_FALLBACK = new Set<string>(["high-elf"]);

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
type FitTitleProps = {
  text: string;
  fontFamily: string;
  color: string;
};

/**
 * Подгоняет однострочный заголовок под ширину контейнера:
 * - НЕ обрезает и НЕ переносит
 * - уменьшает letter-spacing и font-size в разумных пределах
 * - корректно ждёт загрузку шрифтов (TV/zoom)
 */
function FitTitle({ text, fontFamily, color }: FitTitleProps) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const textRef = useRef<HTMLDivElement | null>(null);

  const applyFit = () => {
    const wrap = wrapRef.current;
    const el = textRef.current;
    if (!wrap || !el) return;

    // базовые
    let fontPx = 18;
    let letterEm = 0.34;

    const minFontPx = 12;
    const minLetterEm = 0.06;

    // сброс
    el.style.fontSize = `${fontPx}px`;
    el.style.letterSpacing = `${letterEm}em`;

    const cs = getComputedStyle(wrap);
    const padL = parseFloat(cs.paddingLeft || '0') || 0;
    const padR = parseFloat(cs.paddingRight || '0') || 0;

    // доступная ширина под текст (без padding)
    const wrapW = wrap.getBoundingClientRect().width;
    const maxW = Math.max(0, Math.floor(wrapW - padL - padR - 4)); // запас на дробные пиксели/тень

    const measure = () => Math.ceil(el.getBoundingClientRect().width);

    // 1) уменьшаем трекинг
    let guard = 0;
    while (measure() > maxW && letterEm > minLetterEm && guard < 120) {
      letterEm = Math.max(minLetterEm, letterEm - 0.01);
      el.style.letterSpacing = `${letterEm.toFixed(2)}em`;
      guard += 1;
    }

    // 2) уменьшаем размер шрифта
    guard = 0;
    while (measure() > maxW && fontPx > minFontPx && guard < 40) {
      fontPx = Math.max(minFontPx, fontPx - 1);
      el.style.fontSize = `${fontPx}px`;
      guard += 1;
    }

    // 3) если всё ещё не влезло (крайний случай) — ещё немного трекинг
    guard = 0;
    while (measure() > maxW && letterEm > 0.02 && guard < 80) {
      letterEm = Math.max(0.02, letterEm - 0.01);
      el.style.letterSpacing = `${letterEm.toFixed(2)}em`;
      guard += 1;
    }
  };


  useLayoutEffect(() => {
    // Два rAF: дождаться layout после применения шрифтов/стилей
    const id1 = requestAnimationFrame(() => {
      const id2 = requestAnimationFrame(applyFit);
      // @ts-ignore
      (applyFit as any)._raf2 = id2;
    });
    // Если шрифты догружаются позже — подгоняем повторно
    if (typeof document !== 'undefined' && (document as any).fonts?.ready) {
      (document as any).fonts.ready.then(() => requestAnimationFrame(applyFit)).catch(() => {});
    }
    return () => {
      cancelAnimationFrame(id1);
      // @ts-ignore
      const id2 = (applyFit as any)._raf2;
      if (id2) cancelAnimationFrame(id2);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    const ro = new ResizeObserver(() => requestAnimationFrame(applyFit));
    ro.observe(wrap);

    // некоторые браузеры/TV плохо шлют RO при zoom — подстрахуемся
    const onResize = () => applyFit();
    window.addEventListener('resize', onResize);

    return () => {
      ro.disconnect();
      window.removeEventListener('resize', onResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  return (
    <div ref={wrapRef} className="min-w-0 overflow-hidden px-6">
      <div
        ref={textRef}
        className="whitespace-nowrap text-center"
        style={{
          fontFamily,
          color,
          textTransform: 'uppercase',
          textShadow: '0 2px 16px rgba(0,0,0,0.70)',
          transform: 'translateY(1px)',
          // чтобы измерение было честным
          display: 'inline-block',
        }}
      >
        {text}
      </div>
    </div>
  );
}


function RaceCard({ race }: { race: Race }) {
  const img = race.artUrl || "";
  const href = `/library/inhabitants/races/${race.slug}`;
  const isReady = (race.available ?? null) === null ? READY_SLUGS_FALLBACK.has(race.slug) : !!race.available;

  // Размер карточки: из высоты арта выводим ширину 9:16
  const artHeightCss = "min(62vh, 720px)";
  const cardWidthCss = `calc(${artHeightCss} * 9 / 16)`;

  // База карточки
  const base1 = "#0f1424";
  const base2 = "#141a33";

  const ether = "rgba(125,211,252,0.55)";
  const astral = "rgba(167,139,250,0.45)";
  const stargold = "rgba(250,204,21,0.22)";

  const textMain = "rgba(235, 245, 255, 0.92)";
  const borderLine = "rgba(255,255,255,0.08)";

  // ✅ Шрифты по канону
  const fontHeading = "var(--font-heading)"; // Yeseva One
  const fontBody = "var(--font-body)"; // Forum

  // ======= TOP TITLE: ЛУННОЕ СЕРЕБРО (градиентный обод) + СТАЛЬ внутри =======
  // Внешний “обод” как у золота снизу, но серебряный (лунный)
  const silverFrameBg = `
    linear-gradient(
      135deg,
      rgba(70, 78, 96, 0.98) 0%,
      rgba(190, 206, 228, 0.98) 18%,
      rgba(255, 255, 255, 0.96) 32%,
      rgba(170, 184, 208, 0.98) 52%,
      rgba(90, 102, 124, 0.98) 72%,
      rgba(245, 250, 255, 0.92) 100%
    )
  `;

  // Внутренняя стальная “пластина”
  const titleSteelBg = `
    radial-gradient(140% 160% at 30% -40%, rgba(255,255,255,0.18), rgba(255,255,255,0) 55%),
    radial-gradient(140% 160% at 80% 140%, rgba(255,255,255,0.10), rgba(255,255,255,0) 58%),
    linear-gradient(180deg, rgba(86, 96, 114, 0.98) 0%, rgba(56, 64, 84, 0.98) 55%, rgba(38, 44, 62, 0.99) 100%)
  `;

  const titleFrameShadow = `
    0 0 0 1px rgba(255,255,255,0.05) inset,
    0 10px 28px rgba(0,0,0,0.55),
    0 0 18px rgba(200, 220, 255, 0.10),
    0 0 36px rgba(125,211,252,0.10)
  `;

  const titlePlateShadow = `
    inset 0 1px 0 rgba(255,255,255,0.12),
    inset 0 -16px 26px rgba(0,0,0,0.35)
  `;

  // ======= BOTTOM CTA: СОЛНЕЧНОЕ ЗОЛОТО (как было) =======
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

  const baseFrameShadow = `
    0 0 0 1px rgba(255,255,255,0.06) inset,
    0 0 18px rgba(250, 204, 21, 0.10),
    0 0 48px rgba(250, 204, 21, 0.06),
    0 18px 44px rgba(0,0,0,0.55)
  `;

  const activeHoverGlow = `
    0 0 0 1px rgba(255,255,255,0.06) inset,
    0 0 26px rgba(250, 204, 21, 0.22),
    0 0 90px rgba(250, 204, 21, 0.12),
    0 0 40px rgba(125,211,252,0.14),
    0 0 40px rgba(167,139,250,0.12),
    0 18px 44px rgba(0,0,0,0.55)
  `;

  const ctaBaseBg = `
    radial-gradient(120% 180% at 50% 140%, rgba(125,211,252,0.18), rgba(0,0,0,0) 58%),
    radial-gradient(110% 170% at 10% 30%, rgba(167,139,250,0.14), rgba(0,0,0,0) 55%),
    linear-gradient(180deg, rgba(18, 22, 40, 0.88), rgba(7, 9, 18, 0.92))
  `;

  const ctaHoverGoldBg = `
    radial-gradient(120% 170% at 50% -30%, rgba(255, 255, 255, 0.30), rgba(255,255,255,0) 55%),
    linear-gradient(
      135deg,
      rgba(105, 78, 22, 0.98) 0%,
      rgba(230, 200, 115, 0.98) 22%,
      rgba(255, 246, 210, 0.96) 42%,
      rgba(210, 160, 70, 0.98) 62%,
      rgba(120, 90, 30, 0.98) 100%
    )
  `;

  const ctaBaseShadow = `
    inset 0 1px 0 rgba(255,255,255,0.06),
    inset 0 -18px 36px rgba(0,0,0,0.42)
  `;

  const ctaHoverShadow = `
    inset 0 1px 0 rgba(255,255,255,0.20),
    inset 0 -18px 36px rgba(0,0,0,0.25),
    0 0 22px rgba(250, 204, 21, 0.18),
    0 0 38px rgba(250, 204, 21, 0.10)
  `;

  // ======= "СКОРО": серая рамка как было =======
  const soonFrameBg = `
    linear-gradient(
      135deg,
      rgba(70, 70, 76, 0.96) 0%,
      rgba(120, 120, 132, 0.96) 22%,
      rgba(180, 180, 192, 0.92) 40%,
      rgba(120, 120, 132, 0.96) 62%,
      rgba(70, 70, 76, 0.96) 100%
    )
  `;

  const soonFrameShadow = `
    0 0 0 1px rgba(255,255,255,0.05) inset,
    0 18px 44px rgba(0,0,0,0.55)
  `;

  return (
    <div className="relative" style={{ width: cardWidthCss, maxWidth: "92vw" }}>
      <div
        className="relative overflow-hidden rounded-[30px] border"
        style={{
          borderColor: borderLine,
          background: `linear-gradient(180deg, ${base2}, ${base1})`,
          boxShadow:
            "0 30px 110px rgba(0,0,0,0.70), 0 0 0 1px rgba(255,255,255,0.04) inset",
        }}
      >
        {/* Астральные слои */}
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

        {/* Внутренняя “стеклянность” */}
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
          {/* TITLE: серебряный обод + стальная пластина. Никаких полос. */}
          <div
            className="relative rounded-t-[30px] overflow-hidden"
            style={{
              padding: "2px",
              background: silverFrameBg,
              boxShadow: titleFrameShadow,
              borderTopLeftRadius: 30,
              borderTopRightRadius: 30,
            }}
          >
            <div
              className="h-14 flex items-center justify-center rounded-t-[28px] relative overflow-hidden"
              style={{
                background: titleSteelBg,
                boxShadow: titlePlateShadow,
                borderTopLeftRadius: 28,
                borderTopRightRadius: 28,
              }}
            >
              <FitTitle text={race.name} fontFamily={fontHeading} color={textMain} />
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
                filter: isReady
                  ? "none"
                  : "grayscale(0.45) saturate(0.55) contrast(0.95)",
                opacity: isReady ? 1 : 0.85,
              }}
            />
            <div className="pointer-events-none absolute inset-0">
              <div
                className="absolute inset-0"
                style={{
                  background: isReady
                    ? "linear-gradient(to top, rgba(0,0,0,0.60), rgba(0,0,0,0.10), rgba(0,0,0,0.18))"
                    : "linear-gradient(to top, rgba(0,0,0,0.72), rgba(0,0,0,0.18), rgba(0,0,0,0.22))",
                }}
              />
              <div
                className="absolute inset-0"
                style={{
                  boxShadow:
                    "inset 0 0 110px rgba(0,0,0,0.70), inset 0 0 0 1px rgba(255,255,255,0.05)",
                }}
              />
            </div>
          </div>

          {/* CTA FRAME (золото / серый) */}
          <div
            className={[
              "relative w-full rounded-b-[30px] overflow-hidden",
              isReady ? "group" : "",
            ].join(" ")}
            style={{
              padding: "2px",
              borderBottomLeftRadius: 30,
              borderBottomRightRadius: 30,
              background: isReady ? goldFrameBg : soonFrameBg,
              boxShadow: isReady ? baseFrameShadow : soonFrameShadow,
            }}
          >
            {isReady ? (
              <Link
                href={href}
                className="relative h-14 w-full flex items-center justify-center rounded-b-[28px] transition active:scale-[0.99]"
                style={{
                  fontFamily: fontHeading,
                  textTransform: "uppercase",
                  letterSpacing: "0.30em",
                  color: "rgba(255, 250, 235, 0.95)",
                  background: ctaBaseBg,
                  boxShadow: ctaBaseShadow,
                  textShadow: `
                    0 0 18px rgba(250, 204, 21, 0.20),
                    0 0 28px rgba(125,211,252,0.14),
                    0 2px 16px rgba(0,0,0,0.74)
                  `,
                  borderTop: "1px solid rgba(255,255,255,0.06)",
                }}
                onMouseEnter={(e) => {
                  const frame = e.currentTarget.parentElement;
                  if (frame) frame.style.boxShadow = activeHoverGlow;

                  e.currentTarget.style.background = ctaHoverGoldBg;
                  e.currentTarget.style.color = "rgba(35, 20, 5, 0.92)";
                  e.currentTarget.style.textShadow = "0 1px 10px rgba(0,0,0,0.35)";
                  e.currentTarget.style.boxShadow = ctaHoverShadow;
                }}
                onMouseLeave={(e) => {
                  const frame = e.currentTarget.parentElement;
                  if (frame) frame.style.boxShadow = baseFrameShadow;

                  e.currentTarget.style.background = ctaBaseBg;
                  e.currentTarget.style.color = "rgba(255, 250, 235, 0.95)";
                  e.currentTarget.style.textShadow = `
                    0 0 18px rgba(250, 204, 21, 0.20),
                    0 0 28px rgba(125,211,252,0.14),
                    0 2px 16px rgba(0,0,0,0.74)
                  `;
                  e.currentTarget.style.boxShadow = ctaBaseShadow;
                }}
              >
                ВЫБРАТЬ РАСУ
              </Link>
            ) : (
              <div
                className="relative h-14 w-full flex items-center justify-center rounded-b-[28px]"
                style={{
                  fontFamily: fontBody,
                  textTransform: "uppercase",
                  letterSpacing: "0.30em",
                  color: "rgba(210, 216, 232, 0.55)",
                  background: "linear-gradient(180deg, rgba(0,0,0,0.62), rgba(0,0,0,0.46))",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)",
                  borderTop: "1px solid rgba(255,255,255,0.06)",
                  cursor: "not-allowed",
                  textShadow: "0 2px 14px rgba(0,0,0,0.75)",
                }}
              >
                СКОРО
              </div>
            )}
          </div>
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
      const lastStart = Math.max(0, Math.floor((list.length - 1) / pageSize) * pageSize);
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
    for (let i = 0; i < pageSize; i++) arr.push(list[(start + i) % list.length]);
    return arr;
  }, [list, start]);

  // ВАЖНО: на некоторых экранах (особенно ТВ / нестандартный масштаб браузера)
  // горизонтальный скролл появлялся из‑за того, что стрелки «вылезали» за
  // пределы контейнера (left/right + translateX). Держим стрелки строго внутри.
  const arrowsTopCss = `calc(56px + (min(62vh, 720px) / 2))`;
  const ARROW_INSET_PX = 14;

  const arrowFg = "rgba(198, 228, 255, 0.90)";
  const ring = "rgba(255,255,255,0.08)";
  const ringGlow = "rgba(125,211,252,0.22)";
  const ringGlow2 = "rgba(167,139,250,0.18)";

  const arrowBaseShadow = `
    0 22px 54px rgba(0,0,0,0.65),
    0 0 18px ${ringGlow},
    0 0 32px ${ringGlow2},
    inset 0 0 0 1px rgba(255,255,255,0.05)
  `;

  const arrowHoverShadow = `
    0 22px 54px rgba(0,0,0,0.65),
    0 0 26px rgba(250,204,21,0.14),
    0 0 26px ${ringGlow},
    0 0 44px ${ringGlow2},
    inset 0 0 0 1px rgba(255,255,255,0.06)
  `;

  const arrowBaseBg = `
    radial-gradient(120% 120% at 30% 20%, rgba(125,211,252,0.18), rgba(0,0,0,0) 55%),
    radial-gradient(120% 120% at 70% 80%, rgba(167,139,250,0.16), rgba(0,0,0,0) 55%),
    linear-gradient(180deg, rgba(0,0,0,0.62), rgba(0,0,0,0.26))
  `;

  return (
    <div className="mx-auto w-full flex justify-center overflow-x-hidden">
      <div className="w-full max-w-[1400px] flex justify-center overflow-x-hidden">
        <div className="relative inline-block overflow-x-hidden">
          {/*
            Внутренние отступы по X дают место для стрелок, чтобы они НЕ вылезали за
            край контейнера (и не создавали горизонтальный скролл на ТВ/масштабе).
          */}
          <div className="grid gap-10 items-start justify-items-center px-14 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
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
              left: ARROW_INSET_PX,
              transform: "translate(0, -50%)",
              color: arrowFg,
              borderColor: ring,
              background: arrowBaseBg,
              boxShadow: arrowBaseShadow,
              backdropFilter: "blur(10px)",
              display: "grid",
              placeItems: "center",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = arrowHoverShadow;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = arrowBaseShadow;
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
              right: ARROW_INSET_PX,
              transform: "translate(0, -50%)",
              color: arrowFg,
              borderColor: ring,
              background: arrowBaseBg,
              boxShadow: arrowBaseShadow,
              backdropFilter: "blur(10px)",
              display: "grid",
              placeItems: "center",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = arrowHoverShadow;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = arrowBaseShadow;
            }}
          >
            <CornerArrow dir="right" />
          </button>
        </div>
      </div>
    </div>
  );
}

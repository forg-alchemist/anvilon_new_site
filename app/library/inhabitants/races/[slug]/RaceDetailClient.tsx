"use client";

import { useEffect, useMemo, useState } from "react";
import type { GreatHouseItem } from "@/lib/data/greatHouses";
import { getRaceSectionsForSlug } from "@/lib/races/sectionRules";
import type { RaceSectionKey } from "@/lib/races/raceSections";
import { renderRichText } from "@/lib/ui/richText";
import { getPublicStorageUrl } from "@/lib/supabase/publicUrl";
import type { RaceDetail, RaceSkill, AboutTabKey, HouseTabKey } from "./types";
import type { RaceHistorySection } from "@/lib/data/raceHistory";
import AboutSection from "./sections/AboutSection";
import SkillsSection from "./sections/SkillsSection";
import MapSection from "./sections/MapSection";
import GreatHousesSection from "./sections/GreatHousesSection";
import HistorySection from "./sections/HistorySection";

const ABOUT_TABS: Array<{ key: AboutTabKey; label: string }> = [
  { key: "desc", label: "Описание расы" },
  { key: "phys", label: "Физиология" },
  { key: "arch", label: "Архетипы и характер" },
  { key: "relations", label: "Друзья и враги" },
  { key: "names", label: "Имена" },
];

/**
 * Разделы страницы расы:
 * - универсальные (общие для всех рас)
 * - уникальные для конкретного slug (вставляются правилами)
 *
 * ВАЖНО: comingSoon => раздел виден, но недоступен (плашка «СКОРО»).
 */
function useRaceSections(slug: string) {
  return useMemo(() => {
    const rules = getRaceSectionsForSlug(slug);

    return rules.sections.map((s) => ({
      key: s.key,
      label: s.label,
      disabled: !!s.comingSoon,
      comingSoon: !!s.comingSoon,
    }));
  }, [slug]);
}


export default function RaceDetailClient({
  detail,
  raceSkills,
  greatHouses,
  history,
}: {
  detail: RaceDetail;
  raceSkills: RaceSkill[];
  greatHouses: GreatHouseItem[];
  history: RaceHistorySection[];
}) {
  const sections = useRaceSections(detail.slug);
  const [section, setSection] = useState<RaceSectionKey>("map");
  const [aboutTab, setAboutTab] = useState<AboutTabKey>("desc");

  // Великие дома: выбранный дом + вкладка панели
  const [activeHouseId, setActiveHouseId] = useState<string | null>(null);
  const [houseTab, setHouseTab] = useState<HouseTabKey>("description");
  const [hoveredHouseId, setHoveredHouseId] = useState<string | null>(null);
  const [houseTooltip, setHouseTooltip] = useState<{
    visible: boolean;
    text: string;
    x: number;
    y: number;
  }>({ visible: false, text: "", x: 0, y: 0 });

  // Кол-во колонок для сетки Великих домов (должно соответствовать классам сетки).
  // ВАЖНО: hooks должны быть ТОЛЬКО на верхнем уровне компонента.
  const getHouseGridCols = () => {
    if (typeof window === "undefined") return 5;
    const w = window.innerWidth;
    if (w >= 1024) return 5; // lg
    if (w >= 768) return 3; // md
    return 2;
  };

  const [houseGridCols, setHouseGridCols] = useState<number>(5);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const apply = () => setHouseGridCols(getHouseGridCols());
    apply();
    window.addEventListener("resize", apply);
    return () => window.removeEventListener("resize", apply);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const initUrl = getPublicStorageUrl("art", "UI_UX/Init.png");
  const goldFrameUrl = getPublicStorageUrl("art", "UI_UX/GoldFrame.png");
  const [skillIndex, setSkillIndex] = useState(0);

  const content = useMemo(() => {
    // ====== РАСОВЫЕ НАВЫКИ ======
if (section === "skills") {
  return (
    <SkillsSection raceSkills={raceSkills} skillIndex={skillIndex} setSkillIndex={setSkillIndex} />
  );
}


    // ====== О РАСЕ ======
    if (section === "map") {
  return <MapSection detail={detail} />;
}


if (section === "houses") {
  return (
    <GreatHousesSection
      detail={detail}
      greatHouses={greatHouses}
      activeHouseId={activeHouseId}
      setActiveHouseId={setActiveHouseId}
      houseTab={houseTab}
      setHouseTab={setHouseTab}
      hoveredHouseId={hoveredHouseId}
      setHoveredHouseId={setHoveredHouseId}
      houseTooltip={houseTooltip}
      setHouseTooltip={setHouseTooltip}
      houseGridCols={houseGridCols}
    />
  );
}




if (section === "history") {
  if (!history || history.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 text-white/75">
        Этот раздел пока пустой — заполним позже.
      </div>
    );
  }

  return <HistorySection history={history} />;
}

if (section !== "about") {
      return (
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 text-white/75">
          Этот раздел пока пустой — заполним позже.
        </div>
      );
    }

    return <AboutSection detail={detail} aboutTab={aboutTab} />;

  }, [section, aboutTab, skillIndex, detail, raceSkills, greatHouses, history, activeHouseId, hoveredHouseId, houseTab, houseTooltip, goldFrameUrl]);
  const ink = "rgba(235, 245, 255, 0.92)";
  const inkSoft = "rgba(214, 230, 255, 0.75)";
  const line = "rgba(255,255,255,0.10)";
  const glowCyan = "rgba(125,211,252,0.20)";
  const glowViolet = "rgba(167,139,250,0.18)";
  const gold = "rgba(244, 214, 123, 0.60)";
  const goldSoft = "rgba(244, 214, 123, 0.20)";

  return (
    <div className="mx-auto w-full max-w-[1500px]">
      {/* Левый компактный, правый широкий */}
      <div className="grid gap-8 lg:gap-10 lg:grid-cols-[320px_1fr] items-start">
        {/* LEFT NAV */}
        <aside
          className="relative overflow-hidden rounded-[30px] border"
          style={{
            borderColor: line,
            background: "rgba(0,0,0,0.28)",
            boxShadow:
              "0 30px 100px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.04) inset",
          }}
        >
          {/* Подложка арта */}
          {detail.artUrl ? (
            <div className="absolute inset-0">
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `url(${detail.artUrl})`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right center",
                  backgroundSize: "cover",
                  opacity: 0.60,
                  filter: "saturate(0.92) contrast(1.02)",
                  transform: "scale(1.06)",
                  maskImage:
                    "linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.85) 40%, rgba(0,0,0,1) 72%)",
                  WebkitMaskImage:
                    "linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.85) 40%, rgba(0,0,0,1) 72%)",
                }}
              />
              <div
                className="absolute inset-0"
                style={{
                  background: `
                    linear-gradient(90deg,
                      rgba(0,0,0,0.92) 0%,
                      rgba(0,0,0,0.78) 44%,
                      rgba(0,0,0,0.52) 80%,
                      rgba(0,0,0,0.40) 100%
                    ),
                    radial-gradient(120% 110% at 15% 0%, ${glowViolet}, rgba(0,0,0,0) 55%),
                    radial-gradient(120% 110% at 90% 65%, ${glowCyan}, rgba(0,0,0,0) 58%)
                  `,
                }}
              />
              <div
                className="absolute inset-0"
                style={{
                  boxShadow:
                    "inset 0 0 0 1px rgba(255,255,255,0.06), inset 0 0 110px rgba(0,0,0,0.55)",
                }}
              />
            </div>
          ) : (
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(0,0,0,0.86))",
              }}
            />
          )}

          <div className="relative p-5 lg:p-6">
            {initUrl ? (
              <div className="group relative h-[4.8rem] w-[4.8rem] mb-0">
                <div className="relative h-full w-full overflow-hidden rounded-2xl bg-transparent">
                  <img
                  src={initUrl}
                  alt=""
                  className="h-full w-full object-contain"
                  draggable={false}
                />
              
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span
                    style={{
                      fontFamily: "var(--font-buttons)",
                      fontSize: 34,
                      fontWeight: 700,
                      letterSpacing: "0.06em",
                      color: "#f4d67b",
                      textShadow:
                        "0 2px 18px rgba(0,0,0,0.92), 0 0 22px rgba(244, 214, 123, 0.22)",
                    }}
                  >
                    {detail.initiative}
                  </span>
                </div>
                </div>

                <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-[115%] pointer-events-none opacity-0 translate-y-1 transition-all duration-150 group-hover:opacity-100 group-hover:translate-y-0">
                  <div
                    className="whitespace-nowrap rounded-xl px-3 py-2 text-sm"
                    style={{
                      background: "rgba(0,0,0,0.72)",
                      border: "1px solid rgba(244, 214, 123, 0.22)",
                      boxShadow: "0 10px 28px rgba(0,0,0,0.55)",
                      color: "#f4d67b",
                      backdropFilter: "blur(6px)",
                      fontFamily: "var(--font-text)",
                    }}
                  >
                    Инициатива расы
                  </div>
                </div>
              </div>
            ) : null}

            <nav className="grid gap-3">
              {sections.map((s) => {
                const active = section === s.key;
                const disabled = !!s.disabled;

                return (
                  <button
                    key={s.key}
                    type="button"
                    disabled={disabled}
                    onClick={() => {
                      if (disabled) return;
                      setSection(s.key);
                      if (s.key === "about") setAboutTab("desc");
                      if (s.key === "skills") setSkillIndex(0);
                    }}
                    className="group text-left rounded-2xl border px-5 py-4 transition disabled:cursor-not-allowed"
                    style={{
                      borderColor: active
                        ? "rgba(244, 214, 123, 0.38)"
                        : "rgba(255,255,255,0.10)",
                      background: active
                        ? `
                          radial-gradient(140% 120% at 50% 0%, ${goldSoft}, rgba(0,0,0,0) 62%),
                          linear-gradient(180deg, rgba(0,0,0,0.46), rgba(0,0,0,0.26))
                        `
                        : "rgba(0,0,0,0.28)",
                      boxShadow: active
                        ? `0 16px 40px rgba(0,0,0,0.55), 0 0 26px ${goldSoft}`
                        : "0 14px 32px rgba(0,0,0,0.45)",
                      backdropFilter: "blur(10px)",
                      opacity: disabled ? 0.55 : 1,
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        style={{
                          fontFamily: "var(--font-buttons)",
                          fontSize: 14,
                          textTransform: "uppercase",
                          letterSpacing: "0.22em",
                          color: active ? ink : inkSoft,
                          textShadow: active
                            ? `0 0 14px ${goldSoft}, 0 2px 18px rgba(0,0,0,0.85)`
                            : "0 2px 16px rgba(0,0,0,0.8)",
                        }}
                      >
                        {s.label}
                      </div>

                      {disabled && (
                        <div
                          className="ml-auto rounded-full border border-white/10 bg-black/25 px-3 py-1"
                          style={{
                            fontFamily: "var(--font-buttons)",
                            fontSize: 12,
                            textTransform: "uppercase",
                            letterSpacing: "0.22em",
                            color: "rgba(214, 230, 255, 0.45)",
                          }}
                        >
                          Скоро
                        </div>
                      )}
                    </div>

                    <div
                      className="mt-3 h-[1px] w-full"
                      style={{
                        background: active
                          ? `linear-gradient(90deg, rgba(255,255,255,0), ${gold}, rgba(255,255,255,0))`
                          : `linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.10), rgba(255,255,255,0))`,
                        opacity: active ? 0.95 : 0.55,
                      }}
                    />
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* RIGHT CONTENT */}
        <section
          className="rounded-[30px] border overflow-hidden"
          style={{
            borderColor: line,
            background: `
              radial-gradient(120% 110% at 10% 0%, ${glowViolet}, rgba(0,0,0,0) 52%),
              radial-gradient(120% 110% at 90% 60%, ${glowCyan}, rgba(0,0,0,0) 56%),
              linear-gradient(180deg, rgba(255,255,255,0.05), rgba(0,0,0,0.86))
            `,
            boxShadow:
              "0 34px 130px rgba(0,0,0,0.70), 0 0 0 1px rgba(255,255,255,0.04) inset",
          }}
        >
          {section === "about" && (
            <div className="px-6 pt-6 lg:px-8 lg:pt-7">
              <div className="flex flex-wrap gap-3">
                {ABOUT_TABS.map((t) => {
                  const active = aboutTab === t.key;
                  return (
                    <button
                      key={t.key}
                      type="button"
                      onClick={() => setAboutTab(t.key)}
                      className="rounded-full border px-2.5 py-1.5 transition"
                      style={{
                        borderColor: active
                          ? "rgba(244, 214, 123, 0.38)"
                          : "rgba(255,255,255,0.10)",
                        background: active
                          ? `
                            radial-gradient(140% 140% at 50% 0%, ${goldSoft}, rgba(0,0,0,0) 62%),
                            linear-gradient(180deg, rgba(0,0,0,0.52), rgba(0,0,0,0.22))
                          `
                          : "rgba(0,0,0,0.25)",
                        boxShadow: active
                          ? `0 12px 28px rgba(0,0,0,0.55), 0 0 22px ${goldSoft}`
                          : "0 10px 24px rgba(0,0,0,0.40)",
                        backdropFilter: "blur(10px)",
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "var(--font-buttons)",
                          fontSize: 14,
                          textTransform: "uppercase",
                          letterSpacing: "0.18em",
                          color: active ? ink : inkSoft,
                          textShadow: active
                            ? `0 0 14px ${goldSoft}, 0 2px 16px rgba(0,0,0,0.85)`
                            : "0 2px 14px rgba(0,0,0,0.8)",
                        }}
                      >
                        {t.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="p-6 lg:p-8">{content}</div>
        </section>
      </div>
    </div>
  );
}

/**
 * Стили 1-в-1 по RaceSlider.tsx → RaceCard (рамка, стекло, серебряный заголовок),
 * но без ссылок/кнопок/hover.
 */
/**
 * Стили 1-в-1 по RaceSlider.tsx → RaceCard (рамка, стекло, серебряный заголовок),
 * но без ссылок/кнопок/hover.
 */

"use client";

import { useEffect, useMemo, useState } from "react";
import type { GreatHouseItem } from "@/lib/data/greatHouses";
import { getRaceSectionsForSlug } from "@/lib/races/sectionRules";
import type { RaceSectionKey } from "@/lib/races/raceSections";
import { renderRichText } from "@/lib/ui/richText";
import { getPublicStorageUrl } from "@/lib/supabase/publicUrl";
import type { RaceDetail, RaceSkill, AboutTabKey, HouseTabKey } from "./types";
import type { RaceHistorySection } from "@/lib/data/raceHistory";
import type { GameClassWithSkills } from "@/lib/data/classes";
import AboutSection from "./sections/AboutSection";
import SkillsSection from "./sections/SkillsSection";
import MapSection from "./sections/MapSection";
import GreatHousesSection from "./sections/GreatHousesSection";
import MoonElfFamiliesSection from "./sections/MoonElfFamiliesSection";
import type { MoonElfFamilyItem } from "@/lib/data/moonElfFamilies";
import LegendarySquadsSection from "./sections/LegendarySquadsSection";
import type { MoonSquadItem, MoonSquadPersonItem } from "@/lib/data/moonSquad";
import HistorySection from "./sections/HistorySection";
import RaceClassesSection from "./sections/RaceClassesSection";

const ABOUT_TABS: AboutTabKey[] = ["desc", "phys", "arch", "relations", "names"];

function getSectionLabel(key: RaceSectionKey, isEn: boolean): string {
  if (isEn) {
    switch (key) {
      case "about":
        return "ABOUT RACE";
      case "skills":
        return "RACIAL SKILLS";
      case "r_classes":
        return "RACIAL CLASSES";
      case "houses":
        return "GREAT HOUSES";
      case "map":
        return "TERRITORY MAP";
      case "history":
        return "RACE HISTORY";
      case "religion":
        return "RELIGION";
      case "moon-clans":
        return "MOON ELF CLANS";
      case "legendary-squads":
        return "LEGENDARY SQUADS";
      case "institutions":
        return "SOCIAL INSTITUTIONS";
      default:
        return String(key).toUpperCase();
    }
  }

  switch (key) {
    case "about":
      return "О РАСЕ";
    case "skills":
      return "РАСОВЫЕ НАВЫКИ";
    case "r_classes":
      return "РАСОВЫЕ КЛАССЫ";
    case "houses":
      return "ВЕЛИКИЕ ДОМА";
    case "map":
      return "КАРТА ВЛАДЕНИЙ";
    case "history":
      return "ИСТОРИЯ РАСЫ";
    case "religion":
      return "РЕЛИГИЯ";
    case "moon-clans":
      return "РОДА ЛУННЫХ ЭЛЬФОВ";
    case "legendary-squads":
      return "ЛЕГЕНДАРНЫЕ ОТРЯДЫ";
    case "institutions":
      return "ВАЖНЫЕ СОЦИАЛЬНЫЕ ИНСТИТУТЫ";
    default:
      return String(key).toUpperCase();
  }
}

function getAboutTabLabel(key: AboutTabKey, isEn: boolean): string {
  if (isEn) {
    switch (key) {
      case "desc":
        return "RACE DESCRIPTION";
      case "phys":
        return "PHYSIOLOGY";
      case "arch":
        return "ARCHETYPES AND CHARACTER";
      case "relations":
        return "FRIENDS AND ENEMIES";
      case "names":
        return "NAMES";
      default:
        return String(key).toUpperCase();
    }
  }

  switch (key) {
    case "desc":
      return "ОПИСАНИЕ РАСЫ";
    case "phys":
      return "ФИЗИОЛОГИЯ";
    case "arch":
      return "АРХЕТИПЫ И ХАРАКТЕР";
    case "relations":
      return "ДРУЗЬЯ И ВРАГИ";
    case "names":
      return "ИМЕНА";
    default:
      return String(key).toUpperCase();
  }
}

/**
 * Разделы страницы расы:
 * - универсальные (общие для всех рас)
 * - уникальные для конкретного slug (вставляются правилами)
 *
 * ВАЖНО: comingSoon => раздел виден, но недоступен (плашка «СКОРО»).
 */
function useRaceSections(slug: string, isEn: boolean) {
  return useMemo(() => {
    const rules = getRaceSectionsForSlug(slug);

    return rules.sections.map((s) => ({
      key: s.key,
      label: getSectionLabel(s.key, isEn),
      disabled: !!s.comingSoon,
      comingSoon: !!s.comingSoon,
    }));
  }, [slug, isEn]);
}


export default function RaceDetailClient({
  detail,
  raceSkills,
  raceClasses,
  greatHouses,
  history,
  moonFamilies,
  moonSquads,
  lang = "ru",
}: {
  detail: RaceDetail;
  raceSkills: RaceSkill[];
  raceClasses: GameClassWithSkills[];
  greatHouses: GreatHouseItem[];
  history: RaceHistorySection[];
  moonFamilies: MoonElfFamilyItem[];
  moonSquads: Array<MoonSquadItem & { persons: MoonSquadPersonItem[] }>;
  lang?: "ru" | "en";
}) {
  const isEn = lang === "en";
  const sections = useRaceSections(detail.slug, isEn);
  const [section, setSection] = useState<RaceSectionKey>("about");
  const [aboutTab, setAboutTab] = useState<AboutTabKey>("desc");

  // При смене расы (переход со слайдера) — всегда открываем «О расе»
  useEffect(() => {
    setSection("about");
    setAboutTab("desc");
    setSkillIndex(0);
  }, [detail.slug]);

  const [activeClassId, setActiveClassId] = useState<string | null>(
    raceClasses?.[0]?.id ?? null
  );

  // Если список классов поменялся (или пришёл позже) — выставим первую вкладку
  useEffect(() => {
    if (!raceClasses || raceClasses.length === 0) {
      setActiveClassId(null);
      return;
    }
    setActiveClassId((prev) => {
      if (prev && raceClasses.some((c) => c.id === prev)) return prev;
      return raceClasses[0].id;
    });
  }, [raceClasses]);

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

  // Рода лунных эльфов
  const [activeMoonFamilyId, setActiveMoonFamilyId] = useState<string | null>(null);
  const [moonFamilyTab, setMoonFamilyTab] = useState<import("./sections/MoonElfFamiliesSection").MoonFamilyTabKey>("description");

  const [activeMoonSquadId, setActiveMoonSquadId] = useState<string | null>(null);


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

  // Кол-во колонок для сетки легендарных отрядов (1 / 2 / 3).
  const getSquadGridCols = () => {
    if (typeof window === "undefined") return 3;
    const w = window.innerWidth;
    if (w >= 1024) return 3; // lg
    if (w >= 768) return 2; // md
    return 1;
  };

  // Legendary squads are displayed as an approved 2x2 tile grid.
  const [squadGridCols, setSquadGridCols] = useState<number>(2);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const apply = () => setSquadGridCols(getSquadGridCols());
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
        <SkillsSection
          raceSkills={raceSkills}
          skillIndex={skillIndex}
          setSkillIndex={setSkillIndex}
        />
      );
    }

    // ====== РАСОВЫЕ КЛАССЫ ======
    if (section === "r_classes") {
      return <RaceClassesSection classes={raceClasses} activeId={activeClassId} />;
    }

    // ====== КАРТА ======
    if (section === "map") {
      return <MapSection detail={detail} />;
    }

    // ====== РОДА ЛУННЫХ ЭЛЬФОВ ======
    if (section === "moon-clans") {
      return (
        <MoonElfFamiliesSection
          families={moonFamilies}
          activeId={activeMoonFamilyId}
          setActiveId={setActiveMoonFamilyId}
          tab={moonFamilyTab}
          setTab={setMoonFamilyTab}
        />
      );
    }

    // ====== ЛЕГЕНДАРНЫЕ ОТРЯДЫ ======
    if (section === "legendary-squads") {
      return (
        <LegendarySquadsSection
          squads={moonSquads}
          activeId={activeMoonSquadId}
          setActiveId={setActiveMoonSquadId}
          gridCols={squadGridCols}
        />
      );
    }

    // ====== ВЕЛИКИЕ ДОМА ======
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

    // ====== ИСТОРИЯ ======
    if (section === "history") {
      if (!history || history.length === 0) {
        return (
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 text-white/75">
            {isEn ? "This section is empty for now — we will fill it later." : "Этот раздел пока пустой — заполним позже."}
          </div>
        );
      }

      return <HistorySection history={history} />;
    }

if (section !== "about") {
      return (
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 text-white/75">
          {isEn ? "This section is empty for now — we will fill it later." : "Этот раздел пока пустой — заполним позже."}
        </div>
      );
    }

    return <AboutSection detail={detail} aboutTab={aboutTab} />;

  }, [
    section,
    aboutTab,
    skillIndex,
    detail,
    raceSkills,
    raceClasses,
    activeClassId,
    greatHouses,
    history,
    activeHouseId,
    hoveredHouseId,
    houseTab,
    houseTooltip,
    houseGridCols,
    moonFamilies,
    activeMoonFamilyId,
    moonFamilyTab,
    moonSquads,
    activeMoonSquadId,
    squadGridCols,
  ]);
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
                    {isEn ? "Race initiative" : "Инициатива расы"}
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
                          {isEn ? "Soon" : "Скоро"}
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
                {ABOUT_TABS.map((tabKey) => {
                  const active = aboutTab === tabKey;
                  return (
                    <button
                      key={tabKey}
                      type="button"
                      onClick={() => setAboutTab(tabKey)}
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
                        {getAboutTabLabel(tabKey, isEn)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {section === "r_classes" && (
            <div className="px-6 pt-6 lg:px-8 lg:pt-7">
              <div className="flex flex-wrap gap-3">
                {(raceClasses ?? []).map((c) => {
                  const active = activeClassId === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setActiveClassId(c.id)}
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
                        {(c.name ?? (c as any).name_ru ?? (c as any).name_en ?? c.slug_class)}
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

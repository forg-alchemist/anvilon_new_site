"use client";

import { useEffect, useMemo, useState } from "react";
import type { GreatHouseItem } from "@/lib/data/greatHouses";
import { getRaceSectionsForSlug } from "@/lib/races/sectionRules";
import type { RaceSectionKey } from "@/lib/races/raceSections";
import { renderRichText } from "@/lib/ui/richText";
import { getPublicStorageUrl } from "@/lib/supabase/publicUrl";

export type RaceDetail = {
  slug: string;
  name: string;
  artUrl: string;
  initiative: number;
  /** URL карты владений (public storage) */
  mapUrl?: string;
  about: {
    /** Вкладка "Описание расы" (первый текстовый блок) */
    description: string;

    /** Вкладка "Описание расы" (второй текстовый блок под заголовком "Особенности") */
    features: string;

    /** Вкладка "Физиология" (подраздел 1) */
    physiology: string;

    /** Вкладка "Физиология" (подраздел 2: "Происхождение") */
    origin: string;

    /** Теги показываются ТОЛЬКО в подразделе "Происхождение" внутри вкладки "Физиология" */
    originTags: string[];

    /** Вкладка "Физиология" (подраздел 3) */
    sociality: string;

    archetypes: string;
    /** Теги-капсулы для "Архетипы и роль персонажа" */
    archetypeTags: string[];

    /** Текст блока "Характер" для вкладки "Архетипы и роль персонажа" */
    character: string;

    relations: string;
    /** Теги-капсулы для вкладки "Друзья и враги" */
    relationshipsTags: string[];

    /** Вкладка "Имена" — общий текст */
    names: string;
    /** Вкладка "Имена" — фамилии/родовые имена */
    surname: string;
    /** Вкладка "Имена" — особенности построения имен */
    nameFeatures: string;
  };
};

export type RaceSkill = {
  slug: string;
  skillNum: number;
  name: string;
  description: string;
  artPath: string;
};

type SectionKey = RaceSectionKey;
type AboutTabKey = "desc" | "phys" | "arch" | "relations" | "names";

type HouseTabKey = "description" | "members" | "bonus" | "tradition";



// ✅ "Происхождение" как отдельную вкладку УДАЛИЛИ.
// ✅ Теперь оно внутри вкладки "Физиология" как подраздел.
const ABOUT_TABS: Array<{ key: AboutTabKey; label: string }> = [
  { key: "desc", label: "Описание расы" },
  { key: "phys", label: "Физиология" },
  { key: "arch", label: "Архетипы и роль персонажа" },
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
}: {
  detail: RaceDetail;
  raceSkills: RaceSkill[];
  greatHouses: GreatHouseItem[];
}) {
  const sections = useRaceSections(detail.slug);
  const [section, setSection] = useState<SectionKey>("map");
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
  const sorted = [...(raceSkills ?? [])].sort(
    (a, b) => (a.skillNum ?? 0) - (b.skillNum ?? 0)
  );

  const safeIndex =
    sorted.length === 0
      ? 0
      : Math.min(Math.max(skillIndex, 0), sorted.length - 1);

  const activeSkill = sorted[safeIndex];

  // ВАЖНО: здесь НЕ ДОЛЖНО быть gap между корешками и панелью.
  // Любой gap визуально выглядит как "пустая полоса".
  return (
    <div className="flex flex-col">
      <RaceSkillTabs
        skills={sorted}
        activeIndex={safeIndex}
        onSelect={(i) => setSkillIndex(i)}
      />

      {activeSkill ? (
        <RaceSkillPanel skill={activeSkill} />
      ) : (
        <RaceSkillPanelPlaceholder />
      )}
    </div>
  );
}

    // ====== О РАСЕ ======
    if (section === "map") {
      return (
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 text-white/85">
          <div className="text-sm tracking-[0.18em] uppercase text-[#f4d67b]">Карта владений</div>

          {detail.mapUrl ? (
            <div className="mt-4 overflow-hidden rounded-xl border border-white/10 bg-black/20">
              <img
                src={detail.mapUrl}
                alt={`Карта владений: ${detail.name}`}
                className="block h-auto w-full object-contain"
                loading="lazy"
                draggable={false}
              />
            </div>
          ) : (
            <div className="mt-4 text-white/75">
              (заглушка) Здесь позже появится карта владений и краткое описание территорий.
            </div>
          )}
        </div>
      );
    }

if (section === "houses") {
      const activeHouse =
        activeHouseId ? greatHouses?.find((h) => h.id === activeHouseId) ?? null : null;

      const tabs: Array<{ key: HouseTabKey; label: string }> = [
        { key: "description", label: "Описание" },
        { key: "members", label: "Представители дома" },
        { key: "bonus", label: "Бонусы дома" },
        { key: "tradition", label: "Традиции и обычаи" },
      ];

      // Кол-во колонок берём из состояния верхнего уровня (hooks нельзя вызывать внутри useMemo).
      const gridCols = houseGridCols;

      const activeIndex = activeHouseId
        ? Math.max(0, greatHouses.findIndex((h) => h.id === activeHouseId))
        : -1;

      const rowEndIndex =
        activeIndex >= 0 && gridCols > 0
          ? Math.min(
              greatHouses.length - 1,
              activeIndex + (gridCols - 1 - (activeIndex % gridCols))
            )
          : -1;

      return (
        <div className="relative">
          {/* Плитки домов + встроенная панель (вставляется сразу ПОД строкой выбранного дома) */}
          {greatHouses?.length ? (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-3 lg:grid-cols-5 lg:gap-4">
              {greatHouses.map((h, idx) => {
                const title = (h.name_house || h.house || "").toString();
                const isActive = activeHouseId === h.id;
                const isHovered = hoveredHouseId === h.id;
                const showFx = isActive || isHovered;
                const isDim = !!activeHouseId && !isActive;

                return (
                  <div key={h.id} className="contents">
                    <button
                      type="button"
                      className="group relative text-left"
                      onClick={() => {
                        if (activeHouseId === h.id) {
                          setActiveHouseId(null);
                          return;
                        }
                        setActiveHouseId(h.id);
                        setHouseTab("description");
                      }}
                      onMouseEnter={() => {
                        setHoveredHouseId(h.id);
                        if (title) {
                          setHouseTooltip((t) => ({ ...t, visible: true, text: title }));
                        }
                      }}
                      onMouseMove={(e) => {
                        if (!title) return;
                        const x = e.clientX + 14;
                        const y = e.clientY + 14;
                        setHouseTooltip((t) => ({ ...t, visible: true, text: title, x, y }));
                      }}
                      onMouseLeave={() => {
                        setHoveredHouseId((prev) => (prev === h.id ? null : prev));
                        setHouseTooltip((t) => ({ ...t, visible: false }));
                      }}
                      style={{
                        transition: "transform 140ms ease, filter 140ms ease, opacity 140ms ease",
                        filter: isDim ? "grayscale(1) saturate(0.45) brightness(0.75)" : "none",
                        opacity: isDim ? 0.34 : 1,
                        transform: showFx ? "translateY(-1px)" : "translateY(0)",
                      }}
                    >
                      <div className="relative aspect-[9/16] w-full">
                        {/* Арт (плитка, без закруглений) */}
                        {h.artUrl ? (
                          <img
                            src={h.artUrl}
                            alt={title}
                            className="absolute inset-0 h-full w-full object-cover"
                            loading="lazy"
                            draggable={false}
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20 text-xs text-white/60">
                            Нет арта
                          </div>
                        )}

                        {/* Рамка из storage (hover/active) */}
                        {goldFrameUrl ? (
                          <img
                            src={goldFrameUrl}
                            alt=""
                            className="pointer-events-none absolute inset-0 h-full w-full"
                            style={{
                              opacity: showFx ? 1 : 0,
                              transition: "opacity 120ms ease",
                              transform: showFx ? "scale(1.01)" : "scale(1)",
                            }}
                            draggable={false}
                          />
                        ) : null}

                        {/* Очень сильное свечение (ПОВЕРХ рамки) */}
                        <div
                          className="pointer-events-none absolute inset-0"
                          style={{
                            opacity: showFx ? 1 : 0,
                            transition: "opacity 120ms ease",
                            boxShadow:
                              "0 0 26px rgba(244,214,123,0.85), 0 0 70px rgba(244,214,123,0.55), 0 0 140px rgba(244,214,123,0.30)",
                          }}
                        />
                        <div
                          className="pointer-events-none absolute inset-0"
                          style={{
                            opacity: showFx ? 1 : 0,
                            transition: "opacity 120ms ease",
                            boxShadow:
                              "0 0 0 2px rgba(244,214,123,0.20) inset, 0 0 26px rgba(244,214,123,0.28) inset",
                          }}
                        />
                      </div>
                    </button>

                    {/* Вставляем панель сразу после строки, где лежит выбранный дом */}
                    {activeHouse && idx === rowEndIndex ? (
                      <div className="col-span-full">
                        <div
                          className="mt-4 rounded-2xl border border-white/10 bg-black/25 p-4 lg:p-5"
                          style={{
                            backdropFilter: "blur(10px)",
                            boxShadow: "0 22px 70px rgba(0,0,0,0.55)",
                          }}
                        >
                          
{/* House title */}
<div
  className="mb-3 text-center"
  style={{
    fontFamily: "var(--font-title)",
    fontSize: 26,
    lineHeight: 1.1,
    letterSpacing: "0.06em",
    color: "rgba(244, 214, 123, 0.96)",
    textShadow:
      "0 0 18px rgba(244, 214, 123, 0.20), 0 2px 28px rgba(0,0,0,0.85)",
  }}
>
  {(activeHouse?.name_house || activeHouse?.house || "").toString().trim().toUpperCase()}
</div>

                          {/* Tabs */}
                          <div className="flex flex-wrap gap-2">
                            {tabs.map((t) => {
                              const active = houseTab === t.key;
                              return (
                                <button
                                  key={t.key}
                                  type="button"
                                  onClick={() => setHouseTab(t.key)}
                                  className="rounded-full border px-2.5 py-1.5 transition"
                                  style={{
                                    borderColor: active
                                      ? "rgba(244, 214, 123, 0.38)"
                                      : "rgba(255,255,255,0.10)",
                                    background: active
                                      ? `radial-gradient(140% 140% at 50% 0%, rgba(244, 214, 123, 0.20), rgba(0,0,0,0) 62%), linear-gradient(180deg, rgba(0,0,0,0.52), rgba(0,0,0,0.22))`
                                      : "rgba(0,0,0,0.25)",
                                    boxShadow: active
                                      ? "0 10px 24px rgba(0,0,0,0.55), 0 0 18px rgba(244, 214, 123, 0.18)"
                                      : "0 8px 18px rgba(0,0,0,0.40)",
                                    backdropFilter: "blur(10px)",
                                  }}
                                >
                                  <span
                                    style={{
                                      fontFamily: "var(--font-buttons)",
                                      fontSize: 13,
                                      textTransform: "uppercase",
                                      letterSpacing: "0.16em",
                                      color: active
                                        ? "rgba(235, 245, 255, 0.92)"
                                        : "rgba(214, 230, 255, 0.75)",
                                      textShadow: active
                                        ? "0 0 14px rgba(244, 214, 123, 0.18), 0 2px 16px rgba(0,0,0,0.85)"
                                        : "0 2px 14px rgba(0,0,0,0.8)",
                                    }}
                                  >
                                    {t.label}
                                  </span>
                                </button>
                              );
                            })}
                          </div>

                          <div className="mt-3">
                            {/* 1) Описание */}
                            {houseTab === "description" ? (
                              <TextBlock text={activeHouse.description ?? ""} />
                            ) : null}

                            {/* 2) Представители */}
                            {houseTab === "members" ? (
                              <div className="flex flex-col gap-3">

                                {(() => {
                                  const members = [...(activeHouse.council ?? [])].sort(
                                    (a, b) => (a.number ?? 0) - (b.number ?? 0)
                                  );

                                  if (!members.length) {
                                    return (
                                      <div className="text-white/70">
                                        В таблице council пока нет представителей для этого дома.
                                      </div>
                                    );
                                  }

                                  return (
                                    <div className="flex flex-col gap-7">
                                      {members.map((m) => (
                                        <div key={m.id} className="flex flex-col gap-3">
                                          <div
                                            style={{
                                              fontFamily: "var(--font-buttons)",
                                              fontSize: 22,
                                              textTransform: "none",
                                              letterSpacing: "0.10em",
                                              color: "rgba(235, 245, 255, 0.92)",
                                              opacity: 0.92,
                                            }}
                                          >
                                            {(m.name ?? "").toString()}
                                          </div>

                                          <div className="flex flex-col gap-4 lg:flex-row lg:gap-6">
                                            {/* Арт 9:16 слева, фиксированный */}
                                            <div className="w-full max-w-[220px] shrink-0">
                                              <div
                                                className="relative aspect-[9/16] w-full overflow-hidden rounded-2xl border border-white/12 bg-black/25"
                                                style={{ boxShadow: "0 18px 50px rgba(0,0,0,0.42)" }}
                                              >
                                                {m.artUrl ? (
                                                  <img
                                                    src={m.artUrl}
                                                    alt={(m.name ?? "").toString()}
                                                    className="absolute inset-0 h-full w-full object-cover"
                                                    loading="lazy"
                                                    draggable={false}
                                                  />
                                                ) : (
                                                  <div className="absolute inset-0 flex items-center justify-center text-xs text-white/55">
                                                    Нет арта
                                                  </div>
                                                )}
                                              </div>
                                            </div>

                                            {/* Текст справа */}
                                            <div className="min-w-0 flex-1">
                                              <div className="flex flex-col gap-3">
                                                {/* Место в совете */}
                                                <div
                                                  style={{
                                                    fontFamily: "var(--font-buttons)",
                                                    fontSize: 16,
                                                    textTransform: "none",
                                                    letterSpacing: "0.10em",
                                                    color: "rgba(235, 245, 255, 0.92)",
                                                  }}
                                                >
                                                  <span>Место в совете: </span>
                                                  <span
                                                    style={{
                                                      color: "rgba(244, 214, 123, 0.95)",
                                                      fontWeight: 600,
                                                      textShadow:
                                                        "0 0 14px rgba(244, 214, 123, 0.18), 0 2px 22px rgba(0,0,0,0.80)",
                                                    }}
                                                  >
                                                    {m.number ?? "—"}
                                                  </span>
                                                </div>

                                                <div>
                                                  <SubHeader title="Направление политики" />
                                                  <div className="mt-2">
                                                    <TagsRow tags={m.policyDirectionTags} />
                                                  </div>
                                                </div>

                                                <div>
                                                  <SubHeader title="Союзники в Совете" />
                                                  <div className="mt-2">
                                                    <TagsRow tags={m.alliesTags} />
                                                  </div>
                                                </div>

                                                <div>
                                                  <SubHeader title="Описание" />
                                                  <div className="mt-2">
                                                    <TextBlock text={m.description ?? ""} />
                                                  </div>
                                                </div>

                                                <div>
                                                  <SubHeader title="Характер" />
                                                  <div className="mt-2">
                                                    <TextBlock text={m.character ?? ""} />
                                                  </div>
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  );
                                })()}
                              </div>
                            ) : null}

                            {/* 3) Бонусы */}
                            {houseTab === "bonus" ? (
                              <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
                                <div className="w-full max-w-[190px] shrink-0">
                                  <div
                                    className="relative aspect-square w-full overflow-hidden rounded-2xl border border-white/12 bg-black/25"
                                    style={{ boxShadow: "0 18px 50px rgba(0,0,0,0.42)" }}
                                  >
                                    {activeHouse.bonusArtUrl ? (
                                      <img
                                        src={activeHouse.bonusArtUrl}
                                        alt="Бонус"
                                        className="absolute inset-0 h-full w-full object-cover"
                                        loading="lazy"
                                        draggable={false}
                                      />
                                    ) : (
                                      <div className="absolute inset-0 flex items-center justify-center text-xs text-white/55">
                                        Нет арта
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <div className="min-w-0 flex-1">
                                  <TextBlock text={activeHouse.bonus ?? ""} />
                                </div>
                              </div>
                            ) : null}

                            {/* 4) Традиции */}
                            {houseTab === "tradition" ? (
                              <TextBlock text={activeHouse.tradition ?? ""} />
                            ) : null}
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-white/75">Пока нет данных по Великим домам.</div>
          )}

          {/* Tooltip поверх плиток (не внутри) */}
          {houseTooltip.visible && houseTooltip.text ? (
            <div
              className="pointer-events-none fixed z-[9999]"
              style={{
                left: houseTooltip.x,
                top: houseTooltip.y,
              }}
            >
              <div
                className="rounded-md border px-3 py-2"
                style={{
                  borderColor: "rgba(244, 214, 123, 0.30)",
                  background: "rgba(0,0,0,0.65)",
                  backdropFilter: "blur(10px)",
                  boxShadow: "0 18px 50px rgba(0,0,0,0.55), 0 0 18px rgba(244,214,123,0.18)",
                  fontFamily: "var(--font-buttons)",
                  fontSize: 12,
                  textTransform: "uppercase",
                  letterSpacing: "0.22em",
                  color: "rgba(244, 214, 123, 0.95)",
                }}
              >
                {houseTooltip.text}
              </div>
            </div>
          ) : null}
        </div>
      );
    }

if (section !== "about") {
      return (
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 text-white/75">
          Этот раздел пока пустой — заполним позже.
        </div>
      );
    }

    switch (aboutTab) {
      case "desc":
        // ✅ ДВА РАЗНЫХ текстовых блока: description + features
        return (
          <div className="flex flex-col gap-8">
            <TextBlock text={detail.about.description} />
            <div>
            <SubHeader title="Особенности" />
            <div className="mt-3">
              <TextBlock text={detail.about.features} />
            </div>
          </div>
          </div>
        );

      case "phys":
        // ✅ Внутри "Физиология" три подраздела: Физиология, Происхождение, Социальность
        return (
          <div className="flex flex-col gap-8">
            <div>
            <SubHeader title="Физиология" />
            <div className="mt-3">
              <TextBlock text={detail.about.physiology} />
            </div>
          </div>

            <SubHeader title="Происхождение" />
            <TagsRow tags={detail.about.originTags} />
            <TextBlock text={detail.about.origin} />

            <div>
            <SubHeader title="Социальность" />
            <div className="mt-3">
              <TextBlock text={detail.about.sociality} />
            </div>
          </div>
          </div>
        );

      case "arch":
        return (
          <div className="flex flex-col gap-8">
            {detail.about.archetypeTags.length ? <TagsRow tags={detail.about.archetypeTags} /> : null}
            <TextBlock text={detail.about.archetypes} />

            {detail.about.character.trim().length ? (
              <>
                <div>
            <SubHeader title="Характер" />
            <div className="mt-3">
              <TextBlock text={detail.about.character} />
            </div>
          </div>
              </>
            ) : null}
          </div>
        );

      case "relations":
        return (
          <div className="flex flex-col gap-8">
            {detail.about.relationshipsTags.length ? <TagsRow tags={detail.about.relationshipsTags} /> : null}
            <TextBlock text={detail.about.relations} />
          </div>
        );

      case "names":
        return (
          <div className="flex flex-col gap-8">
            <TextBlock text={detail.about.names} />

            <div>
            <SubHeader title="Фамилии" />
            <div className="mt-3">
              <TextBlock text={detail.about.surname} />
            </div>
          </div>

            {detail.about.nameFeatures.trim().length ? (
              <>
                <div>
            <SubHeader title="Особенности" />
            <div className="mt-3">
              <TextBlock text={detail.about.nameFeatures} />
            </div>
          </div>
              </>
            ) : null}
          </div>
        );
default:
        return null;
    }
  }, [section, aboutTab, skillIndex, detail, raceSkills, greatHouses, activeHouseId, hoveredHouseId, houseTab, houseTooltip, goldFrameUrl]);
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
function RaceSkillTabs({
  skills,
  activeIndex,
  onSelect,
}: {
  skills: RaceSkill[];
  activeIndex: number;
  onSelect: (index: number) => void;
}) {
  const ink = "rgba(235, 245, 255, 0.92)";
  const inkSoft = "rgba(214, 230, 255, 0.75)";
  const gold = "rgba(244, 214, 123, 0.60)";
  const goldSoft = "rgba(244, 214, 123, 0.20)";

  if (!skills || skills.length === 0) return null;

  return (
    // Табы: без визуальных щелей, без горизонтального скролла.
    // (overflow-x-auto даже при малом количестве вкладок рисует полосу прокрутки,
    // которая выглядит как "пустое место" между табами и панелью)
    // -mb схлопывает стык с панелью: убираем визуальную "щель" между табами и блоком.
    <div className="px-6 -mb-[1px]">
      {/*
        Адаптивность табов:
        - Никаких shrink-0: кнопки распределяются по ширине контейнера и НЕ вылезают за край.
        - Текст не обрезаем троеточием — разрешаем перенос на 2 строки внутри самой кнопки.
        - overflow-x-auto НЕ используем: он может рисовать полосу прокрутки, выглядящую как "пустая полоса".
      */}
      <div className="flex w-full gap-0 overflow-x-hidden">
        {skills.map((s, i) => {
          const active = i === activeIndex;
          return (
            <button
              key={`${s.slug}:${s.skillNum}:${i}`}
              type="button"
              onClick={() => onSelect(i)}
              className="flex-1 min-w-0 rounded-t-[18px] rounded-b-[6px] border px-3 py-2 transition"
              style={{
                borderColor: active
                  ? "rgba(244, 214, 123, 0.38)"
                  : "rgba(255,255,255,0.10)",
                background: active
                  ? `
                    radial-gradient(140% 140% at 50% 0%, ${goldSoft}, rgba(0,0,0,0) 62%),
                    linear-gradient(180deg, rgba(0,0,0,0.52), rgba(0,0,0,0.22))
                  `
                  : "rgba(0,0,0,0.22)",
                boxShadow: active
                  ? `0 10px 24px rgba(0,0,0,0.55), 0 0 18px ${goldSoft}`
                  : "0 10px 22px rgba(0,0,0,0.40)",
                backdropFilter: "blur(10px)",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-buttons)",
                  // чуть меньше, чем вкладки "О РАСЕ" + адаптивно от ширины экрана
                  fontSize: "clamp(10px, 0.9vw, 12px)",
                  textTransform: "uppercase",
                  letterSpacing: "0.18em",
                  color: active ? ink : inkSoft,
                  textShadow: active
                    ? `0 0 12px ${goldSoft}, 0 2px 14px rgba(0,0,0,0.85)`
                    : "0 2px 12px rgba(0,0,0,0.8)",
                  display: "block",
                  textAlign: "center",
                  // ВАЖНО: без обрезки — переносимся внутри кнопки
                  whiteSpace: "normal",
                  lineHeight: 1.1,
                  overflowWrap: "anywhere",
                }}
              >
                {(s.name || "").toUpperCase()}
              </span>

              {active && (
                <div
                  className="mt-2 h-[1px] w-full"
                  style={{
                    background: `linear-gradient(90deg, rgba(255,255,255,0), ${gold}, rgba(255,255,255,0))`,
                    opacity: 0.9,
                  }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function RaceSkillPanel({ skill }: { skill: RaceSkill }) {
  const goldLine = "rgba(244, 214, 123, 0.38)";
  const goldSoft = "rgba(244, 214, 123, 0.20)";

  return (
    <div
      className="overflow-hidden rounded-[28px] border"
      style={{
        borderColor: goldLine,
        boxShadow:
          `0 30px 60px rgba(0,0,0,.35), 0 0 22px ${goldSoft}, inset 0 1px 0 rgba(255,255,255,.18)`,
      }}
    >
      <div className="flex items-stretch gap-0">
        {/* Art */}
        <div className="w-[180px] bg-black/20">
          <img
            src={skill.artPath}
            alt={skill.name}
            className="block h-full w-full object-cover"
            loading="lazy"
          />
        </div>

        {/* Divider */}
        <div
          className="w-[1px]"
          style={{
            background:
              "linear-gradient(180deg, rgba(255,255,255,0), rgba(255,255,255,.20), rgba(255,255,255,0))",
            opacity: 0.55,
          }}
        />

        {/* Text */}
        <div
          className="flex-1 bg-gradient-to-br from-[#2f91c9]/45 via-[#1b2230]/60 to-[#6a4b8b]/45 px-6 py-6"
          style={{
            boxShadow: "inset 0 1px 0 rgba(255,255,255,.14)",
          }}
        >
          <div
            className="pt-1 leading-[1.75] text-white/75 whitespace-pre-line"
            style={{ fontSize: "clamp(16px, 1.05vw, 18px)" }}
          >
            {renderRichText(skill.description)}
          </div>
        </div>
      </div>
    </div>
  );
}

function RaceSkillPanelPlaceholder() {
  const goldLine = "rgba(244, 214, 123, 0.26)";
  const goldSoft = "rgba(244, 214, 123, 0.14)";

  return (
    <div
      className="overflow-hidden rounded-[28px] border opacity-70"
      style={{
        borderColor: goldLine,
        boxShadow:
          `0 26px 56px rgba(0,0,0,.25), 0 0 18px ${goldSoft}, inset 0 1px 0 rgba(255,255,255,.12)`,
      }}
    >
      <div className="flex items-stretch gap-0">
        <div className="w-[180px] bg-black/20">
          <div className="h-full w-full bg-white/5" />
        </div>

        <div
          className="w-[1px]"
          style={{
            background:
              "linear-gradient(180deg, rgba(255,255,255,0), rgba(255,255,255,.18), rgba(255,255,255,0))",
            opacity: 0.45,
          }}
        />

        <div className="flex-1 bg-gradient-to-br from-[#2f91c9]/35 via-[#1b2230]/55 to-[#6a4b8b]/35 px-6 py-6">
          <div
            className="pt-1 leading-[1.75] text-white/30"
            style={{ fontSize: "clamp(16px, 1.05vw, 18px)" }}
          >
            —
          </div>
        </div>
      </div>
    </div>
  );
}

function RaceSkillCard({ skill }: { skill: RaceSkill }) {
  const TITLE_H = 44; // px
  return (
    <div className="relative">
      {/* Title tab (spine) — absolute so it does NOT create any gap */}
      <div className="pointer-events-none absolute left-[180px] top-0 z-10">
        <div
          className="flex items-center whitespace-nowrap rounded-t-[22px] rounded-b-[6px] border border-white/18 bg-gradient-to-b from-white/22 via-white/12 to-black/30 px-6"
          style={{
            height: TITLE_H,
            lineHeight: 1,
            boxShadow:
              "0 12px 35px rgba(0,0,0,.45), inset 0 1px 0 rgba(255,255,255,.35)",
            transform: "translateY(-50%)",
          }}
        >
          <div
            className="text-[15px] font-[600] tracking-[.35em] text-white/90"
            style={{ textShadow: "0 2px 12px rgba(0,0,0,.8)" }}
          >
            {(skill.name || "").toUpperCase()}
          </div>
        </div>
      </div>

      {/* Body (two connected boxes). We reserve ONLY the exact space under the spine */}
      <div className="flex items-stretch gap-0" style={{ marginTop: TITLE_H / 2 }}>
        {/* Art block */}
        <div
          className="w-[180px] overflow-hidden rounded-l-[28px] border border-white/12 border-r-0 bg-black/20"
          style={{ boxShadow: "inset 0 0 0 1px rgba(255,255,255,.06)" }}
        >
          <img
            src={skill.artPath}
            alt={skill.name}
            className="block h-full w-full object-cover"
            loading="lazy"
          />
        </div>

        {/* Description block */}
        <div
          className="flex-1 rounded-r-[28px] border border-white/12 bg-gradient-to-br from-[#2f91c9]/45 via-[#1b2230]/60 to-[#6a4b8b]/45 px-6 py-6"
          style={{
            boxShadow:
              "0 30px 60px rgba(0,0,0,.35), inset 0 1px 0 rgba(255,255,255,.16)",
          }}
        >
          <div className="pt-1 text-[18px] leading-[1.75] text-white/75">
            {renderRichText(skill.description)}
          </div>
        </div>
      </div>
    </div>
  );
}


function RaceSkillCardPlaceholder() {
  const TITLE_H = 44; // px
  return (
    <div className="relative opacity-70">
      <div className="pointer-events-none absolute left-[180px] top-0 z-10">
        <div
          className="flex items-center whitespace-nowrap rounded-t-[22px] rounded-b-[6px] border border-white/18 bg-gradient-to-b from-white/22 via-white/12 to-black/30 px-6"
          style={{
            height: TITLE_H,
            lineHeight: 1,
            boxShadow:
              "0 12px 35px rgba(0,0,0,.45), inset 0 1px 0 rgba(255,255,255,.35)",
            transform: "translateY(-50%)",
          }}
        >
          <div
            className="text-[15px] font-[600] tracking-[.35em] text-white/40"
            style={{ textShadow: "0 2px 12px rgba(0,0,0,.8)" }}
          >
            ПУСТО
          </div>
        </div>
      </div>

      <div className="flex items-stretch gap-0" style={{ marginTop: TITLE_H / 2 }}>
        <div
          className="w-[180px] overflow-hidden rounded-l-[28px] border border-white/12 border-r-0 bg-black/20"
          style={{ boxShadow: "inset 0 0 0 1px rgba(255,255,255,.06)" }}
        >
          <div className="h-full w-full bg-white/5" />
        </div>

        <div
          className="flex-1 rounded-r-[28px] border border-white/12 bg-gradient-to-br from-[#2f91c9]/35 via-[#1b2230]/55 to-[#6a4b8b]/35 px-6 py-6"
          style={{
            boxShadow:
              "0 30px 60px rgba(0,0,0,.25), inset 0 1px 0 rgba(255,255,255,.12)",
          }}
        >
          <div className="pt-1 text-[18px] leading-[1.75] text-white/30">—</div>
        </div>
      </div>
    </div>
  );
}

function SubHeader({ title }: { title: string }) {
  const gold = "rgba(244, 214, 123, 0.85)";
  const goldSoft = "rgba(244, 214, 123, 0.25)";

  return (
    <div className="pt-1">
      <div
        style={{
          fontFamily: "var(--font-buttons)",
          fontSize: 14,
          textTransform: "uppercase",
          letterSpacing: "0.22em",
          color: gold,
          textShadow: `0 0 14px ${goldSoft}, 0 2px 16px rgba(0,0,0,0.85)`,
        }}
      >
        {title}
      </div>

      {/* ✅ Короткая линия (не во всю ширину), затухает вправо */}
      <div
        className="mt-2 h-[2px]"
        style={{
          width: 220,
          background: `linear-gradient(90deg, ${gold}, rgba(244,214,123,0))`,
          opacity: 0.85,
          borderRadius: 999,
        }}
      />
    </div>
  );
}

function TagsRow({ tags }: { tags?: string[] }) {
  if (!tags || tags.length === 0) return null;

  const inkSoft = "rgba(214, 230, 255, 0.74)";
  const gold = "rgba(244, 214, 123, 0.85)";
  const goldSoft = "rgba(244, 214, 123, 0.16)";

  return (
    <div className="-mt-1 mb-2 flex flex-wrap gap-3">
      {tags.map((raw) => {
        const idx = raw.indexOf(":");
        const label = idx >= 0 ? raw.slice(0, idx).trim() : raw.trim();
        const value = idx >= 0 ? raw.slice(idx + 1).trim() : "";

        return (
          <span
            key={raw}
            className="rounded-full border px-4 py-2"
            style={{
              borderColor: "rgba(255,255,255,0.12)",
              background: `
                radial-gradient(140% 140% at 50% 0%, ${goldSoft}, rgba(0,0,0,0) 62%),
                linear-gradient(180deg, rgba(0,0,0,0.45), rgba(0,0,0,0.22))
              `,
              boxShadow: `0 10px 26px rgba(0,0,0,0.45)`,
              backdropFilter: "blur(10px)",
              fontFamily: "var(--font-buttons)",
              fontSize: 13,
              textTransform: "uppercase",
              letterSpacing: "0.16em",
            }}
          >
            <span style={{ color: gold, fontWeight: 700 }}>{label}</span>
            {value ? <span style={{ color: inkSoft }}>{`: ${value}`}</span> : null}
          </span>
        );
      })}
    </div>
  );
}

function TextBlock({ text }: { text?: string | null }) {
  if (!text) return null;

  return (
    <div
      className="rounded-2xl border border-white/10 bg-black/25 p-5 lg:p-3"
      style={{
        backdropFilter: "blur(10px)",
        boxShadow: "0 18px 50px rgba(0,0,0,0.45)",
        color: "rgba(235, 245, 255, 0.90)",
        fontSize: 18,
        lineHeight: 1.65,
        whiteSpace: "pre-line",
      }}
    >
      {renderRichText(text)}
    </div>
  );
}


"use client";

import React from "react";
import { getPublicStorageUrl } from "@/lib/supabase/publicUrl";
import { SubHeader, TagsRow, TextBlock } from "./_shared";
import type { GreatHouseItem } from "@/lib/data/greatHouses";
import type { RaceDetail, HouseTabKey, HouseTooltipState } from "../types";

export default function GreatHousesSection(props: {
  detail: RaceDetail;
  greatHouses: GreatHouseItem[];
  activeHouseId: string | null;
  setActiveHouseId: (id: string | null) => void;
  houseTab: HouseTabKey;
  setHouseTab: (k: HouseTabKey) => void;
  hoveredHouseId: string | null;
  setHoveredHouseId: (id: string | null) => void;
  houseTooltip: HouseTooltipState;
  setHouseTooltip: (s: HouseTooltipState) => void;
  houseGridCols: number;
}) {
  const {
    detail,
    greatHouses,
    activeHouseId,
    setActiveHouseId,
    houseTab,
    setHouseTab,
    hoveredHouseId,
    setHoveredHouseId,
    houseTooltip,
    setHouseTooltip,
    houseGridCols,
  } = props;

  const goldFrameUrl = getPublicStorageUrl("art", "UI_UX/GoldFrame.png");

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
                      onMouseEnter={(e) => {
                        setHoveredHouseId(h.id);
                        if (title) {
                          setHouseTooltip({ visible: true, text: title, x: e.clientX + 14, y: e.clientY + 14 });
                        }
                      }}
                      onMouseMove={(e) => {
                        if (!title) return;
                        const x = e.clientX + 14;
                        const y = e.clientY + 14;
                        setHouseTooltip({ visible: true, text: title, x, y });
                      }}
                      onMouseLeave={() => {
                        setHoveredHouseId(null);
                        setHouseTooltip({ visible: false, text: "", x: 0, y: 0 });
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
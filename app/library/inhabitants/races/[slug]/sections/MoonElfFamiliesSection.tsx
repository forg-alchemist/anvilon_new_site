'use client';

import React from 'react';
import { getPublicStorageUrl } from '@/lib/supabase/publicUrl';
import { SubHeader, TextBlock } from './_shared';
import type { MoonElfFamilyItem } from '@/lib/data/moonElfFamilies';

export type MoonFamilyTabKey = 'description' | 'bonus' | 'story';

type TooltipState = { visible: boolean; text: string; x: number; y: number };

function useGridCols() {
  const [cols, setCols] = React.useState<number>(2);

  React.useEffect(() => {
    const compute = () => {
      const w = window.innerWidth;
      // Breakpoints aligned with GreatHousesSection:
      // base: 2 cols, md (>=768): 3 cols, lg (>=1024): 5 cols
      if (w >= 1024) return 5;
      if (w >= 768) return 3;
      return 2;
    };

    const onResize = () => setCols(compute());
    setCols(compute());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return cols;
}

export default function MoonElfFamiliesSection(props: {
  families: MoonElfFamilyItem[];
  activeId: string | null;
  setActiveId: (id: string | null) => void;
  tab: MoonFamilyTabKey;
  setTab: (k: MoonFamilyTabKey) => void;
}) {
  const { families, activeId, setActiveId, tab, setTab } = props;

  const silverFrameUrl = getPublicStorageUrl('art', 'UI_UX/SilverFrame.png');

  const [hoveredId, setHoveredId] = React.useState<string | null>(null);
  const [tooltip, setTooltip] = React.useState<TooltipState>({
    visible: false,
    text: '',
    x: 0,
    y: 0,
  });

  const gridCols = useGridCols();

  if (!families || families.length === 0) {
    return <div className="text-white/75">Пока нет данных по Родам лунных эльфов.</div>;
  }

  const active = activeId ? families.find((f) => f.id === activeId) ?? null : null;

  const tabs: Array<{ key: MoonFamilyTabKey; label: string }> = [
    { key: 'description', label: 'Описание расы' },
    { key: 'bonus', label: 'Бонусы рода' },
    { key: 'story', label: 'История и особенности' },
  ];

  const activeIndex = activeId ? Math.max(0, families.findIndex((f) => f.id === activeId)) : -1;

  const rowEndIndex =
    activeIndex >= 0 && gridCols > 0
      ? Math.min(
          families.length - 1,
          activeIndex + (gridCols - 1 - (activeIndex % gridCols))
        )
      : -1;

  const silverGlowA =
    '0 0 26px rgba(220,230,255,0.55), 0 0 70px rgba(220,230,255,0.34), 0 0 140px rgba(220,230,255,0.18)';
  const silverGlowB =
    '0 0 0 2px rgba(220,230,255,0.16) inset, 0 0 26px rgba(220,230,255,0.22) inset';

  return (
    <div className="relative">
      {/* Плитки родов + встроенная панель (вставляется сразу ПОД строкой выбранного рода) */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-3 lg:grid-cols-5 lg:gap-4">
        {families.map((f, idx) => {
          const title = (f.name || '').toString();
          const isActive = activeId === f.id;
          const isHovered = hoveredId === f.id;
          const showFx = isActive || isHovered;
          const isDim = !!activeId && !isActive;

          return (
            <div key={f.id} className="contents">
              <button
                type="button"
                className="group relative text-left"
                onClick={() => {
                  if (activeId === f.id) {
                    setActiveId(null);
                    return;
                  }
                  setActiveId(f.id);
                  setTab('description');
                }}
                onMouseEnter={(e) => {
                  setHoveredId(f.id);
                  if (title) {
                    setTooltip({ visible: true, text: title, x: e.clientX + 14, y: e.clientY + 14 });
                  }
                }}
                onMouseMove={(e) => {
                  if (!title) return;
                  setTooltip({ visible: true, text: title, x: e.clientX + 14, y: e.clientY + 14 });
                }}
                onMouseLeave={() => {
                  setHoveredId(null);
                  setTooltip({ visible: false, text: '', x: 0, y: 0 });
                }}
                style={{
                  transition: 'transform 140ms ease, filter 140ms ease, opacity 140ms ease',
                  filter: isDim ? 'grayscale(1) saturate(0.55) brightness(0.78)' : 'none',
                  opacity: isDim ? 0.34 : 1,
                  transform: showFx ? 'translateY(-1px)' : 'translateY(0)',
                }}
              >
                <div className="relative aspect-[9/16] w-full">
                  {/* Арт (плитка, без закруглений) */}
                  {f.artUrl ? (
                    <img
                      src={f.artUrl}
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
                  {silverFrameUrl ? (
                    <img
                      src={silverFrameUrl}
                      alt=""
                      className="pointer-events-none absolute inset-0 h-full w-full"
                      style={{
                        opacity: showFx ? 1 : 0,
                        transition: 'opacity 120ms ease',
                        transform: showFx ? 'scale(1.01)' : 'scale(1)',
                      }}
                      draggable={false}
                    />
                  ) : null}

                  {/* Серебряное свечение (ПОВЕРХ рамки) */}
                  <div
                    className="pointer-events-none absolute inset-0"
                    style={{
                      opacity: showFx ? 1 : 0,
                      transition: 'opacity 120ms ease',
                      boxShadow: silverGlowA,
                    }}
                  />
                  <div
                    className="pointer-events-none absolute inset-0"
                    style={{
                      opacity: showFx ? 1 : 0,
                      transition: 'opacity 120ms ease',
                      boxShadow: silverGlowB,
                    }}
                  />
                </div>
              </button>

              {/* Вставляем панель сразу после строки, где лежит выбранный род */}
              {active && idx === rowEndIndex ? (
                <div className="col-span-full">
                  <div
                    className="mt-4 rounded-2xl border border-white/10 bg-black/25 p-4 lg:p-5"
                    style={{
                      backdropFilter: 'blur(10px)',
                      boxShadow: '0 22px 70px rgba(0,0,0,0.55)',
                    }}
                  >
                    {/* Title */}
                    <div
                      className="mb-3 text-center"
                      style={{
                        fontFamily: 'var(--font-title)',
                        fontSize: 26,
                        lineHeight: 1.1,
                        letterSpacing: '0.06em',
                        color: 'rgba(220, 230, 255, 0.92)',
                        textShadow: '0 0 18px rgba(220, 230, 255, 0.18), 0 2px 28px rgba(0,0,0,0.85)',
                      }}
                    >
                      {(active?.name ?? '').toString().trim().toUpperCase()}
                    </div>

                    {/* Tabs */}
                    <div className="flex flex-wrap gap-2">
                      {tabs.map((t) => {
                        const activeTab = tab === t.key;
                        return (
                          <button
                            key={t.key}
                            type="button"
                            onClick={() => setTab(t.key)}
                            className="rounded-full border px-2.5 py-1.5 transition"
                            style={{
                              borderColor: activeTab ? 'rgba(220, 230, 255, 0.28)' : 'rgba(255,255,255,0.10)',
                              background: activeTab
                                ? 'radial-gradient(140% 140% at 50% 0%, rgba(220, 230, 255, 0.12), rgba(0,0,0,0) 62%), linear-gradient(180deg, rgba(0,0,0,0.52), rgba(0,0,0,0.22))'
                                : 'rgba(0,0,0,0.25)',
                              boxShadow: activeTab
                                ? '0 10px 24px rgba(0,0,0,0.55), 0 0 18px rgba(220, 230, 255, 0.14)'
                                : '0 8px 18px rgba(0,0,0,0.40)',
                              backdropFilter: 'blur(10px)',
                            }}
                          >
                            <span
                              style={{
                                fontFamily: 'var(--font-buttons)',
                                fontSize: 13,
                                textTransform: 'uppercase',
                                letterSpacing: '0.16em',
                                color: activeTab ? 'rgba(235, 245, 255, 0.92)' : 'rgba(214, 230, 255, 0.75)',
                                textShadow: activeTab
                                  ? '0 0 14px rgba(220, 230, 255, 0.12), 0 2px 16px rgba(0,0,0,0.85)'
                                  : '0 2px 14px rgba(0,0,0,0.8)',
                              }}
                            >
                              {t.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    <div className="mt-3">
                      {/* 1) Описание расы */}
                      {tab === 'description' ? <TextBlock text={active.description ?? ''} /> : null}

                      {/* 2) Бонусы рода */}
                      {tab === 'bonus' ? (
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
                          <div className="w-full max-w-[190px] shrink-0">
                            <div
                              className="relative aspect-square w-full overflow-hidden rounded-2xl border border-white/12 bg-black/25"
                              style={{ boxShadow: '0 18px 50px rgba(0,0,0,0.42)' }}
                            >
                              {active.bonusArtUrl ? (
                                <img
                                  src={active.bonusArtUrl}
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
                            <TextBlock text={active.bonus ?? ''} />
                          </div>
                        </div>
                      ) : null}

                      {/* 3) История и особенности + Традиции */}
                      {tab === 'story' ? (
                        <div className="flex flex-col gap-6">
                          <TextBlock text={active.story ?? ''} />
                          <div>
                            <SubHeader title="Традиции" />
                            <div className="mt-2">
                              <TextBlock text={active.tradition ?? ''} />
                            </div>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      {/* Tooltip поверх плиток (не внутри) */}
      {tooltip.visible && tooltip.text ? (
        <div className="pointer-events-none fixed z-[9999]" style={{ left: tooltip.x, top: tooltip.y }}>
          <div
            className="rounded-md border px-3 py-2"
            style={{
              borderColor: 'rgba(220, 230, 255, 0.26)',
              background: 'rgba(0,0,0,0.65)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 18px 50px rgba(0,0,0,0.55), 0 0 18px rgba(220,230,255,0.14)',
              fontFamily: 'var(--font-buttons)',
              fontSize: 12,
              textTransform: 'uppercase',
              letterSpacing: '0.22em',
              color: 'rgba(220, 230, 255, 0.92)',
            }}
          >
            {tooltip.text}
          </div>
        </div>
      ) : null}
    </div>
  );
}

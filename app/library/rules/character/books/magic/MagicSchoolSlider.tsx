'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { getPublicStorageUrl } from '@/lib/supabase/publicUrl';
import { getMagicTheme } from './magicTheme';
import type { MagicPath } from '@/lib/data/magicPath';

export type MagicSchool = {
  id: string;
  created_at: string;
  slug_school: string | null;
  name: string | null;
  bucket: string | null;
  art_path: string | null;
  description: string | null;
};

function upper(v?: string | null): string {
  return (v ?? '').toString().trim().toUpperCase();
}

const ART_CARD_WIDTH = 300;
const ART_CARD_HEIGHT = Math.round((ART_CARD_WIDTH * 16) / 9); // 9:16

function toOptimizedArtUrl(url: string, width: number): string {
  if (!url) return '';

  // Keep original object URL to preserve exact framing inside the card.
  // (Render endpoint changed perceived scale for some source arts.)
  void width;
  return url;
}

function ArrowButton({
  dir,
  onClick,
  tint,
  disabled,
}: {
  dir: 'left' | 'right';
  onClick: () => void;
  tint: string;
  disabled?: boolean;
}): React.ReactElement {
  const iconUrl = getPublicStorageUrl('art', 'UI_UX/BackButton.png');
  const flip = dir === 'right' ? 'scaleX(-1)' : 'none';

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={dir === 'left' ? 'Назад' : 'Вперёд'}
      disabled={disabled}
      className="relative inline-flex items-center justify-center select-none"
      style={{
        width: 58,
        height: 58,
        background: 'transparent',
        border: 'none',
        padding: 0,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.35 : 1,
        filter: 'drop-shadow(0 6px 22px rgba(0,0,0,0.55))',
        transition: 'transform 140ms ease, filter 140ms ease, opacity 140ms ease',
      }}
      onMouseEnter={(e) => {
        if (disabled) return;
        const btn = e.currentTarget as HTMLButtonElement;
        btn.style.transform = 'translateY(-1px) scale(1.05)';
        btn.style.filter = 'drop-shadow(0 10px 28px rgba(0,0,0,0.65))';
      }}
      onMouseLeave={(e) => {
        const btn = e.currentTarget as HTMLButtonElement;
        btn.style.transform = 'none';
        btn.style.filter = 'drop-shadow(0 6px 22px rgba(0,0,0,0.55))';
      }}
      onMouseDown={(e) => {
        if (disabled) return;
        const btn = e.currentTarget as HTMLButtonElement;
        btn.style.transform = 'translateY(0px) scale(0.98)';
      }}
      onMouseUp={(e) => {
        if (disabled) return;
        const btn = e.currentTarget as HTMLButtonElement;
        btn.style.transform = 'translateY(-1px) scale(1.05)';
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={iconUrl}
        alt=""
        draggable={false}
        style={{
          width: 58,
          height: 58,
          objectFit: 'contain',
          display: 'block',
          transform: flip,
          opacity: 0.94,
          transition: 'opacity 140ms ease, filter 140ms ease',
          filter: `drop-shadow(0 0 14px ${tint})`,
        }}
        onMouseEnter={(e) => {
          if (disabled) return;
          e.currentTarget.style.opacity = '1';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.opacity = '0.94';
        }}
      />
    </button>
  );
}

function TopPillButton({
  label,
  theme,
  onClick,
}: {
  label: string;
  theme: { main: string; glow: string; glowSoft: string };
  onClick?: () => void;
}): React.ReactElement {
  const TITLE_H = 44;

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center whitespace-nowrap rounded-t-[22px] rounded-b-[6px] border bg-gradient-to-b from-white/22 via-white/12 to-black/30 px-6 transition select-none"
      style={{
        height: TITLE_H,
        lineHeight: 1,
        borderColor: theme.glow,
        boxShadow: `0 14px 40px rgba(0,0,0,.48), 0 0 18px ${theme.glowSoft}, 0 0 10px ${theme.glow}, inset 0 1px 0 rgba(255,255,255,.38)`,
        fontFamily: 'var(--font-buttons)',
        fontSize: 13,
        textTransform: 'uppercase',
        letterSpacing: '0.30em',
        color: theme.main,
        textShadow: '0 2px 12px rgba(0,0,0,.85)',
        backdropFilter: 'blur(8px)',
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLButtonElement;
        el.style.borderColor = theme.main;
        el.style.boxShadow = `0 14px 40px rgba(0,0,0,.48), 0 0 24px ${theme.glow}, inset 0 1px 0 rgba(255,255,255,.38)`;
        el.style.color = theme.main;
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLButtonElement;
        el.style.borderColor = theme.glowSoft;
        el.style.boxShadow = `0 14px 40px rgba(0,0,0,.48), 0 0 18px ${theme.glowSoft}, inset 0 1px 0 rgba(255,255,255,.38)`;
        el.style.color = theme.main;
      }}
    >
      {label}
    </button>
  );
}

function FancyDivider({
  theme,
  className,
}: {
  theme: { main: string; glowSoft: string };
  className?: string;
}): React.ReactElement {
  return (
    <div className={(className ?? '') + ' flex items-center gap-3'}>
      <div className="h-[1px] flex-1" style={{ background: theme.glowSoft }} />
      <div
        className="h-[6px] w-[6px] rotate-45"
        style={{
          background: theme.main,
          boxShadow: `0 0 18px ${theme.glowSoft}`,
          opacity: 0.75,
        }}
      />
      <div className="h-[1px] flex-1" style={{ background: theme.glowSoft }} />
    </div>
  );
}

export function MagicSchoolSlider({
  schools,
  paths,
}: {
  schools: MagicSchool[];
  paths: MagicPath[];
}): React.ReactElement {
  const schoolItems = useMemo(() => (Array.isArray(schools) ? schools : []), [schools]);
  const allPaths = useMemo(() => (Array.isArray(paths) ? paths : []), [paths]);

  const [mode, setMode] = useState<'school' | 'paths'>('school');
  const [schoolIdx, setSchoolIdx] = useState(0);
  const [pathIdx, setPathIdx] = useState(0);

  const [schoolArtFailed, setSchoolArtFailed] = useState(false);
  const [pathArtFailed, setPathArtFailed] = useState(false);

  const safeSchoolIndex = schoolItems.length ? ((schoolIdx % schoolItems.length) + schoolItems.length) % schoolItems.length : 0;
  const curSchool = schoolItems.length ? schoolItems[safeSchoolIndex] : null;

  const theme = getMagicTheme(curSchool?.id);

  const schoolArtUrl = useMemo(() => {
    const baseUrl = curSchool?.art_path && curSchool?.bucket ? getPublicStorageUrl(curSchool.bucket, curSchool.art_path) : '';
    return toOptimizedArtUrl(baseUrl, ART_CARD_WIDTH * 2);
  }, [curSchool?.art_path, curSchool?.bucket]);

  const curSchoolPaths = useMemo(() => {
    if (!curSchool?.id) return [] as MagicPath[];
    return allPaths.filter((p) => p.id_magic_school === curSchool.id);
  }, [allPaths, curSchool?.id]);

  const safePathIndex = curSchoolPaths.length ? ((pathIdx % curSchoolPaths.length) + curSchoolPaths.length) % curSchoolPaths.length : 0;
  const curPath = curSchoolPaths.length ? curSchoolPaths[safePathIndex] : null;

  const pathArtUrl = useMemo(() => {
    const baseUrl = curPath?.art_path && curPath?.bucket ? getPublicStorageUrl(curPath.bucket, curPath.art_path) : '';
    return toOptimizedArtUrl(baseUrl, ART_CARD_WIDTH * 2);
  }, [curPath?.art_path, curPath?.bucket]);

  useEffect(() => {
    const preload = (url: string) => {
      if (!url) return;
      const img = new Image();
      img.decoding = 'async';
      img.src = url;
    };

    preload(schoolArtUrl);
    preload(pathArtUrl);

    if (schoolItems.length > 1) {
      const prevSchool = schoolItems[(safeSchoolIndex - 1 + schoolItems.length) % schoolItems.length];
      const nextSchool = schoolItems[(safeSchoolIndex + 1) % schoolItems.length];

      const prevUrl =
        prevSchool?.art_path && prevSchool?.bucket
          ? toOptimizedArtUrl(getPublicStorageUrl(prevSchool.bucket, prevSchool.art_path), ART_CARD_WIDTH * 2)
          : '';
      const nextUrl =
        nextSchool?.art_path && nextSchool?.bucket
          ? toOptimizedArtUrl(getPublicStorageUrl(nextSchool.bucket, nextSchool.art_path), ART_CARD_WIDTH * 2)
          : '';

      preload(prevUrl);
      preload(nextUrl);
    }

    if (curSchoolPaths.length > 1) {
      const prevPath = curSchoolPaths[(safePathIndex - 1 + curSchoolPaths.length) % curSchoolPaths.length];
      const nextPath = curSchoolPaths[(safePathIndex + 1) % curSchoolPaths.length];

      const prevUrl =
        prevPath?.art_path && prevPath?.bucket
          ? toOptimizedArtUrl(getPublicStorageUrl(prevPath.bucket, prevPath.art_path), ART_CARD_WIDTH * 2)
          : '';
      const nextUrl =
        nextPath?.art_path && nextPath?.bucket
          ? toOptimizedArtUrl(getPublicStorageUrl(nextPath.bucket, nextPath.art_path), ART_CARD_WIDTH * 2)
          : '';

      preload(prevUrl);
      preload(nextUrl);
    }
  }, [schoolArtUrl, pathArtUrl, schoolItems, safeSchoolIndex, curSchoolPaths, safePathIndex]);

  const title = mode === 'paths' ? upper(curPath?.name) || '—' : upper(curSchool?.name) || '—';
  const mainText =
    mode === 'paths'
      ? (curPath?.description ?? '').toString().trim()
      : (curSchool?.description ?? '').toString().trim();

  const direction = (curPath?.direction ?? '').toString().trim();
  const reqTalent = upper(curPath?.req_talent);

  const goPrev = () => {
    setSchoolArtFailed(false);
    setPathArtFailed(false);
    if (mode === 'paths') {
      setPathIdx((v) => v - 1);
      return;
    }
    setSchoolIdx((v) => v - 1);
    setPathIdx(0);
  };

  const goNext = () => {
    setSchoolArtFailed(false);
    setPathArtFailed(false);
    if (mode === 'paths') {
      setPathIdx((v) => v + 1);
      return;
    }
    setSchoolIdx((v) => v + 1);
    setPathIdx(0);
  };

  const glassPanel: React.CSSProperties = {
    border: `1px solid ${theme.glow}`,
    background: 'linear-gradient(180deg, rgba(255,255,255,0.08), rgba(0,0,0,0.24))',
    boxShadow: `0 22px 58px rgba(0,0,0,0.46), 0 0 32px ${theme.glowSoft}, 0 0 10px ${theme.glow}, inset 0 1px 0 rgba(255,255,255,0.10)`,
    backdropFilter: 'blur(10px)',
  };

  // Keep the grid columns stable between modes.
  // When a path overlay card shifts to the right, we mirror that shift on the right column
  // so the visual gap between the art and the content stays identical.
  const leftColWidth = 320;
  // Path art overlay shift (keep subtle)
  const overlayShift = 36;

  return (
    <div className="relative z-20 pb-24">
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(1200px 600px at 20% 22%, rgba(255,255,255,0.04), rgba(0,0,0,0) 60%), radial-gradient(900px 600px at 70% 65%, rgba(125,211,252,0.05), rgba(0,0,0,0) 62%)',
          opacity: 0.85,
        }}
      />

      {/* Two-column layout. No gutter between columns; the art column uses its own right padding. */}
      <div className="grid items-stretch gap-0" style={{ gridTemplateColumns: `${leftColWidth}px 1fr` }}>
        {/* ART 9:16 */}
        <div className="relative pr-6" style={{ width: leftColWidth }}>
          {/* base school card */}
          <div
            className="overflow-hidden rounded-t-2xl"
            style={{
              ...glassPanel,
              width: ART_CARD_WIDTH,
              boxShadow: `0 22px 58px rgba(0,0,0,0.52), 0 0 46px ${theme.glowSoft}, 0 0 14px ${theme.glow}, inset 0 0 0 1px rgba(255,255,255,0.06)`,
            }}
          >
            <div className="relative aspect-[9/16] w-full">
              <div
                className="absolute inset-0"
                style={{
                  background: `radial-gradient(1100px 760px at 30% 10%, ${theme.glowSoft}, rgba(0,0,0,0.0) 55%), radial-gradient(900px 700px at 80% 70%, rgba(125,211,252,0.10), rgba(0,0,0,0.0) 60%), linear-gradient(180deg, rgba(0,0,0,0.10), rgba(0,0,0,0.38))`,
                }}
              />

              {schoolArtUrl && !schoolArtFailed ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={schoolArtUrl}
                  alt={curSchool?.name ?? 'Magic school'}
                  className="absolute inset-0 h-full w-full object-cover"
                  draggable={false}
                  loading="eager"
                  decoding="async"
                  fetchPriority={mode === 'school' ? 'high' : 'auto'}
                  onError={() => setSchoolArtFailed(true)}
                  style={
                    mode === 'paths'
                      ? { filter: 'grayscale(1) brightness(0.85) contrast(1.05)' }
                      : undefined
                  }
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center px-6 text-center">
                  <div
                    style={{
                      color: 'rgba(235, 245, 255, 0.84)',
                      fontSize: 14,
                      letterSpacing: '0.18em',
                      textTransform: 'uppercase',
                      textShadow: '0 2px 12px rgba(0,0,0,0.85)',
                    }}
                  >
                    {upper(curSchool?.name) || 'НЕТ АРТА'}
                  </div>
                </div>
              )}

              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  boxShadow: `inset 0 0 0 1px ${theme.glow}, inset 0 -140px 160px rgba(0,0,0,0.34), 0 0 62px ${theme.glowSoft}, 0 0 18px ${theme.glow}`,
                }}
              />
            </div>
          </div>

          {/* overlay path card (only in paths mode) */}
          {mode === 'paths' ? (
            <div
              className="absolute top-0"
              style={{ left: overlayShift, width: ART_CARD_WIDTH }}
            >
              <div
                className="overflow-hidden rounded-b-2xl"
                style={{
                  ...glassPanel,
                  boxShadow: `0 26px 66px rgba(0,0,0,0.56), 0 0 60px ${theme.glowSoft}, 0 0 18px ${theme.glow}, inset 0 0 0 1px rgba(255,255,255,0.08)`,
                }}
              >
                <div className="relative aspect-[9/16] w-full">
                  <div
                    className="absolute inset-0"
                    style={{
                      background: `radial-gradient(1100px 760px at 30% 10%, ${theme.glowSoft}, rgba(0,0,0,0.0) 55%), linear-gradient(180deg, rgba(0,0,0,0.10), rgba(0,0,0,0.38))`,
                    }}
                  />

                  {pathArtUrl && !pathArtFailed ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={pathArtUrl}
                      alt={curPath?.name ?? 'Magic path'}
                      className="absolute inset-0 h-full w-full object-cover"
                      draggable={false}
                      loading="eager"
                      decoding="async"
                      fetchPriority="high"
                      onError={() => setPathArtFailed(true)}
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center px-6 text-center">
                      <div
                        style={{
                          color: 'rgba(235, 245, 255, 0.84)',
                          fontSize: 14,
                          letterSpacing: '0.18em',
                          textTransform: 'uppercase',
                          textShadow: '0 2px 12px rgba(0,0,0,0.85)',
                        }}
                      >
                        {upper(curPath?.name) || 'НЕТ АРТА'}
                      </div>
                    </div>
                  )}

                  <div
                    className="pointer-events-none absolute inset-0"
                    style={{
                      boxShadow: `inset 0 0 0 1px ${theme.glow}, inset 0 -140px 160px rgba(0,0,0,0.34), 0 0 72px ${theme.glowSoft}, 0 0 20px ${theme.glow}`,
                    }}
                  />
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* RIGHT */}
        <div
          className="relative flex h-full flex-col gap-2"
          style={{ minHeight: ART_CARD_HEIGHT, marginLeft: mode === 'paths' ? overlayShift : 0 }}
        >
          {/* Controls row (arrows + buttons). Kept in normal flow so it never overlaps the panel. */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ArrowButton
                dir="left"
                onClick={goPrev}
                tint={theme.glowSoft}
                disabled={mode === 'paths' ? curSchoolPaths.length <= 1 : schoolItems.length <= 1}
              />
              <ArrowButton
                dir="right"
                onClick={goNext}
                tint={theme.glowSoft}
                disabled={mode === 'paths' ? curSchoolPaths.length <= 1 : schoolItems.length <= 1}
              />
            </div>

            <div className="flex items-center gap-3">
              {mode === 'paths' ? (
                <>
                  <TopPillButton
                    label="К ШКОЛЕ МАГИИ"
                    theme={theme}
                    onClick={() => {
                      setMode('school');
                      setPathIdx(0);
                      setPathArtFailed(false);
                    }}
                  />
                  <TopPillButton label="К ЗАКЛИНАНИЯМ" theme={theme} />
                </>
              ) : (
                <TopPillButton
                  label="К ПУТЯМ"
                  theme={theme}
                  onClick={() => {
                    setMode('paths');
                    setPathIdx(0);
                    setSchoolArtFailed(false);
                    setPathArtFailed(false);
                  }}
                />
              )}
            </div>
          </div>

          {/* MAIN PANEL */}
          <div className="relative flex-1">
            <div className="relative h-full overflow-hidden rounded-2xl px-6 py-5" style={glassPanel}>
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  background: `radial-gradient(900px 320px at 45% 10%, ${theme.glowSoft}, rgba(0,0,0,0) 60%), radial-gradient(800px 300px at 70% 40%, rgba(125,211,252,0.06), rgba(0,0,0,0) 58%)`,
                  opacity: 0.95,
                }}
              />
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.06), inset 0 -120px 140px rgba(0,0,0,0.22)',
                }}
              />

              <div className="relative">
                <div
                  className="text-center"
                  style={{
                    fontFamily: 'var(--font-title)',
                    fontSize: 30,
                    lineHeight: 1.1,
                    letterSpacing: '0.10em',
                    textTransform: 'uppercase',
                    color: theme.main,
                    textShadow: `0 2px 18px rgba(0,0,0,0.70), 0 0 22px ${theme.glowSoft}`,
                  }}
                >
                  {title}
                </div>

                <FancyDivider theme={theme} className="mt-2" />

                {mode === 'paths' ? (
                  <>
                    {direction ? (
                      <div className="mt-2 flex justify-center" style={{ opacity: 0.98 }}>
                        <div
                          style={{
                            fontFamily: 'var(--font-buttons)',
                            fontSize: 13,
                            letterSpacing: '0.26em',
                            textTransform: 'uppercase',
                            color: 'rgba(225, 240, 255, 0.72)',
                            textShadow: '0 2px 12px rgba(0,0,0,0.75)',
                          }}
                        >
                          ОСНОВНАЯ ПРЕДРАСПОЛОЖЕННОСТЬ: <span style={{ color: theme.main }}>{upper(direction)}</span>
                        </div>
                      </div>
                    ) : null}

                    {direction ? <FancyDivider theme={theme} className="mt-2" /> : null}

                    {reqTalent ? (
                      <div className="mt-2 flex justify-center" style={{ opacity: 0.98 }}>
                        <div
                          style={{
                            fontFamily: 'var(--font-buttons)',
                            fontSize: 13,
                            letterSpacing: '0.26em',
                            textTransform: 'uppercase',
                            color: 'rgba(225, 240, 255, 0.72)',
                            textShadow: '0 2px 12px rgba(0,0,0,0.75)',
                          }}
                        >
                          ОСНОВНАЯ ХАРАКТЕРИСТИКА/ТАЛАНТ: <span style={{ color: theme.main }}>{reqTalent}</span>
                        </div>
                      </div>
                    ) : null}

                    {reqTalent ? <FancyDivider theme={theme} className="mt-2" /> : null}
                  </>
                ) : null}

                <div className="mt-2">
                  {mainText ? (
                    <div
                      style={{
                        color: 'rgba(235, 245, 255, 0.92)',
                        fontSize: 18,
                        lineHeight: 1.7,
                        whiteSpace: 'pre-line',
                        textShadow: '0 2px 14px rgba(0,0,0,0.62)',
                      }}
                    >
                      {mainText}
                    </div>
                  ) : (
                    <div style={{ color: 'rgba(214, 230, 255, 0.75)' }}>
                      {mode === 'paths' ? 'Описание пути появится позже.' : 'Описание школы появится позже.'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {!schoolItems.length ? (
            <div className="rounded-2xl px-6 py-5" style={glassPanel}>
              <div style={{ color: 'rgba(235, 245, 255, 0.80)' }}>
                В таблице <b>magic_school</b> пока нет записей.
              </div>
            </div>
          ) : null}

          {mode === 'paths' && curSchool && curSchoolPaths.length === 0 ? (
            <div className="rounded-2xl px-6 py-5" style={glassPanel}>
              <div style={{ color: 'rgba(235, 245, 255, 0.80)' }}>
                Для школы <b>{curSchool.name ?? '—'}</b> пока нет путей в таблице <b>magic_path</b>.
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

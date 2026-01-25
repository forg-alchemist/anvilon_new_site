'use client';

import React, { useMemo, useState } from 'react';
import { getPublicStorageUrl } from '@/lib/supabase/publicUrl';

export type MagicSchool = {
  id: string;
  created_at: string;
  slug_school: string | null;
  name: string | null;
  bucket: string | null;
  art_path: string | null;
  description: string | null;
  req_talent_slug: string | null;
  req_talent: string | null;
};

function upper(v?: string | null): string {
  return (v ?? '').toString().trim().toUpperCase();
}

function ArrowButton({
  dir,
  onClick,
}: {
  dir: 'left' | 'right';
  onClick: () => void;
}): React.ReactElement {
  const iconUrl = getPublicStorageUrl('art', 'UI_UX/BackButton.png');
  const flip = dir === 'right' ? 'scaleX(-1)' : 'none';

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={dir === 'left' ? 'Предыдущая школа' : 'Следующая школа'}
      className="relative inline-flex items-center justify-center"
      style={{
        width: 58,
        height: 58,
        background: 'transparent',
        border: 'none',
        padding: 0,
        cursor: 'pointer',
        filter: 'drop-shadow(0 2px 14px rgba(0,0,0,0.55))',
        transition: 'transform 120ms ease, filter 120ms ease',
      }}
      onMouseEnter={(e) => {
        const btn = e.currentTarget as HTMLButtonElement;
        btn.style.transform = 'scale(1.03)';
        btn.style.filter = 'drop-shadow(0 2px 18px rgba(0,0,0,0.65))';
      }}
      onMouseLeave={(e) => {
        const btn = e.currentTarget as HTMLButtonElement;
        btn.style.transform = 'none';
        btn.style.filter = 'drop-shadow(0 2px 14px rgba(0,0,0,0.55))';
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
          opacity: 0.92,
          transition: 'opacity 120ms ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.opacity = '1';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.opacity = '0.92';
        }}
      />
    </button>
  );
}

function PathsButton(): React.ReactElement {
  // Табличка как в SkillsSection (spine): НЕ огромная "пилюля", а шапка, прилипшая к панели.
  const goldSoft = 'rgba(244, 214, 123, 0.18)';
  const TITLE_H = 44; // px

  return (
    <button
      type="button"
      className="flex items-center whitespace-nowrap rounded-t-[22px] rounded-b-[6px] border border-white/18 bg-gradient-to-b from-white/22 via-white/12 to-black/30 px-6 transition"
      style={{
        height: TITLE_H,
        lineHeight: 1,
        boxShadow:
          '0 12px 35px rgba(0,0,0,.45), inset 0 1px 0 rgba(255,255,255,.35)',
        fontFamily: 'var(--font-buttons)',
        fontSize: 13,
        textTransform: 'uppercase',
        letterSpacing: '0.28em',
        color: 'rgba(230, 214, 168, 0.92)',
        textShadow: '0 2px 12px rgba(0,0,0,.8)',
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLButtonElement;
        el.style.borderColor = 'rgba(244, 214, 123, 0.70)';
        el.style.boxShadow = `0 12px 35px rgba(0,0,0,.45), 0 0 18px ${goldSoft}, inset 0 1px 0 rgba(255,255,255,.35)`;
        el.style.color = 'rgba(244, 214, 123, 0.96)';
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLButtonElement;
        el.style.borderColor = 'rgba(255,255,255,0.18)';
        el.style.boxShadow =
          '0 12px 35px rgba(0,0,0,.45), inset 0 1px 0 rgba(255,255,255,.35)';
        el.style.color = 'rgba(230, 214, 168, 0.92)';
      }}
    >
      К ПУТЯМ
    </button>
  );
}

export function MagicSchoolSlider({ schools }: { schools: MagicSchool[] }): React.ReactElement {
  const items = useMemo(() => (Array.isArray(schools) ? schools : []), [schools]);
  const [idx, setIdx] = useState(0);

  const safeIndex = items.length ? ((idx % items.length) + items.length) % items.length : 0;
  const cur = items.length ? items[safeIndex] : null;

  const artUrl =
    cur?.art_path && cur?.bucket ? getPublicStorageUrl(cur.bucket, cur.art_path) : '';

  const title = upper(cur?.name) || '—';
  const req = upper(cur?.req_talent) || '—';
  const desc = (cur?.description ?? '').toString().trim();

  const goPrev = () => setIdx((v) => v - 1);
  const goNext = () => setIdx((v) => v + 1);

  const panel: React.CSSProperties = {
    border: '1px solid rgba(255,255,255,0.10)',
    background: 'rgba(0,0,0,0.18)',
    boxShadow: '0 18px 50px rgba(0,0,0,0.45)',
    backdropFilter: 'blur(10px)',
  };

  const TITLE_H = 44; // должно совпадать с PathsButton

  return (
    <div className="relative z-10 grid items-start gap-6 md:grid-cols-[320px_1fr] pb-16 md:pb-20">
      {/* ART 9:16 */}
      <div className="w-full">
        <div className="overflow-hidden rounded-2xl" style={panel}>
          <div className="aspect-[9/16] w-full">
            {artUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={artUrl}
                alt={cur?.name ?? 'Magic school'}
                className="h-full w-full object-cover"
                draggable={false}
              />
            ) : (
              <div
                className="flex h-full w-full items-center justify-center text-xs"
                style={{ color: 'rgba(214, 230, 255, 0.70)' }}
              >
                НЕТ АРТА
              </div>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT */}
      <div className="flex flex-col gap-5">
        {/* TOP ROW: arrows only */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-2">
            <ArrowButton dir="left" onClick={goPrev} />
            <ArrowButton dir="right" onClick={goNext} />
          </div>
        </div>

        {/* TITLE + REQ */}
        <div className="relative rounded-2xl px-6 py-5" style={panel}>
          {/* ✅ как в SkillsSection: таб-«шапка» абсолютом, НЕ создаёт щелей */}
          <div className="absolute right-6 top-0 z-10" style={{ transform: 'translateY(-50%)' }}>
            <PathsButton />
          </div>

          {/* резервируем место под шапку ровно на половину её высоты */}
          <div style={{ marginTop: TITLE_H / 2 }}>
            <div
              className="text-center"
              style={{
                fontFamily: 'var(--font-title)',
                fontSize: 28,
                lineHeight: 1.1,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: '#E6D6A8',
                textShadow: '0 2px 18px rgba(0,0,0,0.65)',
              }}
            >
              {title}
            </div>

            <div
              className="mt-4 h-[1px] w-full"
              style={{ background: 'rgba(255,255,255,0.12)' }}
            />

            <div
              className="mt-4 text-center"
              style={{
                fontFamily: 'var(--font-buttons)',
                fontSize: 13,
                letterSpacing: '0.20em',
                textTransform: 'uppercase',
                color: 'rgba(125,211,252,0.92)',
                textShadow: '0 2px 16px rgba(0,0,0,0.75)',
              }}
            >
              ТРЕБОВАНИЯ: <span style={{ color: 'rgba(251, 113, 133, 0.92)' }}>{req}</span>
            </div>
          </div>
        </div>

        {/* DESCRIPTION */}
        <div className="rounded-2xl px-6 py-5" style={panel}>
          {desc ? (
            <div
              style={{
                color: 'rgba(235, 245, 255, 0.92)',
                fontSize: 18,
                lineHeight: 1.65,
                whiteSpace: 'pre-line',
              }}
            >
              {desc}
            </div>
          ) : (
            <div style={{ color: 'rgba(214, 230, 255, 0.75)' }}>Описание появится позже.</div>
          )}
        </div>

        {!items.length ? (
          <div className="rounded-2xl px-6 py-5" style={panel}>
            <div style={{ color: 'rgba(235, 245, 255, 0.80)' }}>
              В таблице <b>magic_school</b> пока нет записей.
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

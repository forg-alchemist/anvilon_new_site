'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { getPublicStorageUrl } from '@/lib/supabase/publicUrl';
import { getMagicTheme } from './magicTheme';
import type { MagicPath } from '@/lib/data/magicPath';
import type { TalentRow } from '@/lib/data/talents';
import type { MagicSpell, SpellConditionRow, SpellEffectRow, SpellResourceRow } from '@/lib/data/magicSpells';

export type MagicSchool = {
  id: string;
  created_at: string;
  slug_school: string | null;
  name: string | null;
  bucket: string | null;
  art_path: string | null;
  description: string | null;
};

type CatalogBookRow = {
  id: string;
  group: string | null;
  name: string | null;
  bucket: string | null;
  art_path: string | null;
};

type SpellDeckItem = {
  key: string;
  name: string;
  description: string;
  bucket: string | null;
  art_path: string | null;
  levels: MagicSpell[];
};

type SpellEffectView = SpellEffectRow & {
  resources: SpellResourceRow[] | null;
  conditions: SpellConditionRow[] | null;
};

type EnhancementInfo = {
  freeActionsValue: number | null;
  intoleranceValue: number | null;
  freeEffectIds: Set<string>;
  intoleranceEffectIds: Set<string>;
  freeEffectCosts: Map<string, number>;
  intoleranceEffectCosts: Map<string, number>;
};

function upper(v?: string | null): string {
  return (v ?? '').toString().trim().toUpperCase();
}

function normalizeName(v?: string | null): string {
  return (v ?? '').toString().trim().toLowerCase();
}

function normalizeResourceType(value?: string | null): string {
  return (value ?? '').toString().toLowerCase().replace(/\s+/g, ' ').trim();
}

function isFreeActionResource(resourceType?: string | null): boolean {
  return normalizeResourceType(resourceType).includes('свободных действий');
}

function isIntoleranceResource(resourceType?: string | null): boolean {
  return normalizeResourceType(resourceType).includes('жетонов нетерпимости');
}

function getTargetPrefix(attackFocus?: string | null): string {
  const v = normalizeResourceType(attackFocus);
  if (!v) return '';
  if (v.includes('area_target') || v.includes('площад')) return 'Площадь';
  if (v.includes('region_target') || v.includes('област')) return 'Область';
  return '';
}

function formatTargetValues(primary: number, secondary: number, prefix?: string): string {
  const prim = Number.isFinite(primary) ? primary : 0;
  const sec = Number.isFinite(secondary) ? secondary : 0;
  if (!prim && !sec) return '';
  if (sec) {
    const base = `${prim}x${sec}`;
    return prefix ? `${prefix} ${base}` : base;
  }
  return String(prim);
}

function pluralizeRu(value: number, one: string, few: string, many: string): string {
  const n = Math.abs(Math.trunc(value));
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}

function toOptimizedArtUrl(url: string, width: number): string {
  if (!url) return '';
  void width;
  return url;
}

function getResourceColor(resourceType: string): string {
  const n = resourceType.toLowerCase();
  if (n.includes('здоров') || n.includes('жизн')) return '#ff6b6b';
  if (n.includes('концентрац')) return '#6eb8ff';
  if (n.includes('душ')) return '#b5e6ff';
  if ((n.includes('восстанов') || n.includes('время')) && n.includes('навык')) return '#ffb366';
  if (n.includes('стойк')) return '#bf8cff';
  if (n.includes('мана') || n.includes('маны')) return '#5d86ff';
  return 'rgba(225, 240, 255, 0.84)';
}

function toResourceHeader(resourceType: string): string {
  const trimmed = resourceType.trim();
  const withoutPrefix = trimmed.replace(/^затраты\s+/i, '');
  return `ЗАТРАТЫ ${withoutPrefix}`.trim().toUpperCase();
}

const ART_CARD_WIDTH = 300;
const ART_CARD_HEIGHT = Math.round((ART_CARD_WIDTH * 16) / 9);

function getSchoolArtFilter(mode: 'school' | 'paths' | 'spells'): string {
  if (mode === 'school') return 'grayscale(0) saturate(1) brightness(1)';
  if (mode === 'paths') return 'grayscale(0.5) saturate(0.85) brightness(0.93)';
  return 'grayscale(1) saturate(0.55) brightness(0.78)';
}

function getPathArtFilter(mode: 'school' | 'paths' | 'spells'): string {
  if (mode === 'spells') return 'grayscale(0.5) saturate(0.85) brightness(0.9)';
  return 'grayscale(0) saturate(1) brightness(1)';
}

function getFadeOverlayOpacity(layer: 'school' | 'path', mode: 'school' | 'paths' | 'spells'): number {
  if (layer === 'school') {
    if (mode === 'paths') return 0.2;
    if (mode === 'spells') return 0.42;
    return 0;
  }
  if (mode === 'spells') return 0.2;
  return 0;
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
          filter: `drop-shadow(0 0 14px ${tint})`,
        }}
      />
    </button>
  );
}

function LevelArrowArtButton({
  dir,
  onClick,
  disabled,
}: {
  dir: 'left' | 'right';
  onClick: () => void;
  disabled?: boolean;
}): React.ReactElement {
  const iconUrl = getPublicStorageUrl('art', 'UI_UX/BackButton.png');
  const flip = dir === 'right' ? 'scaleX(-1)' : 'none';
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={dir === 'left' ? 'Уровень назад' : 'Уровень вперед'}
      className="inline-flex h-9 w-9 items-center justify-center"
      style={{ opacity: disabled ? 0.4 : 1 }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={iconUrl}
        alt=""
        draggable={false}
        style={{
          width: 34,
          height: 34,
          objectFit: 'contain',
          transform: flip,
          filter: 'drop-shadow(0 0 10px rgba(231,196,122,0.85))',
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
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center whitespace-nowrap rounded-t-[22px] rounded-b-[6px] border bg-gradient-to-b from-white/22 via-white/12 to-black/30 px-6 transition select-none"
      style={{
        height: 44,
        borderColor: theme.glow,
        boxShadow: `0 14px 40px rgba(0,0,0,.48), 0 0 18px ${theme.glowSoft}, 0 0 10px ${theme.glow}, inset 0 1px 0 rgba(255,255,255,.38)`,
        fontFamily: 'var(--font-buttons)',
        fontSize: 13,
        textTransform: 'uppercase',
        letterSpacing: '0.30em',
        color: theme.main,
        textShadow: '0 2px 12px rgba(0,0,0,.85)',
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
      <div className="h-[6px] w-[6px] rotate-45" style={{ background: theme.main, boxShadow: `0 0 18px ${theme.glowSoft}`, opacity: 0.75 }} />
      <div className="h-[1px] flex-1" style={{ background: theme.glowSoft }} />
    </div>
  );
}

export function MagicSchoolSlider({
  schools,
  paths,
  spells,
  talents,
  spellResources,
  spellEffects,
  spellConditions,
  catalogBooks,
}: {
  schools: MagicSchool[];
  paths: MagicPath[];
  spells: MagicSpell[];
  talents: TalentRow[];
  spellResources: SpellResourceRow[];
  spellEffects: SpellEffectRow[];
  spellConditions: SpellConditionRow[];
  catalogBooks: CatalogBookRow[];
}): React.ReactElement {
  const schoolItems = useMemo(() => (Array.isArray(schools) ? schools : []), [schools]);
  const allPaths = useMemo(() => (Array.isArray(paths) ? paths : []), [paths]);
  const allSpells = useMemo(() => (Array.isArray(spells) ? spells : []), [spells]);
  const allTalents = useMemo(() => (Array.isArray(talents) ? talents : []), [talents]);
  const allSpellResources = useMemo(() => (Array.isArray(spellResources) ? spellResources : []), [spellResources]);
  const allSpellEffects = useMemo(() => (Array.isArray(spellEffects) ? spellEffects : []), [spellEffects]);
  const allSpellConditions = useMemo(() => (Array.isArray(spellConditions) ? spellConditions : []), [spellConditions]);
  const allCatalogBooks = useMemo(() => (Array.isArray(catalogBooks) ? catalogBooks : []), [catalogBooks]);

  const talentNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const t of allTalents) {
      if (t?.id && t?.name) map.set(String(t.id), String(t.name));
    }
    return map;
  }, [allTalents]);

  const [mode, setMode] = useState<'school' | 'paths' | 'spells'>('school');
  const [spellTab, setSpellTab] = useState<'general' | 'attacks'>('general');
  const [schoolIdx, setSchoolIdx] = useState(0);
  const [pathIdx, setPathIdx] = useState(0);
  const [spellIdx, setSpellIdx] = useState(0);
  const [spellLevelByName, setSpellLevelByName] = useState<Record<string, number>>({});

  const [schoolArtFailed, setSchoolArtFailed] = useState(false);
  const [pathArtFailed, setPathArtFailed] = useState(false);
  const [spellArtFailed, setSpellArtFailed] = useState(false);
  const [iconTooltip, setIconTooltip] = useState<{ text: string; x: number; y: number; visible: boolean }>({
    text: '',
    x: 0,
    y: 0,
    visible: false,
  });

  const safeSchoolIndex = schoolItems.length ? ((schoolIdx % schoolItems.length) + schoolItems.length) % schoolItems.length : 0;
  const curSchool = schoolItems.length ? schoolItems[safeSchoolIndex] : null;
  const theme = getMagicTheme(curSchool?.id);

  const curSchoolPaths = useMemo(() => {
    if (!curSchool?.id) return [] as MagicPath[];
    return allPaths.filter((p) => p.id_magic_school === curSchool.id);
  }, [allPaths, curSchool?.id]);

  const safePathIndex = curSchoolPaths.length ? ((pathIdx % curSchoolPaths.length) + curSchoolPaths.length) % curSchoolPaths.length : 0;
  const curPath = curSchoolPaths.length ? curSchoolPaths[safePathIndex] : null;

  const spellDeck = useMemo<SpellDeckItem[]>(() => {
    if (!curPath?.id) return [];
    const map = new Map<string, SpellDeckItem>();
    const pathSpells = allSpells
      .filter((s) => s.id_path === curPath.id)
      .sort((a, b) => {
        const ta = a.created_at ? Date.parse(a.created_at) : 0;
        const tb = b.created_at ? Date.parse(b.created_at) : 0;
        return ta - tb;
      });

    for (const s of pathSpells) {
      const key = normalizeName(s.name);
      if (!key) continue;
      const existing = map.get(key);
      if (!existing) {
        map.set(key, {
          key,
          name: (s.name ?? '').toString().trim(),
          description: (s.description ?? '').toString().trim(),
          bucket: s.bucket ?? null,
          art_path: s.art_path ?? null,
          levels: [s],
        });
      } else {
        existing.levels.push(s);
      }
    }

    return Array.from(map.values()).map((entry) => ({
      ...entry,
      levels: [...entry.levels].sort((a, b) => (a.lvl ?? 0) - (b.lvl ?? 0)),
    }));
  }, [allSpells, curPath?.id]);

  const safeSpellIndex = spellDeck.length ? ((spellIdx % spellDeck.length) + spellDeck.length) % spellDeck.length : 0;
  const curSpellDeckItem = spellDeck.length ? spellDeck[safeSpellIndex] : null;

  const selectedSpellLevel = curSpellDeckItem ? spellLevelByName[curSpellDeckItem.key] ?? 1 : 1;
  const curSpell =
    curSpellDeckItem?.levels.find((s) => (s.lvl ?? 0) === selectedSpellLevel) ??
    curSpellDeckItem?.levels[0] ??
    null;

  const curSpellCosts = useMemo(() => {
    if (!curSpell?.id) return [] as Array<{ resourceType: string; value: number }>;
    return allSpellResources
      .filter((r) => r.id_spell_skill === curSpell.id && r.type === 'spell')
      .map((r) => ({
        resourceType: (r.resource_type ?? '').toString().trim(),
        value: Number(r.resource_value ?? 0),
      }))
      .filter((r) => r.resourceType);
  }, [allSpellResources, curSpell?.id]);

  const curSpellDuration = curSpell?.duration ?? 0;

  const curSpellEffects = useMemo(() => {
    if (!curSpell?.id) return [] as SpellEffectView[];
    const effects = allSpellEffects
      .filter((e) => e.id_spell_skill === curSpell.id)
      .sort((a, b) => (a.num_eff ?? 0) - (b.num_eff ?? 0));

    const directResourcesByEffect = new Map<string, SpellResourceRow[]>();
    for (const r of allSpellResources) {
      if (!r.id_spell_skill) continue;
      const list = directResourcesByEffect.get(r.id_spell_skill) ?? [];
      list.push(r);
      directResourcesByEffect.set(r.id_spell_skill, list);
    }

    return effects.map((e) => {
      const resources = directResourcesByEffect.get(e.id) ?? [];
      const conditions = allSpellConditions.filter((c) => c.id_eff === e.id);
      return {
        ...e,
        resources: resources.length ? resources : null,
        conditions: conditions.length ? conditions : null,
      };
    });
  }, [allSpellEffects, allSpellResources, allSpellConditions, curSpell?.id]);

  const curSpellTargetPrim = curSpell?.target_value_prim ?? 0;
  const curSpellTargetSec = curSpell?.target_value_sec ?? 0;
  const firstEffectFocus = curSpellEffects[0]?.attack_focus ?? '';
  const curSpellTargetText = formatTargetValues(
    curSpellTargetPrim,
    curSpellTargetSec,
    curSpellTargetSec ? getTargetPrefix(firstEffectFocus) : '',
  );

  const enhancementInfo = useMemo<EnhancementInfo>(() => {
    if (!curSpell?.id) {
      return {
        freeActionsValue: null as number | null,
        intoleranceValue: null as number | null,
        freeEffectIds: new Set<string>(),
        intoleranceEffectIds: new Set<string>(),
        freeEffectCosts: new Map<string, number>(),
        intoleranceEffectCosts: new Map<string, number>(),
      };
    }
    const freeEffectIds = new Set<string>();
    const intoleranceEffectIds = new Set<string>();
    const freeEffectCosts = new Map<string, number>();
    const intoleranceEffectCosts = new Map<string, number>();
    let freeActionsValue: number | null = null;
    let intoleranceValue: number | null = null;
    const effectIdSet = new Set(curSpellEffects.map((e) => e.id));
    const impactRows = allSpellResources.filter(
      (r) => r.type === 'spell_impact' && r.id_spell_skill && effectIdSet.has(r.id_spell_skill),
    );
    const freeRows = impactRows.filter((r) => isFreeActionResource(r.resource_type));
    const intoleranceRows = impactRows.filter((r) => isIntoleranceResource(r.resource_type));

    for (const row of freeRows) {
      if (row.id_spell_skill) {
        freeEffectIds.add(row.id_spell_skill);
        freeEffectCosts.set(
          row.id_spell_skill,
          (freeEffectCosts.get(row.id_spell_skill) ?? 0) + Number(row.resource_value ?? 0),
        );
      }
      freeActionsValue = (freeActionsValue ?? 0) + Number(row.resource_value ?? 0);
    }

    for (const row of intoleranceRows) {
      if (row.id_spell_skill) {
        intoleranceEffectIds.add(row.id_spell_skill);
        intoleranceEffectCosts.set(
          row.id_spell_skill,
          (intoleranceEffectCosts.get(row.id_spell_skill) ?? 0) + Number(row.resource_value ?? 0),
        );
      }
      intoleranceValue = (intoleranceValue ?? 0) + Number(row.resource_value ?? 0);
    }

    return { freeActionsValue, intoleranceValue, freeEffectIds, intoleranceEffectIds, freeEffectCosts, intoleranceEffectCosts };
  }, [curSpell?.id, curSpellEffects, allSpellResources]);

  const catalogArtUrl = useMemo(() => {
    const map = new Map<string, { bucket: string | null; art_path: string | null }>();
    for (const row of allCatalogBooks) {
      const g = (row.group ?? '').toString().trim().toLowerCase();
      const n = (row.name ?? '').toString().trim().toLowerCase();
      if (!g || !n) continue;
      map.set(`${g}::${n}`, { bucket: row.bucket ?? null, art_path: row.art_path ?? null });
    }
    return (group: string, name: string) => {
      const key = `${group.toLowerCase()}::${name.toLowerCase()}`;
      const found = map.get(key);
      if (!found?.bucket || !found?.art_path) return '';
      return getPublicStorageUrl(found.bucket, found.art_path);
    };
  }, [allCatalogBooks]);

  useEffect(() => {
    if (!curSpellDeckItem) return;
    setSpellLevelByName((prev) => {
      if (mode !== 'spells') return prev;
      return { ...prev, [curSpellDeckItem.key]: 1 };
    });
  }, [curSpellDeckItem, mode]);

  useEffect(() => {
    setPathIdx(0);
    setSpellIdx(0);
    setSpellTab('general');
    setSpellLevelByName({});
    setSpellArtFailed(false);
  }, [curSchool?.id]);

  useEffect(() => {
    setSpellIdx(0);
    setSpellTab('general');
    setSpellLevelByName({});
    setSpellArtFailed(false);
  }, [curPath?.id]);

  const schoolArtUrl = useMemo(() => {
    const baseUrl = curSchool?.art_path && curSchool?.bucket ? getPublicStorageUrl(curSchool.bucket, curSchool.art_path) : '';
    return toOptimizedArtUrl(baseUrl, ART_CARD_WIDTH * 2);
  }, [curSchool?.art_path, curSchool?.bucket]);

  const pathArtUrl = useMemo(() => {
    const baseUrl = curPath?.art_path && curPath?.bucket ? getPublicStorageUrl(curPath.bucket, curPath.art_path) : '';
    return toOptimizedArtUrl(baseUrl, ART_CARD_WIDTH * 2);
  }, [curPath?.art_path, curPath?.bucket]);

  const spellArtUrl = useMemo(() => {
    const baseUrl = curSpell?.art_path && curSpell?.bucket ? getPublicStorageUrl(curSpell.bucket, curSpell.art_path) : '';
    return toOptimizedArtUrl(baseUrl, ART_CARD_WIDTH * 2);
  }, [curSpell?.art_path, curSpell?.bucket]);

  const levelList = curSpellDeckItem?.levels ?? [];
  const currentLevelIndex = levelList.findIndex((s) => (s.lvl ?? 0) === selectedSpellLevel);
  const canSwitchLevel = levelList.length > 1;

  const switchLevel = (dir: -1 | 1) => {
    if (!curSpellDeckItem || !levelList.length) return;
    const nextIndex = currentLevelIndex < 0 ? 0 : (currentLevelIndex + dir + levelList.length) % levelList.length;
    const nextLevel = levelList[nextIndex]?.lvl ?? levelList[0]?.lvl ?? 1;
    setSpellLevelByName((prev) => ({ ...prev, [curSpellDeckItem.key]: nextLevel }));
  };

  useEffect(() => {
    const preload = (url: string) => {
      if (!url) return;
      const img = new Image();
      img.decoding = 'async';
      img.src = url;
    };

    function getWrapped<T>(list: T[], index: number): T | null {
      if (!list.length) return null;
      const safe = ((index % list.length) + list.length) % list.length;
      return list[safe] ?? null;
    }

    const toArtUrl = (bucket?: string | null, artPath?: string | null) => {
      if (!bucket || !artPath) return '';
      return toOptimizedArtUrl(getPublicStorageUrl(bucket, artPath), ART_CARD_WIDTH * 2);
    };

    preload(schoolArtUrl);
    preload(pathArtUrl);
    preload(spellArtUrl);

    // Neighbor school arts for fast school browsing.
    const prevSchool = getWrapped(schoolItems, safeSchoolIndex - 1);
    const nextSchool = getWrapped(schoolItems, safeSchoolIndex + 1);
    preload(toArtUrl(prevSchool?.bucket, prevSchool?.art_path));
    preload(toArtUrl(nextSchool?.bucket, nextSchool?.art_path));

    // Neighbor path arts for fast path browsing.
    const prevPath = getWrapped(curSchoolPaths, safePathIndex - 1);
    const nextPath = getWrapped(curSchoolPaths, safePathIndex + 1);
    preload(toArtUrl(prevPath?.bucket, prevPath?.art_path));
    preload(toArtUrl(nextPath?.bucket, nextPath?.art_path));

    // Neighbor spell arts for fast spell browsing.
    const prevSpell = getWrapped(spellDeck, safeSpellIndex - 1);
    const nextSpell = getWrapped(spellDeck, safeSpellIndex + 1);
    preload(toArtUrl(prevSpell?.bucket, prevSpell?.art_path));
    preload(toArtUrl(nextSpell?.bucket, nextSpell?.art_path));

    // Neighbor level arts inside the current spell (if levels differ by art).
    const prevLevel = getWrapped(levelList, currentLevelIndex - 1);
    const nextLevel = getWrapped(levelList, currentLevelIndex + 1);
    preload(toArtUrl(prevLevel?.bucket, prevLevel?.art_path));
    preload(toArtUrl(nextLevel?.bucket, nextLevel?.art_path));
  }, [
    schoolArtUrl,
    pathArtUrl,
    spellArtUrl,
    schoolItems,
    safeSchoolIndex,
    curSchoolPaths,
    safePathIndex,
    spellDeck,
    safeSpellIndex,
    levelList,
    currentLevelIndex,
  ]);

  const title =
    mode === 'spells' ? upper(curSpell?.name) || '—' : mode === 'paths' ? upper(curPath?.name) || '—' : upper(curSchool?.name) || '—';
  const mainText =
    mode === 'spells'
      ? (curSpell?.description ?? '').toString().trim()
      : mode === 'paths'
        ? (curPath?.description ?? '').toString().trim()
        : (curSchool?.description ?? '').toString().trim();

  const direction = (curPath?.direction ?? '').toString().trim();
  const reqTalent = upper(curPath?.req_talent);

  const goPrev = () => {
    setSchoolArtFailed(false);
    setPathArtFailed(false);
    setSpellArtFailed(false);
    if (mode === 'spells') {
      setSpellIdx((v) => v - 1);
      return;
    }
    if (mode === 'paths') {
      setPathIdx((v) => v - 1);
      return;
    }
    setSchoolIdx((v) => v - 1);
  };

  const goNext = () => {
    setSchoolArtFailed(false);
    setPathArtFailed(false);
    setSpellArtFailed(false);
    if (mode === 'spells') {
      setSpellIdx((v) => v + 1);
      return;
    }
    if (mode === 'paths') {
      setPathIdx((v) => v + 1);
      return;
    }
    setSchoolIdx((v) => v + 1);
  };

  const shiftStep = 36;
  const currentShift = mode === 'spells' ? shiftStep * 2 : mode === 'paths' ? shiftStep : 0;

  const glassPanel: React.CSSProperties = {
    border: `1px solid ${theme.glow}`,
    background: 'linear-gradient(180deg, rgba(255,255,255,0.08), rgba(0,0,0,0.24))',
    boxShadow: `0 22px 58px rgba(0,0,0,0.46), 0 0 32px ${theme.glowSoft}, 0 0 10px ${theme.glow}, inset 0 1px 0 rgba(255,255,255,0.10)`,
    backdropFilter: 'blur(10px)',
  };

  const spellTabs = [
    { key: 'general' as const, label: 'Общая информация' },
    { key: 'attacks' as const, label: 'Детализация воздействий' },
  ];

  const spellTabPanel = (
    <div className="shrink-0 self-start">
      <div className="flex flex-col gap-3">
        {spellTabs.map((tab) => {
          const active = spellTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setSpellTab(tab.key)}
              className="rounded-2xl border px-2 py-3 transition"
              style={{
                borderColor: active ? 'rgba(244, 214, 123, 0.38)' : 'rgba(255,255,255,0.10)',
                background: active
                  ? 'radial-gradient(140% 140% at 50% 0%, rgba(244,214,123,0.20), rgba(0,0,0,0) 62%), linear-gradient(180deg, rgba(0,0,0,0.52), rgba(0,0,0,0.22))'
                  : 'rgba(0,0,0,0.25)',
                boxShadow: active
                  ? '0 12px 28px rgba(0,0,0,0.55), 0 0 22px rgba(244,214,123,0.25)'
                  : '0 10px 24px rgba(0,0,0,0.40)',
                backdropFilter: 'blur(10px)',
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-buttons)',
                  fontSize: 13,
                  textTransform: 'uppercase',
                  letterSpacing: '0.24em',
                  color: active ? 'rgba(244,214,123,0.95)' : 'rgba(225,240,255,0.82)',
                  textShadow: active
                    ? '0 0 14px rgba(244,214,123,0.35), 0 2px 16px rgba(0,0,0,0.85)'
                    : '0 2px 14px rgba(0,0,0,0.8)',
                  writingMode: 'vertical-rl',
                  textOrientation: 'mixed',
                  transform: 'rotate(0deg)',
                }}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );

  const renderSpellAttacks = () => {
    if (!curSpellEffects.length) {
      return <div className="mt-4 text-lg text-white/70">Воздействия не указаны.</div>;
    }

    const byId = new Map<string, SpellEffectView>();
    const childIds = new Set<string>();
    for (const e of curSpellEffects) {
      if (e.id) byId.set(e.id, e);
      if (e.add_imp_eff) childIds.add(e.add_imp_eff);
    }
    const top = curSpellEffects.filter(
      (e) => !childIds.has(e.id) && !enhancementInfo.freeEffectIds.has(e.id) && !enhancementInfo.intoleranceEffectIds.has(e.id),
    );

    const renderArt = (group: string, name?: string | null) => {
      const label = (name ?? '').toString().trim();
      const showTooltip = (ev: React.MouseEvent) => {
        if (!label) return;
        setIconTooltip({ text: label, x: ev.clientX + 12, y: ev.clientY + 12, visible: true });
      };
      const moveTooltip = (ev: React.MouseEvent) => {
        if (!label) return;
        setIconTooltip((prev) => ({ ...prev, x: ev.clientX + 12, y: ev.clientY + 12 }));
      };
      const hideTooltip = () => {
        setIconTooltip((prev) => ({ ...prev, visible: false }));
      };
      if (!label) return <div className="h-16 w-16" />;

      const url = catalogArtUrl(group, label);
      if (!url) {
        return (
          <div onMouseEnter={showTooltip} onMouseMove={moveTooltip} onMouseLeave={hideTooltip}>
            <div className="flex h-16 w-16 items-center justify-center text-center text-[10px] text-white/60">{label}</div>
          </div>
        );
      }

      return (
        <div onMouseEnter={showTooltip} onMouseMove={moveTooltip} onMouseLeave={hideTooltip}>
          <div className="h-16 w-16">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt={label} className="h-full w-full object-contain" />
          </div>
        </div>
      );
    };

    const renderInfo = (e: SpellEffectView) => {
      const effectIndex = e.num_eff ?? 0;
      const lookupIndex = (id?: string | null) => {
        if (!id) return '';
        const row = byId.get(id);
        return row?.num_eff ? `Эффект ${row.num_eff}` : id;
      };

      const hasImpact = String(e.impact ?? '').trim().length > 0;
      const hasEffect = String(e.effect ?? '').trim().length > 0;
      const effectDescription = String(e.description ?? '').trim();

      const valueOrEmpty = (v: unknown) => {
        if (v == null) return '';
        if (typeof v === 'number' && !Number.isFinite(v)) return '';
        if (typeof v === 'number' && v === 0) return '';
        const s = String(v).trim();
        if (!s) return '';
        if (s === '0') return '';
        return s;
      };

      const durationValue = (v: unknown, enabled: boolean) => {
        if (!enabled) return '';
        if (v == null) return '';
        const n = typeof v === 'number' ? v : Number(v);
        if (!Number.isFinite(n)) return '';
        if (n === 0) return 'Мгновенно';
        return String(n);
      };

      const getTalentName = (id?: string | null) => {
        if (!id) return '';
        return talentNameById.get(String(id)) ?? '';
      };

      const rows: Array<{ label: string; value: string }> = [
        { label: 'Крит', value: e.crit_check ? 'Да' : '' },
        { label: 'Дистанция атаки', value: valueOrEmpty(e.attack_distance) },
        {
          label: 'Число целей',
          value: (() => {
            const prim = Number(e.target_value_prim ?? 0);
            const sec = Number(e.target_value_sec ?? 0);
            const prefix = sec ? getTargetPrefix(e.attack_focus) : '';
            return formatTargetValues(prim, sec, prefix);
          })(),
        },
        { label: 'Тип атаки', value: valueOrEmpty(e.attack_type) },
        { label: 'Направление атаки', value: valueOrEmpty(e.direction_attack) },
        { label: 'Покрывающая атака', value: e.covering_attack ? 'Да' : '' },
        { label: 'Высота покрывающей атаки', value: valueOrEmpty(e.covering_attack_high) },
        { label: 'Тип воздействия', value: valueOrEmpty(e.impact) },
        { label: 'Значение воздействия', value: valueOrEmpty(e.impact_value) },
        { label: 'Длительность воздействия', value: durationValue(e.impact_duration, hasImpact) },
        { label: 'Сопротивление/эффективность', value: valueOrEmpty(e.potency_resist) },
        { label: 'Эффект', value: valueOrEmpty(e.effect) },
        { label: 'Значение эффекта', value: valueOrEmpty(e.effect_value) },
        { label: 'Длительность эффекта', value: durationValue(e.effect_duration, hasEffect) },
        { label: 'Тип передвижения', value: valueOrEmpty(e.move_type) },
        { label: 'Значение передвижения', value: valueOrEmpty(e.move_type_value) },
        { label: 'Поддерживаемость', value: valueOrEmpty(e.concentration) },
        { label: 'Зависимый талант', value: valueOrEmpty(getTalentName(e.dep_talent)) },
        { label: 'Замена воздействия/эффекта', value: valueOrEmpty(lookupIndex(e.replace_imp_eff)) },
      ].filter((r) => String(r.value ?? '').trim().length > 0);

      const compactRows = rows.map((r) => ({
        key: `${effectIndex}:${r.label}`,
        label: r.label,
        value: r.value,
      }));

      const resourceRows = (e.resources ?? [])
        .map((r, idx) => ({
          key: `res:${effectIndex}:${idx}`,
          label: 'ЗАТРАТЫ',
          value: `${(r.resource_type ?? '').toString().trim()} ${Number(r.resource_value ?? 0)}`,
        }))
        .filter((r) => r.value.trim() && !r.value.endsWith(' 0'));

      const conditionRows = (e.conditions ?? [])
        .map((c, idx) => ({
          key: `cond:${effectIndex}:${idx}`,
          label: 'УСЛОВИЯ',
          value: `${(c.condition ?? '').toString().trim()}${c.description ? ` — ${c.description}` : ''}`,
        }))
        .filter((c) => c.value.trim());

      const mergedRows = [...compactRows, ...resourceRows, ...conditionRows];

      return (
        <div className="grid grid-cols-[64px_minmax(0,1fr)] gap-2">
          <div className="flex flex-col items-start gap-2">
            {renderArt('attack_category', e.attack_category)}
            {renderArt('type_target', e.type_target)}
            {renderArt('attack_focus', e.attack_focus)}
          </div>
          <div className="min-w-0">
            {effectDescription ? (
              <div
                className="mb-1.5 overflow-hidden rounded-lg border border-white/15"
                style={{
                  background: 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(3,10,24,0.18) 100%)',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)',
                }}
              >
                <div className="border-b border-white/15 px-3 py-2 text-center">
                  <div
                    className="text-[12px] font-semibold uppercase tracking-[0.2em]"
                    style={{
                      background: 'linear-gradient(180deg, #f4dc9a 0%, #e7c47a 45%, #c79f4f 100%)',
                      WebkitBackgroundClip: 'text',
                      backgroundClip: 'text',
                      color: 'transparent',
                      textShadow: '0 2px 12px rgba(0,0,0,0.7)',
                    }}
                  >
                    Описание
                  </div>
                </div>
                <div className="px-3 py-2 text-[14px] leading-[1.45] text-white/92">{effectDescription}</div>
              </div>
            ) : null}
            {mergedRows.length ? (
              <div className="space-y-1.5">
                {(() => {
                  const chunks: Array<typeof mergedRows> = [];
                  for (let i = 0; i < mergedRows.length; i += 4) {
                    chunks.push(mergedRows.slice(i, i + 4));
                  }
                  return chunks.map((chunk, chunkIndex) => {
                    const cols = chunk.length;
                    return (
                      <div
                        key={`chunk-${chunkIndex}`}
                        className="overflow-hidden rounded-lg border border-white/15"
                        style={{
                          background: 'linear-gradient(180deg, rgba(255,255,255,0.025) 0%, rgba(3,10,24,0.16) 100%)',
                          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.045)',
                        }}
                      >
                        <div
                          className="grid border-b border-white/15 bg-white/[0.02]"
                          style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
                        >
                          {chunk.map((r, i) => (
                            <div
                              key={`${r.key}-head`}
                              className="flex min-h-[40px] items-center justify-center border-r border-white/15 px-2 py-1.5 text-center"
                              style={{ borderRightWidth: i === cols - 1 ? 0 : undefined }}
                            >
                              <div
                                className="text-[12px] font-semibold uppercase tracking-[0.2em]"
                                style={{
                                  background: 'linear-gradient(180deg, #f4dc9a 0%, #e7c47a 45%, #c79f4f 100%)',
                                  WebkitBackgroundClip: 'text',
                                  backgroundClip: 'text',
                                  color: 'transparent',
                                  textShadow: '0 2px 12px rgba(0,0,0,0.7)',
                                }}
                              >
                                {r.label}
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="grid" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
                          {chunk.map((r, i) => (
                            <div
                              key={`${r.key}-val`}
                              className="flex min-h-[44px] items-center justify-center border-r border-white/15 px-2 py-1.5 text-center"
                              style={{ borderRightWidth: i === cols - 1 ? 0 : undefined }}
                            >
                              <div className="text-[14px] leading-[1.35] text-white/92">{r.value}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            ) : (
              <div className="text-[15px] text-white/50">Поля не заполнены.</div>
            )}
          </div>
        </div>
      );
    };

    const renderEffect = (e: SpellEffectView, nested: boolean) => {
      const child = e.add_imp_eff ? byId.get(e.add_imp_eff) : null;
      return (
        <div key={e.id} className={nested ? 'ml-6 border-l border-white/10 pl-4' : ''}>
          <div className="text-sm font-semibold text-white/85">{`Эффект ${e.num_eff ?? ''}`}</div>
          <div className="mt-2">{renderInfo(e)}</div>
          {child ? <div className="mt-4">{renderEffect(child, true)}</div> : null}
        </div>
      );
    };

    return (
      <div className="mt-4 space-y-6">
        <div className="space-y-6">
          {top.map((e) => renderEffect(e, false))}

          {(enhancementInfo.freeActionsValue != null || enhancementInfo.intoleranceValue != null) ? (
            <>
              <FancyDivider theme={theme} className="mt-4" />
              <div className="mt-6 space-y-6">
                {enhancementInfo.freeActionsValue != null ? (
                  <div>
                    <div
                      className="text-sm font-semibold uppercase tracking-[0.12em]"
                      style={{
                        background: 'linear-gradient(180deg, #f4dc9a 0%, #e7c47a 45%, #c79f4f 100%)',
                        WebkitBackgroundClip: 'text',
                        backgroundClip: 'text',
                        color: 'transparent',
                        textShadow: '0 2px 12px rgba(0,0,0,0.75)',
                      }}
                    >
                      Усиление за свободные действия
                    </div>
                    <div className="mt-3 space-y-4">
                      {Array.from(enhancementInfo.freeEffectIds)
                        .map((id) => byId.get(id))
                        .filter(Boolean)
                        .map((effect) => (
                          <div key={`free-${effect!.id}`}>{renderEffect(effect!, false)}</div>
                        ))}
                    </div>
                  </div>
                ) : null}

                {enhancementInfo.intoleranceValue != null ? (
                  <div>
                    <FancyDivider theme={theme} className="mb-4" />
                    <div
                      className="text-sm font-semibold uppercase tracking-[0.12em]"
                      style={{
                        background: 'linear-gradient(180deg, #f4dc9a 0%, #e7c47a 45%, #c79f4f 100%)',
                        WebkitBackgroundClip: 'text',
                        backgroundClip: 'text',
                        color: 'transparent',
                        textShadow: '0 2px 12px rgba(0,0,0,0.75)',
                      }}
                    >
                      Усиление за жетоны нетерпимости
                    </div>
                    <div className="mt-3 space-y-4">
                      {Array.from(enhancementInfo.intoleranceEffectIds)
                        .map((id) => byId.get(id))
                        .filter(Boolean)
                        .map((effect) => (
                          <div key={`int-${effect!.id}`}>{renderEffect(effect!, false)}</div>
                        ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </>
          ) : null}
        </div>
      </div>
    );
  };

  const spellGeneralPanel = (
    <>
      <div className="mt-3">
        {mainText ? (
          <div style={{ color: 'rgba(235, 245, 255, 0.92)', fontSize: 18, lineHeight: 1.7, whiteSpace: 'pre-line' }}>{mainText}</div>
        ) : (
          <div style={{ color: 'rgba(214, 230, 255, 0.75)' }}>Описание заклинания появится позже.</div>
        )}
      </div>

      <FancyDivider theme={theme} className="mt-3" />

      <div className="mt-3 grid grid-cols-3 items-start gap-4">
        <div className="text-center">
          <div className="text-xs uppercase tracking-[0.22em]" style={{ color: 'rgba(214,230,255,0.55)' }}>
            Число целей
          </div>
          <div className="mt-2 text-xl font-semibold text-white/90">{curSpellTargetText || '—'}</div>
        </div>
        <div className="text-center">
          <div className="text-xs uppercase tracking-[0.22em]" style={{ color: 'rgba(214,230,255,0.55)' }}>
            Время действия
          </div>
          <div className="mt-2 text-xl font-semibold text-white/90">{curSpellDuration}</div>
        </div>
        <div className="text-center">
          {curSpellCosts.length ? (
            <div className="space-y-3">
              {curSpellCosts.map((c, idx) => {
                const color = getResourceColor(c.resourceType);
                return (
                  <div key={`cost-line-${c.resourceType}-${idx}`} className="text-center">
                    <div className="text-xs uppercase tracking-[0.22em]" style={{ color }}>
                      {toResourceHeader(c.resourceType)}
                    </div>
                    <div className="mt-2 text-xl font-semibold" style={{ color }}>
                      {c.value}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-sm" style={{ color: 'rgba(214, 230, 255, 0.75)' }}>
              Затраты не указаны.
            </div>
          )}
        </div>
      </div>

      {(enhancementInfo.freeEffectIds.size > 0 || enhancementInfo.intoleranceEffectIds.size > 0) ? (
        <>
          <FancyDivider theme={theme} className="mt-3" />
          <div className="mt-3 space-y-1 text-left">
            {(() => {
              const byId = new Map(curSpellEffects.map((e) => [e.id, e]));
              const orderByEffect = (ids: Set<string>) =>
                Array.from(ids)
                  .map((id) => ({ id, num: byId.get(id)?.num_eff ?? 0 }))
                  .sort((a, b) => a.num - b.num)
                  .map((x) => x.id);
              const freeLines = orderByEffect(enhancementInfo.freeEffectIds).map((id) => {
                const effect = byId.get(id);
                const desc = (effect?.description ?? '').toString().trim();
                const cost = enhancementInfo.freeEffectCosts.get(id) ?? 0;
                const suffix = desc ? ` - ${desc}` : '';
                const actionText = pluralizeRu(cost, 'свободное действие', 'свободных действия', 'свободных действий');
                return `За ${cost} ${actionText}${suffix}`;
              });
              const intoleranceLines = orderByEffect(enhancementInfo.intoleranceEffectIds).map((id) => {
                const effect = byId.get(id);
                const desc = (effect?.description ?? '').toString().trim();
                const cost = enhancementInfo.intoleranceEffectCosts.get(id) ?? 0;
                const suffix = desc ? ` - ${desc}` : '';
                const tokenText = pluralizeRu(cost, 'жетон нетерпимости', 'жетона нетерпимости', 'жетонов нетерпимости');
                return `За ${cost} ${tokenText}${suffix}`;
              });
              return [...freeLines, ...intoleranceLines].map((line, idx) => (
                <div
                  key={`enh-line-${idx}`}
                  className="text-[19px] font-semibold leading-relaxed"
                  style={{
                    background: 'linear-gradient(180deg, #f4dc9a 0%, #e7c47a 45%, #c79f4f 100%)',
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                    color: 'transparent',
                    textShadow: '0 2px 12px rgba(0,0,0,0.75)',
                  }}
                >
                  {line}
                </div>
              ));
            })()}
          </div>
        </>
      ) : null}
    </>
  );

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

      <div className="grid items-stretch gap-0" style={{ gridTemplateColumns: `320px 1fr` }}>
        <div className="relative pr-6" style={{ width: 320 }}>
          <div
            className="overflow-hidden rounded-t-2xl"
            style={{
              ...glassPanel,
              width: ART_CARD_WIDTH,
              boxShadow: `0 22px 58px rgba(0,0,0,0.52), 0 0 46px ${theme.glowSoft}, 0 0 14px ${theme.glow}, inset 0 0 0 1px rgba(255,255,255,0.06)`,
            }}
          >
            <div className="relative aspect-[9/16] w-full">
              {schoolArtUrl && !schoolArtFailed ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={schoolArtUrl}
                  alt={curSchool?.name ?? 'Magic school'}
                  className="absolute inset-0 h-full w-full object-cover"
                  draggable={false}
                  onError={() => setSchoolArtFailed(true)}
                  style={{
                    filter: getSchoolArtFilter(mode),
                    transition: 'filter 420ms ease, transform 420ms ease, opacity 420ms ease',
                  }}
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center px-6 text-center">{upper(curSchool?.name) || 'НЕТ АРТА'}</div>
              )}
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    'linear-gradient(120deg, rgba(140,160,190,0.22) 0%, rgba(50,60,80,0.08) 45%, rgba(10,14,25,0.46) 100%)',
                  opacity: getFadeOverlayOpacity('school', mode),
                  transition: 'opacity 420ms ease',
                }}
              />
            </div>
          </div>

          {mode !== 'school' ? (
            <div className="absolute top-0" style={{ left: shiftStep, width: ART_CARD_WIDTH }}>
              <div className="overflow-hidden rounded-b-2xl" style={glassPanel}>
                <div className="relative aspect-[9/16] w-full">
                  {pathArtUrl && !pathArtFailed ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={pathArtUrl}
                      alt={curPath?.name ?? 'Magic path'}
                      className="absolute inset-0 h-full w-full object-cover"
                      draggable={false}
                      onError={() => setPathArtFailed(true)}
                      style={{
                        filter: getPathArtFilter(mode),
                        transition: 'filter 420ms ease, transform 420ms ease, opacity 420ms ease',
                      }}
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center px-6 text-center">{upper(curPath?.name) || 'НЕТ АРТА'}</div>
                  )}
                  <div
                    className="pointer-events-none absolute inset-0"
                    style={{
                      background:
                        'linear-gradient(120deg, rgba(140,160,190,0.20) 0%, rgba(50,60,80,0.06) 45%, rgba(10,14,25,0.4) 100%)',
                      opacity: getFadeOverlayOpacity('path', mode),
                      transition: 'opacity 420ms ease',
                    }}
                  />
                </div>
              </div>
            </div>
          ) : null}

          {mode === 'spells' ? (
            <div className="absolute top-0" style={{ left: shiftStep * 2, width: ART_CARD_WIDTH }}>
              <div className="overflow-hidden rounded-b-2xl" style={glassPanel}>
                <div className="relative aspect-[9/16] w-full">
                  {spellArtUrl && !spellArtFailed ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={spellArtUrl}
                      alt={curSpell?.name ?? 'Spell'}
                      className="absolute inset-0 h-full w-full object-cover"
                      draggable={false}
                      onError={() => setSpellArtFailed(true)}
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center px-6 text-center">{upper(curSpell?.name) || 'НЕТ АРТА'}</div>
                  )}
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <div className="relative flex h-full flex-col gap-2" style={{ minHeight: ART_CARD_HEIGHT, marginLeft: currentShift }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ArrowButton
                dir="left"
                onClick={goPrev}
                tint={theme.glowSoft}
                disabled={mode === 'spells' ? spellDeck.length <= 1 : mode === 'paths' ? curSchoolPaths.length <= 1 : schoolItems.length <= 1}
              />
              <ArrowButton
                dir="right"
                onClick={goNext}
                tint={theme.glowSoft}
                disabled={mode === 'spells' ? spellDeck.length <= 1 : mode === 'paths' ? curSchoolPaths.length <= 1 : schoolItems.length <= 1}
              />
            </div>

            <div className="flex items-center gap-3">
              {mode === 'school' ? (
                <TopPillButton
                  label="К ПУТЯМ"
                  theme={theme}
                  onClick={() => {
                    setMode('paths');
                    setPathIdx(0);
                  }}
                />
              ) : mode === 'paths' ? (
                <>
                  <TopPillButton
                    label="К ШКОЛЕ МАГИИ"
                    theme={theme}
                    onClick={() => {
                      setMode('school');
                      setPathIdx(0);
                    }}
                  />
                  <TopPillButton
                    label="К ЗАКЛИНАНИЯМ"
                    theme={theme}
                    onClick={() => {
                      setMode('spells');
                      setSpellIdx(0);
                      setSpellTab('general');
                      setSpellLevelByName({});
                    }}
                  />
                </>
              ) : (
                <TopPillButton
                  label="К ПУТЯМ"
                  theme={theme}
                  onClick={() => {
                    setMode('paths');
                  }}
                />
              )}
            </div>
          </div>

        <div className="relative flex-1">
          <div className="relative h-full overflow-hidden rounded-2xl px-6 py-5" style={glassPanel}>
            <div className="relative">
              {mode === 'spells' ? (
                <div className="flex items-center justify-between gap-4">
                  <div
                    style={{
                      fontFamily: 'var(--font-title)',
                      fontSize: 30,
                      lineHeight: 1.1,
                      letterSpacing: '0.10em',
                      textTransform: 'uppercase',
                      color: theme.main,
                      textAlign: 'left',
                    }}
                  >
                    {title}
                  </div>
                  <div className="flex shrink-0 flex-col items-center gap-2">
                    <div
                      className="font-semibold uppercase tracking-[0.28em]"
                      style={{
                        color: 'rgba(231,196,122,0.95)',
                        textShadow: '0 0 10px rgba(231,196,122,0.45)',
                        fontSize: 20,
                      }}
                    >
                      УРОВЕНЬ
                    </div>
                    <div className="flex items-center gap-2">
                      <LevelArrowArtButton dir="left" onClick={() => switchLevel(-1)} disabled={!canSwitchLevel} />
                      <div
                        className="min-w-[36px] text-center text-xl font-semibold"
                        style={{ color: '#e7c47a', textShadow: '0 0 12px rgba(231,196,122,0.65)' }}
                      >
                        {selectedSpellLevel}
                      </div>
                      <LevelArrowArtButton dir="right" onClick={() => switchLevel(1)} disabled={!canSwitchLevel} />
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  className="text-center"
                  style={{
                    fontFamily: 'var(--font-title)',
                    fontSize: 30,
                    lineHeight: 1.1,
                    letterSpacing: '0.10em',
                    textTransform: 'uppercase',
                    color: theme.main,
                  }}
                >
                  {title}
                </div>
              )}

              <FancyDivider theme={theme} className="mt-2" />

              {mode === 'paths' ? (
                <>
                  {direction ? (
                    <div className="mt-2 text-center text-sm uppercase tracking-[0.26em]" style={{ color: 'rgba(225,240,255,0.72)' }}>
                      ОСНОВНАЯ ПРЕДРАСПОЛОЖЕННОСТЬ: <span style={{ color: theme.main }}>{upper(direction)}</span>
                    </div>
                  ) : null}
                  {reqTalent ? (
                    <div className="mt-2 text-center text-sm uppercase tracking-[0.26em]" style={{ color: 'rgba(225,240,255,0.72)' }}>
                      ОСНОВНАЯ ХАРАКТЕРИСТИКА/ТАЛАНТ: <span style={{ color: theme.main }}>{reqTalent}</span>
                    </div>
                  ) : null}
                  {(direction || reqTalent) ? <FancyDivider theme={theme} className="mt-2" /> : null}
                </>
              ) : null}

              {mode === 'spells' ? (
                <div className="mt-4">{spellTab === 'general' ? spellGeneralPanel : renderSpellAttacks()}</div>
              ) : (
                <div className="mt-3">
                  {mainText ? (
                    <div style={{ color: 'rgba(235, 245, 255, 0.92)', fontSize: 18, lineHeight: 1.7, whiteSpace: 'pre-line' }}>{mainText}</div>
                  ) : (
                    <div style={{ color: 'rgba(214, 230, 255, 0.75)' }}>
                      {mode === 'paths' ? 'Описание пути появится позже.' : 'Описание школы появится позже.'}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          {mode === 'spells' ? (
            <div className="absolute -right-12 top-0">
              {spellTabPanel}
            </div>
          ) : null}
          {iconTooltip.visible ? (
            <div
              className="pointer-events-none fixed z-[2000] max-w-[240px] rounded-lg border px-3 py-2 text-[15px]"
              style={{
                left: iconTooltip.x,
                top: iconTooltip.y,
                background: 'rgba(10, 14, 24, 0.92)',
                borderColor: 'rgba(231,196,122,0.75)',
                color: 'rgba(245, 228, 186, 0.95)',
                boxShadow: '0 10px 24px rgba(0,0,0,0.45)',
                backdropFilter: 'blur(8px)',
              }}
            >
              {iconTooltip.text}
            </div>
          ) : null}
        </div>

          {!schoolItems.length ? (
            <div className="rounded-2xl px-6 py-5" style={glassPanel}>
              <div style={{ color: 'rgba(235, 245, 255, 0.80)' }}>В таблице <b>magic_school</b> пока нет записей.</div>
            </div>
          ) : null}

          {mode !== 'school' && curSchool && curSchoolPaths.length === 0 ? (
            <div className="rounded-2xl px-6 py-5" style={glassPanel}>
              <div style={{ color: 'rgba(235, 245, 255, 0.80)' }}>
                Для школы <b>{curSchool.name ?? '—'}</b> пока нет путей в таблице <b>magic_path</b>.
              </div>
            </div>
          ) : null}

          {mode === 'spells' && curPath && spellDeck.length === 0 ? (
            <div className="rounded-2xl px-6 py-5" style={glassPanel}>
              <div style={{ color: 'rgba(235, 245, 255, 0.80)' }}>
                Для пути <b>{curPath.name ?? '—'}</b> пока нет заклинаний в таблице <b>spells</b>.
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}










"use client";

import React from "react";
import type { RaceSkill } from "../types";
import { renderRichText } from "@/lib/ui/richText";

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

export default function SkillsSection({
  raceSkills,
  skillIndex,
  setSkillIndex,
}: {
  raceSkills: RaceSkill[] | null | undefined;
  skillIndex: number;
  setSkillIndex: (i: number) => void;
}) {
  const sorted = [...(raceSkills ?? [])].sort(
    (a, b) => (a.skillNum ?? 0) - (b.skillNum ?? 0)
  );

  const safeIndex =
    sorted.length === 0 ? 0 : Math.min(Math.max(skillIndex, 0), sorted.length - 1);

  const activeSkill = sorted[safeIndex];

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

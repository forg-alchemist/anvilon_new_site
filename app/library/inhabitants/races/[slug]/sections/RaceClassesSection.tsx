"use client";

import React, { useEffect, useMemo, useState } from "react";
import { getPublicStorageUrl } from "@/lib/supabase/publicUrl";
import { TextBlock } from "./_shared";
import { renderRichText } from "@/lib/ui/richText";
import type { GameClassWithSkills, ClassSkill } from "@/lib/data/classes";

function toUpperSafe(s?: string | null) {
  return (s ?? "").toUpperCase();
}

function getClassName(item: GameClassWithSkills): string {
  const direct = (item.name ?? "").trim();
  if (direct) return direct;

  const ru = ((item as any).name_ru ?? "").toString().trim();
  if (ru) return ru;

  const en = ((item as any).name_en ?? "").toString().trim();
  if (en) return en;

  return item.slug_class;
}

function getClassDescription(item: GameClassWithSkills): string {
  const direct = (item.description ?? "").toString().trim();
  if (direct) return direct;

  const ru = ((item as any).description_ru ?? "").toString().trim();
  if (ru) return ru;

  const en = ((item as any).description_en ?? "").toString().trim();
  if (en) return en;

  return "";
}

function normalizeSkills(skills: ClassSkill[], classKey: string): ClassSkill[] {
  const base = (skills ?? []).slice(0, 4);
  while (base.length < 4) {
    base.push({
      id: `placeholder-${classKey}-${base.length}`,
      created_at: "",
      slug_class: classKey,
      name_skill: "Скоро",
      description: "Этот навык пока пустой — заполним позже.",
      artPath: "",
    });
  }
  return base;
}


function ClassSkillsBlock({
  classKey,
  skills,
}: {
  classKey: string;
  skills: ClassSkill[];
}) {
  const list = useMemo(() => normalizeSkills(skills, classKey), [skills, classKey]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex(0);
  }, [classKey]);

  const active = list[activeIndex];

  // Цвета/эффекты — как в “Расовые навыки”
  const ink = "rgba(235, 245, 255, 0.92)";
  const inkSoft = "rgba(214, 230, 255, 0.75)";
  const goldLine = "rgba(244, 214, 123, 0.38)";
  const goldSoft = "rgba(244, 214, 123, 0.20)";

  return (
    <div className="mt-6">
      {/* Tabs */}
      <div className="px-6 -mb-[1px]">
        <div className="flex w-full gap-0 overflow-x-hidden">
          {list.map((s, i) => {
            const isActive = i === activeIndex;
            return (
              <button
                key={`${classKey}:${s.id}:${i}`}
                type="button"
                onClick={() => setActiveIndex(i)}
                className="flex-1 min-w-0 rounded-t-[18px] rounded-b-[6px] border px-3 py-2 transition"
                style={{
                  borderColor: isActive ? goldLine : "rgba(255,255,255,0.10)",
                  background: isActive
                    ? `
                      radial-gradient(140% 140% at 50% 0%, ${goldSoft}, rgba(0,0,0,0) 62%),
                      linear-gradient(180deg, rgba(0,0,0,0.52), rgba(0,0,0,0.22))
                    `
                    : "rgba(0,0,0,0.22)",
                  boxShadow: isActive
                    ? `0 10px 24px rgba(0,0,0,0.55), 0 0 18px ${goldSoft}`
                    : "0 10px 22px rgba(0,0,0,0.40)",
                  backdropFilter: "blur(10px)",
                }}
                title={s.name_skill}
              >
                <span
                  style={{
                    fontFamily: "var(--font-buttons)",
                    fontSize: "clamp(10px, 0.9vw, 12px)",
                    textTransform: "uppercase",
                    letterSpacing: "0.18em",
                    color: isActive ? ink : inkSoft,
                    textShadow: isActive
                      ? `0 0 12px ${goldSoft}, 0 2px 14px rgba(0,0,0,0.85)`
                      : "0 2px 12px rgba(0,0,0,0.8)",
                    display: "block",
                    textAlign: "center",
                    whiteSpace: "normal",
                    lineHeight: 1.15,
                  }}
                >
                  {toUpperSafe(s.name_skill)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Panel */}
      <div
        className="overflow-hidden rounded-[28px] border"
        style={{
          borderColor: goldLine,
          boxShadow:
            `0 30px 60px rgba(0,0,0,.35), 0 0 22px ${goldSoft}, inset 0 1px 0 rgba(255,255,255,.18)`,
        }}
      >
        <div className="flex items-stretch gap-0">
          {/* Art (как в Расовые навыки: фиксированная ширина, не 9:16) */}
          <div className="w-[180px] bg-black/35">
            <div className="h-full w-full">
              {active.artPath ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={active.artPath}
                  alt={active.name_skill}
                  className="h-full w-full object-cover"
                  draggable={false}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs text-white/45">
                  Нет арта
                </div>
              )}
            </div>
          </div>

          <div
            className="w-[1px]"
            style={{
              background:
                "linear-gradient(180deg, rgba(255,255,255,0), rgba(255,255,255,.20), rgba(255,255,255,0))",
              opacity: 0.55,
            }}
          />

          <div
            className="flex-1 bg-gradient-to-br from-[#2f91c9]/45 via-[#1b2230]/60 to-[#6a4b8b]/45 px-6 py-6"
            style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,.12)" }}
          >

            <div className="mt-3">
              {active.description ? (
                <div
                  style={{
                    color: "rgba(235, 245, 255, 0.90)",
                    fontSize: 18,
                    lineHeight: 1.65,
                    whiteSpace: "pre-line",
                  }}
                >
                  {renderRichText(active.description)}
                </div>
              ) : (
                <div className="text-sm text-white/45">Нет описания</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RaceClassesSection({
  classes,
  activeId,
}: {
  classes: GameClassWithSkills[];
  activeId: string | null;
}) {
  if (!classes || classes.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 text-white/75">
        Этот раздел пока пустой — заполним позже.
      </div>
    );
  }

  const active =
    classes.find((c) => c.id === activeId) ??
    classes[0];

  const artUrl = active.art_path
    ? getPublicStorageUrl(active.bucket ?? "art", active.art_path)
    : "";

  const goldLight = "rgba(244, 214, 123, 0.92)";
  const goldDark = "rgba(194, 151, 64, 0.95)";
  const cyan = "rgba(125, 211, 252, 0.92)";
  const red = "rgba(251, 113, 133, 0.92)";

  const initValue =
    active.initiative === null || active.initiative === undefined || active.initiative === ""
      ? "-"
      : String(active.initiative);

  const req = active.req_talent ? toUpperSafe(active.req_talent) : "-";
  const activeName = getClassName(active);
  const activeDescription = getClassDescription(active);

  return (
    <div>
      {/* ✅ ВЕРХНИЙ БЛОК — РОВНО КАК БЫЛО */}
      <div className="grid gap-6 lg:gap-8 lg:grid-cols-[320px_1fr] items-start">
        {/* ART 9:16 */}
        <div className="w-full">
          <div
            className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/25"
            style={{ boxShadow: "0 18px 50px rgba(0,0,0,0.45)", backdropFilter: "blur(10px)" }}
          >
            <div className="aspect-[9/16] w-full">
              {artUrl ? (
                <img
                  src={artUrl}
                  alt={activeName}
                  className="h-full w-full object-cover"
                  draggable={false}
                />
              ) : (
                <div className="h-full w-full bg-white/[0.04]" />
              )}
            </div>
          </div>
        </div>

        {/* INFO */}
        <div className="flex flex-col gap-5">
          <div
            className="rounded-2xl border border-white/10 bg-black/25 p-5"
            style={{ boxShadow: "0 18px 50px rgba(0,0,0,0.45)", backdropFilter: "blur(10px)" }}
          >
            <div
              style={{
                fontFamily: "var(--font-buttons)",
                fontSize: 14,
                textTransform: "uppercase",
                letterSpacing: "0.22em",
                color: goldDark,
                textShadow: "0 2px 16px rgba(0,0,0,0.85)",
              }}
            >
              ИНИЦИАТИВА: <span style={{ color: goldLight }}>{initValue}</span>
            </div>

            <div className="mt-3 h-[1px] w-full" style={{ background: "rgba(255,255,255,0.10)" }} />

            <div
              className="mt-3"
              style={{
                fontFamily: "var(--font-buttons)",
                fontSize: 14,
                textTransform: "uppercase",
                letterSpacing: "0.22em",
                color: cyan,
                textShadow: "0 2px 16px rgba(0,0,0,0.85)",
              }}
            >
              ТРЕБОВАНИЯ: <span style={{ color: red }}>{req} 7</span>
            </div>
          </div>

          <TextBlock text={activeDescription} />
        </div>
      </div>

      {/* ✅ НАВЫКИ КЛАССА — ОТДЕЛЬНЫМ БЛОКОМ НИЖЕ */}
      <ClassSkillsBlock classKey={active.slug_class} skills={active.skills ?? []} />
    </div>
  );
}

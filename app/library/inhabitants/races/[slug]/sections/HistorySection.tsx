"use client";

import React from "react";
import type { RaceHistorySection } from "@/lib/data/raceHistory";
import { SubHeader, TextBlock } from "./_shared";

type Chapter = {
  id: string;
  header: string;
  index: number;
  slug_head: string;
  epoch: string | null;
  start_year: number | null;
  end_year: number | null;
};

function formatEpochLabel(
  epoch: string | null,
  start: number | null,
  end: number | null
) {
  if (!epoch && start == null && end == null) return null;

  const years =
    start != null && end != null
      ? `${start}-${end}`
      : start != null
        ? `${start}`
        : end != null
          ? `${end}`
          : "";

  const spacer = epoch && years ? " " : "";
  const tail = years ? " гг" : "";
  return `${epoch ?? ""}${spacer}${years}${tail}`.trim();
}

/**
 * История:
 * - type=chapter => вкладки (как в "О расе")
 * - type=section => заголовки внутри выбранного chapter
 * - тексты приходят из history по slug_head (и для chapter, и для section)
 */
export default function HistorySection({
  history,
}: {
  history: RaceHistorySection[];
}) {
  const goldSoft = "rgba(244, 214, 123, 0.20)";
  const ink = "rgba(235, 245, 255, 0.92)";
  const inkSoft = "rgba(214, 230, 255, 0.75)";

  const chapters: Chapter[] = React.useMemo(() => {
    return history
      .filter((b) => b.head.type === "chapter")
      .map((b) => ({
        id: b.head.id,
        header: b.head.header,
        index: b.head.index ?? 0,
        slug_head: b.head.slug_head,
        epoch: b.head.epoch ?? null,
        start_year: b.head.start_year ?? null,
        end_year: b.head.end_year ?? null,
      }))
      .sort((a, b) => a.index - b.index);
  }, [history]);

  const [activeChapterId, setActiveChapterId] = React.useState<string | null>(
    chapters[0]?.id ?? null
  );

  // при первой загрузке (или при смене slug) зафиксируем первый chapter
  React.useEffect(() => {
    if (!activeChapterId && chapters.length > 0) {
      setActiveChapterId(chapters[0].id);
    }
  }, [activeChapterId, chapters]);

  const activeChapter = React.useMemo(() => {
    return chapters.find((c) => c.id === activeChapterId) ?? chapters[0] ?? null;
  }, [chapters, activeChapterId]);

  const chapterBlock = React.useMemo(() => {
    if (!activeChapter) return null;
    return history.find((b) => b.head.id === activeChapter.id) ?? null;
  }, [history, activeChapter]);

  const sections = React.useMemo(() => {
    if (!activeChapter) return [];
    // section принадлежит chapter по chapter_index
    // у chapter chapter_index = null, у section = номер главы
    const chapterIndex = activeChapter.index;

    return history
      .filter((b) => b.head.type === "section")
      .filter((b) => (b.head.chapter_index ?? null) === chapterIndex)
      .sort((a, b) => (a.head.index ?? 0) - (b.head.index ?? 0));
  }, [history, activeChapter]);

  return (
    <div className="flex flex-col gap-8">
      {/* Вкладки глав — копия стилей из "О расе" */}
      {chapters.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {chapters.map((c) => {
            const active = activeChapter?.id === c.id;

            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setActiveChapterId(c.id)}
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
                  {c.header}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Инфо по главе (epoch + годы) — как вводный текст */}
      {activeChapter && (
        <div className="text-sm text-white/55">
          {formatEpochLabel(
            activeChapter.epoch,
            activeChapter.start_year,
            activeChapter.end_year
          )}
        </div>
      )}

      {/* Текст главы (если есть в history по slug_head главы) */}
      {chapterBlock && chapterBlock.entries.length > 0 && (
        <div className="flex flex-col gap-4">
          {chapterBlock.entries.map((e) => (
            <TextBlock key={e.id} text={e.description} />
          ))}
        </div>
      )}

      {/* Section внутри главы */}
      {sections.map((sec) => {
        const label = formatEpochLabel(
          sec.head.epoch ?? null,
          sec.head.start_year ?? null,
          sec.head.end_year ?? null
        );

        return (
          <div key={sec.head.id} className="flex flex-col gap-3">
            <div>
              <SubHeader title={sec.head.header} />
              {label && <div className="mt-2 text-sm text-white/55">{label}</div>}
            </div>

            <div className="flex flex-col gap-4">
              {sec.entries.map((e) => (
                <TextBlock key={e.id} text={e.description} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
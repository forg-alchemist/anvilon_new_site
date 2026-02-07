"use client";

import { useMemo, useState } from "react";

type VersionChangelogButtonProps = {
  version: string;
  dateLabel: string;
  changelog: string;
};

function parseChangelog(changelog: string): Array<{ type: "heading" | "list" | "text"; value: string | string[] }> {
  const lines = changelog.split(/\r?\n/);
  const blocks: Array<{ type: "heading" | "list" | "text"; value: string | string[] }> = [];
  let listBuffer: string[] = [];

  const flushList = () => {
    if (listBuffer.length > 0) {
      blocks.push({ type: "list", value: listBuffer });
      listBuffer = [];
    }
  };

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    const trimmed = line.trim();

    if (!trimmed) {
      flushList();
      continue;
    }

    if (trimmed.startsWith("### ")) {
      flushList();
      blocks.push({ type: "heading", value: trimmed.slice(4) });
      continue;
    }

    if (trimmed.startsWith("- ")) {
      listBuffer.push(trimmed.slice(2));
      continue;
    }

    if (line.startsWith("  ") && listBuffer.length > 0) {
      listBuffer[listBuffer.length - 1] = `${listBuffer[listBuffer.length - 1]} ${trimmed}`;
      continue;
    }

    flushList();
    blocks.push({ type: "text", value: trimmed });
  }

  flushList();
  return blocks;
}

export function VersionChangelogButton({ version, dateLabel, changelog }: VersionChangelogButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const blocks = useMemo(() => parseChangelog(changelog), [changelog]);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-3 right-4 z-40 rounded border border-white/15 bg-black/25 px-3 py-1.5 text-[11px] tracking-[0.08em] text-white/75 backdrop-blur-sm transition hover:border-white/30 hover:bg-black/35"
      >
        <span>alpha build v.</span>
        <span
          className="font-semibold"
          style={{ color: "#e66b6b", textShadow: "0 0 10px rgba(230,107,107,0.35)" }}
        >
          {version}
        </span>
        <span> from </span>
        <span
          className="font-semibold"
          style={{
            background: "linear-gradient(180deg, #f4dc9a 0%, #e7c47a 45%, #c79f4f 100%)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
            textShadow: "0 2px 12px rgba(0,0,0,0.5)",
          }}
        >
          {dateLabel}
        </span>
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-[200] bg-black/70 p-4 backdrop-blur-sm" onClick={() => setIsOpen(false)}>
          <div
            className="mx-auto mt-[8vh] w-full max-w-3xl rounded-2xl border border-[#e7c47a]/30 bg-[#0b1020]/95 shadow-[0_20px_70px_rgba(0,0,0,0.55)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <div className="text-base font-semibold text-[#f1d78d]">{`Журнал изменений v.${version}`}</div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg border border-white/15 px-3 py-1.5 text-sm text-white/80 transition hover:border-white/30 hover:bg-white/5 hover:text-white"
              >
                Закрыть
              </button>
            </div>

            <div className="max-h-[70vh] space-y-3 overflow-y-auto px-5 py-4">
              {blocks.length === 0 ? (
                <p className="text-sm text-white/70">Записи для этой версии пока отсутствуют.</p>
              ) : (
                blocks.map((block, index) => {
                  if (block.type === "heading") {
                    return (
                      <h3 key={`h-${index}`} className="pt-1 text-sm font-semibold uppercase tracking-[0.08em] text-[#e7c47a]">
                        {String(block.value)}
                      </h3>
                    );
                  }
                  if (block.type === "list") {
                    return (
                      <ul key={`l-${index}`} className="list-disc space-y-1 pl-5 text-sm leading-relaxed text-white/90">
                        {(block.value as string[]).map((item, itemIndex) => (
                          <li key={`li-${index}-${itemIndex}`}>{item}</li>
                        ))}
                      </ul>
                    );
                  }
                  return (
                    <p key={`p-${index}`} className="text-sm leading-relaxed text-white/85">
                      {String(block.value)}
                    </p>
                  );
                })
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

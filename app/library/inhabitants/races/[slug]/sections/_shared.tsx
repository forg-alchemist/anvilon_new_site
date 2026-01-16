"use client";

import React from "react";
import { renderRichText } from "@/lib/ui/richText";

export function SubHeader({ title }: { title: string }) {
  const gold = "rgba(244, 214, 123, 0.85)";
  const goldSoft = "rgba(244, 214, 123, 0.25)";

  return (
    // Space below the heading so it doesn't stick to the next block.
    // Use padding instead of margin to avoid margin-collapsing edge cases.
    <div className="pt-1 pb-4">
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

export function TagsRow({ tags }: { tags?: string[] }) {
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

export function TextBlock({ text }: { text?: string | null }) {
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

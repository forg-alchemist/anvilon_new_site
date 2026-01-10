import React from "react";

type StyleKey =
  | "gold_b" | "gold_i" | "gold_bi"
  | "blue_b" | "blue_i" | "blue_bi"
  | "red_b" | "red_i" | "red_bi"
  | "orange_b" | "orange_i" | "orange_bi"
  | "green_b" | "green_i" | "green_bi";

const STYLES: Record<StyleKey, string> = {
  // GOLD — сакральное, элита
  gold_b:  "font-bold text-[#f4d67b]",
  gold_i:  "italic text-[#e8c96a]",
  gold_bi: "font-bold italic text-[#f6dd8f]",

  // BLUE — магия, интеллект
  blue_b:  "font-bold text-[#9cc7ff]",
  blue_i:  "italic text-[#86b6ff]",
  blue_bi: "font-bold italic text-[#b2d6ff]",

  // RED — кровь, ненависть
  red_b:   "font-bold text-[#ff9a9a]",
  red_i:   "italic text-[#ff7f7f]",
  red_bi:  "font-bold italic text-[#ffb3b3]",

  // ORANGE — энергия, ремесло
  orange_b:  "font-bold text-[#ffbe78]",
  orange_i:  "italic text-[#ffab55]",
  orange_bi: "font-bold italic text-[#ffd09a]",

  // GREEN — жизнь, природа
  green_b:  "font-bold text-[#9fe0b2]",
  green_i:  "italic text-[#87cfa0]",
  green_bi: "font-bold italic text-[#b8f0c8]",
};

// Формат разметки:
// {{gold_b|text}}, {{blue_i|text}}, {{red_bi|text}} и т.д.
// Всё остальное — обычный текст.
export function renderRichText(input: string): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  const re = /\{\{([a-z_]+)\|([\s\S]*?)\}\}/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = re.exec(input)) !== null) {
    const [full, style, text] = match;
    const start = match.index;

    // обычный текст до выделения
    if (start > lastIndex) {
      out.push(
        <React.Fragment key={`t-${key++}`}>
          {input.slice(lastIndex, start)}
        </React.Fragment>
      );
    }

    const className =
      STYLES[style as StyleKey] ?? "font-semibold";

    out.push(
      <span key={`s-${key++}`} className={className}>
        {text}
      </span>
    );

    lastIndex = start + full.length;
  }

  // хвост
  if (lastIndex < input.length) {
    out.push(
      <React.Fragment key={`t-${key++}`}>
        {input.slice(lastIndex)}
      </React.Fragment>
    );
  }

  return out;
}

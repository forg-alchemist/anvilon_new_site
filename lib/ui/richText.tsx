import React from "react";

type StyleKey = "gold" | "blue";

const STYLES: Record<StyleKey, string> = {
  gold: "font-semibold text-[#d6b25e]", // золото
  blue: "font-semibold text-[#78a6ff]", // холодный синий (можешь поменять)
};

// Формат: {{gold|text}} или {{blue|text}}
// Всё остальное — обычный текст.
export function renderRichText(input: string): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  const re = /\{\{(gold|blue)\|([\s\S]*?)\}\}/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = re.exec(input)) !== null) {
    const [full, style, text] = match;
    const start = match.index;

    // обычный текст до выделения
    if (start > lastIndex) {
      out.push(<React.Fragment key={`t-${key++}`}>{input.slice(lastIndex, start)}</React.Fragment>);
    }

    // выделенный фрагмент
    const className = STYLES[style as StyleKey] ?? "font-semibold";
    out.push(
      <span key={`s-${key++}`} className={className}>
        {text}
      </span>
    );

    lastIndex = start + full.length;
  }

  // хвост
  if (lastIndex < input.length) {
    out.push(<React.Fragment key={`t-${key++}`}>{input.slice(lastIndex)}</React.Fragment>);
  }

  return out;
}

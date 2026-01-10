// lib/races/sectionRules.ts
import type { InsertRule, RaceRules, RaceSectionRule } from "./raceSections";

/**
 * Универсальные секции (есть у ВСЕХ рас).
 * Здесь же задаём статус «Скоро» для общих, но ещё не реализованных разделов.
 */
const UNIVERSAL_SECTIONS: RaceSectionRule[] = [
  { key: "about", label: "О РАСЕ" },
  { key: "skills", label: "РАСОВЫЕ НАВЫКИ" },
  { key: "map", label: "КАРТА ВЛАДЕНИЙ" },

  // Общие разделы для всех рас (пока закрыты)
  { key: "history", label: "ИСТОРИЯ РАСЫ", comingSoon: true },
  { key: "religion", label: "РЕЛИГИЯ", comingSoon: true },
];

/**
 * Точечные уникальные секции по slug.
 * ВАЖНО: это НЕ заменяет универсальные секции, а вставляет/добавляет поверх.
 */
const INSERTIONS: Record<string, InsertRule[]> = {
  // Высший эльф: уникальный раздел «Великие дома» идёт после «Расовые навыки»
  "high-elf": [
    {
      after: "skills",
      section: { key: "houses", label: "ВЕЛИКИЕ ДОМА"},
    },
  ],

  // Лунный эльф: уникальные разделы после «Расовые навыки»
  "moon-elf": [
    {
      after: "skills",
      section: { key: "moon-clans", label: "РОДА ЛУННЫХ ЭЛЬФОВ", comingSoon: true },
    },
    {
      after: "moon-clans",
      section: { key: "legendary-squads", label: "ЛЕГЕНДАРНЫЕ ОТРЯДЫ", comingSoon: true },
    },
  ],

  // Лесной эльф: уникальный раздел после «Расовые навыки»
  "wood-elf": [
    {
      after: "skills",
      section: { key: "institutions", label: "ВАЖНЫЕ СОЦИАЛЬНЫЕ ИНСТИТУТЫ", comingSoon: true },
    },
  ],
};

function applyInsertions(
  base: RaceSectionRule[],
  insertions: InsertRule[] | undefined
): RaceSectionRule[] {
  if (!insertions || insertions.length === 0) return base;

  // Работаем на копии
  const result = [...base];

  // Вставки применяем по порядку их объявления
  for (const ins of insertions) {
    const idx = result.findIndex((s) => s.key === ins.after);
    if (idx === -1) {
      // если after не найден — добавим в конец (но такое лучше не допускать)
      result.push(ins.section);
      continue;
    }

    // Не вставляем дубликаты
    if (result.some((s) => s.key === ins.section.key)) continue;

    result.splice(idx + 1, 0, ins.section);
  }

  return result;
}

export function getRaceSectionsForSlug(slug: string): RaceRules {
  const base = UNIVERSAL_SECTIONS;

  const withInserts = applyInsertions(base, INSERTIONS[slug]);

  return { sections: withInserts };
}

// lib/races/raceSections.ts
/**
 * Секции страницы расы:
 * - есть универсальные (общие для всех рас)
 * - есть точечные вставки/исключения для конкретных slug
 */

export type RaceSectionKey =
  | "about"
  | "skills"
  | "r_classes"
  | "map"
  | "houses"
  | "history"
  | "religion"
  | (string & {});

export type RaceSectionRule = {
  /** Ключ раздела */
  key: RaceSectionKey;

  /** Текст на кнопке раздела */
  label: string;

  /** Раздел отображается, но недоступен (плашка «Скоро») */
  comingSoon?: boolean;

  /** (Опционально) внутренний заголовок секции в контенте */
  title?: string;
};

export type RaceRules = {
  sections: RaceSectionRule[];
};

export type InsertRule = {
  /** Вставить после какого ключа (в рамках базового списка) */
  after: RaceSectionKey;
  section: RaceSectionRule;
};

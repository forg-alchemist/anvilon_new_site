// Spell migration dictionary (client-side helpers)
//
// Keeps all resource cost rules in one place and provides conversion
// from UI selections to numeric values for migration.

export type Level = 1 | 2 | 3 | 4 | 5;

export type ResourceResolutionResult =
  | { ok: true; value: number }
  | { ok: false; error: string };

type LevelArray = [number, number, number, number, number];

type DualManaHealth = {
  kind: "dual_mana_health";
  mana: LevelArray;
  health: LevelArray;
};

type RuleValue = number | LevelArray | DualManaHealth;

const isLevel = (n: number): n is Level => n >= 1 && n <= 5 && Number.isInteger(n);

const pickLevel = (arr: LevelArray, lvl: Level): number => arr[lvl - 1];

/**
 * Canonical resource type names (UI labels).
 * We match by substring to be tolerant to minor wording tweaks.
 */
const isManaType = (resourceTypeName: string) =>
  /ман/i.test(resourceTypeName) && !/здоров/i.test(resourceTypeName);

const isHealthType = (resourceTypeName: string) =>
  /здоров/i.test(resourceTypeName) || /хп/i.test(resourceTypeName);

/**
 * Resource cost rules based on your sheet (levels 1..5).
 *
 * Notes:
 * - For labels with "двойные затраты" we store two arrays: mana/health.
 * - For fixed-cost labels (жетоны/свободные действия) we store a constant.
 * - "Без затрат" always resolves to 0.
 */
export const RESOURCE_COST_RULES: Record<string, RuleValue> = {
  // Universal
  "Без затрат": [0, 0, 0, 0, 0],

  // Mana (single)
  "Заклинание ученика": [8, 11, 14, 17, 20],
  "Заклинание мастера": [24, 28, 32, 36, 40],
  "Заклинание грандмастера": [50, 55, 60, 65, 70],
  "Заклинание эксперта": [80, 85, 90, 95, 100],

  // Mana skill concentration
  "Концентрация навыка": [10, 20, 30, 40, 50],

  // Health skill cost
  "Затраты жизни навыка": [10, 20, 30, 40, 50],

  // Dual costs (mana/health) - apprentice..expert
  "Заклинание ученика двойные затраты": {
    kind: "dual_mana_health",
    mana: [4, 6, 7, 9, 10],
    health: [4, 5, 7, 8, 10],
  },
  "Заклинание мастера двойные затраты": {
    kind: "dual_mana_health",
    mana: [12, 14, 16, 18, 20],
    health: [12, 14, 16, 18, 20],
  },
  "Заклинание грандмастера двойные затраты": {
    kind: "dual_mana_health",
    mana: [25, 28, 30, 33, 35],
    health: [25, 27, 30, 32, 35],
  },
  "Заклинание эксперта двойные затраты": {
    kind: "dual_mana_health",
    mana: [40, 43, 45, 48, 50],
    health: [40, 42, 45, 47, 50],
  },

  // Cooldowns / recovery time (level-based)
  "Длительность стойки": [2, 3, 4, 5, 6],
  "Время восстановления навыка": [1, 2, 3, 4, 5],

  // Tokens / free actions (fixed)
  "Половинные затраты жетонов": 1,
  "Полные затраты жетонов": 2,
  "Сверхзатраты жетонов": 3,
};

/**
 * Resolve numeric resource_value from:
 * - resource type name (UI label)
 * - chosen cost label (UI label from list)
 * - level (1..5)
 * - optional custom input (string), which overrides list selection
 *
 * Rules:
 * - Custom input wins.
 * - For dual labels (A/B) the picked number depends on resourceTypeName:
 *   - if type == mana -> pick mana part
 *   - if type == health -> pick health part
 */
export function resolveResourceValue(params: {
  resourceTypeName: string;
  costLabel: string;
  level: number;
  customValue?: string | null;
}): ResourceResolutionResult {
  const { resourceTypeName, costLabel, level, customValue } = params;

  // Custom overrides everything
  const rawCustom = (customValue ?? "").trim();
  if (rawCustom.length) {
    const num = Number(rawCustom);
    if (!Number.isFinite(num) || !Number.isInteger(num)) {
      return { ok: false, error: `Некорректное число в ручном вводе: "${rawCustom}"` };
    }
    return { ok: true, value: num };
  }

  if (!isLevel(level)) {
    return { ok: false, error: `Некорректный уровень (должен быть 1-5): ${level}` };
  }
  const lvl = level as Level;

  const rule = RESOURCE_COST_RULES[costLabel];
  if (!rule) {
    return { ok: false, error: `Неизвестный вариант затрат ресурса: "${costLabel}"` };
  }

  if (typeof rule === "number") {
    return { ok: true, value: rule };
  }

  if (Array.isArray(rule)) {
    return { ok: true, value: pickLevel(rule as LevelArray, lvl) };
  }

  // Dual mana/health
  if (rule.kind === "dual_mana_health") {
    if (isManaType(resourceTypeName)) {
      return { ok: true, value: pickLevel(rule.mana, lvl) };
    }
    if (isHealthType(resourceTypeName)) {
      return { ok: true, value: pickLevel(rule.health, lvl) };
    }
    return {
      ok: false,
      error:
        `Двойные затраты поддерживают только типы "Затраты маны" или "Затраты здоровья". ` +
        `Сейчас выбран тип: "${resourceTypeName}"`,
    };
  }

  return { ok: false, error: "Не удалось определить затраты ресурса." };
}

/**
 * Normalizes spell name: first character uppercase (Russian-friendly).
 */
export function normalizeSpellName(value: string): string {
  const v = String(value ?? "");
  if (!v) return v;
  return v.charAt(0).toUpperCase() + v.slice(1);
}

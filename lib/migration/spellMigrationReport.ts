// Spell migration report builder (client-side).
//
// Collects UI state, generates deterministic IDs, resolves resource values
// via the dictionary module, can output a human-readable text report,
// and can submit rows into Supabase tables.

import { supabase } from "@/lib/supabaseClient";
import { normalizeSpellName, resolveResourceValue } from "./spellMigrationDict";

export type Uuid = string;

export type CatalogLabelById = Record<string, string>;

type ConditionRow = {
  // catalogs_book.id (group=conditions)
  conditionId: string;
  // required only for "Специальные условия"
  description?: string;
};

type EffectBlockInput = {
  // UI-local id
  id: string;
  isCritical: boolean;

  attackDistanceKind: string;
  targetType: string;
  targetKind: string;
  attackDistanceValue: string;
  targetValuePrim: string;
  targetValueSec: string;
  attackType: string;
  attackDirection: string;
  coveringAttack: boolean;
  coveringAttackHigh: string;

  impactType: string;
  impactDuration: string;
  impactValue: string;
  potencyResist: string;

  effectType: string;
  effectDuration: string;
  effectValue: string;

  depTalent: string;
  moveType: string;
  moveValue: string;
  concentration: string;
  resourceType: string;
  resourceCost: string;

  replaceImpactOrEffect: string;
  addImpactOrEffect: string;

  description: string;

  conditions: ConditionRow[];
};

type SpellResourceRowInput = {
  id: string;
  resourceTypeId: string;
  resourceCostId: string; // label from fallback list
  resourceCostCustom: string;
};

export type SpellBuilderStateForMigration = {
  spellName: string;
  spellDescription: string;
  spellLevel: number;
  spellTargetValuePrim: number;
  spellTargetValueSec: number;
  spellDuration: number;
  selectedPathId: string;
  talentExceptionId: string;

  spellResources: SpellResourceRowInput[];
  effects: EffectBlockInput[];

  catalogLabelById: CatalogLabelById;
};

type MigrationSpellsRow = {
  id: Uuid;
  name: string;
  description: string;
  lvl: number;
  id_path: Uuid;
  exc_talent: Uuid | null;
  target_value_prim: number;
  target_value_sec: number;
  duration: number;
};

type MigrationEffectRow = {
  id: Uuid;
  id_spell_skill: Uuid;
  num_eff: number;

  crit_check: boolean;
  attack_category: string;
  type_target: string;
  attack_focus: string;
  attack_distance: number;
  target_value_prim: number;
  target_value_sec: number;
  attack_type: string | null;
  direction_attack: string | null;
  covering_attack: boolean;
  covering_attack_high: number | null;

  impact: string;
  impact_value: number | null;
  impact_duration: number;
  potency_resist: string | null;

  effect: string | null;
  effect_value: number | null;
  effect_duration: number;

  move_type: string | null;
  move_type_value: number;
  concentration: string | null;

  dep_talent: Uuid | null;
  replace_imp_eff: Uuid | null;
  add_imp_eff: Uuid | null;
  description: string | null;
};

type MigrationConditionRow = {
  id: Uuid;
  id_eff: Uuid;
  condition: string; // catalogs_book.name
  description: string | null;
  type: "spell" | "spell_impact";
};

type MigrationResourceRow = {
  id: Uuid;
  id_spell_skill: Uuid;
  resource_type: string; // catalogs_book.name
  resource_value: number;
  type: "spell" | "spell_impact";
};

export type MigrationPayload = {
  spells: MigrationSpellsRow;
  skill_spell_attack: MigrationEffectRow[];
  conditions: MigrationConditionRow[];
  spell_skill_resource: MigrationResourceRow[];
  errors: string[];
};

function uuid(): Uuid {
  // Browser: crypto.randomUUID, fallback for older runtimes.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const c: any = (globalThis as any).crypto;
  if (c?.randomUUID) return c.randomUUID();
  // simple fallback (not cryptographically strong)
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (ch) => {
    const r = (Math.random() * 16) | 0;
    const v = ch === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function toIntOrZero(v: string): number {
  const n = Number(String(v ?? "").trim());
  if (!Number.isFinite(n)) return 0;
  return Math.trunc(n);
}

function toNumericOrNull(v: string): number | null {
  const s = String(v ?? "").trim();
  if (!s) return null;
  const n = Number(s);
  if (!Number.isFinite(n)) return null;
  return n;
}

function asNullableUuid(v: string): Uuid | null {
  const s = String(v ?? "").trim();
  return s ? s : null;
}

function labelById(map: CatalogLabelById, id: string): string {
  return map[String(id)] ?? String(id ?? "");
}

function labelByIdOrNull(map: CatalogLabelById, id: string): string | null {
  const s = String(id ?? "").trim();
  if (!s) return null;
  return map[s] ?? s;
}

function isSpecialConditionLabel(label: string): boolean {
  return label === "Специальные условия" || label === "special_condit";
}

function isNoConditionsLabel(label: string): boolean {
  return label === "Нет условий" || label === "no_conditions";
}

export function buildMigrationPayload(state: SpellBuilderStateForMigration): MigrationPayload {
  const errors: string[] = [];

  const spellId = uuid();

  const spellsRow: MigrationSpellsRow = {
    id: spellId,
    name: normalizeSpellName(state.spellName.trim()),
    description: state.spellDescription ?? "",
    lvl: state.spellLevel,
    id_path: state.selectedPathId as Uuid,
    exc_talent: state.talentExceptionId ? (state.talentExceptionId as Uuid) : null,
    target_value_prim: toIntOrZero(state.spellTargetValuePrim),
    target_value_sec: toIntOrZero(state.spellTargetValueSec),
    duration: toIntOrZero(state.spellDuration),
  };

  if (!spellsRow.name) errors.push("[spells] Не заполнено: Название заклинания");
  if (!spellsRow.id_path) errors.push("[spells] Не заполнено: Путь магии");
  if (!(spellsRow.lvl >= 1 && spellsRow.lvl <= 5)) errors.push("[spells] Некорректный уровень (1-5)");
  if (!spellsRow.description) {
    // Description is allowed to be empty; keep as warning style (not error)
  }

  // Resources
  const resourceRows: MigrationResourceRow[] = [];
  for (const r of state.spellResources ?? []) {
    const typeName = labelById(state.catalogLabelById, r.resourceTypeId);
    const costLabel = String(r.resourceCostId ?? "");
    const res = resolveResourceValue({
      resourceTypeName: typeName,
      costLabel,
      level: state.spellLevel,
      customValue: r.resourceCostCustom,
    });

    if (!res.ok) {
      errors.push(`[spell_skill_resource] ${typeName}: ${res.error}`);
      continue;
    }

    resourceRows.push({
      id: uuid(),
      id_spell_skill: spellId,
      resource_type: typeName,
      resource_value: res.value,
      type: "spell",
    });
  }

  if (!resourceRows.length) {
    errors.push("[spell_skill_resource] Должна быть минимум 1 строка ресурса");
  }

  // Effects + conditions
  const effectRows: MigrationEffectRow[] = [];
  const conditionRows: MigrationConditionRow[] = [];

  (state.effects ?? []).forEach((e, idx) => {
    const effId = uuid();

    const attackDistance = toIntOrZero(e.attackDistanceValue);
    const targetValuePrim = toIntOrZero(e.targetValuePrim);
    const targetValueSec = toIntOrZero(e.targetValueSec);
    const impactDuration = toIntOrZero(e.impactDuration);
    const effectDuration = toIntOrZero(e.effectDuration);
    const moveValue = toIntOrZero(e.moveValue);
    const effectResourceType = labelByIdOrNull(state.catalogLabelById, e.resourceType);
    let effectResourceValue: number | null = null;
    if (effectResourceType && String(e.resourceCost ?? "").trim()) {
      const effectRes = resolveResourceValue({
        resourceTypeName: effectResourceType,
        costLabel: String(e.resourceCost ?? ""),
        level: state.spellLevel,
      });
      if (effectRes.ok) {
        effectResourceValue = effectRes.value;
      } else {
        errors.push(`[skill_spell_attack] Эффект ${idx + 1}: ${effectRes.error}`);
      }
    }

    const row: MigrationEffectRow = {
      id: effId,
      id_spell_skill: spellId,
      num_eff: idx + 1,

      crit_check: !!e.isCritical,
      attack_category: labelById(state.catalogLabelById, e.attackDistanceKind),
      type_target: labelById(state.catalogLabelById, e.targetType),
      attack_focus: labelById(state.catalogLabelById, e.targetKind),
      attack_distance: attackDistance,
      target_value_prim: targetValuePrim,
      target_value_sec: targetValueSec,
      attack_type: labelByIdOrNull(state.catalogLabelById, e.attackType),
      direction_attack: labelByIdOrNull(state.catalogLabelById, e.attackDirection),
      covering_attack: !!e.coveringAttack,
      covering_attack_high: e.coveringAttack ? toIntOrZero(e.coveringAttackHigh) : null,

      impact: labelById(state.catalogLabelById, e.impactType),
      impact_value: toNumericOrNull(e.impactValue),
      impact_duration: impactDuration,
      potency_resist: labelByIdOrNull(state.catalogLabelById, e.potencyResist),

      effect: labelByIdOrNull(state.catalogLabelById, e.effectType),
      effect_value: toNumericOrNull(e.effectValue),
      effect_duration: effectDuration,

      move_type: labelByIdOrNull(state.catalogLabelById, e.moveType),
      move_type_value: moveValue,
      concentration: labelByIdOrNull(state.catalogLabelById, e.concentration),

      dep_talent: asNullableUuid(e.depTalent),
      replace_imp_eff: asNullableUuid(e.replaceImpactOrEffect),
      add_imp_eff: asNullableUuid(e.addImpactOrEffect),
      description: String(e.description ?? "").trim() || null,
    };

    // Required (red fields from your sheet):
    if (!e.attackDistanceKind) errors.push(`[skill_spell_attack] Эффект ${idx + 1}: не заполнено "Дистанция атаки"`);
    if (!e.targetType) errors.push(`[skill_spell_attack] Эффект ${idx + 1}: не заполнено "Тип цели"`);
    if (!e.targetKind) errors.push(`[skill_spell_attack] Эффект ${idx + 1}: не заполнено "Вид цели"`);
    if (!e.impactType) errors.push(`[skill_spell_attack] Эффект ${idx + 1}: не заполнено "Тип воздействия"`);

    effectRows.push(row);
    if (effectResourceType && effectResourceValue !== null) {
      resourceRows.push({
        id: uuid(),
        id_spell_skill: effId,
        resource_type: effectResourceType,
        resource_value: effectResourceValue,
        type: "spell_impact",
      });
    }

    // Conditions: must be 1+ row; default is "Нет условий" in UI.
    const conds = Array.isArray(e.conditions) && e.conditions.length ? e.conditions : [];
    if (!conds.length) {
      errors.push(`[conditions] Эффект ${idx + 1}: нет ни одного условия (ожидается минимум 1)`);
    }

    for (const c of conds) {
      const label = labelById(state.catalogLabelById, c.conditionId);

      if (isSpecialConditionLabel(label)) {
        const desc = String(c.description ?? "").trim();
        if (!desc) {
          errors.push(`[conditions] Эффект ${idx + 1}: "Специальные условия" требуют описание`);
        }
        conditionRows.push({
          id: uuid(),
          id_eff: effId,
          condition: label,
          description: desc || null,
          type: "spell_impact",
        });
        continue;
      }

      // "Нет условий" — разрешено только как единственное условие (на уровне UI это поддерживается).
      if (isNoConditionsLabel(label)) {
        conditionRows.push({
          id: uuid(),
          id_eff: effId,
          condition: label,
          description: null,
          type: "spell_impact",
        });
        continue;
      }

      conditionRows.push({
        id: uuid(),
        id_eff: effId,
        condition: label,
        description: null,
        type: "spell_impact",
      });
    }
  });

  if (!effectRows.length) {
    errors.push("[skill_spell_attack] Должен быть минимум 1 эффект");
  }

  return {
    spells: spellsRow,
    skill_spell_attack: effectRows,
    conditions: conditionRows,
    spell_skill_resource: resourceRows,
    errors,
  };
}

function toSqlLiteral(value: unknown): string {
  if (value === null || value === undefined) return "NULL";
  if (typeof value === "number") return Number.isFinite(value) ? String(value) : "NULL";
  if (typeof value === "boolean") return value ? "TRUE" : "FALSE";
  const s = String(value).replace(/'/g, "''");
  return `'${s}'`;
}

function buildInsertSql(table: string, rows: Array<Record<string, unknown>>): string {
  if (!rows.length) return `-- ${table}: no rows`;

  const columns = Object.keys(rows[0]);
  const values = rows
    .map((row) => `(${columns.map((col) => toSqlLiteral(row[col])).join(", ")})`)
    .join(",\n");

  return `INSERT INTO ${table} (${columns.join(", ")})\nVALUES\n${values};`;
}

export function buildMigrationReport(state: SpellBuilderStateForMigration): string {
  const payload = buildMigrationPayload(state);

  const now = new Date();
  const sections: string[] = [
    "SPELL MIGRATION SIMULATION (DB-SHAPED)",
    `generated_at: ${now.toISOString()}`,
    "",
    buildInsertSql("spells", [payload.spells as unknown as Record<string, unknown>]),
    "",
    buildInsertSql("spell_skill_resource", payload.spell_skill_resource as unknown as Array<Record<string, unknown>>),
    "",
    buildInsertSql("skill_spell_attack", payload.skill_spell_attack as unknown as Array<Record<string, unknown>>),
    "",
    buildInsertSql("conditions", payload.conditions as unknown as Array<Record<string, unknown>>),
    "",
    "[validation]",
  ];

  if (payload.errors.length) {
    sections.push("  status: FAIL");
    payload.errors.forEach((e) => sections.push(`  - ${e}`));
  } else {
    sections.push("  status: OK");
  }

  return sections.join("\n") + "\n";
}

export function downloadTextReport(filename: string, content: string): void {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();

  // Cleanup
  setTimeout(() => URL.revokeObjectURL(url), 2500);
}

function formatUnknownSubmitError(error: unknown): string {
  if (error instanceof Error) return error.message || "Unknown error";
  if (!error || typeof error !== "object") return String(error);

  const obj = error as Record<string, unknown>;
  const parts: string[] = [];

  if (typeof obj.stage === "string" && obj.stage.trim()) {
    parts.push(`stage=${obj.stage}`);
  }
  if (typeof obj.code === "string" && obj.code.trim()) {
    parts.push(`code=${obj.code}`);
  }
  if (typeof obj.message === "string" && obj.message.trim()) {
    parts.push(obj.message);
  }
  if (typeof obj.details === "string" && obj.details.trim()) {
    parts.push(`details=${obj.details}`);
  }
  if (typeof obj.hint === "string" && obj.hint.trim()) {
    parts.push(`hint=${obj.hint}`);
  }

  if (obj.error) {
    const nested = formatUnknownSubmitError(obj.error);
    if (nested && nested !== "[object Object]") {
      parts.push(`cause=${nested}`);
    }
  }

  if (parts.length) return parts.join(" | ");

  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
}

export async function runSpellMigrationToDb(
  state: SpellBuilderStateForMigration
): Promise<{ ok: boolean; errors: string[]; spellId?: string }> {
  const payload = buildMigrationPayload(state);
  if (payload.errors.length) return { ok: false, errors: payload.errors };

  const spellId = payload.spells.id;
  let spellInserted = false;
  let effectsInserted = false;
  let resourcesInserted = false;
  let conditionsInserted = false;

  try {
    const { error: spellError } = await supabase.from("spells").insert(payload.spells);
    if (spellError) throw { stage: "spells.insert", error: spellError };
    spellInserted = true;

    if (payload.skill_spell_attack.length) {
      const { error } = await supabase.from("skill_spell_attack").insert(payload.skill_spell_attack);
      if (error) throw { stage: "skill_spell_attack.insert", error };
      effectsInserted = true;
    }

    if (payload.spell_skill_resource.length) {
      const { error } = await supabase.from("spell_skill_resource").insert(payload.spell_skill_resource);
      if (error) throw { stage: "spell_skill_resource.insert", error };
      resourcesInserted = true;
    }

    if (payload.conditions.length) {
      const { error } = await supabase.from("conditions").insert(payload.conditions);
      if (error) throw { stage: "conditions.insert", error };
      conditionsInserted = true;
    }

    return { ok: true, errors: [], spellId };
  } catch (e) {
    const message = formatUnknownSubmitError(e);
    const conditionIds = payload.conditions.map((c) => c.id);
    const resourceIds = payload.spell_skill_resource.map((r) => r.id);

    // Best-effort rollback for partially inserted payload.
    try {
      if (conditionsInserted && conditionIds.length) await supabase.from("conditions").delete().in("id", conditionIds);
    } catch {}
    try {
      if (resourcesInserted && resourceIds.length) await supabase.from("spell_skill_resource").delete().in("id", resourceIds);
    } catch {}
    try {
      if (effectsInserted) await supabase.from("skill_spell_attack").delete().eq("id_spell_skill", spellId);
    } catch {}
    try {
      if (spellInserted) await supabase.from("spells").delete().eq("id", spellId);
    } catch {}

    return { ok: false, errors: [`[submit] ${message}`] };
  }
}

export async function runSpellMigrationReport(state: SpellBuilderStateForMigration): Promise<{ ok: boolean; errors: string[] }> {
  const report = buildMigrationReport(state);
  const payload = buildMigrationPayload(state);

  const safeName = (normalizeSpellName(state.spellName || "spell") || "spell").replace(/[^0-9a-zA-Zа-яА-Я_-]+/g, "_");
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filename = `spell_migration__${safeName}__${stamp}.txt`;

  downloadTextReport(filename, report);

  return { ok: payload.errors.length === 0, errors: payload.errors };
}


import { supabase } from "@/lib/supabaseClient";

export type MagicSpell = {
  id: string;
  created_at: string | null;
  id_path: string | null;
  name: string | null;
  description: string | null;
  lvl: number | null;
  bucket: string | null;
  art_path: string | null;
  target_value_prim: number | null;
  target_value_sec: number | null;
  duration: number | null;
};

export type SpellResourceRow = {
  id_spell_skill: string | null;
  resource_type: string | null;
  resource_value: number | null;
  type: string | null;
};

export type SpellConditionRow = {
  id: string;
  id_eff: string | null;
  condition: string | null;
  description: string | null;
  type: string | null;
};

export type SpellEffectRow = {
  id: string;
  id_spell_skill: string | null;
  num_eff: number | null;
  crit_check: boolean | null;
  description?: string | null;
  attack_category: string | null;
  type_target: string | null;
  attack_focus: string | null;
  attack_distance: number | null;
  target_value_prim: number | null;
  target_value_sec: number | null;
  attack_type: string | null;
  direction_attack: string | null;
  covering_attack: boolean | null;
  covering_attack_high: number | null;
  impact: string | null;
  impact_value: number | null;
  impact_duration: number | null;
  potency_resist: string | null;
  effect: string | null;
  effect_value: number | null;
  effect_duration: number | null;
  move_type: string | null;
  move_type_value: number | null;
  concentration: string | null;
  dep_talent: string | null;
  replace_imp_eff: string | null;
  add_imp_eff: string | null;
};

export async function getMagicSpells(): Promise<MagicSpell[]> {
  const { data, error } = await supabase.from("spells").select("*").order("created_at", { ascending: true });

  if (error) {
    console.error("getMagicSpells error", error);
    return [];
  }

  return ((data ?? []) as Array<Record<string, unknown>>).map((row) => ({
    id: String(row.id ?? ""),
    created_at: row.created_at ? String(row.created_at) : null,
    id_path: row.id_path ? String(row.id_path) : null,
    name: row.name ? String(row.name) : null,
    description: row.description ? String(row.description) : null,
    lvl: typeof row.lvl === "number" ? row.lvl : Number(row.lvl ?? 0),
    bucket: row.bucket ? String(row.bucket) : null,
    art_path: row.art_path ? String(row.art_path) : null,
    target_value_prim: typeof row.target_value_prim === "number" ? row.target_value_prim : Number(row.target_value_prim ?? 0),
    target_value_sec: typeof row.target_value_sec === "number" ? row.target_value_sec : Number(row.target_value_sec ?? 0),
    duration: typeof row.duration === "number" ? row.duration : Number(row.duration ?? 0),
  }));
}

export async function getSpellResources(): Promise<SpellResourceRow[]> {
  const { data, error } = await supabase.from("spell_skill_resource").select("id_spell_skill, resource_type, resource_value, type");

  if (error) {
    console.error("getSpellResources error", error);
    return [];
  }

  return ((data ?? []) as Array<Record<string, unknown>>).map((row) => ({
    id_spell_skill: row.id_spell_skill ? String(row.id_spell_skill) : null,
    resource_type: row.resource_type ? String(row.resource_type) : null,
    resource_value: typeof row.resource_value === "number" ? row.resource_value : Number(row.resource_value ?? 0),
    type: row.type ? String(row.type) : null,
  }));
}

export async function getSpellConditions(): Promise<SpellConditionRow[]> {
  const { data, error } = await supabase.from("conditions").select("id, id_eff, condition, description, type");

  if (error) {
    console.error("getSpellConditions error", error);
    return [];
  }

  return ((data ?? []) as Array<Record<string, unknown>>).map((row) => ({
    id: String(row.id ?? ""),
    id_eff: row.id_eff ? String(row.id_eff) : null,
    condition: row.condition ? String(row.condition) : null,
    description: row.description ? String(row.description) : null,
    type: row.type ? String(row.type) : null,
  }));
}

export async function getSpellEffects(): Promise<SpellEffectRow[]> {
  const { data, error } = await supabase
    .from("skill_spell_attack")
    .select("*")
    .order("num_eff", { ascending: true });

  if (error) {
    console.error("getSpellEffects error", error);
    return [];
  }

  return ((data ?? []) as Array<Record<string, unknown>>).map((row) => ({
    id: String(row.id ?? ""),
    id_spell_skill: row.id_spell_skill ? String(row.id_spell_skill) : null,
    num_eff: typeof row.num_eff === "number" ? row.num_eff : Number(row.num_eff ?? 0),
    crit_check: typeof row.crit_check === "boolean" ? row.crit_check : Boolean(row.crit_check ?? false),
    description: (row as Record<string, unknown>).description ? String((row as Record<string, unknown>).description) : null,
    attack_category: row.attack_category ? String(row.attack_category) : null,
    type_target: row.type_target ? String(row.type_target) : null,
    attack_focus: row.attack_focus ? String(row.attack_focus) : null,
    attack_distance: typeof row.attack_distance === "number" ? row.attack_distance : Number(row.attack_distance ?? 0),
    target_value_prim: typeof row.target_value_prim === "number" ? row.target_value_prim : Number(row.target_value_prim ?? 0),
    target_value_sec: typeof row.target_value_sec === "number" ? row.target_value_sec : Number(row.target_value_sec ?? 0),
    attack_type: row.attack_type ? String(row.attack_type) : null,
    direction_attack: row.direction_attack ? String(row.direction_attack) : null,
    covering_attack: typeof row.covering_attack === "boolean" ? row.covering_attack : Boolean(row.covering_attack ?? false),
    covering_attack_high: typeof row.covering_attack_high === "number" ? row.covering_attack_high : Number(row.covering_attack_high ?? 0),
    impact: row.impact ? String(row.impact) : null,
    impact_value: typeof row.impact_value === "number" ? row.impact_value : Number(row.impact_value ?? 0),
    impact_duration: typeof row.impact_duration === "number" ? row.impact_duration : Number(row.impact_duration ?? 0),
    potency_resist: row.potency_resist ? String(row.potency_resist) : null,
    effect: row.effect ? String(row.effect) : null,
    effect_value: typeof row.effect_value === "number" ? row.effect_value : Number(row.effect_value ?? 0),
    effect_duration: typeof row.effect_duration === "number" ? row.effect_duration : Number(row.effect_duration ?? 0),
    move_type: row.move_type ? String(row.move_type) : null,
    move_type_value: typeof row.move_type_value === "number" ? row.move_type_value : Number(row.move_type_value ?? 0),
    concentration: row.concentration ? String(row.concentration) : null,
    dep_talent: row.dep_talent ? String(row.dep_talent) : null,
    replace_imp_eff: row.replace_imp_eff ? String(row.replace_imp_eff) : null,
    add_imp_eff: row.add_imp_eff ? String(row.add_imp_eff) : null,
  }));
}


import { getSupabaseServerClient } from "@/lib/supabase/server";

/* =========================
   Types
========================= */

export interface GameClass {
  id: string;
  created_at: string;

  slug: string;

  // В твоей БД это поле есть — трактуем как "группа/принадлежность",
  // НЕ как "это расовый класс". Просто метка/категория.
  slug_class: string | null;

  bucket: string | null;
  art_path: string | null;

  name: string;
  initiative: string | null;

  req_talent_slug: string | null;
  req_talent: string | null;

  description: string | null;
}

export interface ClassSkill {
  id: string;
  created_at: string;

  // По твоей схеме class_skill.slug_class — это связь с class.slug
  slug_class: string;

  name_skill: string;

  bucket: string | null;
  art_path: string | null;

  description: string | null;
}

export interface GameClassWithSkills extends GameClass {
  skills: ClassSkill[];
}

export type GetClassesOptions = {
  /**
   * Фильтр по принадлежности (например, раса/ветка/категория),
   * если ты используешь slug_class как группировку.
   */
  groupSlug?: string;

  /**
   * Если true — не тянуть навыки (иногда полезно для списков).
   * По умолчанию false.
   */
  noSkills?: boolean;
};

/* =========================
   Helpers
========================= */

function sortByInitiative(a: GameClass, b: GameClass) {
  // initiative у тебя text — иногда может быть NULL или не число
  const ai =
    a.initiative && !Number.isNaN(Number(a.initiative))
      ? Number(a.initiative)
      : Number.POSITIVE_INFINITY;

  const bi =
    b.initiative && !Number.isNaN(Number(b.initiative))
      ? Number(b.initiative)
      : Number.POSITIVE_INFINITY;

  return ai - bi;
}

/* =========================
   Data access
========================= */

/**
 * Все классы + все их навыки (если noSkills=false).
 */
export async function getAllClassesWithSkills(): Promise<GameClassWithSkills[]> {
  return getClassesWithSkills({});
}

/**
 * Классы с опциональным фильтром по groupSlug (= class.slug_class)
 * и опциональным отключением навыков.
 */
export async function getClassesWithSkills(
  options: GetClassesOptions
): Promise<GameClassWithSkills[]> {
  const supabase = getSupabaseServerClient();

  // 1) Классы
  let q = supabase.from("class").select("*");

  if (options.groupSlug) {
    q = q.eq("slug_class", options.groupSlug);
  }

  const { data: classes, error: classesError } = await q;

  if (classesError) {
    console.error("getClassesWithSkills / class:", classesError);
    return [];
  }

  if (!classes || classes.length === 0) return [];

  const sortedClasses = [...classes].sort(sortByInitiative);

  // Если навыки не нужны — отдаём пустыми массивами
  if (options.noSkills) {
    return sortedClasses.map((cls) => ({ ...cls, skills: [] }));
  }

  // 2) Навыки: по твоей схеме class_skill.slug_class ссылается на class.slug
  const classSlugs = sortedClasses.map((c) => c.slug);

  const { data: skills, error: skillsError } = await supabase
    .from("class_skill")
    .select("*")
    .in("slug_class", classSlugs);

  if (skillsError) {
    console.error("getClassesWithSkills / class_skill:", skillsError);
    // классы отдадим даже если навыки не пришли
    return sortedClasses.map((cls) => ({ ...cls, skills: [] }));
  }

  const safeSkills = skills ?? [];

  // 3) Склейка
  return sortedClasses.map((cls) => ({
    ...cls,
    skills: safeSkills.filter((s) => s.slug_class === cls.slug),
  }));
}

/**
 * Один класс по slug + его навыки.
 */
export async function getClassBySlugWithSkills(
  classSlug: string
): Promise<GameClassWithSkills | null> {
  const supabase = getSupabaseServerClient();

  const { data: cls, error: classError } = await supabase
    .from("class")
    .select("*")
    .eq("slug", classSlug)
    .maybeSingle();

  if (classError) {
    console.error("getClassBySlugWithSkills / class:", classError);
    return null;
  }

  if (!cls) return null;

  const { data: skills, error: skillsError } = await supabase
    .from("class_skill")
    .select("*")
    .eq("slug_class", cls.slug);

  if (skillsError) {
    console.error("getClassBySlugWithSkills / class_skill:", skillsError);
    return { ...cls, skills: [] };
  }

  return { ...cls, skills: skills ?? [] };
}

import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getPublicStorageUrl } from "@/lib/supabase/publicUrl";

export interface GameClass {
  id: string;
  created_at: string;
  slug: string;
  slug_class: string;

  bucket: string | null;
  art_path: string | null;

  name: string;
  initiative: string | number | null;

  req_talent_slug: string | null;
  req_talent: string | null;

  description: string | null;
}

export interface ClassSkillRow {
  id: string;
  created_at: string;
  slug_class: string;
  name_skill: string | null;
  /** В БД это поле называется description (НЕ description_skill) */
  description: string | null;
  art_path: string | null;
  bucket: string | null;
}

export interface ClassSkill {
  id: string;
  created_at: string;
  slug_class: string;
  name_skill: string;
  description: string;
  artPath: string;
}

export interface GameClassWithSkills extends GameClass {
  skills: ClassSkill[];
}

function logSupabaseError(prefix: string, err: any) {
  try {
    console.error(prefix, {
      message: err?.message,
      details: err?.details,
      hint: err?.hint,
      code: err?.code,
      raw: err,
    });
  } catch {
    console.error(prefix, err);
  }
}

export async function getRaceClassesWithSkills(
  raceSlug: string
): Promise<GameClassWithSkills[]> {
  const supabase = getSupabaseServerClient();

  const { data: classesRaw, error: classErr } = await supabase
    .from("class")
    .select("*")
    .eq("slug", raceSlug)
    .order("created_at", { ascending: true });

  if (classErr) {
    logSupabaseError("getRaceClassesWithSkills / class:", classErr);
    return [];
  }

  const classes = (classesRaw ?? []).filter(
    (c: any) => c?.slug_class && c.slug_class !== "unidentified"
  ) as any[];

  if (classes.length === 0) return [];

  const classKeys = classes
    .map((c) => String(c.slug_class || ""))
    .filter(Boolean);

  // 1) реальные навыки
  const { data: skillsRaw, error: skillErr } = await supabase
    .from("class_skill")
    .select("id, created_at, slug_class, name_skill, description, art_path, bucket")
    .in("slug_class", classKeys)
    .order("created_at", { ascending: true });

  if (skillErr) logSupabaseError("getRaceClassesWithSkills / class_skill (real):", skillErr);

  // 2) шаблон заглушки
  const { data: placeholderRaw, error: placeholderErr } = await supabase
    .from("class_skill")
    .select("id, created_at, slug_class, name_skill, description, art_path, bucket")
    .eq("slug_class", "unidentified")
    .order("created_at", { ascending: true })
    .limit(1);

  if (placeholderErr)
    logSupabaseError("getRaceClassesWithSkills / class_skill (unidentified):", placeholderErr);

  const mappedReal = (skillsRaw ?? []).map((row: ClassSkillRow) => ({
    id: row.id,
    created_at: row.created_at,
    slug_class: row.slug_class,
    name_skill: row.name_skill ?? "",
    description: row.description ?? "",
    artPath: getPublicStorageUrl(row.bucket, row.art_path),
  })) as ClassSkill[];

  const placeholderTemplate =
    (placeholderRaw?.[0]
      ? ({
          id: placeholderRaw[0].id,
          created_at: placeholderRaw[0].created_at,
          slug_class: "unidentified",
          name_skill: placeholderRaw[0].name_skill ?? "",
          description: (placeholderRaw[0] as any).description ?? "",
          artPath: getPublicStorageUrl(placeholderRaw[0].bucket, placeholderRaw[0].art_path),
        } as ClassSkill)
      : null);

  return classes.map((c: any) => {
    const out = mappedReal.filter((s) => s.slug_class === c.slug_class).slice(0, 4);

    while (out.length < 4) {
      const idx = out.length;
      if (placeholderTemplate) {
        out.push({
          ...placeholderTemplate,
          id: `placeholder-${c.slug_class}-${idx}`,
          slug_class: c.slug_class,
        });
      } else {
        out.push({
          id: `placeholder-${c.slug_class}-${idx}`,
          created_at: "",
          slug_class: c.slug_class,
          name_skill: "Скоро",
          description: "Этот навык пока пустой — заполним позже.",
          artPath: "",
        });
      }
    }

    return { ...c, skills: out };
  });
}

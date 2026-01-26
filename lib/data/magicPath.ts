import { supabase } from "@/lib/supabaseClient";

export type MagicPath = {
  id: string;
  created_at: string;
  id_magic_school: string | null;
  path_slug: string | null;
  name: string | null;
  bucket: string | null;
  art_path: string | null;
  description: string | null;
  direction: string | null;
  req_talent: string | null;
};

export async function getMagicPaths(): Promise<MagicPath[]> {
  const { data, error } = await supabase
    .from("magic_path")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("getMagicPaths error", error);
    return [];
  }

  return (data ?? []) as MagicPath[];
}

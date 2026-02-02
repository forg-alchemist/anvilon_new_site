import { supabase } from "@/lib/supabaseClient";

export type TalentRow = {
  id: string;
  created_at: string;
  name: string | null;
  description: string | null;
  id_stat: string | null;
  bucket: string | null;
  art_path: string | null;
};

/**
 * Public read for the talents reference table.
 * Requires RLS policy + GRANT SELECT for anon/authenticated.
 */
export async function getTalents(): Promise<TalentRow[]> {
  const { data, error } = await supabase
    .from("talents")
    .select("id,created_at,name,description,id_stat,bucket,art_path")
    .order("created_at", { ascending: true });

  if (error) {
    // Surface the issue so the UI can show it.
    throw error;
  }

  return (data ?? []) as TalentRow[];
}

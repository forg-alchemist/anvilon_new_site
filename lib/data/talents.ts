import { supabase } from "@/lib/supabaseClient";
import type { PostgrestError } from "@supabase/supabase-js";

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
 * Read talents reference table from `handbook` schema.
 * Temporary fallback to `public` is kept to avoid hard failures
 * while PostgREST exposed schemas are being updated.
 */
export async function getTalents(): Promise<TalentRow[]> {
  const selectColumns = "id,created_at,name,description,id_stat,bucket,art_path";

  const fromHandbook = await supabase
    .schema("handbook")
    .from("talents")
    .select(selectColumns)
    .order("created_at", { ascending: true });

  if (!fromHandbook.error) {
    return (fromHandbook.data ?? []) as TalentRow[];
  }

  const isInvalidSchema = fromHandbook.error.code === "PGRST106";
  if (!isInvalidSchema) {
    throw fromHandbook.error;
  }

  // Fallback path until `character` is exposed in Supabase API settings.
  const fromPublic = await supabase
    .from("talents")
    .select(selectColumns)
    .order("created_at", { ascending: true });

  if (fromPublic.error) {
    const err = fromPublic.error as PostgrestError;
    if (err.code === "PGRST205" || err.code === "42P01") {
      // Table is absent in public schema after migration; keep UI alive.
      return [];
    }
    throw fromPublic.error;
  }

  return (fromPublic.data ?? []) as TalentRow[];
}

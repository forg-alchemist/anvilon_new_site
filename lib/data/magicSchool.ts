import { supabase } from "@/lib/supabaseClient";

export async function getMagicSchools() {
  const { data, error } = await supabase
    .from("magic_school")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("getMagicSchools error", error);
    return [];
  }

  return data ?? [];
}

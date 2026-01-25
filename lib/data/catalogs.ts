import { supabase } from "@/lib/supabaseClient";

export async function getCatalogBookGroups() {
  const { data, error } = await supabase
    .from("catalogs_book_group")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("getCatalogBookGroups error", error);
    return [];
  }

  return data ?? [];
}

export async function getCatalogBooks() {
  const { data, error } = await supabase
    .from("catalogs_book")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("getCatalogBooks error", error);
    return [];
  }

  return data ?? [];
}

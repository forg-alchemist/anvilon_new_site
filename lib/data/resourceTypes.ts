import { supabase } from "@/lib/supabaseClient";

export type ResourceTypeCatalogItem = {
  id: string;
  created_at: string;
  group: string | null;
  item: string | null;
  name: string | null;
  description: string | null;
  type_kind: string | null;
};

// catalogs_book: group = 'resource_type'
// Ordering is always by created_at ASC.
export async function getResourceTypes(): Promise<ResourceTypeCatalogItem[]> {
  const { data, error } = await supabase
    .from("catalogs_book")
    .select("*")
    .eq("group", "resource_type")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("getResourceTypes error", error);
    return [];
  }

  return (data ?? []) as ResourceTypeCatalogItem[];
}

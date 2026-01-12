import { getSupabaseServerClient } from "@/lib/supabase/server";

/* =========================
   Types
========================= */

export interface RaceHistoryHead {
  id: string;
  slug: string;
  slug_head: string;
  header: string;
  bucket: string | null;
  index: number;
  start_year: number | null;
  end_year: number | null;
  epoch: string | null;
  type: string | null;
  chapter_index: number | null;
}

export interface RaceHistoryEntry {
  id: string;
  slug: string;
  slug_head: string;
  description: string;
}

export interface RaceHistorySection {
  head: RaceHistoryHead;
  entries: RaceHistoryEntry[];
}

/* =========================
   Data access
========================= */

export async function getRaceHistoryBySlug(
  raceSlug: string
): Promise<RaceHistorySection[]> {
  const supabase = getSupabaseServerClient();

  /* --- heads --- */
  const { data: heads, error: headsError } = await supabase
    .from("history_head")
    .select("*")
    .eq("slug", raceSlug)
    .order("index", { ascending: true });

  if (headsError) {
    console.error("getRaceHistoryBySlug / history_head:", headsError);
    return [];
  }

  if (!heads || heads.length === 0) return [];

  const headSlugs = heads.map((h) => h.slug_head);

  /* --- entries --- */
  const { data: entries, error: entriesError } = await supabase
    .from("history")
    .select("*")
    .eq("slug", raceSlug)
    .in("slug_head", headSlugs);

  if (entriesError) {
    console.error("getRaceHistoryBySlug / history:", entriesError);
    return [];
  }

  /* --- normalize --- */
  return heads.map((head) => ({
    head,
    entries: (entries || []).filter(
      (e) => e.slug_head === head.slug_head
    ),
  }));
}

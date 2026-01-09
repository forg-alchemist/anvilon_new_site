import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getPublicStorageUrl } from "@/lib/supabase/publicUrl";

export type PageArtRow = {
  page: string;
  art_bucket: string | null;
  art_page: string | null;
};

export async function getPageArtUrl(page: string): Promise<string> {
  const supabase = getSupabaseServerClient();

  try {
    const { data, error } = await supabase
      .from("page_art")
      .select("page, art_bucket, art_page")
      .eq("page", page)
      .maybeSingle();

    if (error) return "";
    const row = data as PageArtRow | null;

    return getPublicStorageUrl(row?.art_bucket ?? null, row?.art_page ?? null);
  } catch {
    return "";
  }
}

import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getPublicStorageUrl } from "@/lib/supabase/publicUrl";
import { DEFAULT_LANG, normalizeLang, pickLocalizedText, type AppLang } from "@/lib/i18n/shared";

export type PageArtRow = {
  created_at?: string | null;
  page: string;
  art_bucket: string | null;
  art_page: string | null;
  art_path?: string | null;
  name_ru?: string | null;
  name_en?: string | null;
  name?: string | null;
  lang?: string | null;
};

export type PageArtData = {
  artUrl: string;
  name: string;
};

const EMPTY_PAGE_ART: PageArtData = {
  artUrl: "",
  name: "",
};

export async function getPageArt(page: string, lang: AppLang = DEFAULT_LANG): Promise<PageArtData> {
  const supabase = getSupabaseServerClient();

  try {
    // Art: always query only stable columns and read the first row.
    // This keeps loading resilient if table temporarily has duplicates.
    const artRes = await supabase
      .from("page_art")
      .select("art_bucket, art_page")
      .eq("page", page)
      .order("created_at", { ascending: false })
      .limit(1);

    let artRow = (artRes.data?.[0] ?? null) as PageArtRow | null;

    if (artRes.error) {
      const artPathRes = await supabase
        .from("page_art")
        .select("art_bucket, art_path")
        .eq("page", page)
        .order("created_at", { ascending: false })
        .limit(1);

      artRow = (artPathRes.data?.[0] ?? null) as PageArtRow | null;
    }
    const artUrl = getPublicStorageUrl(artRow?.art_bucket ?? null, artRow?.art_page ?? artRow?.art_path ?? null);

    const localized = await supabase
      .from("page_art")
      .select("name_ru, name_en, name")
      .eq("page", page)
      .order("created_at", { ascending: false })
      .limit(1);

    if (!localized.error) {
      const row = (localized.data?.[0] ?? null) as PageArtRow | null;
      return {
        artUrl,
        name: pickLocalizedText(row?.name_ru ?? null, row?.name_en ?? null, lang, row?.name ?? null),
      };
    }

    // Fallback: separate rows per language (`name` + `lang`) or old single `name`.
    const byLanguage = await supabase
      .from("page_art")
      .select("name, lang")
      .eq("page", page)
      .order("created_at", { ascending: false })
      .limit(10);

    if (!byLanguage.error) {
      const rows = (byLanguage.data ?? []) as PageArtRow[];
      const matched = rows.find((row) => normalizeLang(row.lang) === lang) ?? rows[0] ?? null;
      return {
        artUrl,
        name: (matched?.name ?? "").toString().trim(),
      };
    }

    const legacy = await supabase
      .from("page_art")
      .select("name")
      .eq("page", page)
      .order("created_at", { ascending: false })
      .limit(1);

    const row = (legacy.data?.[0] ?? null) as PageArtRow | null;
    return {
      artUrl,
      name: (row?.name ?? "").toString().trim(),
    };
  } catch {
    return EMPTY_PAGE_ART;
  }
}

export async function getPageArtUrl(page: string, lang: AppLang = DEFAULT_LANG): Promise<string> {
  const { artUrl } = await getPageArt(page, lang);
  return artUrl;
}

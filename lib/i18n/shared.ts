export type AppLang = "ru" | "en";

export const DEFAULT_LANG: AppLang = "ru";

export function normalizeLang(value?: string | null): AppLang {
  const v = (value ?? "").toString().trim().toLowerCase();
  return v === "en" ? "en" : "ru";
}

export function pickLocalizedText(
  ru?: string | null,
  en?: string | null,
  lang: AppLang = DEFAULT_LANG,
  fallback?: string | null
): string {
  if (lang === "en") {
    const enValue = (en ?? "").toString().trim();
    if (enValue) return enValue;
  }

  const ruValue = (ru ?? "").toString().trim();
  if (ruValue) return ruValue;

  return (fallback ?? "").toString().trim();
}

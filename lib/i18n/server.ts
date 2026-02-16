import { cookies } from "next/headers";
import { normalizeLang, type AppLang } from "@/lib/i18n/shared";

export async function getServerLang(): Promise<AppLang> {
  const store = await cookies();
  return normalizeLang(store.get("lang")?.value);
}

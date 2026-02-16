import { PageShell } from "@/components/PageShell";
import { getPageArt } from "@/lib/data/pageArt";
import { getServerLang } from "@/lib/i18n/server";
import { getPublicStorageUrl } from "@/lib/supabase/publicUrl";
import EnterAuthPanel from "./EnterAuthPanel";

export default async function EnterPage() {
  const lang = await getServerLang();
  const isEn = lang === "en";

  const loginPage = await getPageArt("Login", lang);
  const loginBackgroundUrl = getPublicStorageUrl("art", "page-art/LoginBackground.png");

  return (
    <PageShell
      title={loginPage.name || (isEn ? "Login" : "Вход")}
    >
      <EnterAuthPanel isEn={isEn} backgroundUrl={loginBackgroundUrl} backLabel={isEn ? "Back" : "Назад"} />
    </PageShell>
  );
}

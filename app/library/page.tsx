import { NavButton } from "@/components/NavButton";
import { PageShell } from "@/components/PageShell";
import { getPageArt } from "@/lib/data/pageArt";
import { getServerLang } from "@/lib/i18n/server";

export default async function LibraryPage() {
  const lang = await getServerLang();
  const isEn = lang === "en";

  const [libraryPage, rulesPage, worldPage, residentsPage] = await Promise.all([
    getPageArt("KnowledgeLibrary", lang),
    getPageArt("Rules", lang),
    getPageArt("World", lang),
    getPageArt("Residents", lang),
  ]);

  return (
    <PageShell title={libraryPage.name || (isEn ? "Knowledge Library" : "Библиотека знаний")} backHref="/" backLabel={isEn ? "Back" : "Назад"}>
      <div className="grid gap-6 md:grid-cols-3">
        <NavButton
          title={rulesPage.name || (isEn ? "Rules" : "Правила")}
          subtitle={isEn ? "Guide" : "Руководство"}
          href="/library/rules"
          artUrl={rulesPage.artUrl}
        />
        <NavButton
          title={worldPage.name || (isEn ? "About the World" : "О мире")}
          subtitle={isEn ? "Soon" : "Скоро"}
          href={undefined}
          artUrl={worldPage.artUrl}
        />
        <NavButton
          title={residentsPage.name || (isEn ? "Residents" : "Жители Анвилона")}
          subtitle={isEn ? "Races and nationalities" : "Расы и народности"}
          href="/library/inhabitants"
          artUrl={residentsPage.artUrl}
        />
      </div>
    </PageShell>
  );
}

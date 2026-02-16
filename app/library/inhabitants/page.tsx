import { NavButton } from "@/components/NavButton";
import { PageShell } from "@/components/PageShell";
import { getPageArt } from "@/lib/data/pageArt";
import { getServerLang } from "@/lib/i18n/server";

export default async function InhabitantsPage() {
  const lang = await getServerLang();
  const isEn = lang === "en";

  const [libraryPage, residentsPage, racesPage, nationalitiesPage] = await Promise.all([
    getPageArt("KnowledgeLibrary", lang),
    getPageArt("Residents", lang),
    getPageArt("Races", lang),
    getPageArt("Nationalities", lang),
  ]);

  return (
    <PageShell
      title={residentsPage.name || (isEn ? "Residents" : "Жители Анвилона")}
      backHref="/library"
      backLabel={libraryPage.name || (isEn ? "Knowledge Library" : "Библиотека знаний")}
    >
      <div className="grid gap-6 md:grid-cols-2">
        <NavButton
          title={racesPage.name || (isEn ? "Races" : "Расы")}
          subtitle={isEn ? "All about races" : "Все о расах"}
          href="/library/inhabitants/races"
          artUrl={racesPage.artUrl}
        />
        <NavButton
          title={nationalitiesPage.name || (isEn ? "Nationalities" : "Народности")}
          subtitle={isEn ? "Soon" : "Скоро"}
          href={undefined}
          artUrl={nationalitiesPage.artUrl}
        />
      </div>
    </PageShell>
  );
}

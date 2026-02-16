export const dynamic = "force-dynamic";
export const revalidate = 0;

import { PageShell } from "@/components/PageShell";
import RaceSlider from "@/components/RaceSlider";
import { getRaces } from "@/lib/data/races";
import { getPageArt } from "@/lib/data/pageArt";
import { getServerLang } from "@/lib/i18n/server";

export default async function RacesPage() {
  const lang = await getServerLang();
  const isEn = lang === "en";

  const [residentsPage, racesPage] = await Promise.all([
    getPageArt("Residents", lang),
    getPageArt("Races", lang),
  ]);

  try {
    const races = await getRaces(lang);

    return (
      <PageShell
        title={racesPage.name || (isEn ? "Races" : "Расы")}
        backHref="/library/inhabitants"
        backLabel={residentsPage.name || (isEn ? "Residents" : "Жители Анвилона")}
      >
        <RaceSlider races={races} lang={lang} />
      </PageShell>
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : isEn ? "Unknown error" : "Неизвестная ошибка";
    return (
      <PageShell
        title={racesPage.name || (isEn ? "Races" : "Расы")}
        backHref="/library/inhabitants"
        backLabel={residentsPage.name || (isEn ? "Residents" : "Жители Анвилона")}
      >
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-red-200">
          {isEn ? "Loading error:" : "Ошибка загрузки:"} {msg}
        </div>
      </PageShell>
    );
  }
}

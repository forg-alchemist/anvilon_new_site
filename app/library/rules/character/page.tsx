import { NavButton } from "@/components/NavButton";
import { PageShell } from "@/components/PageShell";
import { getPageArt } from "@/lib/data/pageArt";
import { getServerLang } from "@/lib/i18n/server";

export default async function Page() {
  const lang = await getServerLang();
  const isEn = lang === "en";

  const [aboutPage, bookPage, equipmentPage] = await Promise.all([
    getPageArt("AboutCharacter", lang),
    getPageArt("BookPage", lang),
    getPageArt("Equipment", lang),
  ]);

  return (
    <PageShell
      title={isEn ? "Character" : "Персонаж"}
      backHref="/library/rules"
      backLabel={isEn ? "Rules" : "Правила"}
    >
      <div className="grid gap-6 md:grid-cols-3">
        <NavButton
          title={aboutPage.name || (isEn ? "About the Character" : "Все о персонаже")}
          subtitle={isEn ? "Soon" : "Скоро"}
          href={undefined}
          artUrl={aboutPage.artUrl}
        />

        <NavButton
          title={bookPage.name || (isEn ? "Masteries, Skills and Spells" : "Мастерства, навыки и заклинания")}
          href="/library/rules/character/books"
          artUrl={bookPage.artUrl}
        />

        <NavButton
          title={equipmentPage.name || (isEn ? "Weapons, Armor and Equipment" : "Оружие, броня и снаряжение")}
          subtitle={isEn ? "Soon" : "Скоро"}
          href={undefined}
          artUrl={equipmentPage.artUrl}
        />
      </div>
    </PageShell>
  );
}

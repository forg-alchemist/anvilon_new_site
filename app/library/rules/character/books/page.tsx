import { NavButton } from "@/components/NavButton";
import { PageShell } from "@/components/PageShell";
import { getPageArt } from "@/lib/data/pageArt";
import { getServerLang } from "@/lib/i18n/server";

export default async function Page() {
  const lang = await getServerLang();
  const isEn = lang === "en";

  const [bookPage, skillsPage, spellsPage, masteryPage] = await Promise.all([
    getPageArt("BookPage", lang),
    getPageArt("SkillBook", lang),
    getPageArt("SpellBook", lang),
    getPageArt("MasteryBook", lang),
  ]);

  return (
    <PageShell
      title={bookPage.name || (isEn ? "Masteries, Skills and Spells" : "Мастерства, навыки и заклинания")}
      backHref="/library/rules/character"
      backLabel={isEn ? "Character" : "Персонаж"}
    >
      <div className="grid gap-6 md:grid-cols-3">
        <NavButton
          title={skillsPage.name || (isEn ? "Skill Book" : "Книга навыков")}
          href="/library/rules/character/books/skills"
          artUrl={skillsPage.artUrl}
        />

        <NavButton
          title={spellsPage.name || (isEn ? "Spell Book" : "Книга магии")}
          href="/library/rules/character/books/magic"
          artUrl={spellsPage.artUrl}
        />

        <NavButton
          title={masteryPage.name || (isEn ? "Mastery Book" : "Трактат профессий")}
          href="/library/rules/character/books/professions"
          artUrl={masteryPage.artUrl}
        />
      </div>
    </PageShell>
  );
}

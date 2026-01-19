// app/library/rules/character/books/page.tsx
import { NavButton } from "@/components/NavButton";
import { PageShell } from "@/components/PageShell";
import { getPageArtUrl } from "@/lib/data/pageArt";

export default async function Page() {
  const [skillsArt, spellsArt, professionsArt] = await Promise.all([
    getPageArtUrl("SkillBook"),
    getPageArtUrl("SpellBook"),
    getPageArtUrl("MasteryBook"),
  ]);

  return (
    <PageShell
      title="Мастерства, навыки и заклинания"
      backHref="/library/rules/character"
      backLabel="Персонаж"
    >
      <div className="grid gap-6 md:grid-cols-3">
        <NavButton
          title="Книга навыков"
          href="/library/rules/character/books/skills"
          artUrl={skillsArt}
        />

        <NavButton
          title="Книга магии"
          href="/library/rules/character/books/magic"
          artUrl={spellsArt}
        />

        <NavButton
          title="Трактат профессий"
          href="/library/rules/character/books/professions"
          artUrl={professionsArt}
        />
      </div>
    </PageShell>
  );
}

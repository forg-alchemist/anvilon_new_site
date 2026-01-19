// app/library/rules/character/page.tsx
import { NavButton } from "@/components/NavButton";
import { PageShell } from "@/components/PageShell";
import { getPageArtUrl } from "@/lib/data/pageArt";

export default async function Page() {
  const [aboutArt, bookArt, equipmentArt] = await Promise.all([
    getPageArtUrl("AboutCharacter"),
    getPageArtUrl("BookPage"),
    getPageArtUrl("Equipment"),
  ]);

  return (
    <PageShell title="Персонаж" backHref="/library/rules" backLabel="Правила">
      <div className="grid gap-6 md:grid-cols-3">
        <NavButton
          title="Все о персонаже"
          subtitle="Скоро"
          href={undefined}
          artUrl={aboutArt}
        />

        <NavButton
          title="Мастерства, навыки и заклинания"
          href="/library/rules/character/books"
          artUrl={bookArt}
        />

        <NavButton
          title="Оружие, броня и снаряжение"
          subtitle="Скоро"
          href={undefined}
          artUrl={equipmentArt}
        />
      </div>
    </PageShell>
  );
}

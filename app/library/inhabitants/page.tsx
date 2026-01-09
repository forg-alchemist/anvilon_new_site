// app/library/inhabitants/page.tsx
import { NavButton } from "@/components/NavButton";
import { PageShell } from "@/components/PageShell";
import { getPageArtUrl } from "@/lib/data/pageArt";

export default async function InhabitantsPage() {
  const [racesArt, nationalitiesArt] = await Promise.all([
    getPageArtUrl("Races"),
    getPageArtUrl("Nationalities"),
  ]);

  return (
    <PageShell
      title="Жители Анвилона"
      backHref="/library"
      backLabel="Библиотека знаний"
    >
      <div className="grid gap-6 md:grid-cols-2">
        <NavButton
          title="Расы"
          subtitle="Все о расах"
          href="/library/inhabitants/races"
          artUrl={racesArt}
        />
        <NavButton
          title="Народности"
          subtitle="Скоро"
          href={undefined}
          artUrl={nationalitiesArt}
        />
      </div>
    </PageShell>
  );
}

import { NavButton } from "@/components/NavButton";
import { PageShell } from "@/components/PageShell";
import { getPageArtUrl } from "@/lib/data/pageArt";

export default async function LibraryPage() {
  const [rulesArt, worldArt, residentsArt] = await Promise.all([
    getPageArtUrl("Rules"),
    getPageArtUrl("World"),
    getPageArtUrl("Residents"),
  ]);

  return (
    <PageShell title="Библиотека знаний" backHref="/" backLabel="Назад">
      <div className="grid gap-6 md:grid-cols-3">
        <NavButton
          title="Правила"
          subtitle="Руководство"
          href="/library/rules"
          artUrl={rulesArt}
        />
        <NavButton
          title="О мире"
          subtitle="История и география"
          href="/library/about-world"
          artUrl={worldArt}
        />
        <NavButton
          title="Жители Анвилона"
          subtitle="Расы и народности"
          href="/library/inhabitants"
          artUrl={residentsArt}
        />
      </div>
    </PageShell>
  );
}
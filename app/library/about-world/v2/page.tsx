import { PageShell } from "@/components/PageShell";
import { NavButton } from "@/components/NavButton";
import { getPageArtUrl } from "@/lib/data/pageArt";
import AboutWorldClient from "../AboutWorldClient";

export default async function AboutWorldV2Page() {
  const [mapArt, continentsArt, islandsArt, theoryArt] = await Promise.all([
    getPageArtUrl("WorldMap"),
    getPageArtUrl("Continents"),
    getPageArtUrl("Islands"),
    getPageArtUrl("Theory"),
  ]);

  return (
    <PageShell title="О мире (v2)" backHref="/library/about-world" backLabel="О мире">
      <AboutWorldClient />

      {/* Navigation cards for sub-sections (all disabled/coming soon) */}
      <div className="grid gap-6 md:grid-cols-2 mt-8">
        <NavButton
          title="Карта мира"
          subtitle="Скоро"
          href={undefined}
          artUrl={mapArt}
        />
        <NavButton
          title="Материки"
          subtitle="Скоро"
          href={undefined}
          artUrl={continentsArt}
        />
        <NavButton
          title="Значимые архипелаги и острова"
          subtitle="Скоро"
          href={undefined}
          artUrl={islandsArt}
        />
        <NavButton
          title="Теоретическая часть"
          subtitle="Скоро"
          href={undefined}
          artUrl={theoryArt}
        />
      </div>
    </PageShell>
  );
}

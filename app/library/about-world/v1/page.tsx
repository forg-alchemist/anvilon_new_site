import { PageShell } from "@/components/PageShell";
import { NavButton } from "@/components/NavButton";
import { getPageArtUrl } from "@/lib/data/pageArt";
import AboutWorldContent from "../content.mdx";

export default async function AboutWorldV1Page() {
  const [mapArt, continentsArt, islandsArt, theoryArt] = await Promise.all([
    getPageArtUrl("WorldMap"),
    getPageArtUrl("Continents"),
    getPageArtUrl("Islands"),
    getPageArtUrl("Theory"),
  ]);

  return (
    <PageShell title="О мире (v1)" backHref="/library/about-world" backLabel="О мире">
      {/* MDX Content */}
      <div
        className="rounded-[30px] border p-8 lg:p-10"
        style={{
          borderColor: "rgba(255, 255, 255, 0.10)",
          background: `
            radial-gradient(120% 120% at 15% 0%, rgba(167,139,250,0.12), rgba(0,0,0,0) 50%),
            radial-gradient(100% 100% at 85% 80%, rgba(125,211,252,0.10), rgba(0,0,0,0) 50%),
            rgba(0, 0, 0, 0.28)
          `,
          backdropFilter: "blur(12px)",
          boxShadow:
            "0 30px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)",
        }}
      >
        <AboutWorldContent />
      </div>

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

// app/library/inhabitants/races/page.tsx
import { PageShell } from "@/components/PageShell";
import RaceSlider from "@/components/RaceSlider";
import { getRaces } from "@/lib/data/races";

export default async function RacesPage() {
  try {
    const races = await getRaces();

    return (
      <PageShell
        title="Расы"
        backHref="/library/inhabitants"
        backLabel="Жители Анвилона"
      >
        <RaceSlider races={races} />
      </PageShell>
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Неизвестная ошибка";
    return (
      <PageShell
        title="Расы"
        backHref="/library/inhabitants"
        backLabel="Жители Анвилона"
      >
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-red-200">
          Ошибка загрузки: {msg}
        </div>
      </PageShell>
    );
  }
}

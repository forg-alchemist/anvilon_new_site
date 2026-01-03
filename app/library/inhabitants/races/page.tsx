import { PageShell } from "@/components/PageShell";
import RaceSlider, { type Race } from "@/components/RaceSlider";
import { supabase } from "@/lib/supabaseClient";

export default async function RacesPage() {
  const { data, error } = await supabase
    .from("races")
    .select("id, created_at, slug, name, art_bucket, art_path, initiative")
    .order("created_at", { ascending: true });

  return (
    <PageShell
      title="Расы"
      backHref="/library/inhabitants"
      backLabel="Жители Анвилона"
    >
      {error ? (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-red-200">
          Ошибка Supabase: {error.message}
        </div>
      ) : (
        <RaceSlider races={(data ?? []) as Race[]} />
      )}
    </PageShell>
  );
}

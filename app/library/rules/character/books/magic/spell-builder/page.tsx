import { PageShell } from "@/components/PageShell";
import { SpellBuilderForm } from "./SpellBuilderForm";

export default function Page() {
  return (
    <PageShell title="Конструктор навыков/заклинаний" backHref="/library/rules/character/books/magic" backLabel="Книга магии">
      <div className="space-y-6">
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 text-white/75">
          <p>Конструктор навыков/заклинаний</p>
        </div>

        <SpellBuilderForm />
      </div>
    </PageShell>
  );
}

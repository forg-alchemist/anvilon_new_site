// app/library/rules/character/books/magic/page.tsx
import { PageShell } from "@/components/PageShell";

export default function Page() {
  return (
    <PageShell
      title="Книга магии"
      backHref="/library/rules/character/books"
      backLabel="Мастерства, навыки и заклинания"
    >
      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 text-white/75">
        Этот раздел пока пустой — заполним позже.
      </div>
    </PageShell>
  );
}

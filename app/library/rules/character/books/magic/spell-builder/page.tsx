import { PageShell } from "@/components/PageShell";
import { SpellBuilderForm } from "./SpellBuilderForm";

export default function Page() {
  return (
    <PageShell title="Конструктор навыков/заклинаний" backHref="/library/rules/character/books/magic" backLabel="Книга магии">
      <SpellBuilderForm />
    </PageShell>
  );
}

import { NavButton } from "@/components/NavButton";
import { PageShell } from "@/components/PageShell";

export default function InhabitantsPage() {
  return (
    <PageShell
      title="Жители Анвилона"
      backHref="/library"
      backLabel="Библиотека знаний"
    >
      <NavButton title="Расы" href="/library/inhabitants/races" />
      <NavButton title="Народности" note="Скоро" />
    </PageShell>
  );
}

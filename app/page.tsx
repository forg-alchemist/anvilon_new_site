import { NavButton } from "@/components/NavButton";
import { PageShell } from "@/components/PageShell";

export default function Home() {
  return (
    <PageShell title="Анвилон">
      <NavButton title="Выполнить вход" note="Скоро" />
      <NavButton title="Библиотека знаний" href="/library" />
    </PageShell>
  );
}

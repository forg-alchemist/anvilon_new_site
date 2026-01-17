// app/enter/page.tsx
import { NavButton } from "@/components/NavButton";
import { PageShell } from "@/components/PageShell";
import { getPageArtUrl } from "@/lib/data/pageArt";

export default async function EnterPage() {
  const [masterLoginArt, playerLoginArt] = await Promise.all([
    getPageArtUrl("MasterLogin"),
    getPageArtUrl("PlayerLogin"),
  ]);

  return (
    <PageShell title="Выполнить вход" backHref="/" backLabel="Назад">
      <div className="grid gap-6 md:grid-cols-2">
        <NavButton
          title="Войти как мастер"
          subtitle="Скоро"
          href={undefined}
          artUrl={masterLoginArt}
        />

        <NavButton
          title="Войти как игрок"
          subtitle="Скоро"
          href={undefined}
          artUrl={playerLoginArt}
        />
      </div>
    </PageShell>
  );
}

// app/library/rules/page.tsx
import { NavButton } from "@/components/NavButton";
import { PageShell } from "@/components/PageShell";
import { getPublicStorageUrl } from "@/lib/supabase/publicUrl";

export default function RulesPage() {
  const characterArt = getPublicStorageUrl("art", "page-art/CharacterPage.png");
  const nonBattleArt = getPublicStorageUrl("art", "page-art/NonBattleSutiationPage.jpg");
  const battleArt = getPublicStorageUrl("art", "page-art/BattleSutiationPage.jpg");

  return (
    <PageShell title="Правила" backHref="/library" backLabel="Библиотека знаний">
      {/* Intro text box — same typography as TextBlock in races */}
      <div
        className="rounded-2xl border border-white/10 bg-black/25 p-5 lg:p-3"
        style={{
          backdropFilter: "blur(10px)",
          boxShadow: "0 18px 50px rgba(0,0,0,0.45)",
          color: "rgba(235, 245, 255, 0.90)",
          fontSize: 18,
          lineHeight: 1.65,
          whiteSpace: "pre-line",
        }}
      >
        Данное руководство познакомит вас с правилами и механиками игры. Оно
        содержит инструкции и информацию по ключевым моментам, стараясь
        затрагивать максимально большое число аспектов. Это база, на которой
        держатся механики. Некоторые механики будут прямо противоречить
        информации из руководства, например возможности заклинаний или навыков.
        Во всех таких случаях стоит руководствоваться принципом - частное над
        общим и брать в приоритет описание и возможности заклинания или навыка
      </div>

      {/* Cards */}
      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        <NavButton title="Персонаж" href="/library/rules/character" artUrl={characterArt} />

        {/* Closed for now */}
        <NavButton title="Внебоевые ситуации" subtitle="Скоро" artUrl={nonBattleArt} />
        <NavButton title="Боевые ситуации" subtitle="Скоро" artUrl={battleArt} />
      </div>
    </PageShell>
  );
}
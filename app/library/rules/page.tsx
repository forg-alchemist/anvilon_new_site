import { NavButton } from "@/components/NavButton";
import { PageShell } from "@/components/PageShell";
import { getPageArt } from "@/lib/data/pageArt";
import { getServerLang } from "@/lib/i18n/server";
import { getPublicStorageUrl } from "@/lib/supabase/publicUrl";

export default async function RulesPage() {
  const lang = await getServerLang();
  const isEn = lang === "en";

  const [libraryPage, rulesPage] = await Promise.all([
    getPageArt("KnowledgeLibrary", lang),
    getPageArt("Rules", lang),
  ]);

  const characterArt = getPublicStorageUrl("art", "page-art/CharacterPage.png");
  const nonBattleArt = getPublicStorageUrl("art", "page-art/NonBattleSutiationPage.jpg");
  const battleArt = getPublicStorageUrl("art", "page-art/BattleSutiationPage.jpg");

  const introText = isEn
    ? "This guide introduces game rules and core mechanics. It covers key systems and practical instructions. In case of contradictions, prioritize specific spell/skill descriptions over generic rules."
    : "Данное руководство познакомит вас с правилами и механиками игры. Оно содержит инструкции и информацию по ключевым моментам, стараясь затрагивать максимально большое число аспектов. Во всех спорных случаях в приоритете описание и возможности конкретного заклинания или навыка.";

  return (
    <PageShell
      title={rulesPage.name || (isEn ? "Rules" : "Правила")}
      backHref="/library"
      backLabel={libraryPage.name || (isEn ? "Knowledge Library" : "Библиотека знаний")}
    >
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
        {introText}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        <NavButton
          title={isEn ? "Character" : "Персонаж"}
          href="/library/rules/character"
          artUrl={characterArt}
        />
        <NavButton
          title={isEn ? "Non-combat Situations" : "Внебоевые ситуации"}
          subtitle={isEn ? "Soon" : "Скоро"}
          artUrl={nonBattleArt}
        />
        <NavButton
          title={isEn ? "Combat Situations" : "Боевые ситуации"}
          subtitle={isEn ? "Soon" : "Скоро"}
          artUrl={battleArt}
        />
      </div>
    </PageShell>
  );
}

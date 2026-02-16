import { PageShell } from "@/components/PageShell";
import { getServerLang } from "@/lib/i18n/server";

export default async function Page() {
  const lang = await getServerLang();
  const isEn = lang === "en";

  return (
    <PageShell
      title={isEn ? "Skill Book" : "Книга навыков"}
      backHref="/library/rules/character/books"
      backLabel={isEn ? "Masteries, Skills and Spells" : "Мастерства, навыки и заклинания"}
    >
      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 text-white/75">
        {isEn ? "This section is empty for now — we will fill it later." : "Этот раздел пока пустой — заполним позже."}
      </div>
    </PageShell>
  );
}

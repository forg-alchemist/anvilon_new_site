import { PageShell } from "@/components/PageShell";
import { getMagicSchools } from "@/lib/data/magicSchool";
import { getMagicPaths } from "@/lib/data/magicPath";
import { getCatalogBooks } from "@/lib/data/catalogs";
import { getTalents } from "@/lib/data/talents";
import { getMagicSpells, getSpellConditions, getSpellEffects, getSpellResources } from "@/lib/data/magicSpells";
import { getServerLang } from "@/lib/i18n/server";
import { MagicSchoolSlider } from "./MagicSchoolSlider";

export default async function Page() {
  const lang = await getServerLang();
  const isEn = lang === "en";

  const schools = await getMagicSchools();
  const paths = await getMagicPaths();
  const catalogBooks = await getCatalogBooks();
  const spells = await getMagicSpells();
  const talents = await getTalents();
  const spellResources = await getSpellResources();
  const spellConditions = await getSpellConditions();
  const spellEffects = await getSpellEffects();

  return (
    <PageShell
      title={isEn ? "Spell Book" : "Книга магии"}
      backHref="/library/rules/character/books"
      backLabel={isEn ? "Masteries, Skills and Spells" : "Мастерства, навыки и заклинания"}
    >
      <div className="space-y-6">
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 text-white/75">
          {isEn
            ? "Spells are structured magical formulas and practices. Below is the complete spellbook with schools, paths and available spells."
            : "Заклинания — это формулы и практики магии. Ниже представлена полная книга магии со школами, путями и доступными заклинаниями."}
        </div>

        <MagicSchoolSlider
          schools={schools}
          paths={paths}
          spells={spells}
          talents={talents}
          spellResources={spellResources}
          spellEffects={spellEffects}
          spellConditions={spellConditions}
          catalogBooks={catalogBooks ?? []}
        />
      </div>
    </PageShell>
  );
}

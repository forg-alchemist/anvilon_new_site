// app/library/rules/character/books/magic/page.tsx
import { PageShell } from "@/components/PageShell";
import { getMagicSchools } from "@/lib/data/magicSchool";
import { getMagicPaths } from "@/lib/data/magicPath";
import { MagicSchoolSlider } from "./MagicSchoolSlider";

export default async function Page() {
  const schools = await getMagicSchools();
  const paths = await getMagicPaths();

  return (
    <PageShell
      title="Книга магии"
      backHref="/library/rules/character/books"
      backLabel="Мастерства, навыки и заклинания"
    >
      <div className="space-y-6">
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 text-white/75">
          <p>
            Заклинания — это формулы и практики, позволяющие придавать магии определённый тип, стабильную нужную форму и
            силу. Они играют ключевую роль в магической системе мира, предоставляя персонажам возможность взаимодействовать
            с окружающей средой и влиять на неё с помощью магии. Заклинания можно улучшать при доступном потенциале
            навыков/заклинаний. Максимальный уровень заклинания 5. Изучение каждого заклинания тратит 1 потенциал
            способностей. Как правило, заклинания не имеют время восстановления, но тратят пункты маны для активации
            и/или поддержания
          </p>

          <p className="mt-6">Заклинания могут быть приобретены:</p>
          <ul className="mt-3 list-disc space-y-2 pl-6">
            <li>С выбором расы и идти вместе с ней</li>
            <li>С выбором класса и идти вместе с ним</li>
            <li>С выбором школы магии</li>
            <li>При снаряжении артефакта</li>
          </ul>

          <p className="mt-6">
            Ниже представлена книга магии, в которой отображены все доступные заклинания и школы магии:
          </p>
        </div>

        <MagicSchoolSlider schools={schools} paths={paths} />
      </div>
    </PageShell>
  );
}

import { PageShell } from "@/components/PageShell";
import { supabase } from "@/lib/supabaseClient";

function publicImageUrl(bucket?: string | null, path?: string | null) {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base || !bucket || !path) return "";
  return `${base}/storage/v1/object/public/${bucket}/${path}`;
}

type RaceRow = {
  slug: string;
  name: string;
  art_bucket: string | null;
  header: string | null;
};

export default async function HighElfPage() {
  const { data, error } = await supabase
    .from("races")
    .select("slug, name, art_bucket, header")
    .eq("slug", "high-elf")
    .single();

  const race: RaceRow = (data as RaceRow) ?? {
    slug: "high-elf",
    name: "Высший эльф",
    art_bucket: null,
    header: null,
  };

  // header-картинка становится ФОНОМ блока
  const heroBg = publicImageUrl(race.art_bucket, race.header);

  return (
    <PageShell title={race.name} backHref="/library/inhabitants/races" backLabel="Расы">
      {/* HERO: картинка = фон блока, текст поверх */}
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_18px_50px_rgba(0,0,0,.35)]">
        {/* фон-картинка из header */}
        {heroBg ? (
          <div className="pointer-events-none absolute inset-0">
            <img
              src={heroBg}
              alt=""
              className="h-full w-full object-cover object-center"
              draggable={false}
            />
            {/* лёгкое затемнение как раньше, чтобы текст читался */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-black/35 to-black/55" />
          </div>
        ) : null}

        {/* мягкие подсветки поверх фона (если фон есть — будет очень красиво) */}
        <div className="pointer-events-none absolute inset-0 opacity-90">
          <div className="absolute -left-32 -top-40 h-[520px] w-[520px] rounded-full bg-sky-300/10 blur-3xl" />
          <div className="absolute -right-32 -top-40 h-[480px] w-[480px] rounded-full bg-amber-200/10 blur-3xl" />
          <div className="absolute right-10 bottom-[-220px] h-[560px] w-[560px] rounded-full bg-sky-300/10 blur-3xl" />
        </div>

        {/* контент поверх фона */}
        <div className="relative">
          <p className="max-w-[72ch] text-base leading-relaxed text-white/80">
            Самые мудрые и древние представители Авэй — носители памяти, власти и
            магического порядка. Их решения редко бывают мягкими, но почти всегда
            — дальновидными.
          </p>

          <div className="mt-5 rounded-2xl border border-white/15 bg-black/25 p-4 text-white/85 backdrop-blur-[2px]">
            <div className="border-l-2 border-white/35 pl-4 italic leading-relaxed">
              Это раса, которая слишком рано стала взрослой и так и не позволила
              себе быть наивной.
            </div>
          </div>
        </div>
      </section>

      {/* GRID */}
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        {/* 1 */}
        <section className="lg:col-span-2 rounded-3xl border border-white/10 bg-white/5 p-5">
          <Header num="1" title="Описание расы" />
          <p className="mt-3 leading-relaxed text-white/80">
            Высшие эльфы — элита народа Авэй, чьи истоки уходят в самые ранние
            эпохи мира. В древности они были жрецами и правителями объединённого
            народа, и даже спустя века сохраняют амбиции, чувство избранности и
            привычку мыслить масштабами поколений. Их холодная собранность — не
            поза, а следствие опыта: они знают, как дорого стоит ошибка.
          </p>
          <Tags
            items={[
              "вековая перспектива",
              "амбициозность",
              "элитарность",
              "цивилизационная роль",
            ]}
          />
        </section>

        {/* 2 */}
        <section className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <Header num="2" title="Происхождение" />
          <p className="mt-3 leading-relaxed text-white/80">
            Авэй вышли из магического колодца <b>Авэлир</b> в центре будущего{" "}
            <b>Альквамарэ</b> в начале эры Света. Высшие эльфы — одна из древнейших
            рас Арантира, стоящая в одном ряду с дварфами и первыми народами
            континента.
          </p>
          <p className="mt-3 leading-relaxed text-white/60">
            Их происхождение неразрывно связано с магией и становлением
            миропорядка — они не просто жили в мире, они участвовали в его
            формировании.
          </p>
        </section>

        {/* 3 */}
        <section className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <Header num="3" title="Особенности" />
          <p className="mt-3 leading-relaxed text-white/80">
            Магия для высших эльфов — фундамент цивилизации: цель, инструмент и
            повседневная необходимость. Ею пронизаны быт, строительство, ремесло,
            война и даже развлечения. Днём, под солнечным светом, они особенно
            продуктивны — свет усиливает их связь с магией.
          </p>
          <p className="mt-3 leading-relaxed text-white/80">
            Они не делят поступки на добрые и злые: они совершают необходимые —
            те, что, по их убеждению, служат <b>Высшему благу</b>.
          </p>
        </section>

        {/* 4 */}
        <section className="lg:col-span-2 rounded-3xl border border-white/10 bg-white/5 p-5">
          <Header num="4" title="Представители и роль персонажа" />
          <p className="mt-3 leading-relaxed text-white/80">
            Выходец из высших эльфов чаще всего — одарённый маг, учёный или
            мыслитель с жадной, неутолимой тягой к знаниям. Его любознательность
            нередко граничит с одержимостью, а стремление к истине — с
            беспощадной настойчивостью. Среди них много дипломатов, советников,
            магистров и представителей высшего сословия.
          </p>
          <p className="mt-3 leading-relaxed text-white/80">
            Игрок за высшего эльфа — это персонаж, который мыслит стратегически,
            видит последствия, выбирает долг и порядок, и готов платить цену за
            решения, которые другим кажутся неприемлемыми.
          </p>
          <Tags
            items={[
              "магистр",
              "архитектор решений",
              "дипломат",
              "исследователь",
              "стратег",
            ]}
          />
        </section>

        {/* 5 */}
        <section className="lg:col-span-2 rounded-3xl border border-white/10 bg-white/5 p-5">
          <Header num="5" title="Друзья и враги" />
          <p className="mt-3 leading-relaxed text-white/80">
            Заклятые враги высших эльфов — демоны и эдоcпоклонники, некогда
            разрушившие леса Симхаль и оставившие одну из глубочайших ран в
            истории Авэй. Эта борьба тянется веками.
          </p>
          <p className="mt-3 leading-relaxed text-white/80">
            Драконорожденных высшие эльфы презирают как искажённый результат
            противоестественных экспериментов. К тёмным эльфам относятся
            враждебно и настороженно — из-за слома устоев общества Авэй, ведь
            именно они посеяли зерно сомнения.
          </p>
          <p className="mt-3 leading-relaxed text-white/60">
            С прочими расами отношения часто напряжённые, но постепенно смещаются
            в сторону дипломатии и попыток сгладить острые углы.
          </p>

          <div className="mt-5 h-px w-full bg-white/10" />

          <Tags
            items={[
              "уважение: лунные эльфы",
              "враги: демоны",
              "враги: эдоcпоклонники",
              "презрение: драконорожденные",
              "конфликт: тёмные эльфы",
              "напряжение: прочие расы",
            ]}
          />
        </section>
      </div>

      {error ? (
        <div className="mt-4 text-xs text-white/35">Supabase: {error.message}</div>
      ) : null}
    </PageShell>
  );
}

function Header({ num, title }: { num: string; title: string }) {
  return (
    <div className="flex items-baseline gap-3">
      <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-bold text-white/80">
        {num}
      </span>
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
    </div>
  );
}

function Tags({ items }: { items: string[] }) {
  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {items.map((t) => (
        <span
          key={t}
          className="rounded-full border border-white/12 bg-white/7 px-3 py-1.5 text-xs text-white/75"
        >
          {t}
        </span>
      ))}
    </div>
  );
}

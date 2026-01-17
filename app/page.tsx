// app/page.tsx
import { NavButton } from "@/components/NavButton";
import { PageShell } from "@/components/PageShell";
import { getPageArtUrl } from "@/lib/data/pageArt";

export default async function Home() {
  const [loginArt, libraryArt] = await Promise.all([
    getPageArtUrl("Login"),              // если нет — будет пусто, это ок
    getPageArtUrl("KnowledgeLibrary"),   // ← ВАЖНО: ровно как в page_art.page
  ]);

  return (
    <PageShell title="Анвилон">
      <div className="grid gap-6 md:grid-cols-2">
        <NavButton
          title="Выполнить вход"
          href="/enter"
          artUrl={loginArt}
        />
        <NavButton
          title="Библиотека знаний"
          href="/library"
          artUrl={libraryArt}
        />
      </div>
    </PageShell>
  );
}

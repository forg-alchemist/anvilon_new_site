import { execSync } from "node:child_process";
import { NavButton } from "@/components/NavButton";
import { PageShell } from "@/components/PageShell";
import { getPageArtUrl } from "@/lib/data/pageArt";

function getLastUpdateDateLabel(): string {
  try {
    const iso = execSync("git log -1 --format=%cI", {
      stdio: ["ignore", "pipe", "ignore"],
    })
      .toString()
      .trim();
    const parsed = new Date(iso);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toLocaleDateString("ru-RU");
    }
  } catch {
    // Fallback to build date if git metadata is unavailable.
  }

  return new Date().toLocaleDateString("ru-RU");
}

export default async function Home() {
  const lastUpdateLabel = getLastUpdateDateLabel();
  const [loginArt, libraryArt] = await Promise.all([
    getPageArtUrl("Login"),
    getPageArtUrl("KnowledgeLibrary"),
  ]);

  return (
    <PageShell title="Анвилон">
      <div className="grid gap-6 md:grid-cols-2">
        <NavButton title="Выполнить вход" href="/enter" artUrl={loginArt} />
        <NavButton title="Библиотека знаний" href="/library" artUrl={libraryArt} />
      </div>

      <div className="fixed bottom-3 right-4 z-40 rounded border border-white/15 bg-black/25 px-3 py-1.5 text-[11px] uppercase tracking-[0.12em] text-white/75 backdrop-blur-sm">
        {`Update version ${lastUpdateLabel}`}
      </div>
    </PageShell>
  );
}

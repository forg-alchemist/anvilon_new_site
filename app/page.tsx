import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { NavButton } from "@/components/NavButton";
import { PageShell } from "@/components/PageShell";
import { VersionChangelogButton } from "@/components/VersionChangelogButton";
import { getPageArt } from "@/lib/data/pageArt";
import { getServerLang } from "@/lib/i18n/server";

function getBuildVersion(): string {
  try {
    const packageJsonPath = join(process.cwd(), "package.json");
    const raw = readFileSync(packageJsonPath, "utf8");
    const parsed = JSON.parse(raw) as { version?: string };
    return parsed.version?.trim() || "0.0.0";
  } catch {
    return "0.0.0";
  }
}

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

function escapeRegExp(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getChangelogForVersion(version: string): string {
  try {
    const changelogPath = join(process.cwd(), "CHANGELOG.md");
    const raw = readFileSync(changelogPath, "utf8");
    const lines = raw.split(/\r?\n/);
    const headingPattern = new RegExp(`^## \\[${escapeRegExp(version)}\\]`);
    const startIndex = lines.findIndex((line) => headingPattern.test(line));
    if (startIndex === -1) {
      return "Для этой версии записи пока отсутствуют.";
    }

    const endIndex = lines.findIndex((line, index) => index > startIndex && /^## \[/.test(line));
    const sectionLines = endIndex === -1 ? lines.slice(startIndex + 1) : lines.slice(startIndex + 1, endIndex);
    const section = sectionLines.join("\n").trim();

    return section || "Для этой версии записи пока отсутствуют.";
  } catch {
    return "Не удалось загрузить журнал изменений.";
  }
}

export default async function Home() {
  const lang = await getServerLang();
  const isEn = lang === "en";
  const buildVersion = getBuildVersion();
  const lastUpdateLabel = getLastUpdateDateLabel();
  const versionChangelog = getChangelogForVersion(buildVersion);
  const [loginPage, libraryPage] = await Promise.all([
    getPageArt("Login", lang),
    getPageArt("KnowledgeLibrary", lang),
  ]);

  return (
    <PageShell title={isEn ? "Anvilon" : "Анвилон"}>
      <div className="grid gap-6 md:grid-cols-2">
        <NavButton
          title={loginPage.name || (isEn ? "Login" : "Выполнить вход")}
          href="/enter"
          artUrl={loginPage.artUrl}
        />
        <NavButton
          title={libraryPage.name || (isEn ? "Knowledge Library" : "Библиотека знаний")}
          href="/library"
          artUrl={libraryPage.artUrl}
        />
      </div>

      <VersionChangelogButton
        version={buildVersion}
        dateLabel={lastUpdateLabel}
        changelog={versionChangelog}
      />
    </PageShell>
  );
}

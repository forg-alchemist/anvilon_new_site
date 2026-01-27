import { PageShell } from "@/components/PageShell";
import Link from "next/link";

const inkSoft = "rgba(214, 230, 255, 0.75)";
const line = "rgba(255,255,255,0.10)";
const glowCyan = "rgba(125,211,252,0.20)";
const glowViolet = "rgba(167,139,250,0.18)";
const gold = "rgba(244, 214, 123, 0.60)";
const goldSoft = "rgba(244, 214, 123, 0.20)";

const versions = [
  {
    href: "/library/about-world/v1",
    title: "Версия 1",
    subtitle: "Простая страница с одним MDX файлом",
  },
  {
    href: "/library/about-world/v2",
    title: "Версия 2",
    subtitle: "Страница с табами и навигацией по разделам",
  },
];

const demoPages = [
  {
    href: "/library/inhabitants",
    title: "Жители Анвилона",
    subtitle: "Страница для проверки стилей заголовков",
  },
  {
    href: "/library/inhabitants/races",
    title: "Расы",
    subtitle: "Список всех рас",
  },
];

export default function AboutWorldPage() {
  return (
    <PageShell title="О мире" backHref="/library" backLabel="Библиотека">
      <div className="mx-auto max-w-2xl">
        {/* About World versions */}
        <h3
          className="mb-4"
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: 16,
            color: gold,
            textTransform: "uppercase",
            letterSpacing: "0.15em",
          }}
        >
          Версии страницы «О мире»
        </h3>
        <div className="grid gap-4 mb-10">
          {versions.map((v) => (
            <Link
              key={v.href}
              href={v.href}
              className="block rounded-[24px] border p-6 transition hover:scale-[1.02]"
              style={{
                borderColor: line,
                background: `
                  radial-gradient(120% 110% at 10% 0%, ${glowViolet}, rgba(0,0,0,0) 52%),
                  radial-gradient(120% 110% at 90% 60%, ${glowCyan}, rgba(0,0,0,0) 56%),
                  linear-gradient(180deg, rgba(255,255,255,0.05), rgba(0,0,0,0.86))
                `,
                boxShadow:
                  "0 20px 60px rgba(0,0,0,0.50), 0 0 0 1px rgba(255,255,255,0.04) inset",
              }}
            >
              <h2
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: 24,
                  color: gold,
                  textShadow: `0 0 14px ${goldSoft}, 0 2px 18px rgba(0,0,0,0.85)`,
                  marginBottom: 8,
                }}
              >
                {v.title}
              </h2>
              <p
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: 16,
                  color: inkSoft,
                }}
              >
                {v.subtitle}
              </p>
            </Link>
          ))}
        </div>

        {/* Demo pages for style comparison */}
        <h3
          className="mb-4"
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: 16,
            color: gold,
            textTransform: "uppercase",
            letterSpacing: "0.15em",
          }}
        >
          Страницы для сравнения стилей
        </h3>
        <div className="grid gap-4">
          {demoPages.map((v) => (
            <Link
              key={v.href}
              href={v.href}
              className="block rounded-[24px] border p-6 transition hover:scale-[1.02]"
              style={{
                borderColor: line,
                background: `
                  radial-gradient(120% 110% at 10% 0%, ${glowCyan}, rgba(0,0,0,0) 52%),
                  radial-gradient(120% 110% at 90% 60%, ${glowViolet}, rgba(0,0,0,0) 56%),
                  linear-gradient(180deg, rgba(255,255,255,0.05), rgba(0,0,0,0.86))
                `,
                boxShadow:
                  "0 20px 60px rgba(0,0,0,0.50), 0 0 0 1px rgba(255,255,255,0.04) inset",
              }}
            >
              <h2
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: 24,
                  color: "rgba(125, 211, 252, 0.85)",
                  textShadow: `0 0 14px rgba(125, 211, 252, 0.25), 0 2px 18px rgba(0,0,0,0.85)`,
                  marginBottom: 8,
                }}
              >
                {v.title}
              </h2>
              <p
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: 16,
                  color: inkSoft,
                }}
              >
                {v.subtitle}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </PageShell>
  );
}

"use client";

import { useMemo, useState } from "react";

export type RaceDetail = {
  slug: string;
  name: string;
  artUrl: string;
  about: {
    description: string;
    origin: string;
    features: string;
    archetypes: string;
    relations: string;
  };
};

type SectionKey = "about" | "physiology" | "skills" | "name";
type AboutTabKey = "desc" | "origin" | "features" | "arch" | "relations";

const SECTIONS: Array<{ key: SectionKey; label: string; disabled?: boolean }> = [
  { key: "about", label: "О РАСЕ" },
  { key: "physiology", label: "ФИЗИОЛОГИЯ И ОСОБЕННОСТИ", disabled: true },
  { key: "skills", label: "РАСОВЫЕ НАВЫКИ", disabled: true },
  { key: "name", label: "ВЫБОР ИМЕНИ", disabled: true },
];

const ABOUT_TABS: Array<{ key: AboutTabKey; label: string }> = [
  { key: "desc", label: "Описание расы" },
  { key: "origin", label: "Происхождение" },
  { key: "features", label: "Особенности" },
  { key: "arch", label: "Архетипы и роль персонажа" },
  { key: "relations", label: "Друзья и враги" },
];

export default function RaceDetailClient({ detail }: { detail: RaceDetail }) {
  const [section, setSection] = useState<SectionKey>("about");
  const [aboutTab, setAboutTab] = useState<AboutTabKey>("desc");

  const rightTitle = useMemo(() => {
    const s = SECTIONS.find((x) => x.key === section);
    return s?.label ?? "";
  }, [section]);

  const content = useMemo(() => {
    if (section !== "about") {
      return (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-white/70">
          Этот раздел пока пустой — заполним позже.
        </div>
      );
    }

    switch (aboutTab) {
      case "desc":
        return <TextBlock text={detail.about.description} />;
      case "origin":
        return <TextBlock text={detail.about.origin} />;
      case "features":
        return <TextBlock text={detail.about.features} />;
      case "arch":
        return <TextBlock text={detail.about.archetypes} />;
      case "relations":
        return <TextBlock text={detail.about.relations} />;
      default:
        return null;
    }
  }, [section, aboutTab, detail]);

  // ===== Theme (cosmic / astral) =====
  const base = "#070A12";
  const ink = "rgba(235, 245, 255, 0.92)";
  const inkSoft = "rgba(214, 230, 255, 0.72)";
  const line = "rgba(255,255,255,0.10)";
  const glowCyan = "rgba(125,211,252,0.22)";
  const glowViolet = "rgba(167,139,250,0.18)";
  const gold = "rgba(244, 214, 123, 0.55)";
  const goldSoft = "rgba(244, 214, 123, 0.18)";

  return (
    <div className="mx-auto w-full max-w-[1400px]">
      <div
        className="
          grid
          gap-6
          lg:gap-8
          lg:grid-cols-[360px_1fr]
          items-start
        "
      >
        {/* LEFT NAV (vertical) */}
        <aside
          className="relative overflow-hidden rounded-[26px] border"
          style={{
            borderColor: line,
            background: `linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))`,
            boxShadow:
              "0 28px 90px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.04) inset",
          }}
        >
          {/* Background art (blur + tint) */}
          {detail.artUrl ? (
            <div className="absolute inset-0">
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `url(${detail.artUrl})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  filter: "blur(18px)",
                  transform: "scale(1.08)",
                  opacity: 0.55,
                }}
              />
              {/* tint / contrast */}
              <div
                className="absolute inset-0"
                style={{
                  background: `
                    radial-gradient(120% 110% at 20% 0%, ${glowViolet}, rgba(0,0,0,0) 52%),
                    radial-gradient(120% 110% at 90% 60%, ${glowCyan}, rgba(0,0,0,0) 56%),
                    linear-gradient(180deg, rgba(0,0,0,0.72), rgba(0,0,0,0.82))
                  `,
                }}
              />
              {/* bottom fade if list taller than art */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/70 to-black/85" />
            </div>
          ) : (
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(180deg, ${base}, rgba(0,0,0,0.92))`,
              }}
            />
          )}

          {/* Content */}
          <div className="relative p-4 lg:p-5">
            <div
              className="mb-3 flex items-center gap-3 rounded-2xl border border-white/10 bg-black/25 px-4 py-3"
              style={{ backdropFilter: "blur(10px)" }}
            >
              <div
                className="text-[13px] tracking-[0.26em] uppercase"
                style={{
                  fontFamily: "var(--font-buttons)",
                  color: inkSoft,
                }}
              >
                Разделы
              </div>
              <div className="ml-auto h-[1px] flex-1 bg-white/10" />
            </div>

            <nav className="grid gap-2">
              {SECTIONS.map((s) => {
                const active = section === s.key;
                const disabled = !!s.disabled;

                return (
                  <button
                    key={s.key}
                    type="button"
                    disabled={disabled}
                    onClick={() => {
                      if (disabled) return;
                      setSection(s.key);
                      if (s.key === "about") setAboutTab("desc");
                    }}
                    className="
                      group
                      text-left
                      rounded-2xl
                      border
                      px-4
                      py-3
                      transition
                      disabled:cursor-not-allowed
                    "
                    style={{
                      borderColor: active
                        ? "rgba(244, 214, 123, 0.35)"
                        : "rgba(255,255,255,0.10)",
                      background: active
                        ? `
                          radial-gradient(140% 120% at 50% 0%, ${goldSoft}, rgba(0,0,0,0) 62%),
                          linear-gradient(180deg, rgba(0,0,0,0.42), rgba(0,0,0,0.26))
                        `
                        : "rgba(0,0,0,0.28)",
                      boxShadow: active
                        ? `0 14px 36px rgba(0,0,0,0.55), 0 0 24px ${goldSoft}`
                        : "0 12px 28px rgba(0,0,0,0.45)",
                      backdropFilter: "blur(10px)",
                      opacity: disabled ? 0.55 : 1,
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="text-[12px] uppercase"
                        style={{
                          fontFamily: "var(--font-buttons)",
                          letterSpacing: "0.22em",
                          color: active ? ink : inkSoft,
                          textShadow: active
                            ? `0 0 14px ${goldSoft}, 0 2px 16px rgba(0,0,0,0.8)`
                            : "0 2px 14px rgba(0,0,0,0.75)",
                        }}
                      >
                        {s.label}
                      </div>

                      {disabled && (
                        <div
                          className="ml-auto rounded-full border border-white/10 bg-black/25 px-3 py-1 text-[11px] uppercase"
                          style={{
                            fontFamily: "var(--font-buttons)",
                            letterSpacing: "0.22em",
                            color: "rgba(214, 230, 255, 0.45)",
                          }}
                        >
                          Скоро
                        </div>
                      )}
                    </div>

                    {/* subtle underline glow */}
                    <div
                      className="mt-2 h-[1px] w-full"
                      style={{
                        background: active
                          ? `linear-gradient(90deg, rgba(255,255,255,0), ${gold}, rgba(255,255,255,0))`
                          : `linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.10), rgba(255,255,255,0))`,
                        opacity: active ? 0.9 : 0.55,
                      }}
                    />
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* RIGHT CONTENT */}
        <section
          className="rounded-[26px] border overflow-hidden"
          style={{
            borderColor: line,
            background: `
              radial-gradient(120% 110% at 10% 0%, ${glowViolet}, rgba(0,0,0,0) 52%),
              radial-gradient(120% 110% at 90% 60%, ${glowCyan}, rgba(0,0,0,0) 56%),
              linear-gradient(180deg, rgba(255,255,255,0.04), rgba(0,0,0,0.86))
            `,
            boxShadow:
              "0 30px 110px rgba(0,0,0,0.70), 0 0 0 1px rgba(255,255,255,0.04) inset",
          }}
        >
          {/* top bar */}
          <div
            className="px-5 py-4 border-b"
            style={{
              borderColor: "rgba(255,255,255,0.10)",
              background:
                "linear-gradient(180deg, rgba(0,0,0,0.45), rgba(0,0,0,0.22))",
            }}
          >
            <div className="flex items-center gap-4">
              <div
                className="text-[12px] uppercase"
                style={{
                  fontFamily: "var(--font-buttons)",
                  letterSpacing: "0.28em",
                  color: inkSoft,
                }}
              >
                {rightTitle}
              </div>

              <div className="h-[1px] flex-1 bg-white/10" />

              <div
                className="text-[12px] uppercase"
                style={{
                  fontFamily: "var(--font-buttons)",
                  letterSpacing: "0.20em",
                  color: "rgba(214, 230, 255, 0.45)",
                }}
              >
                {detail.name}
              </div>
            </div>

            {/* horizontal tabs (only for About now) */}
            {section === "about" && (
              <div className="mt-4 flex flex-wrap gap-2">
                {ABOUT_TABS.map((t) => {
                  const active = aboutTab === t.key;
                  return (
                    <button
                      key={t.key}
                      type="button"
                      onClick={() => setAboutTab(t.key)}
                      className="rounded-full border px-4 py-2 transition"
                      style={{
                        borderColor: active
                          ? "rgba(244, 214, 123, 0.35)"
                          : "rgba(255,255,255,0.10)",
                        background: active
                          ? `
                            radial-gradient(140% 140% at 50% 0%, ${goldSoft}, rgba(0,0,0,0) 62%),
                            linear-gradient(180deg, rgba(0,0,0,0.48), rgba(0,0,0,0.22))
                          `
                          : "rgba(0,0,0,0.25)",
                        boxShadow: active
                          ? `0 10px 24px rgba(0,0,0,0.55), 0 0 20px ${goldSoft}`
                          : "0 8px 20px rgba(0,0,0,0.40)",
                        backdropFilter: "blur(10px)",
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "var(--font-buttons)",
                          textTransform: "uppercase",
                          letterSpacing: "0.18em",
                          fontSize: 12,
                          color: active ? ink : inkSoft,
                          textShadow: active
                            ? `0 0 14px ${goldSoft}, 0 2px 14px rgba(0,0,0,0.8)`
                            : "0 2px 12px rgba(0,0,0,0.75)",
                        }}
                      >
                        {t.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* content area */}
          <div className="p-5 lg:p-6">{content}</div>
        </section>
      </div>
    </div>
  );
}

function TextBlock({ text }: { text: string }) {
  return (
    <div
      className="rounded-2xl border border-white/10 bg-black/25 p-5 lg:p-6 leading-relaxed"
      style={{
        backdropFilter: "blur(10px)",
        boxShadow: "0 16px 40px rgba(0,0,0,0.45)",
        color: "rgba(235, 245, 255, 0.88)",
        fontSize: 16,
      }}
    >
      {text}
    </div>
  );
}

"use client";

import { useState } from "react";
import { aboutWorldSections, type AboutWorldSectionKey } from "@/shared/content/about-world";

const ink = "rgba(235, 245, 255, 0.92)";
const inkSoft = "rgba(214, 230, 255, 0.75)";
const line = "rgba(255,255,255,0.10)";
const glowCyan = "rgba(125,211,252,0.20)";
const glowViolet = "rgba(167,139,250,0.18)";
const gold = "rgba(244, 214, 123, 0.60)";
const goldSoft = "rgba(244, 214, 123, 0.20)";

export default function AboutWorldClient() {
  const [activeSection, setActiveSection] = useState<AboutWorldSectionKey>("intro");

  const currentSection = aboutWorldSections.find((s) => s.key === activeSection);
  const Content = currentSection?.Content;

  return (
    <div className="mx-auto w-full max-w-[1500px]">
      <div className="grid gap-8 lg:gap-10 lg:grid-cols-[320px_1fr] items-start">
        {/* LEFT NAV */}
        <aside
          className="relative overflow-hidden rounded-[30px] border"
          style={{
            borderColor: line,
            background: "rgba(0,0,0,0.28)",
            boxShadow:
              "0 30px 100px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.04) inset",
          }}
        >
          <div
            className="absolute inset-0"
            style={{
              background: `
                radial-gradient(120% 110% at 15% 0%, ${glowViolet}, rgba(0,0,0,0) 55%),
                radial-gradient(120% 110% at 90% 65%, ${glowCyan}, rgba(0,0,0,0) 58%),
                linear-gradient(180deg, rgba(255,255,255,0.06), rgba(0,0,0,0.86))
              `,
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              boxShadow:
                "inset 0 0 0 1px rgba(255,255,255,0.06), inset 0 0 110px rgba(0,0,0,0.55)",
            }}
          />

          <div className="relative p-5 lg:p-6">
            <nav className="grid gap-3">
              {aboutWorldSections.map((s) => {
                const active = activeSection === s.key;

                return (
                  <button
                    key={s.key}
                    type="button"
                    onClick={() => setActiveSection(s.key)}
                    className="group text-left rounded-2xl border px-5 py-4 transition"
                    style={{
                      borderColor: active
                        ? "rgba(244, 214, 123, 0.38)"
                        : "rgba(255,255,255,0.10)",
                      background: active
                        ? `
                          radial-gradient(140% 120% at 50% 0%, ${goldSoft}, rgba(0,0,0,0) 62%),
                          linear-gradient(180deg, rgba(0,0,0,0.46), rgba(0,0,0,0.26))
                        `
                        : "rgba(0,0,0,0.28)",
                      boxShadow: active
                        ? `0 16px 40px rgba(0,0,0,0.55), 0 0 26px ${goldSoft}`
                        : "0 14px 32px rgba(0,0,0,0.45)",
                      backdropFilter: "blur(10px)",
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        style={{
                          fontFamily: "var(--font-buttons)",
                          fontSize: 14,
                          textTransform: "uppercase",
                          letterSpacing: "0.22em",
                          color: active ? ink : inkSoft,
                          textShadow: active
                            ? `0 0 14px ${goldSoft}, 0 2px 18px rgba(0,0,0,0.85)`
                            : "0 2px 16px rgba(0,0,0,0.8)",
                        }}
                      >
                        {s.label}
                      </div>
                    </div>

                    <div
                      className="mt-3 h-[1px] w-full"
                      style={{
                        background: active
                          ? `linear-gradient(90deg, rgba(255,255,255,0), ${gold}, rgba(255,255,255,0))`
                          : `linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.10), rgba(255,255,255,0))`,
                        opacity: active ? 0.95 : 0.55,
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
          className="rounded-[30px] border overflow-hidden"
          style={{
            borderColor: line,
            background: `
              radial-gradient(120% 110% at 10% 0%, ${glowViolet}, rgba(0,0,0,0) 52%),
              radial-gradient(120% 110% at 90% 60%, ${glowCyan}, rgba(0,0,0,0) 56%),
              linear-gradient(180deg, rgba(255,255,255,0.05), rgba(0,0,0,0.86))
            `,
            boxShadow:
              "0 34px 130px rgba(0,0,0,0.70), 0 0 0 1px rgba(255,255,255,0.04) inset",
          }}
        >
          <div className="p-6 lg:p-8">
            {Content && <Content />}
          </div>
        </section>
      </div>
    </div>
  );
}

"use client";

import React from "react";
import Link from "next/link";

export type PageShellProps = {
  title: string;
  children: React.ReactNode;
  backHref?: string;
  backLabel?: string;
};

const TITLE_FONT_SIZE = 34;
const HEADER_ROW_HEIGHT = 56;

function resolveBackText(backLabel?: string): string {
  const normalized = (backLabel ?? "").trim().toLowerCase();
  return normalized === "back" ? "Back" : "Назад";
}

function BackButton({ href, label }: { href: string; label?: string }) {
  const text = resolveBackText(label);

  return (
    <Link
      href={href}
      aria-label={label ?? text}
      className="inline-flex h-11 items-center gap-2 rounded-xl border px-4 transition"
      style={{
        borderColor: "rgba(244, 214, 123, 0.34)",
        background:
          "radial-gradient(120% 150% at 15% 0%, rgba(244,214,123,0.14), rgba(0,0,0,0) 55%), linear-gradient(180deg, rgba(20,26,44,0.86), rgba(8,12,22,0.88))",
        boxShadow: "0 10px 26px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.08)",
        color: "rgba(244, 228, 186, 0.95)",
        textDecoration: "none",
        fontFamily: "var(--font-buttons)",
        textTransform: "uppercase",
        letterSpacing: "0.16em",
        fontSize: 14,
        lineHeight: 1,
      }}
    >
      <span aria-hidden="true" style={{ fontSize: 18, lineHeight: 1, transform: "translateY(-1px)" }}>
        ←
      </span>
      <span>{text}</span>
    </Link>
  );
}

export function PageShell({ title, children, backHref, backLabel }: PageShellProps) {
  return (
    <main className="relative z-10 mx-auto max-w-[1400px] px-6 py-8 lg:px-10 lg:py-10">
      <header className="relative z-30 mb-6">
        <div className="relative overflow-visible" style={{ height: HEADER_ROW_HEIGHT }}>
          <div className="flex h-full items-center justify-start overflow-visible">
            {backHref ? <BackButton href={backHref} label={backLabel} /> : null}
          </div>

          <h1
            className="absolute left-1/2 top-1/2 uppercase text-white"
            style={{
              fontFamily: "var(--font-buttons)",
              fontSize: TITLE_FONT_SIZE,
              lineHeight: 1,
              letterSpacing: "0.02em",
              margin: 0,
              textShadow: "0 2px 16px rgba(0,0,0,0.55)",
              whiteSpace: "nowrap",
              pointerEvents: "none",
              transform: "translate(-50%, -50%)",
            }}
          >
            {title}
          </h1>
        </div>
      </header>

      <section className="relative z-10 grid gap-6">{children}</section>
    </main>
  );
}

export default PageShell;

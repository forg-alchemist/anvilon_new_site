"use client";

import React from "react";
import Link from "next/link";
import { getPublicStorageUrl } from "@/lib/supabase/publicUrl";

export type PageShellProps = {
  title: string;
  children: React.ReactNode;
  backHref?: string;
  backLabel?: string;
};

/* =======================
   SIZE CONSTANTS
   ======================= */
const BACK_FONT_SIZE = 24;   // ← размер текста «НАЗАД»
const TITLE_FONT_SIZE = 34;  // ← размер названия страницы
const BACK_ICON_SIZE = 162;   // ← размер арта кнопки назад
const HEADER_ROW_HEIGHT = 40;

/* =======================
   BACK BUTTON
   ======================= */
function BackButton({ href, label }: { href: string; label: string }) {
  const iconUrl = getPublicStorageUrl("art", "UI_UX/BackButton.png");

  return (
    <Link
      href={href}
      aria-label={label}
      className="back-flame relative inline-flex items-center overflow-visible"
      style={{
        fontFamily: "var(--font-buttons)",
        color: "#E6D6A8",
        textDecoration: "none",
      }}
    >
      {/* Art (lower layer) */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={iconUrl}
        alt=""
        draggable={false}
        style={{
          width: BACK_ICON_SIZE,
          height: BACK_ICON_SIZE,
          objectFit: "contain",
          display: "block",
          zIndex: 1,
          filter: "drop-shadow(0 2px 14px rgba(0,0,0,0.6))",
        }}
      />

      {/* Text ABOVE the art (can overflow outside header height) */}
      <span
        style={{
          fontSize: BACK_FONT_SIZE,
          lineHeight: 1,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          textShadow: "0 2px 16px rgba(0,0,0,0.65)",
          whiteSpace: "nowrap",
          position: "relative",
          zIndex: 2,
          marginLeft: -22, // заезд на арт
          pointerEvents: "none",
          /* tweak if you want it to rise outside the row:
             transform: "translateY(-10px)",
          */
        }}
      >
        {label}
      </span>
    </Link>
  );
}

/* =======================
   PAGE SHELL
   ======================= */
export function PageShell({
  title,
  children,
  backHref,
  backLabel = "Назад",
}: PageShellProps) {
  return (
    <main className="mx-auto max-w-[1400px] px-6 lg:px-10 py-8 lg:py-10">
      <header className="mb-6">
        {/* Single row with fixed height, but overflow allowed */}
        <div
          className="relative overflow-visible"
          style={{ height: HEADER_ROW_HEIGHT }}
        >
          {/* Left: Back */}
          <div className="h-full flex items-center justify-start overflow-visible">
            {backHref ? <BackButton href={backHref} label={backLabel} /> : null}
          </div>

          {/* Center: Title */}
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
              transform: "translate(-50%, -50%) translateY(-8px)",
            }}
          >
            {title}
          </h1>
        </div>
      </header>

      <section className="grid gap-6">{children}</section>
    </main>
  );
}

export default PageShell;

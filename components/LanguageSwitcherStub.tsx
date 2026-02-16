"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { normalizeLang, type AppLang } from "@/lib/i18n/shared";

type Props = {
  initialLang: AppLang;
};

export function LanguageSwitcherStub({ initialLang }: Props) {
  const router = useRouter();
  const [lang, setLang] = useState<AppLang>(normalizeLang(initialLang));
  const [isPending, startTransition] = useTransition();

  const baseClass =
    "rounded-md border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.1em] transition";
  const activeClass = "border-[#e7c47a]/40 bg-[#e7c47a]/15 text-[#f6e6b6]";
  const inactiveClass = "border-white/15 bg-white/5 text-white/75 hover:border-white/30 hover:bg-white/10";

  const switchLang = (next: AppLang) => {
    if (next === lang || isPending) return;

    startTransition(async () => {
      setLang(next);
      try {
        await fetch("/api/lang", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lang: next }),
        });
      } finally {
        router.refresh();
      }
    });
  };

  return (
    <div className="fixed right-4 top-3 z-40 flex items-center gap-2 rounded-xl border border-white/15 bg-black/25 p-1.5 backdrop-blur-sm">
      <button
        type="button"
        aria-pressed={lang === "ru"}
        onClick={() => switchLang("ru")}
        className={`${baseClass} ${lang === "ru" ? activeClass : inactiveClass}`}
      >
        Рус
      </button>

      <button
        type="button"
        aria-pressed={lang === "en"}
        onClick={() => switchLang("en")}
        className={`${baseClass} ${lang === "en" ? activeClass : inactiveClass}`}
      >
        Eng
      </button>
    </div>
  );
}

import Link from "next/link";

function BackPill({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="
        group
        inline-flex items-center
        overflow-hidden
        rounded-full
        border border-white/15
        bg-black/20
        h-12
        w-fit
        transition-all
        hover:border-white/25
        hover:bg-black/30
        active:scale-[0.98]
      "
      style={{
        fontFamily: "var(--font-buttons)",
        color: "var(--button-foreground)",
      }}
    >
      {/* 1) Стрелка */}
      <span className="flex h-full w-[50px] items-center justify-center">
        <svg
          width="36"
          height="36"
          viewBox="0 0 24 24"
          fill="none"
          className="transition-transform group-hover:-translate-x-0.5"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M15.8 5.7L7.6 12l8.2 6.3"
            stroke="currentColor"
            strokeWidth="3.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>

      {/* 2) Диагональ */}
      <span className="relative h-full w-[12px] flex-shrink-0">
        <span
          aria-hidden="true"
          className="absolute left-1/2 top-1/2 h-[120%] w-[3px] -translate-x-1/2 -translate-y-1/2 rotate-[18deg] opacity-85"
          style={{ background: "currentColor" }}
        />
      </span>

      {/* 3) Текст */}
      <span className="flex h-full items-center justify-center pl-3 pr-4">
        <span
          className="text-base tracking-[0.18em] whitespace-nowrap"
          style={{
            textTransform: "uppercase",
            transform: "translateY(1px)",
          }}
        >
          {label}
        </span>
      </span>
    </Link>
  );
}

export function PageShell({
  title,
  children,
  backHref,
  backLabel = "На главную",
}: {
  title: string;
  children: React.ReactNode;
  backHref?: string;
  backLabel?: string;
}) {
  return (
    <main className="mx-auto max-w-[1400px] px-6 lg:px-10 py-8 lg:py-10">
      <header className="mb-5 lg:mb-6">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center">
          <div className="justify-self-start">
            {backHref ? <BackPill href={backHref} label={backLabel} /> : <span />}
          </div>

          <h1
            className="
              justify-self-center
              font-normal
              tracking-wide
              text-white
              text-[clamp(34px,3.2vw,52px)]
              leading-[1.05]
            "
            style={{ fontFamily: "var(--font-buttons)" }}
          >
            {title}
          </h1>

          <div className="justify-self-end" />
        </div>
      </header>

      <section className="grid gap-5 lg:gap-6">{children}</section>
    </main>
  );
}

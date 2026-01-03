import Link from "next/link";

export function PageShell({
  title,
  children,
  backHref,
  backLabel = "Назад",
}: {
  title: string;
  children: React.ReactNode;
  backHref?: string;
  backLabel?: string;
}) {
  return (
    <main
      className="
        mx-auto
        max-w-[1400px]
        px-6
        lg:px-10
        py-8
        lg:py-10
      "
    >
      {/* Header row: Back (left) + Title (center on same line) */}
      <header className="mb-5 lg:mb-6">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center">
          <div className="justify-self-start">
            {backHref ? (
              <Link
                href={backHref}
                className="
                  inline-flex
                  items-center
                  gap-2
                  text-base
                  text-white/70
                  hover:text-white
                  transition-colors
                "
              >
                ← {backLabel}
              </Link>
            ) : (
              <span />
            )}
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
            style={{
              fontFamily: "var(--font-buttons)",
            }}
          >
            {title}
          </h1>

          {/* Right spacer to keep true centering */}
          <div className="justify-self-end" />
        </div>
      </header>

      {/* Content */}
      <section className="grid gap-5 lg:gap-6">{children}</section>
    </main>
  );
}

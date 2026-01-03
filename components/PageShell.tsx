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
    <main className="mx-auto max-w-4xl px-6 py-12">
      <header className="mb-8">
        {backHref && (
          <Link
            href={backHref}
            className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white"
          >
            ← {backLabel}
          </Link>
        )}
        <h1 className="mt-4 text-4xl font-bold tracking-tight">
          {title}
        </h1>
      </header>

      <section className="grid gap-4">
        {children}
      </section>
    </main>
  );
}

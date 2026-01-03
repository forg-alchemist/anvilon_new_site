import Link from "next/link";

type Props = {
  title: string;
  href?: string;
  note?: string;
};

export function NavButton({ title, href, note }: Props) {
  const base =
    "group relative block w-full rounded-2xl border border-white/10 " +
    "bg-gradient-to-b from-white/[0.04] to-white/[0.01] " +
    "px-6 py-5 transition-all duration-200";

  const hover =
    "hover:border-white/20 hover:from-white/[0.07] hover:to-white/[0.02] " +
    "hover:translate-y-[-1px] hover:shadow-[0_10px_30px_rgba(0,0,0,0.35)]";

  const disabled =
    "opacity-40 cursor-not-allowed hover:translate-y-0 hover:shadow-none";

  const content = (
    <>
      <div className="text-lg font-semibold tracking-tight">
        {title}
      </div>
      {note && (
        <div className="mt-1 text-sm text-white/60">
          {note}
        </div>
      )}
      <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-white/5" />
    </>
  );

  if (!href) {
    return (
      <div className={`${base} ${disabled}`}>
        {content}
      </div>
    );
  }

  return (
    <Link href={href} className={`${base} ${hover}`}>
      {content}
    </Link>
  );
}

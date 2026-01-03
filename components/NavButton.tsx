import Link from "next/link";

type Props = {
  title: string;
  href?: string;
  note?: string;
};

export function NavButton({ title, href, note }: Props) {
  const base =
    "group relative block w-full rounded-2xl border border-white/10 " +
    "bg-gradient-to-b from-white/[0.05] to-white/[0.015] " +
    "px-[clamp(18px,1.6vw,26px)] py-[clamp(18px,1.8vw,28px)] " +
    "min-h-[clamp(90px,10vw,140px)] " +
    "transition-all duration-200";

  const hover =
    "hover:border-white/20 hover:from-white/[0.08] hover:to-white/[0.02] " +
    "hover:translate-y-[-1px] hover:shadow-[0_10px_30px_rgba(0,0,0,0.35)]";

  const disabled =
    "opacity-40 cursor-not-allowed hover:translate-y-0 hover:shadow-none";

  const content = (
    <>
      <div
        className="
          text-[clamp(18px,1.6vw,26px)]
          tracking-tight
          normal-case
        "
        style={{
          fontFamily: "var(--font-buttons)",
          color: "var(--button-foreground)",
          textTransform: "none",
        }}
      >
        {title}
      </div>

      {note && (
        <div className="mt-2 text-[clamp(13px,1.1vw,15px)] text-white/65 normal-case">
          {note}
        </div>
      )}
    </>
  );

  if (!href) {
    return <div className={`${base} ${disabled}`}>{content}</div>;
  }

  return (
    <Link href={href} className={`${base} ${hover}`}>
      {content}
    </Link>
  );
}

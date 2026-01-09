// components/NavButton.tsx
import Link from "next/link";

type Props = {
  title: string;
  subtitle?: string;
  href?: string;
  artUrl?: string;
};

export function NavButton({ title, subtitle, href, artUrl }: Props) {
  const isDisabled = !href;

  const card = (
    <div
      className={[
        "relative overflow-hidden rounded-2xl border",
        "transition",
        isDisabled
          ? "opacity-60 cursor-not-allowed"
          : "hover:-translate-y-[1px] active:translate-y-0",
      ].join(" ")}
      style={{
        aspectRatio: "16 / 9",
        borderColor: "rgba(255,255,255,0.10)",
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(0,0,0,0.62))",
        boxShadow:
          "0 18px 60px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.04) inset",
      }}
    >
      {/* ART */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: artUrl ? `url(${artUrl})` : undefined,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        {/* veil */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-black/40 to-black/85" />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(120% 120% at 20% 0%, rgba(167,139,250,0.18), rgba(0,0,0,0) 55%), radial-gradient(120% 120% at 80% 60%, rgba(125,211,252,0.16), rgba(0,0,0,0) 60%)",
          }}
        />
      </div>

      {/* CONTENT */}
      <div className="relative h-full w-full p-6 flex items-end">
        {/* LEFT: text */}
        <div className="max-w-[75%]">
          <div
            className="text-[18px] uppercase"
            style={{
              fontFamily: "var(--font-heading)",
              letterSpacing: "0.22em",
              color: "rgba(235,245,255,0.92)",
              textShadow: "0 2px 16px rgba(0,0,0,0.75)",
            }}
          >
            {title}
          </div>

          {subtitle ? (
            <div
              className="mt-2 text-sm leading-relaxed"
              style={{
                fontFamily: "var(--font-body)",
                color: "rgba(255,255,255,0.70)",
              }}
            >
              {subtitle}
            </div>
          ) : null}
        </div>

        {/* RIGHT: arrow */}
        <div className="ml-auto text-white/40">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path
              d="M9 6l6 6-6 6"
              stroke="currentColor"
              strokeWidth="2.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </div>
  );

  if (isDisabled) return card;

  return (
    <Link href={href} className="block">
      {card}
    </Link>
  );
}

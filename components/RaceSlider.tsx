"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

export type Race = {
  id: string;
  slug: string;
  name: string;
  art_bucket: string | null;
  art_path: string | null;
  initiative: number | null;
};

function getPublicImageUrl(bucket?: string | null, path?: string | null) {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base || !bucket || !path) return "";
  return `${base}/storage/v1/object/public/${bucket}/${path}`;
}

export default function RaceSlider({ races }: { races: Race[] }) {
  const safeRaces = useMemo(() => (Array.isArray(races) ? races : []), [races]);
  const [i, setI] = useState(0);

  const current = safeRaces[i];

  const prev = () =>
    setI((x) =>
      safeRaces.length ? (x - 1 + safeRaces.length) % safeRaces.length : 0
    );
  const next = () =>
    setI((x) => (safeRaces.length ? (x + 1) % safeRaces.length : 0));

  if (!safeRaces.length) {
    return (
      <div className="mx-auto w-full max-w-[420px] rounded-2xl border border-white/10 bg-white/5 p-6 text-white/70">
        Пока нет рас в базе данных.
      </div>
    );
  }

  const img = getPublicImageUrl(current.art_bucket, current.art_path);

  // пока активна только эта
  const isActive = current.slug === "high-elf";
  const href = `/library/inhabitants/races/${current.slug}`;

  return (
    <div className="mx-auto w-full max-w-[420px]">
      {/* Название (синий блок) */}
      <div className="mb-3 text-center">
        <div className="text-2xl font-bold tracking-tight">{current.name}</div>
      </div>

      {/* Область арта 9:16 (красный блок) + стрелки (оранжевые) */}
      <div className="relative">
        <button
          type="button"
          onClick={prev}
          aria-label="Предыдущая раса"
          className="absolute left-[-14px] top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/15 bg-black/40 px-3 py-2 text-white/80 backdrop-blur hover:bg-black/60 hover:text-white"
        >
          ←
        </button>

        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
          <div className="relative aspect-[9/16] w-full">
            {img ? (
              <img
                src={img}
                alt={current.name}
                className="absolute inset-0 h-full w-full object-cover"
                draggable={false}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-white/50">
                Нет изображения
              </div>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={next}
          aria-label="Следующая раса"
          className="absolute right-[-14px] top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/15 bg-black/40 px-3 py-2 text-white/80 backdrop-blur hover:bg-black/60 hover:text-white"
        >
          →
        </button>
      </div>

      {/* Кнопка (зелёный блок) */}
      <div className="mt-4">
        {isActive ? (
          <Link
            href={href}
            className="block w-full rounded-2xl border border-emerald-400/30 bg-emerald-500/15 px-4 py-3 text-center font-semibold text-emerald-100 hover:bg-emerald-500/20"
          >
            Выбрать расу
          </Link>
        ) : (
          <button
            type="button"
            disabled
            className="block w-full cursor-not-allowed rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center font-semibold text-white/40"
            title="Скоро"
          >
            Скоро
          </button>
        )}
      </div>
    </div>
  );
}

"use client";

import React from "react";
import type { RaceDetail } from "../types";

export default function MapSection({ detail }: { detail: RaceDetail }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 text-white/85">
      <div className="text-sm tracking-[0.18em] uppercase text-[#f4d67b]">Карта владений</div>

      {detail.mapUrl ? (
        <div className="mt-4 overflow-hidden rounded-xl border border-white/10 bg-black/20">
          <img
            src={detail.mapUrl}
            alt={`Карта владений: ${detail.name}`}
            className="block h-auto w-full object-contain"
            loading="lazy"
            draggable={false}
          />
        </div>
      ) : (
        <div className="mt-4 text-white/75">
          (заглушка) Здесь позже появится карта владений и краткое описание территорий.
        </div>
      )}
    </div>
  );
}

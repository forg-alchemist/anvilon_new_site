"use client";

import React from "react";

export default function ComingSoonSection({ title }: { title: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 text-white/75">
      {title} — этот раздел пока закрыт.
    </div>
  );
}

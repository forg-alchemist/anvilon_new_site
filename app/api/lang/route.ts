import { NextResponse } from "next/server";
import { normalizeLang } from "@/lib/i18n/shared";

export async function POST(req: Request) {
  let requested: string | null = null;

  try {
    const body = (await req.json()) as { lang?: string };
    requested = body.lang ?? null;
  } catch {
    requested = null;
  }

  const lang = normalizeLang(requested);
  const res = NextResponse.json({ ok: true, lang });

  res.cookies.set({
    name: "lang",
    value: lang,
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
  });

  return res;
}

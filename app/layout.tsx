import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { supabase } from "@/lib/supabaseClient";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Anvilon",
  description: "World of Anvilon",
};

function getPublicImageUrl(bucket?: string | null, path?: string | null) {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base || !bucket || !path) return "";
  return `${base}/storage/v1/object/public/${bucket}/${path}`;
}

async function getGlobalBackgroundUrl() {
  try {
    const { data, error } = await supabase
      .from("page_art")
      .select("art_bucket, art_page")
      .eq("page", "Global")
      .maybeSingle();

    if (error) return "";
    return getPublicImageUrl(data?.art_bucket, data?.art_page);
  } catch {
    return "";
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const bgUrl = await getGlobalBackgroundUrl();

  return (
    <html lang="ru" className="h-full">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen text-white`}>
        {/* GLOBAL BACKGROUND (арт из page_art: page=Global) */}
        <div
          className="min-h-screen w-full"
          style={{
            backgroundColor: "#070a12",
            backgroundImage: bgUrl ? `url(${bgUrl})` : undefined,
            backgroundSize: "100% auto", // ключевое: масштаб по ширине экрана
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center top",
            backgroundAttachment: "fixed",
          }}
        >
          {/* читаемость + “магический” объем (не убивает арт) */}
          <div
            className="min-h-screen w-full"
            style={{
              background: `
                radial-gradient(1100px 700px at 50% 20%, rgba(0,0,0,0.35), rgba(0,0,0,0) 60%),
                linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.20) 35%, rgba(0,0,0,0.65) 100%)
              `,
            }}
          >
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}

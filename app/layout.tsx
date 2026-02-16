// app/layout.tsx
import type { Metadata } from "next";
import { Geist_Mono, Yeseva_One, Forum } from "next/font/google";
import "./globals.css";
import { getPageArtUrl } from "@/lib/data/pageArt";
import { LanguageSwitcherStub } from "@/components/LanguageSwitcherStub";
import { getServerLang } from "@/lib/i18n/server";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const headingFont = Yeseva_One({
  variable: "--font-heading",
  weight: "400",
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

const bodyFont = Forum({
  variable: "--font-body",
  weight: "400",
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Anvilon",
  description: "World of Anvilon",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const lang = await getServerLang();
  const bgUrl = await getPageArtUrl("Global", lang);

  return (
    <html lang={lang} className="h-full overflow-x-hidden">
      <body
        className={`${geistMono.variable} ${headingFont.variable} ${bodyFont.variable} antialiased min-h-screen text-white overflow-x-hidden`}
      >
        <div
          className="min-h-screen w-full"
          style={{
            backgroundColor: "#070a12",
            backgroundImage: bgUrl ? `url(${bgUrl})` : undefined,
            backgroundSize: "100% auto",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center top",
            backgroundAttachment: "fixed",
          }}
        >
          <div
            className="min-h-screen w-full"
            style={{
              background: `
                radial-gradient(1100px 700px at 50% 20%, rgba(0,0,0,0.35), rgba(0,0,0,0) 60%),
                linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.20) 35%, rgba(0,0,0,0.65) 100%)
              `,
            }}
          >
            <LanguageSwitcherStub initialLang={lang} />
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}

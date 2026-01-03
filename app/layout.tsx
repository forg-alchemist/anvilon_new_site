import type { Metadata } from "next";
import { Geist, Geist_Mono, Ruslan_Display } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const ruslan = Ruslan_Display({
  variable: "--font-buttons",
  subsets: ["latin", "cyrillic"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Anvilon",
  description: "World of Anvilon",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ru"
      className={`${geistSans.variable} ${geistMono.variable} ${ruslan.variable} h-full bg-[#3f3f44]`}
    >
      <body className="min-h-screen antialiased bg-[#3f3f44]">{children}</body>
    </html>
  );
}

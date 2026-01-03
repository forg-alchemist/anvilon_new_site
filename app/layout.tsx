import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className="h-full bg-[#3f3f44]">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-[#3f3f44] text-white`}
      >
        {children}
      </body>
    </html>
  );
}

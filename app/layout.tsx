import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/layout/Navigation";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "Killykeen",
  description: "Pike fishing planner — Killykeen Forest Park, Co. Cavan",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased bg-[#F8F9FA] text-slate-800 min-h-screen overflow-x-hidden`}
      >
        <Navigation />
        <main className="max-w-2xl mx-auto px-4 pb-12 overflow-x-hidden">{children}</main>
      </body>
    </html>
  );
}

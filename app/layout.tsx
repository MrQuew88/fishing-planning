import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/layout/Navigation";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
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
        className={`${bricolage.variable} ${plexMono.variable} font-sans antialiased water-bg text-[#F1F5F9] min-h-screen overflow-x-hidden`}
      >
        <Navigation />
        <main className="main-container mx-auto px-4 md:px-8 pb-12 overflow-x-hidden">{children}</main>
      </body>
    </html>
  );
}

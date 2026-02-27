import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Space_Grotesk } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/layout/Navigation";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space",
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
        className={`${jakarta.variable} ${spaceGrotesk.variable} font-sans antialiased water-bg text-[#F1F5F9] min-h-screen overflow-x-hidden`}
      >
        <Navigation />
        <main className="main-container mx-auto px-4 md:px-8 pb-12 overflow-x-hidden">{children}</main>
      </body>
    </html>
  );
}

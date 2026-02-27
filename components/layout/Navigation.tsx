"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Briefing" },
  { href: "/conditions", label: "Conditions" },
  { href: "/arsenal", label: "Arsenal" },
];

export default function Navigation() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  if (pathname === "/login") return null;

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      <nav className="sticky top-0 z-50 bg-[#0B1426]/90 backdrop-blur-xl border-b border-white/[0.06] py-2">
        <div className="main-container mx-auto px-4 md:px-8 flex items-center justify-between min-h-[48px]">
          <Link href="/" className="font-bold text-white text-xl tracking-tight">
            Killykeen
          </Link>

          {/* Desktop pills */}
          <div className="hidden md:flex gap-2">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-6 py-3 rounded-full text-base font-medium transition-colors min-h-[48px] flex items-center ${
                  isActive(link.href)
                    ? "bg-white/15 text-white"
                    : "text-white/50 hover:text-white/80"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Mobile burger */}
          <button
            onClick={() => setMenuOpen(true)}
            className="md:hidden flex items-center justify-center w-12 h-12 -mr-2"
            aria-label="Menu"
          >
            <svg
              className="w-6 h-6 text-white/60"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile overlay */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-[60] md:hidden"
          onClick={() => setMenuOpen(false)}
        >
          <div className="absolute inset-0 bg-black/40 animate-fade-in" />

          <div
            className="absolute top-0 right-0 h-full w-72 bg-[#0B1426]/95 backdrop-blur-2xl border-l border-white/[0.06] animate-slide-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 min-h-[64px] border-b border-white/[0.06]">
              <span className="text-base font-medium text-white/40">Menu</span>
              <button
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-center w-12 h-12 -mr-2"
                aria-label="Fermer"
              >
                <svg
                  className="w-6 h-6 text-white/40"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="py-3">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center px-5 min-h-[48px] text-lg transition-colors ${
                    isActive(link.href)
                      ? "text-white font-bold bg-white/[0.06]"
                      : "text-white/50 hover:text-white/80"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

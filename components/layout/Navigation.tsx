"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Historique" },
  { href: "/forecast", label: "Prévisions" },
  { href: "/arsenal", label: "Arsenal" },
  { href: "/briefing", label: "Briefing" },
];

export default function Navigation() {
  const pathname = usePathname();

  if (pathname === "/login") return null;

  return (
    <nav className="border-b border-gray-800 bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 flex items-center gap-8 h-14">
        <span className="font-bold text-lg tracking-tight">
          Killykeen
        </span>
        <div className="flex gap-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-2 rounded text-sm transition-colors ${
                pathname === link.href
                  ? "bg-gray-800 text-white"
                  : "text-gray-400 hover:text-gray-200 hover:bg-gray-800/50"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}

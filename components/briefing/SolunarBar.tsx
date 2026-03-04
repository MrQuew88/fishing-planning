"use client";

import { Solunar } from "@/lib/types";

const D = "font-[family-name:var(--font-plex)]";

function trimSeconds(time: string): string {
  return time.slice(0, 5);
}

interface SolunarPeriod {
  start: string;
  end: string;
  type: "major" | "minor";
}

function getSolunarPeriods(solunar: Solunar): SolunarPeriod[] {
  const raw: { start: string | null; end: string | null; type: "major" | "minor" }[] = [
    { start: solunar.major_1_start, end: solunar.major_1_end, type: "major" },
    { start: solunar.major_2_start, end: solunar.major_2_end, type: "major" },
    { start: solunar.minor_1_start, end: solunar.minor_1_end, type: "minor" },
    { start: solunar.minor_2_start, end: solunar.minor_2_end, type: "minor" },
  ];
  return raw.filter((p): p is SolunarPeriod => p.start != null && p.end != null);
}

export default function SolunarSection({ solunar }: { solunar: Solunar }) {
  const periods = getSolunarPeriods(solunar);
  if (periods.length === 0) return null;

  const majors = periods.filter((p) => p.type === "major");
  const minors = periods.filter((p) => p.type === "minor");

  return (
    <div className="bg-white/[0.07] backdrop-blur-xl border border-white/[0.12] rounded-2xl px-6 py-6 space-y-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
      {majors.length > 0 && (
        <div>
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="text-base font-bold uppercase tracking-wide text-[#F59E0B]">
              Majeures
            </span>
            <span className={`${D} text-xl font-bold text-white`}>
              {majors.map((p) => `${trimSeconds(p.start)}\u2013${trimSeconds(p.end)}`).join(" \u00b7 ")}
            </span>
          </div>
          <p className="text-lg italic text-white/70 mt-1">
            P&eacute;riodes de forte activit&eacute; des poissons. Meilleur moment pour p&ecirc;cher.
          </p>
        </div>
      )}

      {minors.length > 0 && (
        <div>
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="text-base font-bold uppercase tracking-wide text-[#22C55E]">
              Mineures
            </span>
            <span className={`${D} text-xl font-bold text-white`}>
              {minors.map((p) => `${trimSeconds(p.start)}\u2013${trimSeconds(p.end)}`).join(" \u00b7 ")}
            </span>
          </div>
          <p className="text-lg italic text-white/70 mt-1">
            P&eacute;riodes d&apos;activit&eacute; mod&eacute;r&eacute;e.
          </p>
        </div>
      )}
    </div>
  );
}

"use client";

import { Solunar } from "@/lib/types";

const D = "font-[family-name:var(--font-space)]";

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

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

function isActive(p: SolunarPeriod, nowMinutes: number): boolean {
  return nowMinutes >= timeToMinutes(p.start) && nowMinutes <= timeToMinutes(p.end);
}

function countdown(p: SolunarPeriod, nowMinutes: number): string | null {
  const startMin = timeToMinutes(p.start);
  if (startMin <= nowMinutes) return null;
  const diff = startMin - nowMinutes;
  const h = Math.floor(diff / 60);
  const m = diff % 60;
  if (h > 0) return `dans ${h}h${m > 0 ? m.toString().padStart(2, "0") : ""}`;
  return `dans ${m}min`;
}

export default function SolunarText({ solunar }: { solunar: Solunar }) {
  const periods = getSolunarPeriods(solunar);
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  if (periods.length === 0) return null;

  return (
    <div className="bg-white/[0.07] backdrop-blur-xl border border-white/[0.12] rounded-2xl px-5 py-4">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 text-base leading-relaxed">
        {periods.map((p, i) => {
          const active = isActive(p, nowMinutes);
          const isMajor = p.type === "major";
          const label = isMajor ? "Majeure" : "Mineure";
          const cd = !active ? countdown(p, nowMinutes) : null;

          return (
            <span key={i} className="inline-flex items-center gap-x-2">
              {i > 0 && <span className="text-white/20">{"\u00b7"}</span>}
              <span>
                <span className={isMajor ? "text-[#F59E0B] font-semibold" : "text-[#22C55E] font-medium"}>
                  {label}
                </span>
                {" "}
                <span className={`${D} text-[#F1F5F9] ${active ? "font-bold" : ""}`}>
                  {trimSeconds(p.start)}{"\u2013"}{trimSeconds(p.end)}
                </span>
                {active && <span className="text-white/55 font-bold ml-1">(en cours)</span>}
                {cd && <span className="text-white/40 ml-1">{cd}</span>}
              </span>
            </span>
          );
        })}
      </div>
    </div>
  );
}

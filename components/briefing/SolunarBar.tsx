"use client";

import { Solunar } from "@/lib/types";

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
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

function solunarStatusLabel(periods: SolunarPeriod[], nowMinutes: number): string {
  for (const p of periods) {
    const s = timeToMinutes(p.start);
    const e = timeToMinutes(p.end);
    if (nowMinutes >= s && nowMinutes <= e) {
      return p.type === "major"
        ? `Majeure en cours \u2014 jusqu\u2019\u00e0 ${p.end}`
        : `Mineure en cours \u2014 jusqu\u2019\u00e0 ${p.end}`;
    }
  }

  const upcoming = periods
    .filter((p) => timeToMinutes(p.start) > nowMinutes)
    .sort((a, b) => timeToMinutes(a.start) - timeToMinutes(b.start));

  if (upcoming.length > 0) {
    const next = upcoming[0];
    return `Prochaine ${next.type === "major" ? "majeure" : "mineure"} : ${next.start}\u2013${next.end}`;
  }

  return "Aucune p\u00e9riode restante aujourd\u2019hui";
}

export default function SolunarBar({ solunar }: { solunar: Solunar }) {
  const totalMinutes = 24 * 60;
  const periods = getSolunarPeriods(solunar);

  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const nowPct = (nowMinutes / totalMinutes) * 100;

  const label = solunarStatusLabel(periods, nowMinutes);

  return (
    <div className="space-y-2">
      <div className="relative h-3 bg-slate-100 rounded-full overflow-hidden">
        {periods.map((p, i) => {
          const startMin = timeToMinutes(p.start);
          const endMin = timeToMinutes(p.end);
          const left = (startMin / totalMinutes) * 100;
          const width = ((endMin - startMin) / totalMinutes) * 100;
          return (
            <div
              key={i}
              className={`absolute rounded-full ${
                p.type === "major"
                  ? "bg-amber-400 h-full top-0"
                  : "bg-emerald-300/70 h-2.5 top-[1px]"
              }`}
              style={{ left: `${left}%`, width: `${Math.max(width, 1.5)}%` }}
            />
          );
        })}

        {[6, 12, 18].map((h) => (
          <div
            key={h}
            className="absolute top-0 h-full w-px bg-slate-300/50"
            style={{ left: `${(h / 24) * 100}%` }}
          />
        ))}

        <div
          className="absolute top-[-2px] w-0.5 h-[calc(100%+4px)] bg-slate-800 rounded-full"
          style={{ left: `${nowPct}%` }}
        />
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-500">{label}</span>
        <span className="flex items-center gap-2">
          <span className="flex items-center gap-1">
            <span className="inline-block w-2.5 h-2 bg-amber-400 rounded-full" />
            <span className="text-[10px] text-slate-400">Maj.</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-2.5 h-1.5 bg-emerald-300/70 rounded-full" />
            <span className="text-[10px] text-slate-400">Min.</span>
          </span>
        </span>
      </div>
    </div>
  );
}

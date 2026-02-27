"use client";

import { HourlyForecast, Solunar } from "@/lib/types";

interface HeroNowProps {
  hours: HourlyForecast[];
  solunar: Solunar | undefined;
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function pressureTrend(current: number | null, prev: number | null): string {
  if (current == null || prev == null) return "";
  const delta = current - prev;
  if (delta > 1) return "\u2197";
  if (delta < -1) return "\u2198";
  return "\u2192";
}

function rainColor(prob: number | null): string {
  if (prob == null || prob === 0) return "text-emerald-500";
  if (prob > 50) return "text-amber-600";
  return "text-slate-500";
}

/* ── Hour slot ─────────────────────────────────────────────── */

function HourSlot({
  hour,
  prevHour,
  isCurrent,
}: {
  hour: HourlyForecast;
  prevHour: HourlyForecast | undefined;
  isCurrent: boolean;
}) {
  const hourLabel = `${parseInt(hour.datetime.slice(11, 13), 10)}h`;
  const trend = pressureTrend(hour.pression_hpa, prevHour?.pression_hpa ?? null);

  return (
    <div
      className={`hour-snap flex-shrink-0 rounded-2xl p-4 flex flex-col ${
        isCurrent
          ? "bg-white shadow-sm"
          : "bg-slate-100/60"
      }`}
      /* 3 columns visible = each ~31% of container, leaving ~7% for 4th peek */
      style={{ width: "calc((100% - 24px) / 3.3)" }}
    >
      {/* Hour label */}
      <div className="text-[11px] text-slate-400 mb-1">{hourLabel}</div>

      {/* Temperature */}
      <div
        className={`font-mono font-bold tracking-tighter mb-2 ${
          isCurrent
            ? "text-3xl text-slate-800"
            : "text-2xl text-slate-700"
        }`}
      >
        {hour.temperature_c != null ? `${hour.temperature_c.toFixed(1)}°` : "\u2013"}
      </div>

      {/* Wind */}
      <div className="mb-1.5">
        <div className="flex items-baseline gap-1">
          <span className={`font-mono font-bold text-slate-700 ${isCurrent ? "text-lg" : "text-base"}`}>
            {hour.vent_vitesse_kmh != null ? Math.round(hour.vent_vitesse_kmh) : "\u2013"}
          </span>
          <span className="text-[10px] text-slate-400">{hour.vent_direction ?? ""}</span>
        </div>
        {hour.vent_rafales_kmh != null && (
          <div className="text-[10px] text-slate-400">
            raf. <span className="font-mono">{Math.round(hour.vent_rafales_kmh)}</span>
          </div>
        )}
      </div>

      {/* Rain */}
      <div className={`font-mono text-xs font-medium mb-1 ${rainColor(hour.pluie_probabilite)}`}>
        {hour.pluie_probabilite != null ? `${Math.round(hour.pluie_probabilite)}%` : "\u2013"}
        {hour.pluie_intensite_mm != null && hour.pluie_intensite_mm > 0 && (
          <span className="text-[10px] ml-0.5">{hour.pluie_intensite_mm.toFixed(1)}mm</span>
        )}
      </div>

      {/* Pressure */}
      <div className="flex items-baseline gap-0.5">
        <span className="font-mono text-[10px] text-slate-400">
          {hour.pression_hpa != null ? Math.round(hour.pression_hpa) : "\u2013"}
        </span>
        {trend && <span className="text-[10px] text-slate-400">{trend}</span>}
      </div>
    </div>
  );
}

/* ── Solunar bar ───────────────────────────────────────────── */

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

function solunarStatusLabel(
  periods: SolunarPeriod[],
  nowMinutes: number
): string {
  // Check if currently in a period
  for (const p of periods) {
    const s = timeToMinutes(p.start);
    const e = timeToMinutes(p.end);
    if (nowMinutes >= s && nowMinutes <= e) {
      return p.type === "major"
        ? `Majeure en cours \u2014 jusqu\u2019\u00e0 ${p.end}`
        : `Mineure en cours \u2014 jusqu\u2019\u00e0 ${p.end}`;
    }
  }

  // Find next upcoming period
  const upcoming = periods
    .filter((p) => timeToMinutes(p.start) > nowMinutes)
    .sort((a, b) => timeToMinutes(a.start) - timeToMinutes(b.start));

  if (upcoming.length > 0) {
    const next = upcoming[0];
    return `Prochaine ${next.type === "major" ? "majeure" : "mineure"} : ${next.start}\u2013${next.end}`;
  }

  return "Aucune période restante aujourd\u2019hui";
}

function HeroSolunarBar({ solunar }: { solunar: Solunar }) {
  const totalMinutes = 24 * 60;
  const periods = getSolunarPeriods(solunar);

  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const nowPct = (nowMinutes / totalMinutes) * 100;

  const label = solunarStatusLabel(periods, nowMinutes);

  return (
    <div className="space-y-2">
      {/* Bar */}
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

        {/* Hour markers */}
        {[6, 12, 18].map((h) => (
          <div
            key={h}
            className="absolute top-0 h-full w-px bg-slate-300/50"
            style={{ left: `${(h / 24) * 100}%` }}
          />
        ))}

        {/* Current time indicator */}
        <div
          className="absolute top-[-2px] w-0.5 h-[calc(100%+4px)] bg-slate-800 rounded-full"
          style={{ left: `${nowPct}%` }}
        />
      </div>

      {/* Label */}
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

/* ── Main component ────────────────────────────────────────── */

export default function HeroNow({ hours, solunar }: HeroNowProps) {
  if (hours.length === 0) return null;

  return (
    <section className="pt-8 space-y-5 overflow-hidden">
      {/* Hour slots — 3 visible + partial 4th */}
      <div className="hour-scroll flex gap-2">
        {hours.slice(0, 12).map((hour, i) => (
          <HourSlot
            key={hour.datetime}
            hour={hour}
            prevHour={i > 0 ? hours[i - 1] : undefined}
            isCurrent={i === 0}
          />
        ))}
      </div>

      {/* Solunar bar — always visible */}
      {solunar && <HeroSolunarBar solunar={solunar} />}
    </section>
  );
}

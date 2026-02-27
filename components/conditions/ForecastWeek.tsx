"use client";

import { useState } from "react";
import { HourlyForecast, Solunar } from "@/lib/types";

interface ForecastWeekProps {
  forecast: HourlyForecast[];
  solunar: Solunar[];
}

function groupByDay(hours: HourlyForecast[]): Map<string, HourlyForecast[]> {
  const map = new Map<string, HourlyForecast[]>();
  for (const h of hours) {
    const day = h.datetime.slice(0, 10);
    if (!map.has(day)) map.set(day, []);
    map.get(day)!.push(h);
  }
  return map;
}

function formatDayHeader(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  const weekday = d.toLocaleDateString("fr-FR", { weekday: "long" });
  const day = d.getDate();
  const month = d.toLocaleDateString("fr-FR", { month: "long" });
  return `${weekday.charAt(0).toUpperCase() + weekday.slice(1)} ${day} ${month}`;
}

function moonEmoji(illumination: number | null): string {
  if (illumination == null) return "";
  if (illumination < 5) return "\uD83C\uDF11";
  if (illumination < 25) return "\uD83C\uDF12";
  if (illumination < 45) return "\uD83C\uDF13";
  if (illumination < 55) return "\uD83C\uDF14";
  if (illumination < 75) return "\uD83C\uDF15";
  if (illumination < 95) return "\uD83C\uDF16";
  return "\uD83C\uDF15";
}

function daySummary(hours: HourlyForecast[]): { label: string; color: string } {
  const dayH = hours.filter((h) => {
    const hr = parseInt(h.datetime.slice(11, 13), 10);
    return hr >= 7 && hr <= 19;
  });
  if (dayH.length === 0) return { label: "", color: "text-slate-400" };

  const avgWind = dayH.reduce((s, h) => s + (h.vent_vitesse_kmh ?? 0), 0) / dayH.length;
  const avgRain = dayH.reduce((s, h) => s + (h.pluie_probabilite ?? 0), 0) / dayH.length;
  const maxGust = Math.max(...dayH.map((h) => h.vent_rafales_kmh ?? 0));

  if (avgRain > 60) return { label: "Pluvieux", color: "text-slate-400" };
  if (maxGust > 50 || avgWind > 35) return { label: "Venteux", color: "text-amber-600" };
  if (avgRain > 30) return { label: "Averses", color: "text-slate-400" };
  if (avgWind > 20) return { label: "Brise", color: "text-slate-500" };
  return { label: "Calme", color: "text-emerald-600" };
}

function pressureTrendDay(hours: HourlyForecast[]): string {
  const valid = hours.filter((h) => h.pression_hpa != null);
  if (valid.length < 4) return "\u2192";
  const first = valid[0].pression_hpa!;
  const last = valid[valid.length - 1].pression_hpa!;
  const delta = last - first;
  if (delta > 3) return "\u2197 Hausse";
  if (delta < -3) return "\u2198 Baisse";
  return "\u2192 Stable";
}

function DaySummaryCard({
  date,
  hours,
  solunar,
}: {
  date: string;
  hours: HourlyForecast[];
  solunar: Solunar | undefined;
}) {
  const [open, setOpen] = useState(false);

  const dayH = hours.filter((h) => {
    const hr = parseInt(h.datetime.slice(11, 13), 10);
    return hr >= 7 && hr <= 19;
  });

  const temps = dayH.map((h) => h.temperature_c).filter((t): t is number => t != null);
  const tMin = temps.length > 0 ? Math.min(...temps) : null;
  const tMax = temps.length > 0 ? Math.max(...temps) : null;

  const winds = dayH.map((h) => h.vent_vitesse_kmh).filter((w): w is number => w != null);
  const avgWind = winds.length > 0 ? Math.round(winds.reduce((a, b) => a + b, 0) / winds.length) : null;

  // Dominant wind direction (most common)
  const dirs = dayH.map((h) => h.vent_direction).filter((d): d is string => d != null);
  const dirCount = new Map<string, number>();
  for (const d of dirs) dirCount.set(d, (dirCount.get(d) ?? 0) + 1);
  const dominantDir = [...dirCount.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "";

  const avgRain = dayH.length > 0
    ? Math.round(dayH.reduce((s, h) => s + (h.pluie_probabilite ?? 0), 0) / dayH.length)
    : null;

  const summary = daySummary(hours);
  const pTrend = pressureTrendDay(dayH);

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-5 py-4 active:bg-slate-50 transition-colors min-h-[56px]"
      >
        {/* Top row: day + condition */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-base text-slate-800 text-left">
              {formatDayHeader(date)}
            </span>
            {summary.label && (
              <span className={`text-xs font-medium ${summary.color}`}>
                {summary.label}
              </span>
            )}
          </div>
          <svg
            className={`w-4 h-4 text-slate-300 transition-transform duration-300 flex-shrink-0 ${open ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {/* Summary row — the key data at a glance */}
        <div className="flex items-center gap-4 text-sm">
          {/* Temp range */}
          <span className="font-mono font-bold text-slate-700">
            {tMin != null && tMax != null
              ? `${Math.round(tMin)}\u00b0 / ${Math.round(tMax)}\u00b0`
              : "\u2013"}
          </span>

          {/* Wind */}
          <span className="text-slate-500">
            <span className="font-mono font-medium">{avgWind ?? "\u2013"}</span>{" "}
            <span className="text-xs">km/h {dominantDir}</span>
          </span>

          {/* Rain */}
          <span className={avgRain != null && avgRain > 50 ? "text-amber-600" : "text-slate-400"}>
            <span className="font-mono font-medium">{avgRain ?? "\u2013"}</span>
            <span className="text-xs">% pluie</span>
          </span>
        </div>
      </button>

      {/* Collapsible detail */}
      <div className="collapse-content" data-open={open}>
        <div className="collapse-inner">
          <div className="px-5 pb-4 pt-1 space-y-3 border-t border-slate-50">
            {/* Pressure trend */}
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span>Pression : <span className="font-medium">{pTrend}</span></span>
            </div>

            {/* Solunar + sun/moon */}
            {solunar && (
              <div className="flex items-center gap-4 text-xs text-slate-400">
                <span>
                  {solunar.lever_soleil ?? "\u2013"} \u2013 {solunar.coucher_soleil ?? "\u2013"}
                </span>
                <span>
                  {moonEmoji(solunar.moon_illumination)}{" "}
                  {solunar.moon_illumination != null
                    ? `${Math.round(solunar.moon_illumination)}%`
                    : ""}
                </span>
              </div>
            )}

            {/* Solunar periods detail */}
            {solunar && (
              <div className="flex flex-wrap gap-2 text-[11px]">
                {solunar.major_1_start && solunar.major_1_end && (
                  <span className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full">
                    Maj. {solunar.major_1_start}\u2013{solunar.major_1_end}
                  </span>
                )}
                {solunar.major_2_start && solunar.major_2_end && (
                  <span className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full">
                    Maj. {solunar.major_2_start}\u2013{solunar.major_2_end}
                  </span>
                )}
                {solunar.minor_1_start && solunar.minor_1_end && (
                  <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">
                    Min. {solunar.minor_1_start}\u2013{solunar.minor_1_end}
                  </span>
                )}
                {solunar.minor_2_start && solunar.minor_2_end && (
                  <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">
                    Min. {solunar.minor_2_start}\u2013{solunar.minor_2_end}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ForecastWeek({ forecast, solunar }: ForecastWeekProps) {
  const dayMap = groupByDay(forecast);
  const solunarMap = new Map(solunar.map((s) => [s.date, s]));
  const days = Array.from(dayMap.keys()).sort();

  if (days.length === 0) {
    return (
      <p className="text-sm text-slate-400 py-8 text-center">
        Aucune prévision disponible.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {days.map((day) => (
        <DaySummaryCard
          key={day}
          date={day}
          hours={dayMap.get(day)!}
          solunar={solunarMap.get(day)}
        />
      ))}
    </div>
  );
}

"use client";

import { useState } from "react";
import { HourlyForecast, Solunar } from "@/lib/types";

const D = "font-[family-name:var(--font-space)]";

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

function trimSeconds(time: string): string {
  return time.slice(0, 5);
}

function conditionBadge(hours: HourlyForecast[]): { label: string; classes: string } {
  const dayH = hours.filter((h) => {
    const hr = parseInt(h.datetime.slice(11, 13), 10);
    return hr >= 7 && hr <= 19;
  });
  if (dayH.length === 0) return { label: "", classes: "" };

  const avgWind = dayH.reduce((s, h) => s + (h.vent_vitesse_kmh ?? 0), 0) / dayH.length;
  const avgRain = dayH.reduce((s, h) => s + (h.pluie_probabilite ?? 0), 0) / dayH.length;
  const maxGust = Math.max(...dayH.map((h) => h.vent_rafales_kmh ?? 0));

  if (avgRain > 60) return { label: "Pluvieux", classes: "bg-white/[0.06] text-white/75" };
  if (maxGust > 50 || avgWind > 35) return { label: "Venteux", classes: "bg-[#F59E0B]/20 text-[#F59E0B]" };
  if (avgRain > 30) return { label: "Averses", classes: "bg-white/[0.06] text-white/75" };
  if (avgWind > 20) return { label: "Brise", classes: "bg-white/[0.06] text-white/75" };
  return { label: "Calme", classes: "bg-[#22C55E]/20 text-[#22C55E]" };
}

function pressureTrendDay(hours: HourlyForecast[]): { label: string; arrow: string; color: string } {
  const valid = hours.filter((h) => h.pression_hpa != null);
  if (valid.length < 4) return { label: "Stable", arrow: "\u2192", color: "text-white/75" };
  const first = valid[0].pression_hpa!;
  const last = valid[valid.length - 1].pression_hpa!;
  const delta = last - first;
  if (delta > 3) return { label: "Hausse", arrow: "\u2197", color: "text-[#22C55E]" };
  if (delta < -3) return { label: "Baisse", arrow: "\u2198", color: "text-[#EF4444]/80" };
  return { label: "Stable", arrow: "\u2192", color: "text-white/75" };
}

function DaySummaryCard({
  date,
  hours,
  solunar,
  defaultOpen,
}: {
  date: string;
  hours: HourlyForecast[];
  solunar: Solunar | undefined;
  defaultOpen: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  const dayH = hours.filter((h) => {
    const hr = parseInt(h.datetime.slice(11, 13), 10);
    return hr >= 7 && hr <= 19;
  });

  const temps = dayH.map((h) => h.temperature_c).filter((t): t is number => t != null);
  const tMin = temps.length > 0 ? Math.min(...temps) : null;
  const tMax = temps.length > 0 ? Math.max(...temps) : null;

  const winds = dayH.map((h) => h.vent_vitesse_kmh).filter((w): w is number => w != null);
  const avgWind = winds.length > 0 ? Math.round(winds.reduce((a, b) => a + b, 0) / winds.length) : null;
  const maxGust = dayH.reduce((m, h) => Math.max(m, h.vent_rafales_kmh ?? 0), 0);

  const dirs = dayH.map((h) => h.vent_direction).filter((d): d is string => d != null);
  const dirCount = new Map<string, number>();
  for (const d of dirs) dirCount.set(d, (dirCount.get(d) ?? 0) + 1);
  const dominantDir = [...dirCount.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "";

  const maxRainProb = dayH.reduce((m, h) => Math.max(m, h.pluie_probabilite ?? 0), 0);
  const rainCumul = dayH.reduce((s, h) => s + (h.pluie_intensite_mm ?? 0), 0);

  const pTrend = pressureTrendDay(dayH);
  const pressures = dayH.map((h) => h.pression_hpa).filter((p): p is number => p != null);
  const avgPressure = pressures.length > 0 ? Math.round(pressures.reduce((a, b) => a + b, 0) / pressures.length) : null;

  const badge = conditionBadge(hours);

  const majors: string[] = [];
  const minors: string[] = [];
  if (solunar) {
    if (solunar.major_1_start && solunar.major_1_end) majors.push(`${trimSeconds(solunar.major_1_start)}\u2013${trimSeconds(solunar.major_1_end)}`);
    if (solunar.major_2_start && solunar.major_2_end) majors.push(`${trimSeconds(solunar.major_2_start)}\u2013${trimSeconds(solunar.major_2_end)}`);
    if (solunar.minor_1_start && solunar.minor_1_end) minors.push(`${trimSeconds(solunar.minor_1_start)}\u2013${trimSeconds(solunar.minor_1_end)}`);
    if (solunar.minor_2_start && solunar.minor_2_end) minors.push(`${trimSeconds(solunar.minor_2_start)}\u2013${trimSeconds(solunar.minor_2_end)}`);
  }

  return (
    <div className="bg-white/[0.07] backdrop-blur-xl border border-white/[0.12] rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-6 py-5 active:bg-white/[0.02] transition-colors text-left"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <span className="font-bold text-xl text-white">
              {formatDayHeader(date)}
            </span>
            {badge.label && (
              <span className={`text-base font-semibold px-3 py-1 rounded-full ${badge.classes}`}>
                {badge.label}
              </span>
            )}
          </div>
          <svg
            className={`w-5 h-5 text-white/30 transition-transform duration-300 flex-shrink-0 ${open ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        <div className="flex items-center gap-6">
          <span className={`${D} font-bold text-2xl text-white tracking-tight`}>
            {tMin != null && tMax != null
              ? `${Math.round(tMin)}\u00b0\u2013${Math.round(tMax)}\u00b0`
              : "\u2013"}
          </span>
          <span className="flex items-baseline gap-1.5 text-white/75">
            <span className={`${D} font-bold text-2xl text-white/70`}>{avgWind ?? "\u2013"}</span>
            <span className="text-base font-medium">km/h {dominantDir}</span>
          </span>
          <span className={maxRainProb > 50 ? "text-[#F59E0B]" : "text-white/70"}>
            <span className={`${D} font-bold text-2xl`}>{Math.round(maxRainProb)}</span>
            <span className="text-base font-medium">%</span>
          </span>
        </div>
      </button>

      <div className="collapse-content" data-open={open}>
        <div className="collapse-inner">
          <div className="px-6 pb-6 pt-3 border-t border-white/[0.06]">
            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
              <div>
                <span className="text-base text-white/70 font-medium">Vent dominant</span>
                <div className={`${D} font-bold text-lg text-white/80 mt-1`}>
                  {dominantDir} {avgWind ?? "\u2013"} km/h
                </div>
              </div>
              <div>
                <span className="text-base text-white/70 font-medium">Rafales max</span>
                <div className={`${D} font-bold text-lg text-white/80 mt-1`}>
                  {maxGust > 0 ? `${Math.round(maxGust)} km/h` : "\u2013"}
                </div>
              </div>
              <div>
                <span className="text-base text-white/70 font-medium">Pression</span>
                <div className={`${D} font-bold text-lg mt-1 ${pTrend.color}`}>
                  {pTrend.arrow} {pTrend.label} {avgPressure != null ? `(${avgPressure})` : ""}
                </div>
              </div>
              <div>
                <span className="text-base text-white/70 font-medium">Pluie</span>
                <div className={`${D} font-bold text-lg text-white/80 mt-1`}>
                  {Math.round(maxRainProb)}% max{rainCumul > 0 ? ` \u00b7 ${rainCumul.toFixed(1)} mm` : ""}
                </div>
              </div>
              {solunar && (
                <div>
                  <span className="text-base text-white/70 font-medium">Soleil</span>
                  <div className={`${D} text-lg text-white/80 font-semibold mt-1`}>
                    {solunar.lever_soleil ? trimSeconds(solunar.lever_soleil) : "\u2013"} \u2013 {solunar.coucher_soleil ? trimSeconds(solunar.coucher_soleil) : "\u2013"}
                  </div>
                </div>
              )}
              {solunar && (
                <div>
                  <span className="text-base text-white/70 font-medium">Lune</span>
                  <div className="text-lg text-white/80 font-semibold mt-1">
                    {moonEmoji(solunar.moon_illumination)}{" "}
                    {solunar.moon_illumination != null ? `${Math.round(solunar.moon_illumination)}%` : "\u2013"}
                  </div>
                </div>
              )}
            </div>

            {(majors.length > 0 || minors.length > 0) && (
              <p className="text-base font-semibold mt-4 pt-4 border-t border-white/[0.06]">
                {majors.length > 0 && <span className="text-[#F59E0B]">Maj. {majors.join(" / ")}</span>}
                {majors.length > 0 && minors.length > 0 && <span className="text-white/20"> {"\u00b7"} </span>}
                {minors.length > 0 && <span className="text-[#22C55E]">Min. {minors.join(" / ")}</span>}
              </p>
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
      <p className="text-lg text-white/70 py-8 text-center">
        Aucune pr&eacute;vision disponible.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {days.map((day, i) => (
        <DaySummaryCard
          key={day}
          date={day}
          hours={dayMap.get(day)!}
          solunar={solunarMap.get(day)}
          defaultOpen={i === 0}
        />
      ))}
    </div>
  );
}

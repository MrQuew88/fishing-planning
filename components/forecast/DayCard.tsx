"use client";

import { useState } from "react";
import { HourlyForecast, Solunar } from "@/lib/types";

interface DayCardProps {
  date: string;
  hours: HourlyForecast[];
  solunar: Solunar | undefined;
  defaultOpen: boolean;
}

function formatDayHeader(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  const weekday = d.toLocaleDateString("fr-FR", { weekday: "long" });
  const day = d.getDate();
  const month = d.toLocaleDateString("fr-FR", { month: "long" });
  return `${weekday.charAt(0).toUpperCase() + weekday.slice(1)} ${day} ${month}`;
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

/** Moon phase emoji from illumination percentage */
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

/** Summarize day conditions into a one-word label */
function daySummary(hours: HourlyForecast[]): { label: string; color: string } {
  const dayHours = hours.filter((h) => {
    const hr = parseInt(h.datetime.slice(11, 13), 10);
    return hr >= 7 && hr <= 19;
  });
  if (dayHours.length === 0) return { label: "", color: "text-slate-400" };

  const avgWind =
    dayHours.reduce((s, h) => s + (h.vent_vitesse_kmh ?? 0), 0) / dayHours.length;
  const avgRain =
    dayHours.reduce((s, h) => s + (h.pluie_probabilite ?? 0), 0) / dayHours.length;
  const maxGust = Math.max(...dayHours.map((h) => h.vent_rafales_kmh ?? 0));

  if (avgRain > 60) return { label: "Pluvieux", color: "text-slate-400" };
  if (maxGust > 50 || avgWind > 35) return { label: "Venteux", color: "text-amber-600" };
  if (avgRain > 30) return { label: "Averses", color: "text-slate-400" };
  if (avgWind > 20) return { label: "Brise", color: "text-slate-500" };
  return { label: "Calme", color: "text-emerald-600" };
}

function SolunarBars({ solunar }: { solunar: Solunar }) {
  const totalMinutes = 24 * 60;
  const periods: { start: string | null; end: string | null; type: "major" | "minor" }[] = [
    { start: solunar.major_1_start, end: solunar.major_1_end, type: "major" },
    { start: solunar.major_2_start, end: solunar.major_2_end, type: "major" },
    { start: solunar.minor_1_start, end: solunar.minor_1_end, type: "minor" },
    { start: solunar.minor_2_start, end: solunar.minor_2_end, type: "minor" },
  ];

  return (
    <div className="relative h-3 bg-slate-100 rounded-full overflow-hidden">
      {periods.map((p, i) => {
        if (!p.start || !p.end) return null;
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
                : "bg-emerald-300/70 h-2 top-0.5"
            }`}
            style={{ left: `${left}%`, width: `${Math.max(width, 1.5)}%` }}
            title={`${p.type === "major" ? "Majeure" : "Mineure"} ${p.start}\u2013${p.end}`}
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
    </div>
  );
}

function HourSlot({
  hour,
  prevHour,
}: {
  hour: HourlyForecast;
  prevHour: HourlyForecast | undefined;
}) {
  const hourLabel = `${parseInt(hour.datetime.slice(11, 13), 10)}h`;
  const trend = pressureTrend(hour.pression_hpa, prevHour?.pression_hpa ?? null);

  // Subtle background tint based on conditions
  let bgTint = "";
  if (hour.pluie_intensite_mm != null && hour.pluie_intensite_mm > 2) {
    bgTint = "bg-amber-50/50";
  } else if (
    (hour.vent_vitesse_kmh ?? 0) < 20 &&
    (hour.pluie_probabilite ?? 0) < 20
  ) {
    bgTint = "bg-emerald-50/30";
  }

  return (
    <div className={`hour-snap flex-shrink-0 w-[100px] py-3 px-3 rounded-xl ${bgTint}`}>
      {/* Hour */}
      <div className="text-[11px] text-slate-400 mb-1.5">{hourLabel}</div>

      {/* Temp — dominant */}
      <div className="font-mono text-3xl font-bold text-slate-800 tracking-tighter mb-2">
        {hour.temperature_c != null ? `${hour.temperature_c.toFixed(0)}°` : "\u2013"}
      </div>

      {/* Wind */}
      <div className="mb-2">
        <div className="flex items-baseline gap-1">
          <span className="font-mono text-lg font-bold text-slate-700">
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

      {/* Rain — colored */}
      <div className={`font-mono text-sm font-medium mb-1.5 ${rainColor(hour.pluie_probabilite)}`}>
        {hour.pluie_probabilite != null ? `${Math.round(hour.pluie_probabilite)}%` : "\u2013"}
        {hour.pluie_intensite_mm != null && hour.pluie_intensite_mm > 0 && (
          <span className="text-[10px] ml-0.5">{hour.pluie_intensite_mm.toFixed(1)}mm</span>
        )}
      </div>

      {/* Pressure — smallest */}
      <div className="flex items-baseline gap-0.5">
        <span className="font-mono text-[10px] text-slate-400">
          {hour.pression_hpa != null ? Math.round(hour.pression_hpa) : "\u2013"}
        </span>
        {trend && <span className="text-[10px] text-slate-400">{trend}</span>}
      </div>
    </div>
  );
}

export default function DayCard({ date, hours, solunar, defaultOpen }: DayCardProps) {
  const [open, setOpen] = useState(defaultOpen);

  const dayHours = hours.filter((h) => {
    const hour = parseInt(h.datetime.slice(11, 13), 10);
    return hour >= 6 && hour <= 21;
  });

  const summary = daySummary(hours);

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-4 active:bg-slate-50 transition-colors min-h-[56px]"
      >
        <div className="flex flex-col items-start gap-1">
          <div className="flex items-center gap-2.5">
            <span className="font-bold text-lg text-slate-800 leading-tight">
              {formatDayHeader(date)}
            </span>
            {summary.label && (
              <span className={`text-xs font-medium ${summary.color}`}>
                {summary.label}
              </span>
            )}
          </div>
          {solunar && (
            <div className="flex items-center gap-3 text-xs text-slate-400">
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
      </button>

      {/* Collapsible content */}
      <div className="collapse-content" data-open={open}>
        <div className="collapse-inner">
          <div className="px-6 pb-6 space-y-4">
            {/* Solunar bars */}
            {solunar && (
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider">Solunaire</span>
                  <span className="flex items-center gap-1">
                    <span className="inline-block w-3 h-2.5 bg-amber-400 rounded-full" />
                    <span className="text-[10px] text-slate-400">Maj.</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="inline-block w-3 h-2 bg-emerald-300/70 rounded-full" />
                    <span className="text-[10px] text-slate-400">Min.</span>
                  </span>
                </div>
                <SolunarBars solunar={solunar} />
              </div>
            )}

            {/* Horizontal scrolling hours */}
            <div className="overflow-hidden">
              <div className="hour-scroll flex gap-1">
                {dayHours.map((h, i) => (
                  <HourSlot
                    key={h.datetime}
                    hour={h}
                    prevHour={
                      i > 0
                        ? dayHours[i - 1]
                        : hours.find(
                            (x) =>
                              parseInt(x.datetime.slice(11, 13), 10) ===
                              parseInt(h.datetime.slice(11, 13), 10) - 1
                          )
                    }
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

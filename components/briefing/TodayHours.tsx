"use client";

import { useEffect, useRef } from "react";
import { HourlyForecast } from "@/lib/types";

const D = "font-[family-name:var(--font-space)]"; // Space Grotesk for data

function pressureTrend(current: number | null, prev: number | null): string {
  if (current == null || prev == null) return "";
  const delta = current - prev;
  if (delta > 1) return "\u2197";
  if (delta < -1) return "\u2198";
  return "\u2192";
}

function rainClasses(prob: number | null): string {
  if (prob == null || prob === 0) return "text-[#22C55E] font-medium";
  if (prob > 50) return "text-[#F59E0B] font-semibold";
  return "text-[#F59E0B] font-semibold";
}

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
      data-hour={parseInt(hour.datetime.slice(11, 13), 10)}
      className={`hour-snap flex-shrink-0 w-[120px] py-4 px-4 rounded-[12px] transition-colors ${
        isCurrent
          ? "bg-white/[0.08] border border-[#F59E0B]/30"
          : "bg-white/[0.03] border border-white/[0.06] rounded-xl"
      }`}
    >
      {/* Niveau 3 — Heure */}
      <div className={`text-sm font-medium mb-2 ${isCurrent ? "text-[#F59E0B] font-bold" : "text-white/40"}`}>
        {hourLabel}
      </div>

      {/* Niveau 1 — Température */}
      <div className={`${D} text-4xl font-bold tracking-tight mb-3 ${
        isCurrent ? "text-white" : "text-white/80"
      }`}>
        {hour.temperature_c != null ? `${hour.temperature_c.toFixed(0)}\u00b0` : "\u2013"}
      </div>

      {/* Niveau 2 — Vent */}
      <div className="mb-3">
        <div className="flex items-baseline gap-1.5">
          <span className={`${D} text-lg font-semibold ${isCurrent ? "text-[#F1F5F9]" : "text-[#F1F5F9]/80"}`}>
            {hour.vent_vitesse_kmh != null ? Math.round(hour.vent_vitesse_kmh) : "\u2013"}
          </span>
          <span className="text-sm text-white/40">{hour.vent_direction ?? ""}</span>
        </div>
        {/* Niveau 3 — Rafales */}
        {hour.vent_rafales_kmh != null && (
          <div className="text-sm text-white/45">
            raf. <span className={`${D} font-medium`}>{Math.round(hour.vent_rafales_kmh)}</span>
          </div>
        )}
      </div>

      {/* Niveau 2 — Pluie */}
      <div className={`${D} text-base mb-2 ${rainClasses(hour.pluie_probabilite)}`}>
        {hour.pluie_probabilite != null ? `${Math.round(hour.pluie_probabilite)}%` : "\u2013"}
        {hour.pluie_intensite_mm != null && hour.pluie_intensite_mm > 0 && (
          <span className="text-sm ml-1">{hour.pluie_intensite_mm.toFixed(1)}mm</span>
        )}
      </div>

      {/* Niveau 3 — Pression */}
      <div className="flex items-baseline gap-1">
        <span className={`${D} text-base text-white/50`}>
          {hour.pression_hpa != null ? Math.round(hour.pression_hpa) : "\u2013"}
        </span>
        {trend && <span className="text-sm text-white/50">{trend}</span>}
      </div>
    </div>
  );
}

export default function TodayHours({ hours }: { hours: HourlyForecast[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const currentHour = new Date().getHours();

  useEffect(() => {
    if (!scrollRef.current) return;
    const target = scrollRef.current.querySelector(
      `[data-hour="${currentHour}"]`
    ) as HTMLElement | null;
    if (target) {
      target.scrollIntoView({ inline: "start", block: "nearest", behavior: "instant" });
    }
  }, [currentHour]);

  if (hours.length === 0) return null;

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 overflow-hidden">
      <div ref={scrollRef} className="hour-scroll flex gap-1.5">
        {hours.map((h, i) => {
          const hHour = parseInt(h.datetime.slice(11, 13), 10);
          return (
            <HourSlot
              key={h.datetime}
              hour={h}
              prevHour={i > 0 ? hours[i - 1] : undefined}
              isCurrent={hHour === currentHour}
            />
          );
        })}
      </div>
    </div>
  );
}

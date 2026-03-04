"use client";

import { useEffect, useRef } from "react";
import { HourlyForecast } from "@/lib/types";

const D = "font-[family-name:var(--font-plex)]";

function pressureTrend(current: number | null, prev: number | null): string {
  if (current == null || prev == null) return "";
  const delta = current - prev;
  if (delta > 1) return "\u2197";
  if (delta < -1) return "\u2198";
  return "\u2192";
}

function rainInfo(prob: number | null, mm: number | null): { text: string; classes: string } | null {
  if (prob == null || prob < 15) return null;
  const mmStr = mm != null && mm > 0 ? ` \u00b7 ${mm.toFixed(1)}mm` : "";
  if (prob < 50) return { text: `Averses${mmStr}`, classes: "text-[#F59E0B] text-base" };
  if (prob < 80) return { text: `Pluie probable${mmStr}`, classes: "text-[#F59E0B] text-base font-semibold" };
  return { text: `Pluie certaine${mmStr}`, classes: "text-[#EF4444]/80 text-base font-semibold" };
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
  const rain = rainInfo(hour.pluie_probabilite, hour.pluie_intensite_mm);

  const windSpeed = hour.vent_vitesse_kmh != null ? Math.round(hour.vent_vitesse_kmh) : null;
  const windGust = hour.vent_rafales_kmh != null ? Math.round(hour.vent_rafales_kmh) : null;
  const windLine = windSpeed != null
    ? windGust != null
      ? `${windSpeed} / ${windGust} km/h`
      : `${windSpeed} km/h`
    : "\u2013";

  return (
    <div
      data-hour={parseInt(hour.datetime.slice(11, 13), 10)}
      className={`hour-snap flex-shrink-0 w-[180px] pt-3 pb-2 px-3 rounded-xl transition-colors flex flex-col ${
        isCurrent
          ? "bg-white/[0.08] border border-[#F59E0B]/30"
          : "bg-white/[0.03] border border-white/[0.06]"
      }`}
    >
      {/* Heure */}
      <div className={`text-base font-medium mb-2 ${isCurrent ? "text-[#F59E0B] font-bold" : "text-white/70"}`}>
        {hourLabel}
      </div>

      {/* Température */}
      <div className={`${D} text-4xl font-bold tracking-tight mb-3 ${
        isCurrent ? "text-white" : "text-white/80"
      }`}>
        {hour.temperature_c != null ? `${hour.temperature_c.toFixed(0)}\u00b0` : "\u2013"}
      </div>

      {/* Vent — direction prominent, puis vitesse/rafales */}
      <div className="mb-3">
        <div className={`text-lg font-bold ${isCurrent ? "text-white" : "text-white/80"}`}>
          {hour.vent_direction ?? "\u2013"}
        </div>
        <div className="text-base text-white/75 font-medium">
          {windLine}
        </div>
      </div>

      {/* Pluie — wording actionnable (flex-1 pushes pressure to bottom) */}
      <div className="flex-1">
        {rain && (
          <div className={`${rain.classes}`}>
            {rain.text}
          </div>
        )}
      </div>

      {/* Pression — always at bottom */}
      <div className="flex items-baseline gap-1 mt-2">
        <span className={`${D} text-base text-white/70 font-medium`}>
          {hour.pression_hpa != null ? Math.round(hour.pression_hpa) : "\u2013"}
        </span>
        {trend && <span className="text-base text-white/70">{trend}</span>}
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
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-3 overflow-hidden shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
      <div ref={scrollRef} className="hour-scroll flex gap-2">
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

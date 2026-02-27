"use client";

import { useEffect, useRef } from "react";
import { HourlyForecast } from "@/lib/types";

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
      className={`hour-snap flex-shrink-0 w-[100px] py-3 px-3 rounded-xl transition-colors ${
        isCurrent
          ? "bg-white border-l-[3px] border-l-amber-400 shadow-sm"
          : "bg-slate-50/80"
      }`}
    >
      <div className={`text-[11px] mb-1.5 ${isCurrent ? "text-amber-600 font-semibold" : "text-slate-400"}`}>
        {hourLabel}
      </div>

      <div className={`font-mono text-3xl font-bold tracking-tighter mb-2 ${
        isCurrent ? "text-slate-900" : "text-slate-700"
      }`}>
        {hour.temperature_c != null ? `${hour.temperature_c.toFixed(0)}\u00b0` : "\u2013"}
      </div>

      <div className="mb-2">
        <div className="flex items-baseline gap-1">
          <span className={`font-mono text-lg font-bold ${isCurrent ? "text-slate-800" : "text-slate-600"}`}>
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

      <div className={`font-mono text-sm font-medium mb-1.5 ${rainColor(hour.pluie_probabilite)}`}>
        {hour.pluie_probabilite != null ? `${Math.round(hour.pluie_probabilite)}%` : "\u2013"}
        {hour.pluie_intensite_mm != null && hour.pluie_intensite_mm > 0 && (
          <span className="text-[10px] ml-0.5">{hour.pluie_intensite_mm.toFixed(1)}mm</span>
        )}
      </div>

      <div className="flex items-baseline gap-0.5">
        <span className="font-mono text-[10px] text-slate-400">
          {hour.pression_hpa != null ? Math.round(hour.pression_hpa) : "\u2013"}
        </span>
        {trend && <span className="text-[10px] text-slate-400">{trend}</span>}
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
    <div className="bg-white rounded-2xl shadow-sm p-4 overflow-hidden">
      <div ref={scrollRef} className="hour-scroll flex gap-1">
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

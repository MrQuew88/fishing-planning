"use client";

import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";
import { DailyWeather } from "@/lib/types";
import { TICK_STYLE, AXIS_LINE, GRID_STROKE, TOOLTIP_STYLE, LABEL_STYLE } from "@/lib/chart-theme";

const DIRECTIONS = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"] as const;
const DIR_INDEX: Record<string, number> = {};
DIRECTIONS.forEach((d, i) => (DIR_INDEX[d] = i));

function windColor(kmh: number | null): string {
  if (kmh == null) return "rgba(255,255,255,0.2)";
  if (kmh < 20) return "#22C55E";
  if (kmh < 40) return "#F59E0B";
  return "rgba(255,255,255,0.4)";
}

export default function WindDirectionChart({ data }: { data: DailyWeather[] }) {
  const sorted = [...data]
    .filter((d) => d.direction_vent)
    .sort((a, b) => a.date.localeCompare(b.date));

  const chartData = sorted.map((row) => ({
    date: row.date,
    dirIndex: DIR_INDEX[row.direction_vent!.toUpperCase()] ?? null,
    direction: row.direction_vent,
    vent_kmh: row.vent_kmh,
  }));

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
      <h3 className="text-base font-bold text-white/60 uppercase tracking-[0.15em] mb-1">
        Direction du vent
      </h3>
      <div className="flex gap-3 mb-4">
        <span className="text-xs text-white/60">
          <span style={{ color: "#22C55E" }}>{"\u25CF"}</span> &lt;20
        </span>
        <span className="text-xs text-white/60">
          <span style={{ color: "#F59E0B" }}>{"\u25CF"}</span> 20-40
        </span>
        <span className="text-xs text-white/60">
          <span style={{ color: "rgba(255,255,255,0.4)" }}>{"\u25CF"}</span> &gt;40 km/h
        </span>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <ScatterChart margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} />
          <XAxis dataKey="date" tick={TICK_STYLE} axisLine={AXIS_LINE} tickLine={false} type="category" allowDuplicatedCategory={false} tickFormatter={(v: string) => v.slice(5)} />
          <YAxis dataKey="dirIndex" type="number" domain={[-0.5, 7.5]} ticks={[0, 1, 2, 3, 4, 5, 6, 7]} tickFormatter={(v: number) => DIRECTIONS[v] ?? ""} tick={TICK_STYLE} axisLine={AXIS_LINE} tickLine={false} />
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            labelStyle={LABEL_STYLE}
            itemStyle={{ color: "#F1F5F9" }}
            formatter={((_: unknown, __: string, entry: { payload: { direction: string; vent_kmh: number | null } }) => {
              const p = entry.payload;
              return [`${p.direction} \u2014 ${p.vent_kmh ?? "?"} km/h`, "Vent"];
            }) as never}
          />
          <Scatter data={chartData} fill="#22C55E">
            {chartData.map((entry, i) => (
              <Cell key={i} fill={windColor(entry.vent_kmh)} r={4} />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}

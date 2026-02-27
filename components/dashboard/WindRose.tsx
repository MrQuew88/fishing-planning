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

const DIRECTIONS = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"] as const;
const DIR_INDEX: Record<string, number> = {};
DIRECTIONS.forEach((d, i) => (DIR_INDEX[d] = i));

function windColor(kmh: number | null): string {
  if (kmh == null) return "#cbd5e1";
  if (kmh < 20) return "#16a34a";
  if (kmh < 40) return "#d97706";
  return "#94a3b8";
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
    <div className="bg-white rounded-2xl shadow-sm p-5">
      <h3 className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">
        Direction du vent
      </h3>
      <div className="flex gap-3 mb-4">
        <span className="text-[10px] text-slate-400">
          <span style={{ color: "#16a34a" }}>{"\u25CF"}</span> &lt;20
        </span>
        <span className="text-[10px] text-slate-400">
          <span style={{ color: "#d97706" }}>{"\u25CF"}</span> 20-40
        </span>
        <span className="text-[10px] text-slate-400">
          <span style={{ color: "#94a3b8" }}>{"\u25CF"}</span> &gt;40 km/h
        </span>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <ScatterChart margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: "#94a3b8" }}
            type="category"
            allowDuplicatedCategory={false}
            tickFormatter={(v: string) => v.slice(5)}
          />
          <YAxis
            dataKey="dirIndex"
            type="number"
            domain={[-0.5, 7.5]}
            ticks={[0, 1, 2, 3, 4, 5, 6, 7]}
            tickFormatter={(v: number) => DIRECTIONS[v] ?? ""}
            tick={{ fontSize: 10, fill: "#94a3b8" }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #e2e8f0",
              borderRadius: "12px",
              fontSize: "12px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
            }}
            labelStyle={{ color: "#94a3b8" }}
            formatter={((_: unknown, __: string, entry: { payload: { direction: string; vent_kmh: number | null } }) => {
              const p = entry.payload;
              return [`${p.direction} \u2014 ${p.vent_kmh ?? "?"} km/h`, "Vent"];
            }) as never}
          />
          <Scatter data={chartData} fill="#16a34a">
            {chartData.map((entry, i) => (
              <Cell key={i} fill={windColor(entry.vent_kmh)} r={4} />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}

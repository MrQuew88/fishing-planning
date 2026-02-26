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
  if (kmh == null) return "#6b7280";
  if (kmh < 20) return "#10b981"; // vert — faible
  if (kmh < 40) return "#f59e0b"; // orange — moyen
  return "#ef4444"; // rouge — fort
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
    <div>
      <h3 className="text-sm font-medium text-gray-400 mb-2">
        Direction du vent
        <span className="ml-3 text-xs font-normal">
          <span style={{ color: "#10b981" }}>●</span>{" "}&lt;20
          <span className="ml-2" style={{ color: "#f59e0b" }}>●</span>{" "}20-40
          <span className="ml-2" style={{ color: "#ef4444" }}>●</span>{" "}&gt;40 km/h
        </span>
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <ScatterChart margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: "#9ca3af" }}
            type="category"
            allowDuplicatedCategory={false}
          />
          <YAxis
            dataKey="dirIndex"
            type="number"
            domain={[-0.5, 7.5]}
            ticks={[0, 1, 2, 3, 4, 5, 6, 7]}
            tickFormatter={(v: number) => DIRECTIONS[v] ?? ""}
            tick={{ fontSize: 11, fill: "#9ca3af" }}
          />
          <Tooltip
            contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151" }}
            labelStyle={{ color: "#9ca3af" }}
            formatter={((_: unknown, __: string, entry: { payload: { direction: string; vent_kmh: number | null } }) => {
              const p = entry.payload;
              return [`${p.direction} — ${p.vent_kmh ?? "?"}  km/h`, "Vent"];
            }) as never}
          />
          <Scatter data={chartData} fill="#10b981">
            {chartData.map((entry, i) => (
              <Cell key={i} fill={windColor(entry.vent_kmh)} r={5} />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}

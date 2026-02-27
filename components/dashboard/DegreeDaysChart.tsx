"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from "recharts";
import { DailyWeather } from "@/lib/types";

export default function DegreeDaysChart({ data }: { data: DailyWeather[] }) {
  const sorted = [...data].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="bg-white rounded-2xl shadow-sm p-5">
      <h3 className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-4">
        Degrés-jour cumulés — seuils 500 / 800
      </h3>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={sorted} margin={{ top: 5, right: 10, bottom: 5, left: -10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: "#94a3b8" }}
            tickFormatter={(v: string) => v.slice(5)}
          />
          <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #e2e8f0",
              borderRadius: "12px",
              fontSize: "12px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
            }}
            labelStyle={{ color: "#94a3b8" }}
          />
          <ReferenceLine y={500} stroke="#d97706" strokeDasharray="5 5" label={{ value: "500", fill: "#d97706", fontSize: 10 }} />
          <ReferenceLine y={800} stroke="#94a3b8" strokeDasharray="5 5" label={{ value: "800", fill: "#94a3b8", fontSize: 10 }} />
          <Line
            type="monotone"
            dataKey="degres_jour_cumules"
            stroke="#d97706"
            strokeWidth={2}
            dot={false}
            name="DJ cumulés"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

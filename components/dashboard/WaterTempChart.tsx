"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceArea,
} from "recharts";
import { DailyWeather } from "@/lib/types";

export default function WaterTempChart({ data }: { data: DailyWeather[] }) {
  const sorted = [...data].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div>
      <h3 className="text-sm font-medium text-gray-400 mb-2">
        Température eau (°C) — zone de fraie 8-12°C
      </h3>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={sorted} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#9ca3af" }} />
          <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} />
          <Tooltip
            contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151" }}
            labelStyle={{ color: "#9ca3af" }}
          />
          <ReferenceArea y1={8} y2={12} fill="#22c55e" fillOpacity={0.15} />
          <Line
            type="monotone"
            dataKey="temp_eau_c"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={false}
            name="T° eau"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

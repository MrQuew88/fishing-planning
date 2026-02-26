"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { DailyWeather } from "@/lib/types";

export default function WaterLevelChart({ data }: { data: DailyWeather[] }) {
  const sorted = [...data].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div>
      <h3 className="text-sm font-medium text-gray-400 mb-2">
        Niveau d&apos;eau (delta base 46m AOD)
      </h3>
      <ResponsiveContainer width="100%" height={250}>
        <AreaChart data={sorted} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#9ca3af" }} />
          <YAxis
            tick={{ fontSize: 11, fill: "#9ca3af" }}
            label={{ value: "m", angle: -90, position: "insideLeft", fill: "#6b7280", fontSize: 11 }}
          />
          <Tooltip
            contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151" }}
            labelStyle={{ color: "#9ca3af" }}
          />
          <Area
            type="monotone"
            dataKey="niveau_eau_delta"
            stroke="#06b6d4"
            fill="#06b6d4"
            fillOpacity={0.2}
            strokeWidth={2}
            name="Δ niveau (m)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

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
    <div>
      <h3 className="text-sm font-medium text-gray-400 mb-2">
        Degrés-jour cumulés — seuils 500 / 800 DJ
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
          <ReferenceLine y={500} stroke="#eab308" strokeDasharray="5 5" label={{ value: "500 DJ", fill: "#eab308", fontSize: 11 }} />
          <ReferenceLine y={800} stroke="#ef4444" strokeDasharray="5 5" label={{ value: "800 DJ", fill: "#ef4444", fontSize: 11 }} />
          <Line
            type="monotone"
            dataKey="degres_jour_cumules"
            stroke="#f97316"
            strokeWidth={2}
            dot={false}
            name="DJ cumulés"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

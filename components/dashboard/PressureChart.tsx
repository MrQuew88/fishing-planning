"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { DailyWeather } from "@/lib/types";

export default function PressureChart({ data }: { data: DailyWeather[] }) {
  const sorted = [...data].sort((a, b) => a.date.localeCompare(b.date));

  // Compute trend arrow per point
  const withTrend = sorted.map((d, i) => {
    let trend = "→";
    if (i > 0 && d.pression_hpa !== null && sorted[i - 1].pression_hpa !== null) {
      const delta = d.pression_hpa! - sorted[i - 1].pression_hpa!;
      if (delta > 1) trend = "↑";
      else if (delta < -1) trend = "↓";
    }
    return { ...d, trend };
  });

  return (
    <div>
      <h3 className="text-sm font-medium text-gray-400 mb-2">
        Pression barométrique (hPa)
      </h3>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={withTrend} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#9ca3af" }} />
          <YAxis domain={["auto", "auto"]} tick={{ fontSize: 11, fill: "#9ca3af" }} />
          <Tooltip
            contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151" }}
            labelStyle={{ color: "#9ca3af" }}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter={((value: any, _name: any, props: any) => {
              const trend = props?.payload?.trend ?? "";
              return [`${Number(value).toFixed(1)} hPa ${trend}`, "Pression"];
            }) as never}
          />
          <Line
            type="monotone"
            dataKey="pression_hpa"
            stroke="#a78bfa"
            strokeWidth={2}
            dot={false}
            name="Pression"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

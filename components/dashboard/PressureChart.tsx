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

  const withTrend = sorted.map((d, i) => {
    let trend = "\u2192";
    if (i > 0 && d.pression_hpa !== null && sorted[i - 1].pression_hpa !== null) {
      const delta = d.pression_hpa! - sorted[i - 1].pression_hpa!;
      if (delta > 1) trend = "\u2197";
      else if (delta < -1) trend = "\u2198";
    }
    return { ...d, trend };
  });

  return (
    <div className="bg-white rounded-2xl shadow-sm p-5">
      <h3 className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-4">
        Pression barométrique (hPa)
      </h3>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={withTrend} margin={{ top: 5, right: 10, bottom: 5, left: -10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: "#94a3b8" }}
            tickFormatter={(v: string) => v.slice(5)}
          />
          <YAxis domain={["auto", "auto"]} tick={{ fontSize: 10, fill: "#94a3b8" }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #e2e8f0",
              borderRadius: "12px",
              fontSize: "12px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
            }}
            labelStyle={{ color: "#94a3b8" }}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter={((value: any, _name: any, props: any) => {
              const trend = props?.payload?.trend ?? "";
              return [`${Number(value).toFixed(1)} hPa ${trend}`, "Pression"];
            }) as never}
          />
          <Line
            type="monotone"
            dataKey="pression_hpa"
            stroke="#8b5cf6"
            strokeWidth={2}
            dot={false}
            name="Pression"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

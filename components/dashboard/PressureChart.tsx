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
import { TICK_STYLE, AXIS_LINE, GRID_STROKE, TOOLTIP_STYLE, LABEL_STYLE } from "@/lib/chart-theme";

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
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
      <h3 className="text-base font-bold text-white/60 uppercase tracking-[0.15em] mb-4">
        Pression barométrique (hPa)
      </h3>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={withTrend} margin={{ top: 5, right: 10, bottom: 5, left: -10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} />
          <XAxis dataKey="date" tick={TICK_STYLE} axisLine={AXIS_LINE} tickLine={false} tickFormatter={(v: string) => v.slice(5)} />
          <YAxis domain={["auto", "auto"]} tick={TICK_STYLE} axisLine={AXIS_LINE} tickLine={false} />
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            labelStyle={LABEL_STYLE}
            itemStyle={{ color: "#F1F5F9" }}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter={((value: any, _name: any, props: any) => {
              const trend = props?.payload?.trend ?? "";
              return [`${Number(value).toFixed(1)} hPa ${trend}`, "Pression"];
            }) as never}
          />
          <Line type="monotone" dataKey="pression_hpa" stroke="#8b5cf6" strokeWidth={2} dot={false} name="Pression" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

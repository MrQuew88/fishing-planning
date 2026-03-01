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
import { TICK_STYLE, AXIS_LINE, GRID_STROKE, TOOLTIP_STYLE, LABEL_STYLE } from "@/lib/chart-theme";

export default function WaterLevelChart({ data }: { data: DailyWeather[] }) {
  const sorted = [...data].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
      <h3 className="text-xl font-bold text-[#F1F5F9] uppercase tracking-wide mb-4">
        Niveau d&apos;eau (delta base 46m AOD)
      </h3>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={sorted} margin={{ top: 5, right: 10, bottom: 5, left: -10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} />
          <XAxis dataKey="date" tick={TICK_STYLE} axisLine={AXIS_LINE} tickLine={false} tickFormatter={(v: string) => v.slice(5)} />
          <YAxis tick={TICK_STYLE} axisLine={AXIS_LINE} tickLine={false} />
          <Tooltip contentStyle={TOOLTIP_STYLE} labelStyle={LABEL_STYLE} itemStyle={{ color: "#F1F5F9" }} />
          <Area type="monotone" dataKey="niveau_eau_delta" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.1} strokeWidth={2} name={"\u0394 niveau (m)"} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

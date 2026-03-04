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
import { TICK_STYLE, AXIS_LINE, GRID_STROKE, TOOLTIP_STYLE, LABEL_STYLE } from "@/lib/chart-theme";

export default function DegreeDaysChart({ data }: { data: DailyWeather[] }) {
  const sorted = [...data].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
      <h3 className="text-xl font-bold text-[#F1F5F9] uppercase tracking-wide mb-4">
        Degrés-jour cumulés — seuils 500 / 800
      </h3>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={sorted} margin={{ top: 5, right: 10, bottom: 5, left: -10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} />
          <XAxis dataKey="date" tick={TICK_STYLE} axisLine={AXIS_LINE} tickLine={false} tickFormatter={(v: string) => v.slice(5)} />
          <YAxis tick={TICK_STYLE} axisLine={AXIS_LINE} tickLine={false} />
          <Tooltip contentStyle={TOOLTIP_STYLE} labelStyle={LABEL_STYLE} itemStyle={{ color: "#F1F5F9" }} />
          <ReferenceLine y={500} stroke="#F59E0B" strokeDasharray="5 5" label={{ value: "500", fill: "rgba(255,255,255,0.6)", fontSize: 14 }} />
          <ReferenceLine y={800} stroke="rgba(255,255,255,0.3)" strokeDasharray="5 5" label={{ value: "800", fill: "rgba(255,255,255,0.6)", fontSize: 14 }} />
          <Line type="monotone" dataKey="degres_jour_cumules" stroke="#F59E0B" strokeWidth={2} dot={false} name="DJ cumulés" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

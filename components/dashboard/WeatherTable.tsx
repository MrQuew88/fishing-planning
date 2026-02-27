"use client";

import { DailyWeather } from "@/lib/types";

const columns: { key: keyof DailyWeather; label: string }[] = [
  { key: "date", label: "Date" },
  { key: "tmin_air", label: "T°min" },
  { key: "tmax_air", label: "T°max" },
  { key: "temp_eau_c", label: "T°eau" },
  { key: "temp_moyenne_c", label: "T°moy" },
  { key: "degres_jour_cumules", label: "DJ" },
  { key: "vent_kmh", label: "Vent" },
  { key: "rafales_kmh", label: "Raf." },
  { key: "direction_vent", label: "Dir." },
  { key: "pression_hpa", label: "hPa" },
  { key: "pluie_mm", label: "Pluie" },
  { key: "niveau_eau_delta", label: "Δ niv." },
];

function fmt(v: unknown): string {
  if (v === null || v === undefined) return "\u2013";
  if (typeof v === "number") return v.toFixed(1);
  return String(v);
}

export default function WeatherTable({ data }: { data: DailyWeather[] }) {
  if (!data.length) {
    return <p className="text-sm text-slate-400">Aucune donnée disponible.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-100">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50">
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-2.5 py-2 text-left font-medium text-slate-400 whitespace-nowrap"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.id} className="border-b border-slate-50 hover:bg-slate-50/50">
              {columns.map((col) => (
                <td key={col.key} className="px-2.5 py-1.5 whitespace-nowrap font-mono text-slate-600">
                  {fmt(row[col.key])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

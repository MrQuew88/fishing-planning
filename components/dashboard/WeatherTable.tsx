"use client";

import { DailyWeather } from "@/lib/types";

const D = "font-[family-name:var(--font-space)]";

const columns: { key: keyof DailyWeather; label: string }[] = [
  { key: "date", label: "Date" },
  { key: "tmin_air", label: "T\u00b0min" },
  { key: "tmax_air", label: "T\u00b0max" },
  { key: "temp_eau_c", label: "T\u00b0eau" },
  { key: "temp_moyenne_c", label: "T\u00b0moy" },
  { key: "degres_jour_cumules", label: "DJ" },
  { key: "vent_kmh", label: "Vent" },
  { key: "rafales_kmh", label: "Raf." },
  { key: "direction_vent", label: "Dir." },
  { key: "pression_hpa", label: "hPa" },
  { key: "pluie_mm", label: "Pluie" },
  { key: "niveau_eau_delta", label: "\u0394 niv." },
];

function fmt(v: unknown): string {
  if (v === null || v === undefined) return "\u2013";
  if (typeof v === "number") return v.toFixed(1);
  return String(v);
}

export default function WeatherTable({ data }: { data: DailyWeather[] }) {
  if (!data.length) {
    return <p className="text-lg text-white/70">Aucune donn&eacute;e disponible.</p>;
  }

  return (
    <div className="overflow-x-auto bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
      <table className="w-full text-base">
        <thead>
          <tr className="border-b border-white/[0.06]">
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-3 py-3 text-left font-bold text-white/70 whitespace-nowrap text-base"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.date} className="border-b border-white/[0.04] hover:bg-white/[0.03]">
              {columns.map((col) => (
                <td key={col.key} className={`px-3 py-2 whitespace-nowrap ${D} text-white/70`}>
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

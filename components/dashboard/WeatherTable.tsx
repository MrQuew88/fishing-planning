"use client";

import { DailyWeather } from "@/lib/types";

const columns: { key: keyof DailyWeather; label: string; format?: (v: unknown) => string }[] = [
  { key: "date", label: "Date" },
  { key: "tmin_air", label: "T°min" },
  { key: "tmax_air", label: "T°max" },
  { key: "temp_eau_c", label: "T°eau" },
  { key: "temp_moyenne_c", label: "T°moy" },
  { key: "degres_jour_cumules", label: "DJ cum." },
  { key: "vent_kmh", label: "Vent km/h" },
  { key: "rafales_kmh", label: "Raf. km/h" },
  { key: "direction_vent", label: "Dir." },
  { key: "pression_hpa", label: "Pression" },
  { key: "pluie_mm", label: "Pluie mm" },
  { key: "niveau_eau_delta", label: "Δ niveau" },
];

function fmt(v: unknown): string {
  if (v === null || v === undefined) return "—";
  if (typeof v === "number") return v.toFixed(1);
  return String(v);
}

export default function WeatherTable({ data }: { data: DailyWeather[] }) {
  if (!data.length) {
    return <p className="text-gray-500 text-sm">Aucune donnée disponible.</p>;
  }

  return (
    <div className="overflow-x-auto border border-gray-800 rounded">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-800 bg-gray-900">
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-3 py-2 text-left font-medium text-gray-400 whitespace-nowrap"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.id} className="border-b border-gray-800/50 hover:bg-gray-900/50">
              {columns.map((col) => (
                <td key={col.key} className="px-3 py-1.5 whitespace-nowrap">
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

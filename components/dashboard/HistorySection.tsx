"use client";

import { useState } from "react";
import { DailyWeather } from "@/lib/types";
import WaterTempChart from "./WaterTempChart";
import DegreeDaysChart from "./DegreeDaysChart";
import WaterLevelChart from "./WaterLevelChart";
import PressureChart from "./PressureChart";
import WindDirectionChart from "./WindRose";
import WeatherTable from "./WeatherTable";

export default function HistorySection({ data }: { data: DailyWeather[] }) {
  const [showTable, setShowTable] = useState(false);

  if (!data.length) {
    return (
      <p className="text-sm text-slate-400 py-8 text-center">
        Aucune donnée historique disponible.
      </p>
    );
  }

  return (
    <section className="space-y-6">
      <div className="space-y-4">
        <WaterTempChart data={data} />
        <DegreeDaysChart data={data} />
        <WaterLevelChart data={data} />
        <PressureChart data={data} />
        <WindDirectionChart data={data} />
      </div>

      {/* Expandable raw data table */}
      <div>
        <button
          onClick={() => setShowTable(!showTable)}
          className="flex items-center gap-2 text-xs text-slate-400 hover:text-slate-600 transition-colors py-2"
        >
          <svg
            className={`w-3.5 h-3.5 transition-transform duration-300 ${showTable ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
          {showTable ? "Masquer" : "Voir"} les données brutes
        </button>
        <div className="collapse-content" data-open={showTable}>
          <div className="collapse-inner">
            <WeatherTable data={data} />
          </div>
        </div>
      </div>
    </section>
  );
}

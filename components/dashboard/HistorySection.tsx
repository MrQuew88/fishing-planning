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
      <p className="text-base text-white/40 py-8 text-center">
        Aucune donn\u00e9e historique disponible.
      </p>
    );
  }

  return (
    <section className="space-y-4">
      <div className="space-y-4">
        <WaterTempChart data={data} />
        <DegreeDaysChart data={data} />
        <WaterLevelChart data={data} />
        <PressureChart data={data} />
        <WindDirectionChart data={data} />
      </div>

      <div>
        <button
          onClick={() => setShowTable(!showTable)}
          className="flex items-center gap-2 text-base font-medium text-white/40 hover:text-white/60 transition-colors py-2"
        >
          <svg
            className={`w-4 h-4 transition-transform duration-300 ${showTable ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
          {showTable ? "Masquer" : "Voir"} les donn\u00e9es brutes
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

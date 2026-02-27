"use client";

import { useState } from "react";
import { DailyWeather, HourlyForecast, Solunar } from "@/lib/types";
import HistorySection from "@/components/dashboard/HistorySection";
import ForecastWeek from "@/components/conditions/ForecastWeek";

interface ConditionsTabsProps {
  weatherData: DailyWeather[];
  forecast: HourlyForecast[];
  solunar: Solunar[];
}

export default function ConditionsTabs({
  weatherData,
  forecast,
  solunar,
}: ConditionsTabsProps) {
  const [tab, setTab] = useState<"historique" | "previsions">("historique");

  return (
    <div className="space-y-6">
      {/* Sub-tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
        <button
          onClick={() => setTab("historique")}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
            tab === "historique"
              ? "bg-white text-slate-800 shadow-sm"
              : "text-slate-400 hover:text-slate-600"
          }`}
        >
          Historique
        </button>
        <button
          onClick={() => setTab("previsions")}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
            tab === "previsions"
              ? "bg-white text-slate-800 shadow-sm"
              : "text-slate-400 hover:text-slate-600"
          }`}
        >
          Prévisions 7j
        </button>
      </div>

      {/* Content */}
      {tab === "historique" ? (
        <HistorySection data={weatherData} />
      ) : (
        <ForecastWeek forecast={forecast} solunar={solunar} />
      )}
    </div>
  );
}

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

const tabs = [
  { key: "historique" as const, label: "Historique" },
  { key: "previsions" as const, label: "Prévisions" },
];

export default function ConditionsTabs({
  weatherData,
  forecast,
  solunar,
}: ConditionsTabsProps) {
  const [tab, setTab] = useState<"historique" | "previsions">("historique");

  return (
    <div className="space-y-8">
      {/* Sub-navigation pills */}
      <div className="flex gap-1 p-1 bg-white/5 border border-white/10 rounded-2xl w-fit">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-5 py-2 rounded-full text-sm font-bold uppercase tracking-[0.1em] transition-colors ${
              tab === t.key
                ? "bg-white/10 text-white"
                : "text-white/40 hover:text-white/60"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="animate-fade-in" key={tab}>
        {tab === "historique" ? (
          <HistorySection data={weatherData} />
        ) : (
          <ForecastWeek forecast={forecast} solunar={solunar} />
        )}
      </div>
    </div>
  );
}

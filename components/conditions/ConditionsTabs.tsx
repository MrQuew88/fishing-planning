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
  { key: "previsions" as const, label: "Pr\u00e9visions" },
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
            className={`px-6 py-3 rounded-full text-base font-bold uppercase tracking-wide transition-colors min-h-[48px] ${
              tab === t.key
                ? "bg-white/10 text-white"
                : "text-white/70 hover:text-white/70"
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

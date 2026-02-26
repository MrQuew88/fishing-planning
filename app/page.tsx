import { supabase } from "@/lib/supabase";
import { DailyWeather } from "@/lib/types";
import WeatherTable from "@/components/dashboard/WeatherTable";
import WaterTempChart from "@/components/dashboard/WaterTempChart";
import DegreeDaysChart from "@/components/dashboard/DegreeDaysChart";
import WaterLevelChart from "@/components/dashboard/WaterLevelChart";
import PressureChart from "@/components/dashboard/PressureChart";
import WindDirectionChart from "@/components/dashboard/WindRose";

export const dynamic = "force-dynamic";

async function getWeatherData(): Promise<DailyWeather[]> {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("daily_weather")
    .select("*")
    .order("date", { ascending: false })
    .limit(90);

  if (error) {
    console.error("Failed to fetch weather data:", error);
    return [];
  }

  return data as DailyWeather[];
}

export default async function DashboardPage() {
  const data = await getWeatherData();

  return (
    <div className="space-y-8">
      <h1 className="text-xl font-bold">Historique météo — Killykeen</h1>

      <WeatherTable data={data} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WaterTempChart data={data} />
        <DegreeDaysChart data={data} />
        <WaterLevelChart data={data} />
        <PressureChart data={data} />
      </div>

      <WindDirectionChart data={data} />
    </div>
  );
}

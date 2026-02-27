import { supabase } from "@/lib/supabase";
import { DailyWeather, HourlyForecast, Solunar } from "@/lib/types";
import ConditionsTabs from "@/components/conditions/ConditionsTabs";

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

async function getForecastData(): Promise<HourlyForecast[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("hourly_forecast")
    .select("*")
    .order("datetime", { ascending: true });
  if (error) {
    console.error("Failed to fetch forecast data:", error);
    return [];
  }
  return data as HourlyForecast[];
}

async function getSolunarData(): Promise<Solunar[]> {
  if (!supabase) return [];
  const today = new Date().toISOString().slice(0, 10);
  const { data, error } = await supabase
    .from("solunar")
    .select("*")
    .gte("date", today)
    .order("date", { ascending: true })
    .limit(7);
  if (error) {
    console.error("Failed to fetch solunar data:", error);
    return [];
  }
  return data as Solunar[];
}

export default async function ConditionsPage() {
  const [weatherData, forecast, solunar] = await Promise.all([
    getWeatherData(),
    getForecastData(),
    getSolunarData(),
  ]);

  return (
    <div className="pt-6">
      <ConditionsTabs
        weatherData={weatherData}
        forecast={forecast}
        solunar={solunar}
      />
    </div>
  );
}

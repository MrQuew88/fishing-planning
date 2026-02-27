import { supabase } from "@/lib/supabase";
import { HourlyForecast, Solunar } from "@/lib/types";
import TodayHours from "@/components/briefing/TodayHours";
import SolunarText from "@/components/briefing/SolunarBar";
import SunriseSunset from "@/components/briefing/SunriseSunset";

export const dynamic = "force-dynamic";

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

function getTodayHours(forecast: HourlyForecast[]): HourlyForecast[] {
  const todayStr = new Date().toISOString().slice(0, 10);
  return forecast.filter((h) => {
    const hDate = h.datetime.slice(0, 10);
    const hHour = parseInt(h.datetime.slice(11, 13), 10);
    return hDate === todayStr && hHour >= 6 && hHour <= 21;
  });
}

export default async function BriefingPage() {
  const [forecast, solunar] = await Promise.all([
    getForecastData(),
    getSolunarData(),
  ]);

  const todayHours = getTodayHours(forecast);
  const todayStr = new Date().toISOString().slice(0, 10);
  const solunarMap = new Map(solunar.map((s) => [s.date, s]));
  const todaySolunar = solunarMap.get(todayStr);

  return (
    <div className="space-y-6 pt-6">
      {/* 1. Today's hourly cards */}
      {todayHours.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-base font-bold text-[#F1F5F9] uppercase tracking-[0.15em] px-1">
            Aujourd&apos;hui heure par heure
          </h2>
          <TodayHours hours={todayHours} />
        </section>
      )}

      {/* 2. Solunar text with countdown */}
      {todaySolunar && <SolunarText solunar={todaySolunar} />}

      {/* 3. Sunrise / Sunset */}
      {todaySolunar && <SunriseSunset solunar={todaySolunar} />}

      {/* 4. Tactical briefing placeholder */}
      <section className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <h2 className="text-base font-bold text-[#F1F5F9] uppercase tracking-[0.15em] mb-3">
          Briefing tactique
        </h2>
        <p className="text-base text-white/40">
          Analyse des conditions et plan de p&ecirc;che — bient&ocirc;t disponible.
        </p>
      </section>
    </div>
  );
}

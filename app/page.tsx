import { supabase } from "@/lib/supabase";
import { HourlyForecast, Solunar } from "@/lib/types";
import TodayHours from "@/components/briefing/TodayHours";
import SolunarBar from "@/components/briefing/SolunarBar";

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
      {/* Today's hours — main content, auto-scrolls to current hour */}
      {todayHours.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xs font-medium text-slate-400 uppercase tracking-wider px-1">
            Aujourd&apos;hui heure par heure
          </h2>
          <TodayHours hours={todayHours} />
        </section>
      )}

      {/* Solunar bar — always visible */}
      {todaySolunar && <SolunarBar solunar={todaySolunar} />}

      {/* Tactical briefing placeholder */}
      <section className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">
          Briefing tactique
        </h2>
        <p className="text-sm text-slate-400">
          Analyse des conditions et plan de p&ecirc;che — bient&ocirc;t disponible.
        </p>
      </section>
    </div>
  );
}

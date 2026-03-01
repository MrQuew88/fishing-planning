import { supabase } from "@/lib/supabase";
import { HourlyForecast, Solunar } from "@/lib/types";
import TodayHours from "@/components/briefing/TodayHours";
import SolunarSection from "@/components/briefing/SolunarBar";
import GlassCard from "@/components/ui/GlassCard";
import SectionTitle from "@/components/ui/SectionTitle";

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

function trimSeconds(time: string | null): string {
  if (!time) return "\u2013";
  return time.slice(0, 5);
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
    <div className="space-y-8 pt-6">
      {/* Header with sunrise/sunset */}
      <div className="flex items-center justify-between">
        <SectionTitle>Aujourd&apos;hui heure par heure</SectionTitle>
        {todaySolunar && (
          <span className="text-lg text-white/75 font-medium">
            {"\u2600\uFE0F"}{" "}
            <span className="font-[family-name:var(--font-space)] font-bold text-white">
              {trimSeconds(todaySolunar.lever_soleil)}
            </span>
            {" \u2014 "}
            <span className="font-[family-name:var(--font-space)] font-bold text-white">
              {trimSeconds(todaySolunar.coucher_soleil)}
            </span>
            {" \uD83C\uDF19"}
          </span>
        )}
      </div>

      {/* Today's hourly cards */}
      {todayHours.length > 0 && <TodayHours hours={todayHours} />}

      {/* Solunar structured section */}
      {todaySolunar && <SolunarSection solunar={todaySolunar} />}

      {/* Tactical briefing placeholder */}
      <GlassCard>
        <SectionTitle>Briefing tactique</SectionTitle>
        <p className="text-lg text-white/70 mt-3">
          Analyse des conditions et plan de p&ecirc;che — bient&ocirc;t disponible.
        </p>
      </GlassCard>
    </div>
  );
}

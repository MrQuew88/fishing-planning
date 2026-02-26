/**
 * collect-weather.ts
 *
 * Collecte quotidienne des données météo historiques pour Killykeen.
 * Source : Open-Meteo Archive API (gratuit, pas de clé API)
 *
 * Coordonnées : 54.01, -7.32 (Killykeen Forest Park, Killashandra, Co. Cavan)
 *
 * Usage :
 *   npx tsx scripts/collect-weather.ts            # hier uniquement
 *   npx tsx scripts/collect-weather.ts --backfill  # du 11 jan 2026 à aujourd'hui
 */

import { config } from "dotenv";
config({ path: ".env.local" });
import { createClient } from "@supabase/supabase-js";

const LAT = 54.01;
const LON = -7.32;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function formatDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function yesterday(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return formatDate(d);
}

/** Convert wind direction in degrees to cardinal string */
function degreesToCardinal(deg: number | null): string | null {
  if (deg == null) return null;
  const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const index = Math.round(deg / 45) % 8;
  return directions[index];
}

interface OpenMeteoDaily {
  time: string[];
  temperature_2m_min: (number | null)[];
  temperature_2m_max: (number | null)[];
  wind_speed_10m_max: (number | null)[];
  wind_gusts_10m_max: (number | null)[];
  wind_direction_10m_dominant: (number | null)[];
  pressure_msl_mean: (number | null)[];
  precipitation_sum: (number | null)[];
}

async function fetchWeather(
  startDate: string,
  endDate: string
): Promise<OpenMeteoDaily> {
  const params = new URLSearchParams({
    latitude: String(LAT),
    longitude: String(LON),
    start_date: startDate,
    end_date: endDate,
    daily:
      "temperature_2m_min,temperature_2m_max,wind_speed_10m_max,wind_gusts_10m_max,wind_direction_10m_dominant,pressure_msl_mean,precipitation_sum",
    timezone: "Europe/Dublin",
  });

  const url = `https://archive-api.open-meteo.com/v1/archive?${params}`;
  console.log(`[collect-weather] Fetching ${startDate} → ${endDate}`);

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Open-Meteo error ${res.status}: ${await res.text()}`);
  }

  const json = await res.json();
  return json.daily as OpenMeteoDaily;
}

async function main() {
  const isBackfill = process.argv.includes("--backfill");

  console.log(`[collect-weather] Spot: ${LAT}, ${LON}`);
  console.log(`[collect-weather] Mode: ${isBackfill ? "backfill" : "daily"}`);

  let startDate: string;
  let endDate: string;

  if (isBackfill) {
    startDate = "2026-01-11";
    endDate = yesterday();
  } else {
    startDate = yesterday();
    endDate = yesterday();
  }

  const daily = await fetchWeather(startDate, endDate);

  if (!daily.time || daily.time.length === 0) {
    console.log("[collect-weather] No data returned from Open-Meteo");
    return;
  }

  console.log(`[collect-weather] Got ${daily.time.length} days of data`);

  const rows = daily.time.map((date, i) => {
    const tmin = daily.temperature_2m_min[i];
    const tmax = daily.temperature_2m_max[i];
    const tempMoyenne =
      tmin != null && tmax != null
        ? Math.round(((tmin + tmax) / 2) * 100) / 100
        : null;

    return {
      date,
      tmin_air: tmin,
      tmax_air: tmax,
      vent_kmh: daily.wind_speed_10m_max[i],
      rafales_kmh: daily.wind_gusts_10m_max[i],
      direction_vent: degreesToCardinal(daily.wind_direction_10m_dominant[i]),
      pression_hpa: daily.pressure_msl_mean[i],
      pluie_mm: daily.precipitation_sum[i],
      temp_moyenne_c: tempMoyenne,
      // degres_jour_cumules left null — requires water temperature (from OPW),
      // not air temperature. Will be computed once temp_eau_c is available.
      degres_jour_cumules: null,
    };
  });

  console.log(`[collect-weather] Upserting ${rows.length} rows...`);

  for (let i = 0; i < rows.length; i += 100) {
    const batch = rows.slice(i, i + 100);
    const { error } = await supabase
      .from("daily_weather")
      .upsert(batch, { onConflict: "date" });

    if (error) {
      console.error(`[collect-weather] Upsert error (batch ${i}):`, error);
      throw error;
    }
  }

  console.log(
    `[collect-weather] Done. ${rows.length} rows upserted (${rows[0].date} → ${rows[rows.length - 1].date})`
  );
}

main().catch((err) => {
  console.error("[collect-weather] Fatal error:", err);
  process.exit(1);
});

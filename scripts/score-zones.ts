/**
 * score-zones.ts
 *
 * Scoring engine deterministe: classe les 43 zones avec score meteo par creneau.
 * Output JSON sur stdout, pret a etre merge dans le briefing.
 *
 * Usage:
 *   npx tsx scripts/score-zones.ts                    # aujourd'hui
 *   npx tsx scripts/score-zones.ts --date 2026-03-05
 */

process.env.DOTENV_CONFIG_QUIET = "true";
import { config } from "dotenv";
config({ path: ".env.local", override: false });
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ---------- Types ----------

type SlotKey = "fraiche" | "matinee" | "apres_midi" | "coup_du_soir";
type Tier = "T1" | "T2" | "T3" | "T4";

interface SlotScore {
  wind_dir: string;
  wind_speed_kmh: number;
  cloud_cover_pct: number;
  pressure_hpa: number;
  score: number;
  tier: Tier;
}

interface FishingZone {
  id: string;
  zone_name: string;
  name: string;
  lat: number;
  lng: number;
  depth_min: number;
  depth_max: number;
  type: string;
  profile: string;
  orientation: string | null;
  wind_sheltered: string[];
  wind_exposed: string[];
  post_spawn_score: number;
  vegetation: string | null;
  google_maps_url: string | null;
}

interface HourlyRow {
  datetime: string;
  vent_vitesse_kmh: number | null;
  vent_direction: string | null;
  pression_hpa: number | null;
  couverture_nuageuse_pct: number | null;
}

interface DailyRow {
  date: string;
  pression_hpa: number | null;
}

// ---------- Slot definitions ----------

const SLOTS: Record<SlotKey, { start: number; end: number }> = {
  fraiche: { start: 6, end: 9 },
  matinee: { start: 9, end: 12 },
  apres_midi: { start: 12, end: 16 },
  coup_du_soir: { start: 16, end: 20 },
};

// ---------- Helpers ----------

function parseDate(): string {
  const idx = process.argv.indexOf("--date");
  if (idx !== -1 && process.argv[idx + 1]) return process.argv[idx + 1];
  return new Date().toISOString().slice(0, 10);
}

function mode(arr: string[]): string {
  const counts: Record<string, number> = {};
  for (const v of arr) counts[v] = (counts[v] || 0) + 1;
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "N";
}

function avg(arr: number[]): number {
  if (arr.length === 0) return 0;
  return arr.reduce((s, v) => s + v, 0) / arr.length;
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

function tierFromScore(score: number): Tier {
  if (score >= 8) return "T1";
  if (score >= 6) return "T2";
  if (score >= 4) return "T3";
  return "T4";
}

function tierFromSlotScore(score: number): Tier {
  if (score >= 4) return "T1";
  if (score >= 3) return "T2";
  if (score >= 2) return "T3";
  return "T4";
}

// ---------- Slot weather aggregation ----------

interface SlotWeather {
  wind_dir: string;
  wind_speed: number;
  cloud_cover: number;
  pressure: number;
}

function aggregateSlotWeather(
  hours: HourlyRow[],
  slot: { start: number; end: number }
): SlotWeather {
  const inSlot = hours.filter((h) => {
    const hr = parseInt(h.datetime.slice(11, 13), 10);
    return hr >= slot.start && hr < slot.end;
  });

  const dirs = inSlot
    .map((h) => h.vent_direction)
    .filter((d): d is string => d !== null);
  const speeds = inSlot
    .map((h) => h.vent_vitesse_kmh)
    .filter((v): v is number => v !== null);
  const clouds = inSlot
    .map((h) => h.couverture_nuageuse_pct)
    .filter((v): v is number => v !== null);
  const pressures = inSlot
    .map((h) => h.pression_hpa)
    .filter((v): v is number => v !== null);

  return {
    wind_dir: mode(dirs),
    wind_speed: Math.round(avg(speeds)),
    cloud_cover: Math.round(avg(clouds)),
    pressure: Math.round(avg(pressures) * 10) / 10,
  };
}

// ---------- Scoring ----------

function isShallow(zone: FishingZone): boolean {
  return zone.depth_max <= 4;
}

function isDense(zone: FishingZone): boolean {
  return zone.vegetation !== null && zone.vegetation !== "";
}

function scoreSlot(
  zone: FishingZone,
  weather: SlotWeather,
  slotKey: SlotKey,
  pressureTrend: number // positive = rising, negative = falling
): number {
  let score = 0;

  const exposed = zone.wind_exposed.includes(weather.wind_dir);
  const sheltered = zone.wind_sheltered.includes(weather.wind_dir);
  const windSpeed = weather.wind_speed;

  // Wind direction
  if (exposed) {
    score += 2; // clapot on exposed face = ideal for pike
  } else if (sheltered && windSpeed > 20) {
    score += 1; // sheltered from strong wind = fishable refuge
  } else if (sheltered) {
    score += 0; // sheltered + moderate wind = too calm, no clapot
  } else {
    score += 0.5; // neutral — not exposed, not sheltered
  }

  // Wind force modifier
  if (windSpeed >= 10 && windSpeed <= 25 && exposed) {
    score += 1; // ideal clapot on exposed
  } else if (windSpeed > 25 && sheltered) {
    score += 1; // strong wind but sheltered = good refuge
  } else if (windSpeed < 10) {
    score += 0.5; // calm — less ideal but fishable
  }

  // Pressure trend
  if (pressureTrend > 1) {
    score += 0.25; // rising pressure — mild bonus
  } else if (pressureTrend < -3) {
    score += 0.5; // sharp drop can trigger feeding frenzy
  }

  // Cloud cover + shallow
  if (weather.cloud_cover > 70 && isShallow(zone)) {
    score += 0.5; // overcast + shallow = pike comfortable
  }

  // Low-light bonus (fraiche / coup_du_soir)
  if (slotKey === "fraiche" || slotKey === "coup_du_soir") {
    if (isShallow(zone)) {
      score += 1; // shallow zones best at low light
    } else {
      score += 0.5;
    }
  }

  // Midday penalty: sun + shallow + no dense veg
  if (slotKey === "apres_midi" || slotKey === "matinee") {
    if (weather.cloud_cover < 50 && isShallow(zone) && !isDense(zone)) {
      score -= 0.5;
    }
  }

  return clamp(score, 0, 5);
}

// ---------- Main ----------

async function main() {
  const date = parseDate();

  // Fetch data
  const threeDaysAgo = new Date(date);
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
  const threeDaysAgoStr = threeDaysAgo.toISOString().slice(0, 10);

  const [forecastRes, dailyRes, zonesRes] = await Promise.all([
    supabase
      .from("hourly_forecast")
      .select("datetime, vent_vitesse_kmh, vent_direction, pression_hpa, couverture_nuageuse_pct")
      .gte("datetime", `${date}T06:00`)
      .lte("datetime", `${date}T20:00`)
      .order("datetime", { ascending: true }),
    supabase
      .from("daily_weather")
      .select("date, pression_hpa")
      .gte("date", threeDaysAgoStr)
      .lte("date", date)
      .order("date", { ascending: true }),
    supabase
      .from("fishing_zones")
      .select("*"),
  ]);

  if (forecastRes.error) {
    console.error("[score-zones] Forecast error:", forecastRes.error.message);
    process.exit(1);
  }
  if (zonesRes.error) {
    console.error("[score-zones] Zones error:", zonesRes.error.message);
    process.exit(1);
  }

  const hours = (forecastRes.data ?? []) as HourlyRow[];
  const dailyWeather = (dailyRes.data ?? []) as DailyRow[];
  const zones = (zonesRes.data ?? []) as FishingZone[];

  if (hours.length === 0) {
    console.error(`[score-zones] No hourly forecast data for ${date}`);
    process.exit(1);
  }

  // Calculate pressure trend (3-day)
  const pressures = dailyWeather
    .map((d) => d.pression_hpa)
    .filter((p): p is number => p !== null);
  const pressureTrend =
    pressures.length >= 2
      ? pressures[pressures.length - 1] - pressures[pressures.length - 2]
      : 0;

  // Aggregate weather per slot
  const slotWeather: Record<SlotKey, SlotWeather> = {} as Record<SlotKey, SlotWeather>;
  for (const [key, range] of Object.entries(SLOTS)) {
    slotWeather[key as SlotKey] = aggregateSlotWeather(hours, range);
  }

  // Score each zone
  const scoredZones = zones.map((zone) => {
    const slots: Record<SlotKey, SlotScore> = {} as Record<SlotKey, SlotScore>;
    let bestSlotScore = 0;

    for (const slotKey of Object.keys(SLOTS) as SlotKey[]) {
      const weather = slotWeather[slotKey];
      const meteoScore = scoreSlot(zone, weather, slotKey, pressureTrend);
      const tier = tierFromSlotScore(meteoScore);

      slots[slotKey] = {
        wind_dir: weather.wind_dir,
        wind_speed_kmh: weather.wind_speed,
        cloud_cover_pct: weather.cloud_cover,
        pressure_hpa: weather.pressure,
        score: Math.round(meteoScore * 10) / 10,
        tier,
      };

      if (meteoScore > bestSlotScore) bestSlotScore = meteoScore;
    }

    // Day score = post_spawn_score + best slot meteo score, cap 10
    const dayScore = clamp(
      Math.round((zone.post_spawn_score + bestSlotScore) * 10) / 10,
      1,
      10
    );
    const tier = tierFromScore(dayScore);

    return {
      zone_id: zone.id,
      zone_name: `${zone.zone_name} — ${zone.name}`,
      post_spawn_score: zone.post_spawn_score,
      day_score: dayScore,
      tier,
      target_depths: `${zone.depth_min}–${zone.depth_max}m`,
      google_maps_url: zone.google_maps_url,
      slots,
    };
  });

  // Sort by day_score desc
  scoredZones.sort((a, b) => b.day_score - a.day_score);

  const output = {
    date,
    zones: scoredZones,
    _meta: {
      pressure_trend: pressureTrend,
      slot_weather: slotWeather,
      generated_at: new Date().toISOString(),
    },
  };

  console.log(JSON.stringify(output, null, 2));
}

main().catch((err) => {
  console.error("[score-zones] Fatal:", err);
  process.exit(1);
});

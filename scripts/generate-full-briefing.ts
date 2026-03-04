/**
 * generate-full-briefing.ts
 *
 * Script unifié : fetch données météo + scoring déterministe des 43 zones.
 * Affiche tout sur stdout pour que Claude Code puisse lire, rédiger la prose,
 * et insérer le briefing final.
 *
 * Usage :
 *   npx tsx scripts/generate-full-briefing.ts                    # aujourd'hui
 *   npx tsx scripts/generate-full-briefing.ts --date 2026-03-05
 *
 * Output :
 *   Section 1 — Données météo brutes (pour rédiger la prose)
 *   Section 2 — Données solunaires
 *   Section 3 — Zones scorées JSON (prêt à merger dans le briefing)
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
  is_spawning_zone: boolean | null;
  spawning_notes: string | null;
  notes: string | null;
  google_maps_url: string | null;
}

interface HourlyRow {
  datetime: string;
  temperature_c: number | null;
  vent_vitesse_kmh: number | null;
  vent_direction: string | null;
  vent_rafales_kmh: number | null;
  pression_hpa: number | null;
  pluie_probabilite: number | null;
  pluie_intensite_mm: number | null;
  couverture_nuageuse_pct: number | null;
}

interface DailyRow {
  date: string;
  tmin_air: number | null;
  tmax_air: number | null;
  vent_kmh: number | null;
  rafales_kmh: number | null;
  direction_vent: string | null;
  pression_hpa: number | null;
  pluie_mm: number | null;
  temp_eau_c: number | null;
}

// ---------- Slot definitions ----------

const SLOTS: Record<SlotKey, { start: number; end: number; label: string }> = {
  fraiche: { start: 6, end: 9, label: "Fraîche (6h-9h)" },
  matinee: { start: 9, end: 12, label: "Matinée (9h-12h)" },
  apres_midi: { start: 12, end: 16, label: "Après-midi (12h-16h)" },
  coup_du_soir: { start: 16, end: 20, label: "Coup du soir (16h-20h)" },
};

// ---------- Helpers ----------

function parseDate(): string {
  const idx = process.argv.indexOf("--date");
  if (idx !== -1 && process.argv[idx + 1]) return process.argv[idx + 1];
  return new Date().toISOString().slice(0, 10);
}

function fmt(v: unknown, unit = ""): string {
  if (v == null) return "–";
  return `${v}${unit}`;
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

  const dirs = inSlot.map((h) => h.vent_direction).filter((d): d is string => d !== null);
  const speeds = inSlot.map((h) => h.vent_vitesse_kmh).filter((v): v is number => v !== null);
  const clouds = inSlot.map((h) => h.couverture_nuageuse_pct).filter((v): v is number => v !== null);
  const pressures = inSlot.map((h) => h.pression_hpa).filter((v): v is number => v !== null);

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
  pressureTrend: number
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
    score += 0.5;
  }

  // Low-light bonus
  if (slotKey === "fraiche" || slotKey === "coup_du_soir") {
    if (isShallow(zone)) {
      score += 1;
    } else {
      score += 0.5;
    }
  }

  // Midday penalty
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

  const sevenDaysAgo = new Date(date);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const sevenDaysAgoStr = sevenDaysAgo.toISOString().slice(0, 10);

  const threeDaysAgo = new Date(date);
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
  const threeDaysAgoStr = threeDaysAgo.toISOString().slice(0, 10);

  // Fetch all data in parallel
  const [weatherRes, forecastRes, solunarRes, zonesRes] = await Promise.all([
    supabase
      .from("daily_weather")
      .select("*")
      .gte("date", sevenDaysAgoStr)
      .lte("date", date)
      .order("date", { ascending: true }),
    supabase
      .from("hourly_forecast")
      .select("*")
      .gte("datetime", `${date}T00:00`)
      .lte("datetime", `${date}T23:59`)
      .order("datetime", { ascending: true }),
    supabase
      .from("solunar")
      .select("*")
      .eq("date", date)
      .single(),
    supabase
      .from("fishing_zones")
      .select("*")
      .order("post_spawn_score", { ascending: false }),
  ]);

  if (forecastRes.error) {
    console.error("[briefing] Forecast error:", forecastRes.error.message);
    process.exit(1);
  }
  if (zonesRes.error) {
    console.error("[briefing] Zones error:", zonesRes.error.message);
    process.exit(1);
  }

  const weather = (weatherRes.data ?? []) as DailyRow[];
  const forecast = (forecastRes.data ?? []) as HourlyRow[];
  const solunar = solunarRes.data ?? null;
  const zones = (zonesRes.data ?? []) as FishingZone[];

  // Filter forecast to 6h-20h for scoring
  const scoringHours = forecast.filter((h) => {
    const hr = parseInt(h.datetime.slice(11, 13), 10);
    return hr >= 6 && hr <= 20;
  });

  if (scoringHours.length === 0) {
    console.error(`[briefing] No hourly forecast data for ${date} (6h-20h)`);
    process.exit(1);
  }

  // ===================================================================
  // SECTION 1 — MÉTÉO BRUTE
  // ===================================================================
  console.log(`\n========================================`);
  console.log(`  BRIEFING DATA — ${date}`);
  console.log(`========================================`);

  console.log(`\n## MÉTÉO (7 derniers jours)\n`);
  for (const w of weather) {
    console.log(
      `${w.date} | ${fmt(w.tmin_air, "°")}–${fmt(w.tmax_air, "°C")} | Vent ${fmt(w.vent_kmh, " km/h")} ${fmt(w.direction_vent)} (raf. ${fmt(w.rafales_kmh, " km/h")}) | Pression ${fmt(w.pression_hpa, " hPa")} | Pluie ${fmt(w.pluie_mm, " mm")} | Eau ${fmt(w.temp_eau_c, "°C")}`
    );
  }

  console.log(`\n## PRÉVISIONS HORAIRES (${date})\n`);
  console.log(`Heure | Temp | Vent       | Raf.  | Pression | Pluie %  | Pluie mm | Nuages`);
  console.log(`------|------|------------|-------|----------|----------|----------|-------`);
  for (const h of forecast) {
    const heure = h.datetime.slice(11, 16);
    console.log(
      `${heure} | ${fmt(h.temperature_c, "°C").padEnd(4)} | ${fmt(h.vent_vitesse_kmh, " km/h").padEnd(10)} ${fmt(h.vent_direction).padEnd(2)} | ${fmt(h.vent_rafales_kmh).padEnd(5)} | ${fmt(h.pression_hpa).padEnd(8)} | ${fmt(h.pluie_probabilite, "%").padEnd(8)} | ${fmt(h.pluie_intensite_mm, " mm").padEnd(8)} | ${fmt(h.couverture_nuageuse_pct, "%")}`
    );
  }

  // ===================================================================
  // SECTION 2 — SOLUNAIRE
  // ===================================================================
  console.log(`\n## SOLUNAIRE (${date})\n`);
  if (solunar) {
    console.log(`Lever soleil : ${fmt(solunar.lever_soleil)}`);
    console.log(`Coucher soleil : ${fmt(solunar.coucher_soleil)}`);
    console.log(`Majeure 1 : ${fmt(solunar.major_1_start)} – ${fmt(solunar.major_1_end)}`);
    console.log(`Majeure 2 : ${fmt(solunar.major_2_start)} – ${fmt(solunar.major_2_end)}`);
    console.log(`Mineure 1 : ${fmt(solunar.minor_1_start)} – ${fmt(solunar.minor_1_end)}`);
    console.log(`Mineure 2 : ${fmt(solunar.minor_2_start)} – ${fmt(solunar.minor_2_end)}`);
    console.log(`Phase lunaire : ${fmt(solunar.moon_phase)} (${fmt(solunar.moon_illumination, "%")} illumination)`);
  } else {
    console.log(`Aucune donnée solunaire disponible.`);
  }

  // ===================================================================
  // SECTION 3 — SCORING DÉTERMINISTE
  // ===================================================================

  // Pressure trend (3-day)
  const recentWeather = weather.filter((w) => w.date >= threeDaysAgoStr);
  const pressures = recentWeather
    .map((d) => d.pression_hpa)
    .filter((p): p is number => p !== null);
  const pressureTrend =
    pressures.length >= 2
      ? pressures[pressures.length - 1] - pressures[pressures.length - 2]
      : 0;

  // Aggregate weather per slot
  const slotWeather: Record<SlotKey, SlotWeather> = {} as Record<SlotKey, SlotWeather>;
  for (const [key, range] of Object.entries(SLOTS)) {
    slotWeather[key as SlotKey] = aggregateSlotWeather(scoringHours, range);
  }

  console.log(`\n## MÉTÉO PAR CRÉNEAU\n`);
  for (const [key, sw] of Object.entries(slotWeather)) {
    const slot = SLOTS[key as SlotKey];
    console.log(`${slot.label}: Vent ${sw.wind_dir} ${sw.wind_speed} km/h | Nuages ${sw.cloud_cover}% | Pression ${sw.pressure} hPa`);
  }
  console.log(`Tendance pression (3j) : ${pressureTrend > 0 ? "+" : ""}${pressureTrend.toFixed(1)} hPa`);

  // Score each zone
  const scoredZones = zones.map((zone) => {
    const slots: Record<SlotKey, SlotScore> = {} as Record<SlotKey, SlotScore>;
    let bestSlotScore = 0;

    for (const slotKey of Object.keys(SLOTS) as SlotKey[]) {
      const w = slotWeather[slotKey];
      const meteoScore = scoreSlot(zone, w, slotKey, pressureTrend);
      const tier = tierFromSlotScore(meteoScore);

      slots[slotKey] = {
        wind_dir: w.wind_dir,
        wind_speed_kmh: w.wind_speed,
        cloud_cover_pct: w.cloud_cover,
        pressure_hpa: w.pressure,
        score: Math.round(meteoScore * 10) / 10,
        tier,
      };

      if (meteoScore > bestSlotScore) bestSlotScore = meteoScore;
    }

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
      // Extra info for Claude to write why_today
      _zone_info: {
        type: zone.type,
        profile: zone.profile,
        orientation: zone.orientation,
        vegetation: zone.vegetation,
        wind_sheltered: zone.wind_sheltered,
        wind_exposed: zone.wind_exposed,
        notes: zone.notes,
      },
    };
  });

  scoredZones.sort((a, b) => b.day_score - a.day_score);

  // Print tier summary
  const tierCounts = { T1: 0, T2: 0, T3: 0, T4: 0 };
  for (const z of scoredZones) tierCounts[z.tier]++;

  console.log(`\n## CLASSEMENT DES ZONES (${scoredZones.length} zones)\n`);
  console.log(`T1 (8-10): ${tierCounts.T1} zones | T2 (6-7): ${tierCounts.T2} zones | T3 (4-5): ${tierCounts.T3} zones | T4 (1-3): ${tierCounts.T4} zones\n`);

  // Print T1 and T2 zones in detail (Claude needs to write why_today for these)
  const topZones = scoredZones.filter((z) => z.tier === "T1" || z.tier === "T2");
  console.log(`### Zones T1/T2 (why_today requis)\n`);
  for (const z of topZones) {
    console.log(`${z.tier} | ${z.zone_name} | day_score: ${z.day_score}/10 | post_spawn: ${z.post_spawn_score}/5`);
    console.log(`  Profondeur: ${z.target_depths} | Type: ${z._zone_info.type} | Végétation: ${z._zone_info.vegetation ?? "–"}`);
    console.log(`  Abrité: ${z._zone_info.wind_sheltered.join(", ") || "–"} | Exposé: ${z._zone_info.wind_exposed.join(", ") || "–"}`);
    console.log(`  Slots: fraiche=${z.slots.fraiche.score}(${z.slots.fraiche.tier}) matinee=${z.slots.matinee.score}(${z.slots.matinee.tier}) aprem=${z.slots.apres_midi.score}(${z.slots.apres_midi.tier}) soir=${z.slots.coup_du_soir.score}(${z.slots.coup_du_soir.tier})`);
    if (z._zone_info.notes) console.log(`  Notes: ${z._zone_info.notes}`);
    console.log(``);
  }

  // Print T3/T4 summary (no why_today needed)
  const lowerZones = scoredZones.filter((z) => z.tier === "T3" || z.tier === "T4");
  console.log(`### Zones T3/T4 (pas de why_today)\n`);
  for (const z of lowerZones) {
    console.log(`${z.tier} | ${z.zone_name} | day_score: ${z.day_score}/10`);
  }

  // ===================================================================
  // SECTION 4 — JSON DES ZONES (pour le merge final)
  // ===================================================================

  // Strip _zone_info before outputting the JSON template
  const cleanZones = scoredZones.map(({ _zone_info, ...rest }) => rest);

  const solunarOutput = solunar
    ? {
        major: [
          solunar.major_1_start && solunar.major_1_end
            ? `${solunar.major_1_start.slice(0, 5)} - ${solunar.major_1_end.slice(0, 5)}`
            : null,
          solunar.major_2_start && solunar.major_2_end
            ? `${solunar.major_2_start.slice(0, 5)} - ${solunar.major_2_end.slice(0, 5)}`
            : null,
        ].filter(Boolean) as string[],
        minor: [
          solunar.minor_1_start && solunar.minor_1_end
            ? `${solunar.minor_1_start.slice(0, 5)} - ${solunar.minor_1_end.slice(0, 5)}`
            : null,
          solunar.minor_2_start && solunar.minor_2_end
            ? `${solunar.minor_2_start.slice(0, 5)} - ${solunar.minor_2_end.slice(0, 5)}`
            : null,
        ].filter(Boolean) as string[],
      }
    : { major: [], minor: [] };

  console.log(`\n## ZONES_JSON_START`);
  console.log(JSON.stringify(cleanZones, null, 2));
  console.log(`## ZONES_JSON_END`);

  console.log(`\n## SOLUNAR_JSON_START`);
  console.log(JSON.stringify(solunarOutput, null, 2));
  console.log(`## SOLUNAR_JSON_END`);

  console.log(`\n[briefing] Done. ${scoredZones.length} zones scored for ${date}.`);
}

main().catch((err) => {
  console.error("[briefing] Fatal:", err);
  process.exit(1);
});

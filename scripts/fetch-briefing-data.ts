/**
 * fetch-briefing-data.ts
 *
 * Fetch les données depuis Supabase (météo, forecast, solunar, zones)
 * et les affiche formatées dans la console.
 *
 * Usage :
 *   npx tsx scripts/fetch-briefing-data.ts                # aujourd'hui
 *   npx tsx scripts/fetch-briefing-data.ts --date 2026-03-02
 */

process.env.DOTENV_CONFIG_QUIET = "true";
import { config } from "dotenv";
config({ path: ".env.local", override: false });
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function parseDate(): string {
  const idx = process.argv.indexOf("--date");
  if (idx !== -1 && process.argv[idx + 1]) {
    return process.argv[idx + 1];
  }
  return new Date().toISOString().slice(0, 10);
}

function fmt(v: unknown, unit = ""): string {
  if (v == null) return "–";
  return `${v}${unit}`;
}

async function main() {
  const date = parseDate();

  const sevenDaysAgo = new Date(date);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const sevenDaysAgoStr = sevenDaysAgo.toISOString().slice(0, 10);

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

  if (weatherRes.error) console.error("[fetch] Weather error:", weatherRes.error.message);
  if (forecastRes.error) console.error("[fetch] Forecast error:", forecastRes.error.message);
  if (solunarRes.error) console.error("[fetch] Solunar error:", solunarRes.error.message);
  if (zonesRes.error) console.error("[fetch] Zones error:", zonesRes.error.message);

  const weather = weatherRes.data ?? [];
  const forecast = forecastRes.data ?? [];
  const solunar = solunarRes.data ?? null;
  const zones = zonesRes.data ?? [];

  // === DATE ===
  console.log(`\n========================================`);
  console.log(`  DONNÉES BRIEFING — ${date}`);
  console.log(`========================================\n`);

  // === MÉTÉO 7 JOURS ===
  console.log(`## MÉTÉO (7 derniers jours)\n`);
  for (const w of weather) {
    console.log(`${w.date} | ${fmt(w.tmin_air, "°")}–${fmt(w.tmax_air, "°C")} | Vent ${fmt(w.vent_kmh, " km/h")} ${fmt(w.direction_vent)} (raf. ${fmt(w.rafales_kmh, " km/h")}) | Pression ${fmt(w.pression_hpa, " hPa")} | Pluie ${fmt(w.pluie_mm, " mm")} | Eau ${fmt(w.temp_eau_c, "°C")}`);
  }

  // === FORECAST HORAIRE ===
  console.log(`\n## PRÉVISIONS HORAIRES (${date})\n`);
  console.log(`Heure | Temp | Vent       | Raf.  | Pression | Pluie %  | Pluie mm | Nuages`);
  console.log(`------|------|------------|-------|----------|----------|----------|-------`);
  for (const h of forecast) {
    const heure = h.datetime.slice(11, 16);
    console.log(
      `${heure} | ${fmt(h.temperature_c, "°C").padEnd(4)} | ${fmt(h.vent_vitesse_kmh, " km/h").padEnd(10)} ${fmt(h.vent_direction).padEnd(2)} | ${fmt(h.vent_rafales_kmh).padEnd(5)} | ${fmt(h.pression_hpa).padEnd(8)} | ${fmt(h.pluie_probabilite, "%").padEnd(8)} | ${fmt(h.pluie_intensite_mm, " mm").padEnd(8)} | ${fmt(h.couverture_nuageuse_pct, "%")}`
    );
  }

  // === SOLUNAIRE ===
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

  // === ZONES ===
  console.log(`\n## ZONES DE PÊCHE (${zones.length} zones, triées par score)\n`);
  for (const z of zones) {
    console.log(`### ${z.zone_name} — ${z.name} (score: ${z.post_spawn_score}/5)`);
    console.log(`  Type: ${z.type} | Profil: ${z.profile} | Prof: ${z.depth_min}–${z.depth_max}m`);
    console.log(`  Orientation: ${fmt(z.orientation)} | Végétation: ${fmt(z.vegetation)}`);
    console.log(`  Abrité par vent: ${(z.wind_sheltered || []).join(", ") || "–"}`);
    console.log(`  Exposé par vent: ${(z.wind_exposed || []).join(", ") || "–"}`);
    if (z.is_spawning_zone) console.log(`  🐟 Zone de fraie: ${fmt(z.spawning_notes)}`);
    if (z.notes) console.log(`  Notes: ${z.notes}`);
    if (z.google_maps_url) console.log(`  Maps: ${z.google_maps_url}`);
    console.log(``);
  }
}

main().catch((err) => {
  console.error("[fetch-briefing-data] Fatal error:", err);
  process.exit(1);
});

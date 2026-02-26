/**
 * collect-opw.ts
 *
 * Collecte des données hydrologiques depuis l'OPW (Office of Public Works).
 * Source : waterlevel.ie — Station 36084 (Innisconnell, proche Lough Oughter / Killykeen)
 *
 * Canaux disponibles :
 * - 0001 : Niveau d'eau (gauge height en mètres, toutes les 15 min)
 * - 0002 : Température de l'eau (°C, horaire)
 * - 0003 : Probablement température air ou conductivité (horaire)
 *
 * Conversion gauge height → delta base 46m AOD (Malin Head OSGM15) :
 *   niveau_eau_delta = gauge_height - 1.67
 *   Offset 1.67m calibré sur les données du spreadsheet.
 *
 * Usage : npx tsx scripts/collect-opw.ts
 */

import { config } from "dotenv";
config({ path: ".env.local" });
import { createClient } from "@supabase/supabase-js";

const STATION_ID = "36084";
const GAUGE_TO_DELTA_OFFSET = 1.67; // gauge_height - offset = delta above 46m AOD
const LEVEL_CSV_URL = `https://waterlevel.ie/data/month/${STATION_ID}_0001.csv`;
const WATER_TEMP_CSV_URL = `https://waterlevel.ie/data/month/${STATION_ID}_0002.csv`;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface DailyAvg {
  date: string;
  avg: number;
  count: number;
}

function parseCSV(csvText: string): DailyAvg[] {
  const lines = csvText.trim().split("\n");
  const byDate = new Map<string, { sum: number; count: number }>();

  for (const line of lines) {
    if (!line || line.startsWith("datetime") || line.startsWith("#")) continue;

    const parts = line.split(",");
    if (parts.length < 2) continue;

    const datetimeStr = parts[0].trim();
    const value = parseFloat(parts[1].trim());
    if (isNaN(value)) continue;

    let date: string | null = null;
    const isoMatch = datetimeStr.match(/(\d{4}-\d{2}-\d{2})/);
    if (isoMatch) {
      date = isoMatch[1];
    } else {
      const euMatch = datetimeStr.match(/(\d{2})\/(\d{2})\/(\d{4})/);
      if (euMatch) {
        date = `${euMatch[3]}-${euMatch[2]}-${euMatch[1]}`;
      }
    }
    if (!date) continue;

    const existing = byDate.get(date) ?? { sum: 0, count: 0 };
    existing.sum += value;
    existing.count += 1;
    byDate.set(date, existing);
  }

  const results: DailyAvg[] = [];
  for (const [date, { sum, count }] of byDate) {
    results.push({
      date,
      avg: Math.round((sum / count) * 1000) / 1000,
      count,
    });
  }
  return results.sort((a, b) => a.date.localeCompare(b.date));
}

async function fetchCSV(url: string, label: string): Promise<string> {
  console.log(`[collect-opw] Fetching ${label}...`);
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`waterlevel.ie error ${res.status} for ${label}: ${await res.text()}`);
  }
  const text = await res.text();
  console.log(`[collect-opw] ${label}: ${text.length} bytes`);
  return text;
}

async function main() {
  console.log(`[collect-opw] Station: ${STATION_ID} (Innisconnell)`);

  // Fetch both channels in parallel
  const [levelCsv, tempCsv] = await Promise.all([
    fetchCSV(LEVEL_CSV_URL, "water level (0001)"),
    fetchCSV(WATER_TEMP_CSV_URL, "water temp (0002)"),
  ]);

  const dailyLevels = parseCSV(levelCsv);
  const dailyTemps = parseCSV(tempCsv);

  console.log(`[collect-opw] Parsed ${dailyLevels.length} days of water level`);
  console.log(`[collect-opw] Parsed ${dailyTemps.length} days of water temp`);

  // Build a temp lookup by date
  const tempByDate = new Map(dailyTemps.map((d) => [d.date, d.avg]));

  // Merge level + temp into rows
  const allDates = new Set([
    ...dailyLevels.map((d) => d.date),
    ...dailyTemps.map((d) => d.date),
  ]);

  const levelByDate = new Map(dailyLevels.map((d) => [d.date, d.avg]));

  const rows = [...allDates].sort().map((date) => {
    const gaugeHeight = levelByDate.get(date) ?? null;
    return {
      date,
      // delta above 46m AOD = gauge_height - 1.67
      niveau_eau_delta:
        gaugeHeight != null
          ? Math.round((gaugeHeight - GAUGE_TO_DELTA_OFFSET) * 1000) / 1000
          : null,
      temp_eau_c: tempByDate.get(date) ?? null,
    };
  });

  if (rows.length === 0) {
    console.log("[collect-opw] No data parsed");
    return;
  }

  const { error } = await supabase
    .from("daily_weather")
    .upsert(rows, { onConflict: "date" });

  if (error) {
    console.error("[collect-opw] Upsert error:", error);
    throw error;
  }

  console.log(
    `[collect-opw] Done. ${rows.length} rows upserted (${rows[0].date} → ${rows[rows.length - 1].date})`
  );

  // Print sample
  for (const r of rows.slice(0, 5)) {
    console.log(
      `  ${r.date}: level=${r.niveau_eau_delta}m, water_temp=${r.temp_eau_c}°C`
    );
  }
}

main().catch((err) => {
  console.error("[collect-opw] Fatal error:", err);
  process.exit(1);
});

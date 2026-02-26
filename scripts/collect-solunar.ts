/**
 * collect-solunar.ts
 *
 * Collecte des données solunaires pour Killykeen.
 * Source : solunar.org API
 *
 * Coordonnées : 54.01, -7.32 (Killykeen Forest Park, Killashandra, Co. Cavan)
 *
 * Usage :
 *   npx tsx scripts/collect-solunar.ts            # aujourd'hui uniquement
 *   npx tsx scripts/collect-solunar.ts --backfill  # du 11 jan 2026 à aujourd'hui
 */

import { config } from "dotenv";
config({ path: ".env.local" });
import { createClient } from "@supabase/supabase-js";

const LAT = 54.01;
const LON = -7.32;
const BACKFILL_START = "2026-01-11";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function formatDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function formatDateCompact(d: Date): string {
  return d.toISOString().slice(0, 10).replace(/-/g, "");
}

function today(): string {
  return formatDate(new Date());
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Convert "HH:MM AM/PM" or "H:MM AM/PM" to "HH:MM" 24h format.
 *  Clamps hours >= 24 to 23:59 (solunar API sometimes returns "24:07" etc.) */
function to24h(timeStr: string | undefined | null): string | null {
  if (!timeStr) return null;

  // Already in HH:MM format
  if (/^\d{1,2}:\d{2}$/.test(timeStr)) {
    const [h, m] = timeStr.split(":").map(Number);
    if (h >= 24) return "23:59";
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  }

  const match = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return null;

  let hours = parseInt(match[1], 10);
  const minutes = match[2];
  const period = match[3].toUpperCase();

  if (period === "AM" && hours === 12) hours = 0;
  if (period === "PM" && hours !== 12) hours += 12;

  if (hours >= 24) return "23:59";

  return `${String(hours).padStart(2, "0")}:${minutes}`;
}

interface SolunarResponse {
  sunRise?: string;
  sunSet?: string;
  major1Start?: string;
  major1Stop?: string;
  major2Start?: string;
  major2Stop?: string;
  minor1Start?: string;
  minor1Stop?: string;
  minor2Start?: string;
  minor2Stop?: string;
  moonPhase?: string;
  moonIllumination?: number;
}

async function fetchSolunar(dateCompact: string): Promise<SolunarResponse> {
  const url = `https://api.solunar.org/solunar/${LAT},${LON},${dateCompact},0`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Solunar API error ${res.status}: ${await res.text()}`);
  }
  return res.json();
}

function buildRow(date: string, data: SolunarResponse) {
  return {
    date,
    lever_soleil: to24h(data.sunRise),
    coucher_soleil: to24h(data.sunSet),
    major_1_start: to24h(data.major1Start),
    major_1_end: to24h(data.major1Stop),
    major_2_start: to24h(data.major2Start),
    major_2_end: to24h(data.major2Stop),
    minor_1_start: to24h(data.minor1Start),
    minor_1_end: to24h(data.minor1Stop),
    minor_2_start: to24h(data.minor2Start),
    minor_2_end: to24h(data.minor2Stop),
    moon_phase: data.moonPhase ?? null,
    moon_illumination: data.moonIllumination ?? null,
  };
}

async function main() {
  const isBackfill = process.argv.includes("--backfill");

  console.log(`[collect-solunar] Spot: ${LAT}, ${LON}`);
  console.log(
    `[collect-solunar] Mode: ${isBackfill ? "backfill" : "daily"}`
  );

  if (isBackfill) {
    const start = new Date(BACKFILL_START);
    const end = new Date(today());
    const totalDays = Math.ceil(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    ) + 1;

    console.log(
      `[collect-solunar] Backfilling ${totalDays} days: ${BACKFILL_START} → ${today()}`
    );

    let count = 0;
    const current = new Date(start);

    while (current <= end) {
      const dateStr = formatDate(current);
      const dateCompact = formatDateCompact(current);

      try {
        const data = await fetchSolunar(dateCompact);
        const row = buildRow(dateStr, data);

        const { error } = await supabase
          .from("solunar")
          .upsert([row], { onConflict: "date" });

        if (error) {
          console.error(
            `[collect-solunar] Upsert error for ${dateStr}:`,
            error
          );
        } else {
          count++;
          if (count % 10 === 0) {
            console.log(
              `[collect-solunar] Progress: ${count}/${totalDays} days`
            );
          }
        }
      } catch (err) {
        console.error(`[collect-solunar] Error fetching ${dateStr}:`, err);
      }

      current.setDate(current.getDate() + 1);

      // Rate limiting: 500ms between requests
      await sleep(500);
    }

    console.log(`[collect-solunar] Done. ${count} rows upserted.`);
  } else {
    const dateStr = today();
    const dateCompact = formatDateCompact(new Date());

    console.log(`[collect-solunar] Fetching for ${dateStr}`);

    const data = await fetchSolunar(dateCompact);
    const row = buildRow(dateStr, data);

    const { error } = await supabase
      .from("solunar")
      .upsert([row], { onConflict: "date" });

    if (error) {
      console.error("[collect-solunar] Upsert error:", error);
      throw error;
    }

    console.log(`[collect-solunar] Done. 1 row upserted for ${dateStr}.`);
  }
}

main().catch((err) => {
  console.error("[collect-solunar] Fatal error:", err);
  process.exit(1);
});

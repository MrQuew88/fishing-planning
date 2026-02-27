/**
 * One-time seed: hydro data for Jan 11-21 2026 (before OPW coverage).
 * Values from user's spreadsheet. niveau_delta = metres above 46m AOD (Malin Head OSGM15).
 */

import { config } from "dotenv";
config({ path: ".env.local", override: false });
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const SEED = [
  { date: "2026-01-11", temp_eau_c: 6.0, niveau_eau_delta: 0.1 },
  { date: "2026-01-12", temp_eau_c: 6.0, niveau_eau_delta: 0.18 },
  { date: "2026-01-13", temp_eau_c: 6.1, niveau_eau_delta: 0.3 },
  { date: "2026-01-14", temp_eau_c: 6.2, niveau_eau_delta: 0.38 },
  { date: "2026-01-15", temp_eau_c: 6.2, niveau_eau_delta: 0.44 },
  { date: "2026-01-16", temp_eau_c: 6.2, niveau_eau_delta: 0.48 },
  { date: "2026-01-17", temp_eau_c: 6.2, niveau_eau_delta: 0.49 },
  { date: "2026-01-18", temp_eau_c: 6.2, niveau_eau_delta: 0.48 },
  { date: "2026-01-19", temp_eau_c: 6.2, niveau_eau_delta: 0.471 },
  { date: "2026-01-20", temp_eau_c: 6.2, niveau_eau_delta: 0.48 },
  { date: "2026-01-21", temp_eau_c: 6.2, niveau_eau_delta: 0.561 },
];

async function main() {
  console.log(`[seed-hydro] Upserting ${SEED.length} rows (Jan 11-21)...`);

  const { error } = await supabase
    .from("daily_weather")
    .upsert(SEED, { onConflict: "date" });

  if (error) {
    console.error("[seed-hydro] Error:", error);
    throw error;
  }

  console.log("[seed-hydro] Done.");
}

main().catch((err) => {
  console.error("[seed-hydro] Fatal:", err);
  process.exit(1);
});

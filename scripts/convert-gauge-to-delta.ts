/**
 * One-time conversion: gauge_height → delta base 46m AOD.
 * Formula: niveau_eau_delta = gauge_height - 1.67
 * Applies to all rows from Jan 22 onwards (OPW data).
 */

import { config } from "dotenv";
config({ path: ".env.local" });
import { createClient } from "@supabase/supabase-js";

const OFFSET = 1.67;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function main() {
  const { data, error } = await supabase
    .from("daily_weather")
    .select("date, niveau_eau_delta")
    .gte("date", "2026-01-22")
    .not("niveau_eau_delta", "is", null)
    .order("date", { ascending: true });

  if (error) throw error;
  if (!data || data.length === 0) {
    console.log("[convert] No rows to convert");
    return;
  }

  console.log(`[convert] Converting ${data.length} rows (gauge_height - ${OFFSET})...`);

  const rows = data.map((r) => ({
    date: r.date,
    niveau_eau_delta: Math.round((r.niveau_eau_delta - OFFSET) * 1000) / 1000,
  }));

  const { error: upsertErr } = await supabase
    .from("daily_weather")
    .upsert(rows, { onConflict: "date" });

  if (upsertErr) throw upsertErr;

  console.log(`[convert] Done. Sample:`);
  for (const r of rows.slice(0, 3)) {
    console.log(`  ${r.date}: delta = ${r.niveau_eau_delta}m`);
  }
}

main().catch((err) => {
  console.error("[convert] Fatal:", err);
  process.exit(1);
});

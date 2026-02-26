/**
 * compute-degree-days.ts
 *
 * Recalcule les degrés-jour cumulés basés sur la température de l'eau (temp_eau_c).
 * Formule : DJ = somme cumulative de max(0, temp_eau_c) depuis le premier jour disponible.
 *
 * Usage : npx tsx scripts/compute-degree-days.ts
 */

import { config } from "dotenv";
config({ path: ".env.local" });
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function main() {
  console.log("[compute-dj] Fetching daily_weather rows with temp_eau_c...");

  const { data, error } = await supabase
    .from("daily_weather")
    .select("date, temp_eau_c")
    .not("temp_eau_c", "is", null)
    .order("date", { ascending: true });

  if (error) {
    console.error("[compute-dj] Fetch error:", error);
    throw error;
  }

  if (!data || data.length === 0) {
    console.log("[compute-dj] No rows with temp_eau_c found");
    return;
  }

  console.log(`[compute-dj] ${data.length} days with water temp data`);

  let cumul = 0;
  const rows = data.map((row) => {
    cumul += Math.max(0, row.temp_eau_c);
    return {
      date: row.date,
      degres_jour_cumules: Math.round(cumul * 100) / 100,
    };
  });

  console.log(`[compute-dj] Upserting ${rows.length} rows...`);

  for (let i = 0; i < rows.length; i += 100) {
    const batch = rows.slice(i, i + 100);
    const { error: upsertError } = await supabase
      .from("daily_weather")
      .upsert(batch, { onConflict: "date" });

    if (upsertError) {
      console.error(`[compute-dj] Upsert error (batch ${i}):`, upsertError);
      throw upsertError;
    }
  }

  console.log(
    `[compute-dj] Done. ${rows.length} rows updated (${rows[0].date} → ${rows[rows.length - 1].date})`
  );
  console.log(
    `[compute-dj] Final cumul: ${rows[rows.length - 1].degres_jour_cumules} DJ`
  );
}

main().catch((err) => {
  console.error("[compute-dj] Fatal error:", err);
  process.exit(1);
});

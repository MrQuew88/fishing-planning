/**
 * insert-briefing.ts
 *
 * Lit le JSON du briefing depuis stdin et l'upsert dans tactical_briefings.
 *
 * Usage :
 *   cat /tmp/briefing.json | npx tsx scripts/insert-briefing.ts
 *   cat /tmp/briefing.json | npx tsx scripts/insert-briefing.ts --date 2026-03-02
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

function readStdin(): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = "";
    process.stdin.setEncoding("utf-8");
    process.stdin.on("data", (chunk) => (data += chunk));
    process.stdin.on("end", () => resolve(data.trim()));
    process.stdin.on("error", reject);
  });
}

async function main() {
  const date = parseDate();
  const raw = await readStdin();

  if (!raw) {
    console.error("[insert-briefing] Rien reçu sur stdin.");
    console.error("Usage : cat /tmp/briefing.json | npx tsx scripts/insert-briefing.ts --date 2026-03-02");
    process.exit(1);
  }

  // Strip code fences if present
  const cleaned = raw.replace(/^```(?:json)?\s*\n?/m, "").replace(/\n?```\s*$/m, "");

  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch (e) {
    console.error("[insert-briefing] JSON invalide :", (e as Error).message);
    console.error("[insert-briefing] Début du contenu :", cleaned.slice(0, 200));
    process.exit(1);
  }

  console.log(`[insert-briefing] Date : ${date}`);
  console.log(`[insert-briefing] Zones : ${parsed.zones?.length ?? 0}`);
  const summaryPreview = Array.isArray(parsed.weather_summary)
    ? parsed.weather_summary.map((s: { text: string }) => s.text).join(" · ").slice(0, 80)
    : String(parsed.weather_summary ?? "–").slice(0, 80);
  console.log(`[insert-briefing] Résumé météo : ${summaryPreview}`);

  // Validate zones
  const requiredFields = ["zone_name", "why_today", "target_depths"] as const;
  if (Array.isArray(parsed.zones)) {
    for (const zone of parsed.zones) {
      for (const field of requiredFields) {
        if (!zone[field]) {
          console.warn(`[insert-briefing] ⚠ Zone "${zone.zone_name ?? "?"}" : champ "${field}" manquant ou vide`);
        }
      }
    }
  }

  const { error } = await supabase
    .from("tactical_briefings")
    .upsert(
      {
        date,
        content: JSON.stringify(parsed),
        conditions_snapshot: { generated_at: new Date().toISOString() },
      },
      { onConflict: "date" }
    );

  if (error) {
    console.error("[insert-briefing] Erreur upsert :", error);
    process.exit(1);
  }

  console.log(`[insert-briefing] ✓ Briefing inséré pour ${date}`);
}

main().catch((err) => {
  console.error("[insert-briefing] Fatal :", err);
  process.exit(1);
});

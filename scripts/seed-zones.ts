/**
 * Seed fishing_zones table from fishing_zones_all.json.
 * Flattens all features from all zones and upserts on name.
 *
 * Usage: npx tsx scripts/seed-zones.ts
 */

import { config } from "dotenv";
config({ path: ".env.local", override: false });
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { join } from "path";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Feature {
  name: string;
  lat: number;
  lng: number;
  radius_m: number;
  depth_min: number;
  depth_max: number;
  type: string;
  profile: string;
  orientation: string;
  wind_sheltered: string[];
  wind_exposed: string[];
  post_spawn_score: number;
  vegetation: string | null;
  is_spawning_zone: boolean | null;
  spawning_notes: string | null;
  notes: string;
}

interface Zone {
  zone_name: string;
  features: Feature[];
}

interface AllZones {
  zones: Zone[];
}

async function main() {
  const filePath = join(__dirname, "..", "fishing_zones_all.json");
  const raw = readFileSync(filePath, "utf-8");
  const data: AllZones = JSON.parse(raw);

  const rows = data.zones.flatMap((zone) =>
    zone.features.map((f) => ({
      zone_name: zone.zone_name,
      name: f.name,
      lat: f.lat,
      lng: f.lng,
      radius_m: f.radius_m,
      depth_min: f.depth_min,
      depth_max: f.depth_max,
      type: f.type,
      profile: f.profile,
      orientation: f.orientation,
      wind_sheltered: f.wind_sheltered,
      wind_exposed: f.wind_exposed,
      post_spawn_score: f.post_spawn_score,
      vegetation: f.vegetation,
      is_spawning_zone: f.is_spawning_zone,
      spawning_notes: f.spawning_notes,
      notes: f.notes,
    }))
  );

  console.log(`[seed-zones] Upserting ${rows.length} features from ${data.zones.length} zones...`);

  const { data: result, error } = await supabase
    .from("fishing_zones")
    .upsert(rows, { onConflict: "name" })
    .select("name");

  if (error) {
    console.error("[seed-zones] Error:", error.message);
    process.exit(1);
  }

  console.log(`[seed-zones] Done — ${result.length} rows upserted.`);
}

main();

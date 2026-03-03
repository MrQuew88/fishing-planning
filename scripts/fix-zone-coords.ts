import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function parseCoordsFromUrl(url: string): [number, number] | null {
  // Try @lat,lng pattern
  const m1 = url.match(/@(-?\d+\.?\d+),(-?\d+\.?\d+)/);
  if (m1) return [parseFloat(m1[1]), parseFloat(m1[2])];

  // Try ?q=lat,lng or &q=lat,lng
  const m2 = url.match(/[?&]q=(-?\d+\.?\d+),(-?\d+\.?\d+)/);
  if (m2) return [parseFloat(m2[1]), parseFloat(m2[2])];

  // Try /search/lat,+lng or /search/lat,+-lng (Google Maps search URL)
  const m3 = url.match(/\/search\/(-?\d+\.?\d+),\+(-?\d+\.?\d+)/);
  if (m3) return [parseFloat(m3[1]), parseFloat(m3[2])];

  // Try bare "lat, lng" (some entries are just coords)
  const m4 = url.match(/^(-?\d+\.?\d+),\s*(-?\d+\.?\d+)$/);
  if (m4) return [parseFloat(m4[1]), parseFloat(m4[2])];

  return null;
}

async function resolveShortUrl(shortUrl: string): Promise<string> {
  // Follow redirects manually to get the final URL with coords
  const res = await fetch(shortUrl, { redirect: "follow" });
  return res.url;
}

async function getCoordsForUrl(url: string): Promise<[number, number] | null> {
  // First try parsing directly
  const direct = parseCoordsFromUrl(url);
  if (direct) return direct;

  // If it's a short link, resolve it
  if (url.includes("goo.gl") || url.includes("maps.app")) {
    try {
      const resolved = await resolveShortUrl(url);
      console.log(`   Resolved → ${resolved.slice(0, 100)}…`);
      const fromResolved = parseCoordsFromUrl(resolved);
      if (fromResolved) return fromResolved;
    } catch (e) {
      console.warn(`   Failed to resolve: ${(e as Error).message}`);
    }
  }

  return null;
}

async function main() {
  const { data: zones, error } = await supabase
    .from("fishing_zones")
    .select("id, name, lat, lng, google_maps_url");

  if (error) {
    console.error("Failed to fetch zones:", error);
    process.exit(1);
  }

  console.log(`Found ${zones.length} zones\n`);

  let updated = 0;
  let failed = 0;
  let noUrl = 0;

  for (const zone of zones) {
    if (!zone.google_maps_url) {
      noUrl++;
      console.log(`⏭  "${zone.name}" — no google_maps_url, skipping`);
      continue;
    }

    console.log(`🔍 "${zone.name}"`);
    const coords = await getCoordsForUrl(zone.google_maps_url);

    if (!coords) {
      failed++;
      console.log(`   ⚠ Could not extract coordinates\n`);
      continue;
    }

    const [newLat, newLng] = coords;
    const latDiff = Math.abs(zone.lat - newLat);
    const lngDiff = Math.abs(zone.lng - newLng);

    console.log(
      `   OLD: ${zone.lat}, ${zone.lng}\n` +
      `   NEW: ${newLat}, ${newLng}  (Δ ${latDiff.toFixed(5)}, ${lngDiff.toFixed(5)})`
    );

    const { error: updateError } = await supabase
      .from("fishing_zones")
      .update({ lat: newLat, lng: newLng })
      .eq("id", zone.id);

    if (updateError) {
      console.error(`   ❌ Update failed:`, updateError.message);
      failed++;
    } else {
      updated++;
      console.log(`   ✅ Updated\n`);
    }
  }

  console.log(`\nDone: ${updated} updated, ${failed} failed, ${noUrl} without URL`);
}

main();

import { supabase } from "@/lib/supabase";
import { TacticalBriefing, BriefingContent, FishingZone } from "@/lib/types";
import BriefingMap from "@/components/briefing/BriefingMapLoader";

export const dynamic = "force-dynamic";

async function getTodayBriefing(): Promise<TacticalBriefing | null> {
  if (!supabase) return null;
  const today = new Date().toISOString().slice(0, 10);
  const { data, error } = await supabase
    .from("tactical_briefings")
    .select("*")
    .eq("date", today)
    .single();
  if (error) {
    console.error("Failed to fetch briefing:", error);
    return null;
  }
  return data as TacticalBriefing;
}

async function getFishingZones(): Promise<FishingZone[]> {
  if (!supabase) return [];
  const { data, error } = await supabase.from("fishing_zones").select("*");
  if (error) {
    console.error("Failed to fetch fishing zones:", error);
    return [];
  }
  return data as FishingZone[];
}

export default async function BriefingCartePage() {
  const [briefing, allZones] = await Promise.all([
    getTodayBriefing(),
    getFishingZones(),
  ]);

  if (!briefing) {
    return (
      <div className="fixed top-[52px] left-0 right-0 bottom-0 flex items-center justify-center bg-[#0B1426]">
        <div className="text-center space-y-3 px-6">
          <p className="text-white/50 text-lg">
            Aucun briefing disponible pour aujourd&apos;hui.
          </p>
          <a
            href="/"
            className="inline-block text-[#F59E0B]/80 hover:text-[#F59E0B] transition-colors"
          >
            ← Retour au briefing
          </a>
        </div>
      </div>
    );
  }

  const parsed = JSON.parse(briefing.content) as BriefingContent;

  // Build zones map keyed by id
  const zonesMap: Record<string, FishingZone> = {};
  for (const z of allZones) zonesMap[z.id] = z;

  // Parse lat/lng from a Google Maps URL (handles full URLs, short links resolved, and bare coords)
  function parseCoordsFromUrl(url: string | null): [number, number] | null {
    if (!url) return null;
    const m =
      url.match(/@(-?\d+\.?\d+),(-?\d+\.?\d+)/) ||
      url.match(/[?&]q=(-?\d+\.?\d+),(-?\d+\.?\d+)/) ||
      url.match(/\/search\/(-?\d+\.?\d+),\+(-?\d+\.?\d+)/) ||
      url.match(/^(-?\d+\.?\d+),\s*(-?\d+\.?\d+)$/);
    if (!m) return null;
    return [parseFloat(m[1]), parseFloat(m[2])];
  }

  // Collect briefing zones — prefer coords from google_maps_url
  const mapZones = parsed.zones
    .map((bz) => {
      const detail = zonesMap[bz.zone_id];
      // Try zone's google_maps_url first, then briefing's, then DB lat/lng as last resort
      const coords =
        parseCoordsFromUrl(detail?.google_maps_url ?? null) ??
        parseCoordsFromUrl(bz.google_maps_url) ??
        (detail ? [detail.lat, detail.lng] as [number, number] : null);
      if (!coords) return null;
      return {
        zone_id: bz.zone_id,
        zone_name: bz.zone_name,
        post_spawn_score: bz.post_spawn_score,
        why_today: bz.why_today,
        google_maps_url: detail?.google_maps_url ?? bz.google_maps_url,
        lat: coords[0],
        lng: coords[1],
      };
    })
    .filter((z): z is NonNullable<typeof z> => z !== null);

  // Build zone_name → recommended periods lookup
  const zoneNameToPeriods: Record<string, string[]> = {};
  for (const period of parsed.timing.periods) {
    for (const zoneName of period.zones) {
      if (!zoneNameToPeriods[zoneName]) zoneNameToPeriods[zoneName] = [];
      zoneNameToPeriods[zoneName].push(period.label);
    }
  }

  // Attach periods to each map zone
  const mapZonesWithPeriods = mapZones.map((z) => ({
    ...z,
    periods: zoneNameToPeriods[z.zone_name] ?? [],
  }));

  return <BriefingMap zones={mapZonesWithPeriods} />;
}

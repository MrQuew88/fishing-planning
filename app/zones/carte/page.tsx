import { supabase } from "@/lib/supabase";
import { FishingZone } from "@/lib/types";
import ZonesMapLoader from "@/components/zones/ZonesMapLoader";

export const dynamic = "force-dynamic";

async function getFishingZones(): Promise<FishingZone[]> {
  if (!supabase) return [];
  const { data, error } = await supabase.from("fishing_zones").select("*");
  if (error) {
    console.error("Failed to fetch fishing zones:", error);
    return [];
  }
  return data as FishingZone[];
}

export default async function ZonesCartePage() {
  const allZones = await getFishingZones();

  const mapZones = allZones
    .map((z) => ({
      id: z.id,
      name: z.name,
      post_spawn_score: z.post_spawn_score,
      depth_min: z.depth_min,
      depth_max: z.depth_max,
      google_maps_url: z.google_maps_url,
      lat: z.lat,
      lng: z.lng,
    }))
    .filter((z) => z.lat !== 0 && z.lng !== 0);

  return <ZonesMapLoader zones={mapZones} />;
}

import { supabase } from "@/lib/supabase";
import { FishingZone } from "@/lib/types";
import ZonesClient from "@/components/zones/ZonesClient";
import SectionTitle from "@/components/ui/SectionTitle";

export const dynamic = "force-dynamic";

async function getZones(): Promise<FishingZone[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("fishing_zones")
    .select("*")
    .order("zone_name")
    .order("post_spawn_score", { ascending: false });
  if (error) {
    console.error("Failed to fetch fishing zones:", error);
    return [];
  }
  return data as FishingZone[];
}

export default async function ZonesPage() {
  const zones = await getZones();

  return (
    <div className="pt-6 space-y-6">
      <div>
        <SectionTitle>Zones de pêche</SectionTitle>
        <p className="text-sm md:text-lg text-white/75 mt-1">
          Analyse bathymétrique post-fraie — Killykeen / Lough Oughter
        </p>
      </div>
      <ZonesClient zones={zones} />
    </div>
  );
}

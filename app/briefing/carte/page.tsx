import { supabase } from "@/lib/supabase";
import { getTodayIrish } from "@/lib/date";
import { TacticalBriefing, BriefingContent, FishingZone } from "@/lib/types";
import BriefingMap from "@/components/briefing/BriefingMapLoader";

export const dynamic = "force-dynamic";

async function getBriefing(date: string): Promise<TacticalBriefing | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("tactical_briefings")
    .select("*")
    .eq("date", date)
    .single();
  if (error) return null;
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

export default async function BriefingCartePage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { date } = await searchParams;
  const targetDate = date || getTodayIrish();

  const [briefing, allZones] = await Promise.all([
    getBriefing(targetDate),
    getFishingZones(),
  ]);

  if (!briefing) {
    return (
      <div className="fixed top-[52px] left-0 right-0 bottom-0 flex items-center justify-center bg-[#080F1E]">
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

  // Build map zones with lat/lng from DB + briefing data
  const mapZones = parsed.zones
    .map((bz) => {
      const detail = zonesMap[bz.zone_id];
      if (!detail) return null;

      return {
        zone_id: bz.zone_id,
        zone_name: bz.zone_name,
        feature_name: detail.name,
        day_score: bz.day_score,
        tier: bz.tier,
        why_today: bz.why_today,
        google_maps_url: detail.google_maps_url ?? bz.google_maps_url,
        lat: detail.lat,
        lng: detail.lng,
        slots: bz.slots,
      };
    })
    .filter((z): z is NonNullable<typeof z> => z !== null);

  return <BriefingMap zones={mapZones} />;
}

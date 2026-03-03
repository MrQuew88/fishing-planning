"use client";

import { useState } from "react";
import Link from "next/link";
import { BriefingContent, FishingZone } from "@/lib/types";
import GlassCard from "@/components/ui/GlassCard";
import SectionTitle from "@/components/ui/SectionTitle";
import Badge from "@/components/ui/Badge";

const SCORE_STARS = (score: number) =>
  "★".repeat(score) + "☆".repeat(5 - score);

function BriefingZoneCard({
  briefingZone,
  zoneDetail,
}: {
  briefingZone: BriefingContent["zones"][number];
  zoneDetail: FishingZone | undefined;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div
      id={`briefing-zone-${briefingZone.zone_id}`}
      className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl scroll-mt-24"
    >
      {/* Persistent section — always visible */}
      <div className="p-4 md:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-base md:text-lg font-bold text-white">
                {briefingZone.zone_name}
              </span>
              <span className="text-amber-400 text-sm md:text-base font-[family-name:var(--font-space)]">
                {SCORE_STARS(briefingZone.post_spawn_score)}
              </span>
            </div>
            <p className="text-sm md:text-base text-white/60 mt-1">
              {briefingZone.target_depths}
            </p>
          </div>
        </div>

        {/* Why today — persistent */}
        <p className="text-base md:text-lg text-white/80 leading-relaxed mt-3">
          {briefingZone.why_today}
        </p>

        {/* Google Maps link — persistent */}
        {briefingZone.google_maps_url && (
          <a
            href={briefingZone.google_maps_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-sm md:text-lg text-[#F59E0B]/80 hover:text-[#F59E0B] transition-colors mt-3"
          >
            📍 Google Maps
          </a>
        )}
      </div>

      {/* Collapsible — zone detail from fishing_zones */}
      {zoneDetail && (
        <>
          <button
            onClick={() => setOpen(!open)}
            className="w-full flex items-center gap-2 px-4 md:px-5 py-2 border-t border-white/[0.06] cursor-pointer text-white/40 hover:text-white/60 transition-colors"
          >
            <svg
              className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 ${open ? "rotate-0" : "-rotate-90"}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
            <span className="text-sm font-medium">Détails de la zone</span>
          </button>

          <div className="collapse-content" data-open={open}>
            <div className="collapse-inner">
              <div className="px-4 md:px-5 pb-4 md:pb-5 space-y-3">
                {/* Profile */}
                <p className="text-sm md:text-base text-white/70 leading-relaxed">
                  {zoneDetail.profile}
                </p>

                {/* Metadata */}
                <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm md:text-base">
                  <span className="text-white/50">
                    Prof.{" "}
                    <span className="text-white/70 font-[family-name:var(--font-space)]">
                      {zoneDetail.depth_min}–{zoneDetail.depth_max}m
                    </span>
                  </span>
                  {zoneDetail.orientation && (
                    <span className="text-white/50">
                      Orient. <span className="text-white/70">{zoneDetail.orientation}</span>
                    </span>
                  )}
                  {zoneDetail.vegetation && (
                    <span className="text-white/50">
                      Végét. <span className="text-white/70">{zoneDetail.vegetation}</span>
                    </span>
                  )}
                </div>

                {/* Wind */}
                {(zoneDetail.wind_sheltered.length > 0 || zoneDetail.wind_exposed.length > 0) && (
                  <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm md:text-base">
                    {zoneDetail.wind_sheltered.length > 0 && (
                      <span className="text-white/50">
                        Abrité <span className="text-[#22C55E]/80">{zoneDetail.wind_sheltered.join(", ")}</span>
                      </span>
                    )}
                    {zoneDetail.wind_exposed.length > 0 && (
                      <span className="text-white/50">
                        Exposé <span className="text-[#EF4444]/80">{zoneDetail.wind_exposed.join(", ")}</span>
                      </span>
                    )}
                  </div>
                )}

                {/* Tactical notes */}
                {zoneDetail.notes && (
                  <p className="text-sm text-white/50 leading-relaxed italic">
                    {zoneDetail.notes}
                  </p>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

interface Props {
  content: BriefingContent;
  zonesMap: Record<string, FishingZone>;
  date?: string;
}

export default function TacticalBriefingSection({ content, zonesMap, date }: Props) {
  // Build lookup: fishing_zones.name → zone_id (from briefing zones)
  const nameToZoneId: Record<string, string> = {};
  for (const z of content.zones) {
    // Match on fishing_zones `name` field via zonesMap
    const detail = zonesMap[z.zone_id];
    if (detail) nameToZoneId[detail.name] = z.zone_id;
  }

  function scrollToZone(zoneId: string) {
    const el = document.getElementById(`briefing-zone-${zoneId}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <GlassCard>
        <SectionTitle>Briefing tactique</SectionTitle>

        {/* Weather summary as bullet points */}
        <ul className="mt-3 space-y-1.5">
          {content.weather_summary.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm md:text-base text-white/60 font-[family-name:var(--font-space)]">
              <span className="flex-shrink-0">{item.icon}</span>
              <span>{item.text}</span>
            </li>
          ))}
        </ul>

        {/* General conditions */}
        <p className="text-base md:text-lg text-white/80 mt-4 leading-relaxed">
          {content.general_conditions}
        </p>

        {/* Solunar badges */}
        <div className="flex gap-2 mt-4 flex-wrap">
          {content.timing.solunar_major.map((t, i) => (
            <Badge key={`maj-${i}`} label={`★ ${t}`} color="amber" />
          ))}
          {content.timing.solunar_minor.map((t, i) => (
            <Badge key={`min-${i}`} label={t} color="neutral" />
          ))}
        </div>
      </GlassCard>

      {/* Day periods */}
      {content.timing.periods.length > 0 && (
        <div>
          <SectionTitle>Évolution de la journée</SectionTitle>
          <GlassCard className="mt-4">
            <div className="space-y-5">
              {content.timing.periods.map((period, i) => (
                <div key={i}>
                  <p className="text-base md:text-lg text-white/80 leading-relaxed">
                    <span className="font-semibold text-white">{period.label}</span>
                    {" — "}{period.conditions}
                  </p>
                  {period.zones.length > 0 && (
                    <ul className="mt-1.5 space-y-1 ml-1">
                      {period.zones.map((zoneName, j) => {
                        const zoneId = nameToZoneId[zoneName];
                        return (
                          <li key={j} className="flex items-center gap-2 text-sm md:text-base">
                            <span className="text-white/30">•</span>
                            {zoneId ? (
                              <button
                                onClick={() => scrollToZone(zoneId)}
                                className="text-[#F59E0B]/80 hover:text-[#F59E0B] transition-colors text-left cursor-pointer"
                              >
                                {zoneName}
                              </button>
                            ) : (
                              <span className="text-white/60">{zoneName}</span>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      )}

      {/* Zone cards */}
      {content.zones.length > 0 && (
        <div>
          <SectionTitle>Zones recommandées</SectionTitle>
          <Link
            href={date ? `/briefing/carte?date=${date}` : "/briefing/carte"}
            className="inline-flex items-center gap-2 bg-white/10 border border-white/10 rounded-xl px-5 py-3 text-lg font-semibold text-white hover:bg-white/15 transition-colors mt-4"
          >
            🗺 Voir sur la carte
          </Link>
          <div className="grid gap-3 mt-4">
            {content.zones.map((zone, i) => (
              <BriefingZoneCard
                key={i}
                briefingZone={zone}
                zoneDetail={zonesMap[zone.zone_id]}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

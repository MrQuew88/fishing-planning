"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BriefingContent,
  BriefingZone,
  FishingZone,
  SlotKey,
  Tier,
  SLOT_LABELS,
  TIER_CONFIG,
} from "@/lib/types";
import GlassCard from "@/components/ui/GlassCard";
import SectionTitle from "@/components/ui/SectionTitle";
import Badge from "@/components/ui/Badge";

// ---------- Slot Filter Pills ----------

const ALL_SLOTS: SlotKey[] = ["fraiche", "matinee", "apres_midi", "coup_du_soir"];
const SLOT_SHORT: Record<SlotKey, string> = {
  fraiche: "6h-9h",
  matinee: "9h-12h",
  apres_midi: "12h-16h",
  coup_du_soir: "16h-20h",
};

function SlotFilterPills({
  selected,
  onChange,
}: {
  selected: SlotKey | null;
  onChange: (slot: SlotKey | null) => void;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
      <button
        onClick={() => onChange(null)}
        className={`flex-shrink-0 rounded-xl px-5 py-2.5 text-base font-semibold transition-colors cursor-pointer ${
          selected === null
            ? "bg-white/15 text-white border border-white/20"
            : "bg-white/5 text-white/50 border border-white/10 hover:bg-white/10"
        }`}
      >
        Tous
      </button>
      {ALL_SLOTS.map((slot) => (
        <button
          key={slot}
          onClick={() => onChange(selected === slot ? null : slot)}
          className={`flex-shrink-0 rounded-xl px-5 py-2.5 text-base font-semibold transition-colors cursor-pointer ${
            selected === slot
              ? "bg-white/15 text-white border border-white/20"
              : "bg-white/5 text-white/50 border border-white/10 hover:bg-white/10"
          }`}
        >
          {SLOT_SHORT[slot]}
        </button>
      ))}
    </div>
  );
}

// ---------- Zone Card ----------

function ZoneCard({
  zone,
  zoneDetail,
  selectedSlot,
}: {
  zone: BriefingZone;
  zoneDetail: FishingZone | undefined;
  selectedSlot: SlotKey | null;
}) {
  const [detailOpen, setDetailOpen] = useState(false);

  const displayScore = zone.day_score;
  const displayTier = selectedSlot ? zone.slots[selectedSlot].tier : zone.tier;
  const tierCfg = TIER_CONFIG[displayTier];

  // Optimal slots: those with tier T1 or T2
  const optimalSlots = ALL_SLOTS.filter(
    (s) => zone.slots[s].tier === "T1" || zone.slots[s].tier === "T2"
  );

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
      <div className="p-4 md:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-base md:text-lg font-bold text-white">
                {zone.zone_name}
              </span>
            </div>
            <p className="text-sm md:text-base text-white/60 mt-1">
              {zone.target_depths}
            </p>
          </div>
          <div className="flex-shrink-0 text-right">
            <span className="text-2xl font-bold font-[family-name:var(--font-plex)] text-white">
              {displayScore}
            </span>
            <span className="text-sm text-white/40">
              /10
            </span>
          </div>
        </div>

        {/* Optimal slot pills */}
        {optimalSlots.length > 0 && !selectedSlot && (
          <div className="flex gap-1.5 mt-2 flex-wrap">
            {optimalSlots.map((s) => (
              <span
                key={s}
                className="text-xs px-2 py-0.5 rounded-md bg-white/[0.06] text-white/60 font-medium"
              >
                {SLOT_SHORT[s]}
              </span>
            ))}
          </div>
        )}

        {/* Why today — only T1/T2 */}
        {zone.why_today && (displayTier === "T1" || displayTier === "T2") && (
          <p className="text-base md:text-lg text-white/80 leading-relaxed mt-3">
            {zone.why_today}
          </p>
        )}

        {/* Google Maps link */}
        {zone.google_maps_url && (
          <a
            href={zone.google_maps_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-sm md:text-lg text-[#F59E0B]/80 hover:text-[#F59E0B] transition-colors mt-3"
          >
            📍 Google Maps
          </a>
        )}
      </div>

      {/* Collapsible zone detail */}
      {zoneDetail && (
        <>
          <button
            onClick={() => setDetailOpen(!detailOpen)}
            className="w-full flex items-center gap-2 px-4 md:px-5 py-2 border-t border-white/[0.06] cursor-pointer text-white/40 hover:text-white/60 transition-colors"
          >
            <svg
              className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 ${detailOpen ? "rotate-0" : "-rotate-90"}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
            <span className="text-sm font-medium">Détails de la zone</span>
          </button>
          <div className="collapse-content" data-open={detailOpen}>
            <div className="collapse-inner">
              <div className="px-4 md:px-5 pb-4 md:pb-5 space-y-3">
                <p className="text-sm md:text-base text-white/70 leading-relaxed">
                  {zoneDetail.profile}
                </p>
                <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm md:text-base">
                  <span className="text-white/50">
                    Prof.{" "}
                    <span className="text-white/70 font-[family-name:var(--font-plex)]">
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
                {zoneDetail.notes && (
                  <p className="text-sm text-white/50 leading-relaxed italic">
                    {zoneDetail.notes}
                  </p>
                )}

                {/* Slot scores breakdown */}
                <div className="grid grid-cols-2 gap-2 pt-2">
                  {ALL_SLOTS.map((s) => {
                    const ss = zone.slots[s];
                    const tc = TIER_CONFIG[ss.tier];
                    return (
                      <div
                        key={s}
                        className="bg-white/[0.04] rounded-lg px-3 py-2 text-sm"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-white/50">{SLOT_SHORT[s]}</span>
                          <span className="font-bold font-[family-name:var(--font-plex)] text-white">
                            {ss.score}<span className="text-white/40 font-normal">/5</span>
                          </span>
                        </div>
                        <div className="text-xs text-white/40 mt-0.5">
                          {ss.wind_dir} {ss.wind_speed_kmh}km/h · {ss.cloud_cover_pct}%
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ---------- Tier Group ----------

function TierGroup({
  tier,
  zones,
  zonesMap,
  selectedSlot,
  defaultCollapsed,
}: {
  tier: Tier;
  zones: BriefingZone[];
  zonesMap: Record<string, FishingZone>;
  selectedSlot: SlotKey | null;
  defaultCollapsed: boolean;
}) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const cfg = TIER_CONFIG[tier];

  if (zones.length === 0) return null;

  return (
    <div>
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full flex items-center gap-2 py-2 cursor-pointer group"
      >
        <svg
          className={`w-4 h-4 flex-shrink-0 text-white/40 transition-transform duration-200 ${collapsed ? "-rotate-90" : "rotate-0"}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
        <span className="text-lg font-bold tracking-wider uppercase text-white/50 group-hover:text-white/70 transition-colors">
          {cfg.emoji} {cfg.label}
        </span>
        <span className="text-xs text-white/30 font-[family-name:var(--font-plex)]">
          {zones.length} zone{zones.length > 1 ? "s" : ""}
        </span>
      </button>
      <div className="collapse-content" data-open={!collapsed}>
        <div className="collapse-inner">
          <div className="grid gap-3 pt-1">
            {zones.map((zone) => (
              <ZoneCard
                key={zone.zone_id}
                zone={zone}
                zoneDetail={zonesMap[zone.zone_id]}
                selectedSlot={selectedSlot}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- Main Component ----------

interface Props {
  content: BriefingContent;
  zonesMap: Record<string, FishingZone>;
  date?: string;
}

export default function TacticalBriefingSection({ content, zonesMap, date }: Props) {
  const [selectedSlot, setSelectedSlot] = useState<SlotKey | null>(null);

  // Group zones by tier (accounting for slot filter)
  function getDisplayTier(zone: BriefingZone): Tier {
    return selectedSlot ? zone.slots[selectedSlot].tier : zone.tier;
  }

  const tiers: Tier[] = ["T1", "T2", "T3", "T4"];
  const groupedZones: Record<Tier, BriefingZone[]> = { T1: [], T2: [], T3: [], T4: [] };

  for (const zone of content.zones) {
    const t = getDisplayTier(zone);
    groupedZones[t].push(zone);
  }

  // Sort within each tier by score desc
  for (const t of tiers) {
    groupedZones[t].sort((a, b) => {
      const sa = selectedSlot ? a.slots[selectedSlot].score : a.day_score;
      const sb = selectedSlot ? b.slots[selectedSlot].score : b.day_score;
      return sb - sa;
    });
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <GlassCard>
        <SectionTitle>
          Briefing tactique
          {date
            ? ` — ${new Date(date + "T00:00:00").toLocaleDateString("fr-FR", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}`
            : ""}
        </SectionTitle>

        {/* Weather summary */}
        <p className="mt-3 text-sm md:text-base text-white/60 font-[family-name:var(--font-plex)] leading-relaxed">
          {content.weather_summary}
        </p>

        {/* General conditions */}
        <p className="text-base md:text-lg text-white/80 mt-4 leading-relaxed">
          {content.general_conditions}
        </p>

        {/* Solunar badges */}
        {content.solunar && (
          <div className="flex gap-2 mt-4 flex-wrap">
            {content.solunar.major.map((t, i) => (
              <Badge key={`maj-${i}`} label={`★ ${t}`} color="amber" />
            ))}
            {content.solunar.minor.map((t, i) => (
              <Badge key={`min-${i}`} label={t} color="neutral" />
            ))}
          </div>
        )}
      </GlassCard>

      {/* Day periods */}
      {content.periods && content.periods.length > 0 && (
        <div>
          <SectionTitle>Évolution de la journée</SectionTitle>
          <GlassCard className="mt-4">
            <div className="space-y-5">
              {content.periods.map((period, i) => (
                <div key={i}>
                  <p className="text-base md:text-lg text-white/80 leading-relaxed">
                    <span className="font-semibold text-white">{period.label}</span>
                    {" — "}
                    {period.conditions}
                  </p>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      )}

      {/* Slot filter + zones grouped by tier */}
      {content.zones.length > 0 && (
        <div>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <SectionTitle>Classement des zones</SectionTitle>
            <Link
              href={date ? `/briefing/carte?date=${date}` : "/briefing/carte"}
              className="inline-flex items-center gap-2 bg-white/10 border border-white/10 rounded-xl px-4 py-2 text-sm font-semibold text-white hover:bg-white/15 transition-colors"
            >
              🗺 Carte
            </Link>
          </div>

          <div className="mt-4">
            <SlotFilterPills selected={selectedSlot} onChange={setSelectedSlot} />
          </div>

          <div className="space-y-4 mt-4">
            {tiers.map((tier) => (
              <TierGroup
                key={tier}
                tier={tier}
                zones={groupedZones[tier]}
                zonesMap={zonesMap}
                selectedSlot={selectedSlot}
                defaultCollapsed={tier === "T4"}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

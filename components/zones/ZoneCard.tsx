"use client";

import { FishingZone } from "@/lib/types";
import { useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import Badge from "@/components/ui/Badge";

const TYPE_LABELS: Record<string, { label: string; color: string }> = {
  drop_off: { label: "Drop-off", color: "blue" },
  deep_hole: { label: "Fosse", color: "purple" },
  irregular_shelf: { label: "Shelf irrégulier", color: "teal" },
  narrows: { label: "Narrows", color: "orange" },
  point_drop_off: { label: "Pointe", color: "bg-red-500/20 text-red-300" },
  arm_bay: { label: "Bras / Baie", color: "cyan" },
  plateau: { label: "Plateau", color: "emerald" },
};

const SCORE_STARS = (score: number) =>
  "★".repeat(score) + "☆".repeat(5 - score);

interface Props {
  zone: FishingZone;
}

export default function ZoneCard({ zone }: Props) {
  const [mapsUrl, setMapsUrl] = useState(zone.google_maps_url || "");
  const [vegetation, setVegetation] = useState(zone.vegetation || "");
  const [isSpawning, setIsSpawning] = useState<boolean | null>(zone.is_spawning_zone);
  const [spawningNotes, setSpawningNotes] = useState(zone.spawning_notes || "");
  const [saving, setSaving] = useState(false);

  const save = useCallback(
    async (fields: Partial<FishingZone>) => {
      if (!supabase) return;
      setSaving(true);
      await supabase
        .from("fishing_zones")
        .update({ ...fields, updated_at: new Date().toISOString() })
        .eq("id", zone.id);
      setSaving(false);
    },
    [zone.id]
  );

  const typeInfo = TYPE_LABELS[zone.type] || {
    label: zone.type,
    color: "neutral",
  };

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 relative">
      {saving && (
        <div className="absolute top-4 right-4 text-base text-amber-400/70 animate-pulse">
          Saving…
        </div>
      )}

      {/* Header */}
      <div className="flex flex-wrap items-start gap-3 mb-4">
        <h3 className="text-xl font-bold flex-1 min-w-0">{zone.name}</h3>
        <Badge label={typeInfo.label} color={typeInfo.color} />
        <span className="text-[#F59E0B] font-[family-name:var(--font-space)] text-lg tracking-wide whitespace-nowrap">
          {SCORE_STARS(zone.post_spawn_score)}
        </span>
      </div>

      {/* Depth & Orientation */}
      <div className="flex flex-wrap gap-x-6 gap-y-1 text-lg mb-4">
        <span className="text-white/75 font-medium">
          Profondeur{" "}
          <span className="font-[family-name:var(--font-space)] font-bold text-white">
            {zone.depth_min} – {zone.depth_max}m
          </span>
        </span>
        {zone.orientation && (
          <span className="text-white/75 font-medium">
            Orientation{" "}
            <span className="text-white/80">{zone.orientation}</span>
          </span>
        )}
      </div>

      {/* Wind */}
      {(zone.wind_sheltered.length > 0 || zone.wind_exposed.length > 0) && (
        <div className="flex flex-wrap gap-x-6 gap-y-1 text-lg mb-4">
          {zone.wind_sheltered.length > 0 && (
            <span className="text-white/70 font-medium">
              Abrité{" "}
              <span className="text-[#22C55E]/80">
                {zone.wind_sheltered.join(", ")}
              </span>
            </span>
          )}
          {zone.wind_exposed.length > 0 && (
            <span className="text-white/70 font-medium">
              Exposé{" "}
              <span className="text-[#EF4444]/80">
                {zone.wind_exposed.join(", ")}
              </span>
            </span>
          )}
        </div>
      )}

      {/* Profile */}
      <p className="text-white/80 text-lg leading-relaxed mb-4">
        {zone.profile}
      </p>

      {/* Tactical notes */}
      {zone.notes && (
        <p className="text-white/70 text-lg italic leading-relaxed mb-4">
          {zone.notes}
        </p>
      )}

      {/* Editable fields */}
      <div className="border-t border-white/[0.06] pt-4 mt-2 space-y-4">
        {/* Vegetation */}
        <div className="flex items-center gap-3">
          <label className="text-lg text-white/70 font-medium w-28 shrink-0">Végétation</label>
          <input
            type="text"
            value={vegetation}
            onChange={(e) => setVegetation(e.target.value)}
            onBlur={() => save({ vegetation: vegetation || null })}
            placeholder="Non renseigné"
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-lg text-white placeholder:text-white/40 focus:outline-none focus:border-amber-500/50 transition-colors min-h-[48px]"
          />
        </div>

        {/* Spawning zone */}
        <div className="flex items-center gap-3">
          <label className="text-lg text-white/70 font-medium w-28 shrink-0">Zone de fraie</label>
          <div className="flex gap-2">
            {[
              { value: true, label: "Oui" },
              { value: false, label: "Non" },
              { value: null, label: "?" },
            ].map((opt) => (
              <button
                key={String(opt.value)}
                onClick={() => {
                  setIsSpawning(opt.value as boolean | null);
                  save({ is_spawning_zone: opt.value as boolean | null });
                }}
                className={`px-4 py-2 text-base font-semibold rounded-full border transition-colors min-h-[48px] ${
                  isSpawning === opt.value
                    ? "bg-white/15 border-white/20 text-white"
                    : "border-white/10 text-white/70 hover:text-white/70"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Spawning notes */}
        <div className="flex items-center gap-3">
          <label className="text-lg text-white/70 font-medium w-28 shrink-0">Notes fraie</label>
          <input
            type="text"
            value={spawningNotes}
            onChange={(e) => setSpawningNotes(e.target.value)}
            onBlur={() => save({ spawning_notes: spawningNotes || null })}
            placeholder="Non renseigné"
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-lg text-white placeholder:text-white/40 focus:outline-none focus:border-amber-500/50 transition-colors min-h-[48px]"
          />
        </div>

        {/* Google Maps link */}
        <div className="flex items-center gap-3">
          <label className="text-lg text-white/70 font-medium w-28 shrink-0">Google Maps</label>
          {mapsUrl ? (
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-lg text-blue-400/80 hover:text-blue-300 transition-colors truncate"
              >
                📍 Voir sur Google Maps
              </a>
              <button
                onClick={() => {
                  setMapsUrl("");
                  save({ google_maps_url: null });
                }}
                className="text-white/30 hover:text-white/80 text-base shrink-0 min-h-[48px] px-2"
              >
                ✕
              </button>
            </div>
          ) : (
            <input
              type="text"
              value=""
              onChange={() => {}}
              onPaste={(e) => {
                const url = e.clipboardData.getData("text");
                setMapsUrl(url);
                setTimeout(() => (e.target as HTMLInputElement).blur(), 0);
              }}
              onBlur={(e) => {
                const url = (e.target as HTMLInputElement).value || mapsUrl;
                if (!url) return;
                setMapsUrl(url);
                const fields: Partial<FishingZone> = { google_maps_url: url };
                const m = url.match(/@(-?\d+\.?\d+),(-?\d+\.?\d+)/) ||
                          url.match(/[?&]q=(-?\d+\.?\d+),(-?\d+\.?\d+)/);
                if (m) {
                  fields.lat = parseFloat(m[1]);
                  fields.lng = parseFloat(m[2]);
                }
                save(fields);
              }}
              placeholder="Coller un lien Google Maps"
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-lg text-white placeholder:text-white/40 focus:outline-none focus:border-amber-500/50 transition-colors min-h-[48px]"
            />
          )}
        </div>
      </div>
    </div>
  );
}

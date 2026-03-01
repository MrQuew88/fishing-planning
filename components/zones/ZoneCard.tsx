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
  const [mapsInput, setMapsInput] = useState("");
  const [editingMaps, setEditingMaps] = useState(!zone.google_maps_url);
  const [vegetation, setVegetation] = useState(zone.vegetation || "");
  const [isSpawning, setIsSpawning] = useState(zone.is_spawning_zone === true);
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

        {/* Spawning zone toggle */}
        <div className="flex items-center gap-3">
          <label className="text-lg text-white/70 font-medium w-28 shrink-0">Zone de fraie</label>
          <button
            role="switch"
            aria-checked={isSpawning}
            onClick={() => {
              const next = !isSpawning;
              setIsSpawning(next);
              save({ is_spawning_zone: next });
            }}
            className={`relative w-11 h-6 rounded-full transition-colors duration-200 shrink-0 ${
              isSpawning ? "bg-[#22C55E]" : "bg-white/15"
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform duration-200 ${
                isSpawning ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {/* Google Maps link */}
        <div className="flex items-center gap-3">
          <label className="text-lg text-white/70 font-medium w-28 shrink-0">Google Maps</label>
          {editingMaps ? (
            <div className="flex flex-col md:flex-row gap-2 flex-1 min-w-0">
              <input
                type="text"
                value={mapsInput}
                onChange={(e) => setMapsInput(e.target.value)}
                placeholder="Coller un lien Google Maps"
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-lg text-white placeholder:text-white/40 focus:outline-none focus:border-amber-500/50 transition-colors min-h-[48px]"
              />
              <button
                onClick={() => {
                  if (!mapsInput.trim()) return;
                  const url = mapsInput.trim();
                  setMapsUrl(url);
                  setEditingMaps(false);
                  const fields: Partial<FishingZone> = { google_maps_url: url };
                  const m = url.match(/@(-?\d+\.?\d+),(-?\d+\.?\d+)/) ||
                            url.match(/[?&]q=(-?\d+\.?\d+),(-?\d+\.?\d+)/);
                  if (m) {
                    fields.lat = parseFloat(m[1]);
                    fields.lng = parseFloat(m[2]);
                  }
                  save(fields);
                  setMapsInput("");
                }}
                className="bg-amber-500/20 text-amber-500 font-semibold rounded-xl px-5 py-3 text-lg min-h-[48px] shrink-0 transition-colors hover:bg-amber-500/30"
              >
                Valider
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-lg text-[#F59E0B]/80 hover:text-[#F59E0B] transition-colors truncate"
              >
                📍 Voir sur Google Maps
              </a>
              <button
                onClick={() => {
                  setMapsInput(mapsUrl);
                  setEditingMaps(true);
                }}
                className="text-white/50 hover:text-white/80 text-base shrink-0 min-h-[48px] px-2 transition-colors"
              >
                Modifier
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

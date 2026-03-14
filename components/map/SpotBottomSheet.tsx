"use client";

import { useState } from "react";

/* ------------------------------------------------------------------ */
/*  Slug helper – derives the bathymetry image path from the spot name */
/* ------------------------------------------------------------------ */
function getBathymetryPath(spotName: string): string {
  const slug = spotName
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `/bathymetry/${slug}.png`;
}

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
interface BriefingZone {
  zone_name: string;
  day_score: number;
  tier: string;
  why_today?: string;
  google_maps_url: string | null;
  slots: Record<string, { tier: string }>;
}

interface StaticZone {
  name: string;
  post_spawn_score: number;
  depth_min: number;
  depth_max: number;
  google_maps_url: string | null;
}

type SpotBottomSheetProps =
  | { variant: "briefing"; zone: BriefingZone; onClose: () => void; tierColor: string; optimalSlots: string[] }
  | { variant: "zones"; zone: StaticZone; onClose: () => void; scoreStars: string; scoreColor: string };

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export default function SpotBottomSheet(props: SpotBottomSheetProps) {
  const { variant, zone, onClose } = props;
  const [imgError, setImgError] = useState(false);

  const spotName = variant === "briefing" ? zone.zone_name : zone.name;
  const imgSrc = getBathymetryPath(spotName);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[1100] bg-black/30"
        onClick={onClose}
      />

      {/* Sheet — mobile: bottom sheet, desktop: centered floating card */}
      <div className="fixed z-[1200] bottom-0 left-0 right-0 animate-slide-up md:bottom-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[450px] md:animate-fade-in">
        <div className="bg-[#1a1a2e]/95 backdrop-blur-xl rounded-t-2xl md:rounded-2xl border-t md:border border-white/10 px-5 pt-3 pb-6 max-h-[75vh] md:max-h-[450px] overflow-y-auto">
          {/* Drag handle (mobile only) */}
          <div className="flex justify-center mb-3 md:hidden">
            <div className="w-10 h-1 rounded-full bg-white/30" />
          </div>
          {/* Close button (desktop only) */}
          <button
            onClick={onClose}
            className="hidden md:flex absolute top-3 right-3 w-8 h-8 items-center justify-center rounded-full bg-white/10 text-white/60 hover:bg-white/20 hover:text-white transition-colors cursor-pointer"
          >
            ✕
          </button>

          {/* Header */}
          <div className="flex items-start justify-between gap-3 md:pr-10">
            <h2 className="font-bold text-white text-lg leading-tight flex-1">
              {spotName}
            </h2>

            {variant === "briefing" ? (
              <span
                className="font-bold text-xl whitespace-nowrap"
                style={{ color: props.tierColor }}
              >
                {zone.day_score}
                <span className="text-xs text-white/40 font-normal">/10</span>
              </span>
            ) : (
              <span className="text-lg whitespace-nowrap" style={{ color: props.scoreColor }}>
                {props.scoreStars}
              </span>
            )}
          </div>

          {/* Depth (zones variant) */}
          {variant === "zones" && (
            <p className="text-white/60 text-sm mt-1">
              Prof. {zone.depth_min}–{zone.depth_max}m
            </p>
          )}

          {/* Why today (briefing variant) */}
          {variant === "briefing" && zone.why_today && (
            <p className="text-white/60 text-sm mt-1 leading-snug">
              {zone.why_today}
            </p>
          )}

          {/* Optimal slots (briefing variant) */}
          {variant === "briefing" && props.optimalSlots.length > 0 && (
            <p className="text-blue-400 font-medium mt-2 text-xs">
              🕐 {props.optimalSlots.join(", ")}
            </p>
          )}

          {/* Bathymetric image */}
          {!imgError && (
            <div className="mt-4">
              <p className="text-white/40 text-xs uppercase tracking-wider mb-2">
                Bathymétrie
              </p>
              <img
                src={imgSrc}
                alt={`Bathymétrie — ${spotName}`}
                className="w-full aspect-square object-cover rounded-xl border border-white/10"
                onError={() => setImgError(true)}
              />
            </div>
          )}

          {/* Google Maps button */}
          {zone.google_maps_url && (
            <a
              href={zone.google_maps_url}
              target="_blank"
              rel="noopener noreferrer"
              className="block mt-4 bg-white/10 text-white text-center rounded-xl py-3 px-3 font-semibold text-sm border border-white/10 active:bg-white/20 transition-colors"
            >
              📍 Ouvrir dans Maps
            </a>
          )}
        </div>
      </div>
    </>
  );
}

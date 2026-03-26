"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Circle,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { SlotKey, Tier, SlotScore, TIER_CONFIG } from "@/lib/types";
import SpotBottomSheet from "@/components/map/SpotBottomSheet";

interface MapZone {
  zone_id: string;
  zone_name: string;
  feature_name: string;
  day_score: number;
  tier: Tier;
  why_today?: string;
  google_maps_url: string | null;
  lat: number;
  lng: number;
  slots: Record<SlotKey, SlotScore>;
}

interface Props {
  zones: MapZone[];
}

const TIER_COLORS: Record<Tier, string> = {
  T1: "#F59E0B", // amber
  T2: "#22C55E", // green
  T3: "#3B82F6", // blue
  T4: "#6B7280", // gray
};

const ALL_SLOTS: SlotKey[] = ["fraiche", "matinee", "apres_midi", "coup_du_soir"];
const SLOT_SHORT: Record<SlotKey, string> = {
  fraiche: "6h-9h",
  matinee: "9h-12h",
  apres_midi: "12h-16h",
  coup_du_soir: "16h-20h",
};

function UserLocation({
  onPositionChange,
}: {
  onPositionChange: (pos: [number, number]) => void;
}) {
  const map = useMap();
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [accuracy, setAccuracy] = useState(0);
  const watchRef = useRef<number | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) return;

    watchRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const latlng: [number, number] = [
          pos.coords.latitude,
          pos.coords.longitude,
        ];
        setPosition(latlng);
        setAccuracy(pos.coords.accuracy);
        onPositionChange(latlng);
      },
      (err) => console.warn("Geolocation error:", err.message),
      { enableHighAccuracy: true, maximumAge: 5000 }
    );

    return () => {
      if (watchRef.current !== null) {
        navigator.geolocation.clearWatch(watchRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);

  if (!position) return null;

  return (
    <>
      <Circle
        center={position}
        radius={accuracy}
        pathOptions={{
          color: "#3B82F6",
          fillColor: "#3B82F6",
          fillOpacity: 0.1,
          weight: 1,
        }}
      />
      <CircleMarker
        center={position}
        radius={8}
        pathOptions={{
          color: "#ffffff",
          fillColor: "#3B82F6",
          fillOpacity: 1,
          weight: 2,
        }}
      />
    </>
  );
}

export default function BriefingMap({ zones }: Props) {
  const [userPos, setUserPos] = useState<[number, number] | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<SlotKey | null>(null);
  const [selectedZone, setSelectedZone] = useState<(MapZone & { displayTier: Tier; displayScore: number }) | null>(null);
  const mapRef = useRef<L.Map | null>(null);

  const center: [number, number] =
    zones.length > 0 ? [zones[0].lat, zones[0].lng] : [54.005, -7.476];

  function handleCenterUser() {
    if (userPos && mapRef.current) {
      mapRef.current.flyTo(userPos, 16);
    }
  }

  // Filter and color zones based on selected slot
  const displayZones = zones
    .map((zone) => {
      const tier = selectedSlot ? zone.slots[selectedSlot].tier : zone.tier;
      const score = selectedSlot ? zone.slots[selectedSlot].score : zone.day_score;
      return { ...zone, displayTier: tier, displayScore: score };
    })
    .filter((zone) => {
      // When slot filter active, hide T4
      if (selectedSlot && zone.displayTier === "T4") return false;
      return true;
    });

  return (
    <div
      className="fixed left-0 right-0 bottom-0 cursor-crosshair"
      style={{ top: "52px" }}
    >
      <MapContainer
        center={center}
        zoom={15}
        zoomControl={false}
        attributionControl={false}
        className="w-full h-full"
        ref={mapRef}
      >
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          maxZoom={19}
        />

        <ZoomControls />

        {displayZones.map((zone) => {
          const color = TIER_COLORS[zone.displayTier];
          return (
            <CircleMarker
              key={zone.zone_id}
              center={[zone.lat, zone.lng]}
              radius={10}
              pathOptions={{
                color: "#ffffff",
                fillColor: color,
                fillOpacity: 0.9,
                weight: 2,
              }}
              eventHandlers={{
                click: () => setSelectedZone(zone),
              }}
            />
          );
        })}

        <UserLocation onPositionChange={setUserPos} />
      </MapContainer>

      {/* Back button overlay */}
      <Link
        href="/"
        className="absolute top-4 left-4 z-[1000] flex items-center gap-2 bg-black/50 backdrop-blur-xl rounded-xl px-4 min-h-[48px] text-white font-semibold text-base transition-colors hover:bg-black/70"
      >
        ← Briefing
      </Link>

      {/* Slot filter pills — bottom overlay */}
      <div className="absolute bottom-6 left-4 right-4 z-[1000]">
        <div className="flex gap-1.5 bg-black/40 backdrop-blur-xl rounded-2xl p-2 border border-white/10">
          <button
            onClick={() => setSelectedSlot(null)}
            className={`flex-1 rounded-xl py-2 text-sm font-semibold transition-colors cursor-pointer ${
              selectedSlot === null
                ? "bg-white/20 text-white"
                : "text-white/60 hover:bg-white/10"
            }`}
          >
            Tous
          </button>
          {ALL_SLOTS.map((slot) => (
            <button
              key={slot}
              onClick={() => setSelectedSlot(selectedSlot === slot ? null : slot)}
              className={`flex-1 rounded-xl py-2 text-sm font-semibold transition-colors cursor-pointer ${
                selectedSlot === slot
                  ? "bg-white/20 text-white"
                  : "text-white/60 hover:bg-white/10"
              }`}
            >
              {SLOT_SHORT[slot]}
            </button>
          ))}
        </div>
      </div>

      {/* Center on user button */}
      {userPos && (
        <button
          onClick={handleCenterUser}
          className="absolute bottom-6 right-4 z-[1000] bg-white/90 text-black rounded-full w-12 h-12 shadow-lg flex items-center justify-center cursor-pointer hover:bg-white transition-colors"
          aria-label="Centrer sur ma position"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <circle cx="12" cy="12" r="3" />
            <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
          </svg>
        </button>
      )}

      {/* Spot bottom sheet */}
      {selectedZone && (
        <SpotBottomSheet
          variant="briefing"
          zone={selectedZone}
          tierColor={TIER_COLORS[selectedZone.displayTier]}
          optimalSlots={ALL_SLOTS.filter(
            (s) => selectedZone.slots[s].tier === "T1" || selectedZone.slots[s].tier === "T2"
          ).map((s) => SLOT_SHORT[s])}
          onClose={() => setSelectedZone(null)}
        />
      )}
    </div>
  );
}

function ZoomControls() {
  const map = useMap();

  useEffect(() => {
    const control = L.control.zoom({ position: "topright" });
    control.addTo(map);
    return () => {
      control.remove();
    };
  }, [map]);

  return null;
}

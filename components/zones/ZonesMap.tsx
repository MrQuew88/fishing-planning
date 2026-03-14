"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import SpotBottomSheet from "@/components/map/SpotBottomSheet";

interface MapZone {
  id: string;
  name: string;
  post_spawn_score: number;
  depth_min: number;
  depth_max: number;
  google_maps_url: string | null;
  lat: number;
  lng: number;
}

interface Props {
  zones: MapZone[];
}

const SCORE_COLORS: Record<number, string> = {
  5: "#F59E0B",
  4: "#22C55E",
  3: "#3B82F6",
  2: "#6B7280",
};

const SCORE_STARS = (score: number) =>
  "★".repeat(score) + "☆".repeat(5 - score);

function getScoreColor(score: number): string {
  return SCORE_COLORS[score] || "#6B7280";
}

export default function ZonesMap({ zones }: Props) {
  const [selectedZone, setSelectedZone] = useState<MapZone | null>(null);

  return (
    <div
      className="fixed left-0 right-0 bottom-0 cursor-crosshair"
      style={{ top: "52px" }}
    >
      <MapContainer
        center={[54.005, -7.476]}
        zoom={14}
        zoomControl={false}
        attributionControl={false}
        className="w-full h-full"
      >
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          maxZoom={19}
        />

        <ZoomControls />

        {zones.map((zone) => (
          <CircleMarker
            key={zone.id}
            center={[zone.lat, zone.lng]}
            radius={7}
            pathOptions={{
              color: "#ffffff",
              fillColor: getScoreColor(zone.post_spawn_score),
              fillOpacity: 0.9,
              weight: 2,
            }}
            eventHandlers={{
              click: () => setSelectedZone(zone),
            }}
          />
        ))}
      </MapContainer>

      {/* Back button overlay */}
      <Link
        href="/zones"
        className="absolute top-4 left-4 z-[1000] flex items-center gap-2 bg-black/50 backdrop-blur-xl rounded-xl px-4 min-h-[48px] text-white font-semibold text-base transition-colors hover:bg-black/70"
      >
        ← Zones
      </Link>

      {/* Spot bottom sheet */}
      {selectedZone && (
        <SpotBottomSheet
          variant="zones"
          zone={selectedZone}
          scoreStars={SCORE_STARS(selectedZone.post_spawn_score)}
          scoreColor={getScoreColor(selectedZone.post_spawn_score)}
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

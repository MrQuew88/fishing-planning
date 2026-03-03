"use client";

import { useEffect } from "react";
import Link from "next/link";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

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
  return (
    <div
      className="fixed left-0 right-0 bottom-0"
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
          >
            <Popup>
              <div className="text-sm min-w-[200px]">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-bold text-base">{zone.name}</p>
                  <span className="text-amber-500 text-sm whitespace-nowrap">
                    {SCORE_STARS(zone.post_spawn_score)}
                  </span>
                </div>
                <p className="text-gray-600 mt-1">
                  Prof. {zone.depth_min}–{zone.depth_max}m
                </p>
                {zone.google_maps_url && (
                  <a
                    href={zone.google_maps_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block mt-2 bg-blue-600 text-white text-center rounded-lg py-2 px-3 font-medium text-sm"
                  >
                    📍 Ouvrir dans Maps
                  </a>
                )}
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>

      {/* Back button overlay */}
      <Link
        href="/zones"
        className="absolute top-4 left-4 z-[1000] flex items-center gap-2 bg-black/50 backdrop-blur-xl rounded-xl px-4 min-h-[48px] text-white font-semibold text-base transition-colors hover:bg-black/70"
      >
        ← Zones
      </Link>
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

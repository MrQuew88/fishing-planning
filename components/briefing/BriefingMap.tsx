"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Circle,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface MapZone {
  zone_id: string;
  zone_name: string;
  post_spawn_score: number;
  why_today: string;
  google_maps_url: string | null;
  lat: number;
  lng: number;
  periods: string[];
}

interface Props {
  zones: MapZone[];
}

const SCORE_COLORS: Record<number, string> = {
  5: "#F59E0B",
  4: "#22C55E",
  3: "#3B82F6",
};

const SCORE_STARS = (score: number) =>
  "★".repeat(score) + "☆".repeat(5 - score);

function getScoreColor(score: number): string {
  return SCORE_COLORS[score] || "#6B7280";
}

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
  const mapRef = useRef<L.Map | null>(null);

  const center: [number, number] =
    zones.length > 0 ? [zones[0].lat, zones[0].lng] : [54.005, -7.476];

  function handleCenterUser() {
    if (userPos && mapRef.current) {
      mapRef.current.flyTo(userPos, 16);
    }
  }

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

        {zones.map((zone) => (
          <CircleMarker
            key={zone.zone_id}
            center={[zone.lat, zone.lng]}
            radius={10}
            pathOptions={{
              color: "#ffffff",
              fillColor: getScoreColor(zone.post_spawn_score),
              fillOpacity: 0.9,
              weight: 2,
            }}
          >
            <Popup>
              <div className="text-sm min-w-[220px]">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-bold text-base">{zone.zone_name}</p>
                  <span className="text-amber-500 text-sm whitespace-nowrap">
                    {SCORE_STARS(zone.post_spawn_score)}
                  </span>
                </div>
                <p className="text-gray-600 mt-1 leading-snug">
                  {zone.why_today}
                </p>
                {zone.periods.length > 0 && (
                  <p className="text-blue-700 font-medium mt-2 text-xs">
                    🕐 {zone.periods.join(", ")}
                  </p>
                )}
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

        <UserLocation onPositionChange={setUserPos} />
      </MapContainer>

      {/* Back button overlay */}
      <Link
        href="/"
        className="absolute top-4 left-4 z-[1000] flex items-center gap-2 bg-black/50 backdrop-blur-xl rounded-xl px-4 min-h-[48px] text-white font-semibold text-base transition-colors hover:bg-black/70"
      >
        ← Briefing
      </Link>

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

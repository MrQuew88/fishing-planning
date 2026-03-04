export interface DailyWeather {
  id: string;
  date: string;
  tmin_air: number | null;
  tmax_air: number | null;
  vent_kmh: number | null;
  rafales_kmh: number | null;
  direction_vent: string | null;
  pression_hpa: number | null;
  pluie_mm: number | null;
  temp_eau_c: number | null;
  niveau_eau_delta: number | null;
  temp_moyenne_c: number | null;
  degres_jour_cumules: number | null;
  created_at: string;
}

export interface HourlyForecast {
  id: string;
  datetime: string;
  temperature_c: number | null;
  vent_vitesse_kmh: number | null;
  vent_direction: string | null;
  vent_rafales_kmh: number | null;
  pression_hpa: number | null;
  pluie_probabilite: number | null;
  pluie_intensite_mm: number | null;
  couverture_nuageuse_pct: number | null;
  created_at: string;
}

export interface Solunar {
  id: string;
  date: string;
  lever_soleil: string | null;
  coucher_soleil: string | null;
  major_1_start: string | null;
  major_1_end: string | null;
  major_2_start: string | null;
  major_2_end: string | null;
  minor_1_start: string | null;
  minor_1_end: string | null;
  minor_2_start: string | null;
  minor_2_end: string | null;
  moon_phase: string | null;
  moon_illumination: number | null;
  created_at: string;
}

export interface Lure {
  id: string;
  user_id: string;
  name: string;
  type: string;
  weight_g: number | null;
  size_cm: number | null;
  diving_depth_m: number | null;
  color: string | null;
  notes: string | null;
  created_at: string;
}

export interface TacticalBriefing {
  id: string;
  date: string;
  content: string;
  conditions_snapshot: Record<string, unknown> | null;
  created_at: string;
}

export type SlotKey = "fraiche" | "matinee" | "apres_midi" | "coup_du_soir";
export type Tier = "T1" | "T2" | "T3" | "T4";

export const SLOT_LABELS: Record<SlotKey, string> = {
  fraiche: "Fraîche (6h-9h)",
  matinee: "Matinée (9h-12h)",
  apres_midi: "Après-midi (12h-16h)",
  coup_du_soir: "Coup du soir (16h-20h)",
};

export const TIER_CONFIG: Record<Tier, { label: string; emoji: string; color: string }> = {
  T1: { label: "Top picks", emoji: "🔥", color: "amber" },
  T2: { label: "Très bon", emoji: "⭐", color: "green" },
  T3: { label: "Correct", emoji: "👍", color: "blue" },
  T4: { label: "Éviter", emoji: "💤", color: "neutral" },
};

export interface SlotScore {
  wind_dir: string;
  wind_speed_kmh: number;
  cloud_cover_pct: number;
  pressure_hpa: number;
  score: number;
  tier: Tier;
}

export interface BriefingZone {
  zone_id: string;
  zone_name: string;
  post_spawn_score: number;
  day_score: number;
  tier: Tier;
  target_depths: string;
  why_today?: string;
  google_maps_url: string | null;
  slots: Record<SlotKey, SlotScore>;
}

export interface BriefingPeriod {
  label: string;
  conditions: string;
}

export interface BriefingContent {
  date: string;
  weather_summary: string;
  general_conditions: string;
  zones: BriefingZone[];
  periods: BriefingPeriod[];
  solunar: {
    major: string[];
    minor: string[];
  };
}

export interface FishingZone {
  id: string;
  zone_name: string;
  name: string;
  lat: number;
  lng: number;
  radius_m: number;
  depth_min: number;
  depth_max: number;
  type: string;
  profile: string;
  orientation: string | null;
  wind_sheltered: string[];
  wind_exposed: string[];
  post_spawn_score: number;
  vegetation: string | null;
  is_spawning_zone: boolean | null;
  spawning_notes: string | null;
  notes: string | null;
  google_maps_url: string | null;
  created_at: string;
  updated_at: string;
}

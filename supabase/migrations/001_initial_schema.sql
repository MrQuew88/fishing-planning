-- Killykeen Dashboard - Initial Schema
-- Spot: Killykeen Forest Park, Killashandra, Co. Cavan, Ireland (54.01, -7.32)

create table if not exists daily_weather (
  id uuid primary key default gen_random_uuid(),
  date date unique not null,
  tmin_air float,
  tmax_air float,
  vent_kmh float,
  rafales_kmh float,
  direction_vent text,
  pression_hpa float,
  pluie_mm float,
  temp_eau_c float,
  niveau_eau_delta float, -- delta par rapport à base 46m
  temp_moyenne_c float,
  degres_jour_cumules float,
  created_at timestamptz default now()
);

create table if not exists hourly_forecast (
  id uuid primary key default gen_random_uuid(),
  datetime timestamptz unique not null,
  temperature_c float,
  vent_vitesse_kmh float,
  vent_direction text,
  vent_rafales_kmh float,
  pression_hpa float,
  pluie_probabilite float,
  pluie_intensite_mm float,
  couverture_nuageuse_pct float,
  created_at timestamptz default now()
);

create table if not exists solunar (
  id uuid primary key default gen_random_uuid(),
  date date unique not null,
  lever_soleil time,
  coucher_soleil time,
  major_1_start time,
  major_1_end time,
  major_2_start time,
  major_2_end time,
  minor_1_start time,
  minor_1_end time,
  minor_2_start time,
  minor_2_end time,
  moon_phase text,
  moon_illumination float,
  created_at timestamptz default now()
);

create table if not exists lures (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  name text not null,
  type text not null,
  weight_g float,
  size_cm float,
  diving_depth_m float,
  color text,
  notes text,
  created_at timestamptz default now()
);

create table if not exists tactical_briefings (
  id uuid primary key default gen_random_uuid(),
  date date unique not null,
  content text not null,
  conditions_snapshot jsonb,
  created_at timestamptz default now()
);

-- Index pour les requêtes fréquentes
create index if not exists idx_daily_weather_date on daily_weather(date desc);
create index if not exists idx_hourly_forecast_datetime on hourly_forecast(datetime desc);
create index if not exists idx_solunar_date on solunar(date desc);
create index if not exists idx_lures_user on lures(user_id);
create index if not exists idx_briefings_date on tactical_briefings(date desc);

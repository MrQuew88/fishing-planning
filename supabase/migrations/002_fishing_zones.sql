-- Fishing zones bathymetric features
create table if not exists fishing_zones (
  id uuid primary key default gen_random_uuid(),
  zone_name text not null,
  name text not null unique,
  lat float8 not null,
  lng float8 not null,
  radius_m integer not null,
  depth_min float4 not null,
  depth_max float4 not null,
  type text not null check (type in ('drop_off', 'deep_hole', 'irregular_shelf', 'narrows', 'point_drop_off', 'arm_bay', 'plateau')),
  profile text not null,
  orientation text,
  wind_sheltered text[] default '{}',
  wind_exposed text[] default '{}',
  post_spawn_score integer not null check (post_spawn_score between 1 and 5),
  vegetation text,
  is_spawning_zone boolean,
  spawning_notes text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_fishing_zones_zone on fishing_zones (zone_name);
create index idx_fishing_zones_score on fishing_zones (post_spawn_score desc);

create extension if not exists pgcrypto;

create table if not exists public.map_regions (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('country', 'province')),
  name text not null,
  code text not null,
  parent_country text,
  visited boolean not null default false,
  note text,
  photos text[] not null default '{}' check (cardinality(photos) <= 3),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (type, code)
);

create table if not exists public.map_cities (
  id uuid primary key default gen_random_uuid(),
  city_code text not null unique,
  city_name text not null,
  country_code text not null,
  country_name text not null,
  province_code text,
  province_name text,
  latitude double precision not null check (latitude between -90 and 90),
  longitude double precision not null check (longitude between -180 and 180),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (country_code <> 'CHN' or province_code is not null)
);

create index if not exists map_cities_country_idx on public.map_cities (country_code);
create index if not exists map_cities_province_idx on public.map_cities (province_code);

create table if not exists public.map_pins (
  id uuid primary key default gen_random_uuid(),
  latitude double precision not null check (latitude between -90 and 90),
  longitude double precision not null check (longitude between -180 and 180),
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.map_regions enable row level security;
alter table public.map_cities enable row level security;
alter table public.map_pins enable row level security;

revoke all on public.map_regions, public.map_cities, public.map_pins from anon;
grant select on public.map_regions, public.map_cities, public.map_pins to anon;
grant select, insert, update, delete on public.map_regions, public.map_cities, public.map_pins to authenticated;

drop policy if exists "public map region reads" on public.map_regions;
drop policy if exists "public map city reads" on public.map_cities;
drop policy if exists "public map pin reads" on public.map_pins;
create policy "public map region reads" on public.map_regions for select using (true);
create policy "public map city reads" on public.map_cities for select using (true);
create policy "public map pin reads" on public.map_pins for select using (true);

create or replace function public.is_map_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce(
    auth.jwt() -> 'app_metadata' ->> 'provider' = 'google'
    and lower(auth.jwt() ->> 'email') in ('akach66666@gmail.com', 'yucai2027@gmail.com'),
    false
  );
$$;
revoke execute on function public.is_map_admin() from public;
grant execute on function public.is_map_admin() to anon, authenticated;

drop policy if exists "admin map region writes" on public.map_regions;
drop policy if exists "admin map city writes" on public.map_cities;
drop policy if exists "admin map pin writes" on public.map_pins;
create policy "admin map region writes" on public.map_regions for all to authenticated using (public.is_map_admin()) with check (public.is_map_admin());
create policy "admin map city writes" on public.map_cities for all to authenticated using (public.is_map_admin()) with check (public.is_map_admin());
create policy "admin map pin writes" on public.map_pins for all to authenticated using (public.is_map_admin()) with check (public.is_map_admin());

create or replace function public.protect_china_country()
returns trigger language plpgsql as $$
begin
  if old.type = 'country' and old.code = 'CHN' and (tg_op = 'DELETE' or new.visited = false) then
    raise exception 'China cannot be removed from Places';
  end if;
  return coalesce(new, old);
end;
$$;
drop trigger if exists map_regions_protect_china on public.map_regions;
create trigger map_regions_protect_china before update or delete on public.map_regions
for each row execute function public.protect_china_country();

create or replace function public.sync_china_province_visited()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  old_province text := case when tg_op <> 'INSERT' and old.country_code = 'CHN' then old.province_code end;
  new_province text := case when tg_op <> 'DELETE' and new.country_code = 'CHN' then new.province_code end;
begin
  if new_province is not null then
    insert into public.map_regions (type, name, code, parent_country, visited)
    values ('province', new.province_name, new_province, 'China', true)
    on conflict (type, code) do update set visited = true, updated_at = now();
  end if;
  if old_province is not null and old_province is distinct from new_province then
    update public.map_regions set
      visited = exists (select 1 from public.map_cities where country_code = 'CHN' and province_code = old_province),
      updated_at = now()
    where type = 'province' and code = old_province;
  end if;
  return coalesce(new, old);
end;
$$;

drop trigger if exists map_cities_sync_province on public.map_cities;
create trigger map_cities_sync_province
after insert or update or delete on public.map_cities
for each row execute function public.sync_china_province_visited();

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('map-photos', 'map-photos', true, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'image/avif'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "public map photo reads" on storage.objects;
create policy "public map photo reads" on storage.objects
for select using (bucket_id = 'map-photos');

drop policy if exists "admin map photo inserts" on storage.objects;
drop policy if exists "admin map photo updates" on storage.objects;
drop policy if exists "admin map photo deletes" on storage.objects;
create policy "admin map photo inserts" on storage.objects for insert to authenticated
with check (bucket_id = 'map-photos' and public.is_map_admin());
create policy "admin map photo updates" on storage.objects for update to authenticated
using (bucket_id = 'map-photos' and public.is_map_admin()) with check (bucket_id = 'map-photos' and public.is_map_admin());
create policy "admin map photo deletes" on storage.objects for delete to authenticated
using (bucket_id = 'map-photos' and public.is_map_admin());

-- Photo replacement should update the Region row first, then remove the unreferenced old object.

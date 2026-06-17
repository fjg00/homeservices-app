-- Home Services — Supabase schema
-- Paste this whole file into the Supabase SQL Editor and run it once.
-- Safe to re-run: it drops and recreates the tables.

-- ── Reset ──────────────────────────────────────────────────────────────
drop table if exists reviews cascade;
drop table if exists time_off cascade;
drop table if exists bookings cascade;
drop table if exists providers cascade;
drop table if exists customers cascade;
drop table if exists services cascade;
drop sequence if exists booking_ref_seq;

create sequence booking_ref_seq start 1042;

-- ── Services catalog ───────────────────────────────────────────────────
create table services (
  id text primary key,
  name_en text not null,
  name_ar text,
  icon text,
  active boolean not null default true,
  sort int not null default 0
);

-- ── Providers ──────────────────────────────────────────────────────────
create table providers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  skills text[] not null default '{}',
  zone text,
  load int not null default 0,
  active boolean not null default true,
  workdays int[] not null default '{}',   -- 0=Sun .. 6=Sat
  slots text[] not null default '{}',
  notes text,
  created_at timestamptz not null default now()
);

-- ── Customers ──────────────────────────────────────────────────────────
create table customers (
  id uuid primary key default gen_random_uuid(),
  phone text unique not null,
  name text,
  language text default 'en',
  default_address text,
  default_pin text,
  created_at timestamptz not null default now()
);

-- ── Bookings ───────────────────────────────────────────────────────────
create table bookings (
  id uuid primary key default gen_random_uuid(),
  ref text not null default ('HS-' || nextval('booking_ref_seq')),
  customer_phone text not null,
  customer_name text,
  service_id text references services(id),
  service_name text,
  description text,
  photo_url text,
  landmark text,
  pin text,
  area text,
  time_pref text,
  status text not null default 'requested',  -- requested | accepted | on_way | done | cancelled
  amount numeric,
  currency text,
  provider_id uuid references providers(id),
  rating int,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index on bookings (status);
create index on bookings (customer_phone);

-- ── Time off (provider day-off / company holidays) ─────────────────────
create table time_off (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references providers(id) on delete cascade,
  date date not null,
  reason text,
  created_at timestamptz not null default now()
);

-- ── Keep updated_at fresh on bookings ──────────────────────────────────
create or replace function touch_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger bookings_touch
before update on bookings
for each row execute function touch_updated_at();

-- ── Row Level Security ─────────────────────────────────────────────────
-- PROTOTYPE policies: the public (anon) key may read/write. This is fine
-- for testing but NOT production-secure — we tighten this with real auth
-- before a public launch.
alter table services  enable row level security;
alter table providers enable row level security;
alter table customers enable row level security;
alter table bookings  enable row level security;
alter table time_off  enable row level security;

create policy "anon read services"  on services  for select using (true);

create policy "anon rw providers"   on providers for all using (true) with check (true);
create policy "anon rw customers"   on customers for all using (true) with check (true);
create policy "anon rw bookings"    on bookings  for all using (true) with check (true);
create policy "anon rw time_off"    on time_off  for all using (true) with check (true);

-- ── Realtime ───────────────────────────────────────────────────────────
-- Lets the apps receive live booking changes (new requests, quotes, status).
alter publication supabase_realtime add table bookings;

-- ── Seed: services ─────────────────────────────────────────────────────
insert into services (id, name_en, icon, sort) values
  ('plumber','Plumber','🔧',1),
  ('electrician','Electrician','⚡',2),
  ('ac','AC','❄️',3),
  ('generator','Generator / Solar','🔋',4),
  ('appliance','Appliance Repair','🧺',5),
  ('painter','Painter','🎨',6),
  ('carpenter','Carpenter','🪚',7),
  ('cleaning','Cleaning','🧹',8),
  ('pest','Pest Control','🐜',9),
  ('locksmith','Locksmith','🔑',10),
  ('satellite','Satellite / TV','📡',11),
  ('internet','Internet & Network','📶',12),
  ('mechanic','Car Mechanic','🚗',13),
  ('carwash','Car Wash','🚿',14),
  ('handyman','Handyman','🛠️',15);

-- ── Seed: providers ────────────────────────────────────────────────────
insert into providers (name, phone, skills, zone, load, active, workdays, slots) values
  ('Ahmad H.','+961 70 100 201','{ac,electrician}','Achrafieh',0,true,'{1,2,3,4,5,6}','{"8–11 AM","11 AM–2 PM","2–5 PM","5–8 PM"}'),
  ('Sami K.','+961 71 100 202','{ac,plumber}','Metn',1,true,'{1,2,3,4,5}','{"8–11 AM","11 AM–2 PM"}'),
  ('Rabih M.','+961 76 100 203','{electrician,generator}','Jdeideh',0,true,'{0,1,2,3,4,5,6}','{"8–11 AM","11 AM–2 PM","2–5 PM","5–8 PM"}'),
  ('Georges A.','+961 70 100 204','{painter,carpenter}','Baabda',2,true,'{1,3,5,6}','{"2–5 PM","5–8 PM"}'),
  ('Walid T.','+961 71 100 205','{plumber,handyman}','Hamra',0,true,'{1,2,3,4,5,6}','{"8–11 AM","11 AM–2 PM","2–5 PM","5–8 PM"}'),
  ('Hassan B.','+961 76 100 206','{ac,appliance}','Metn',0,true,'{2,3,4,5,6}','{"2–5 PM","5–8 PM"}'),
  ('Joseph K.','+961 70 100 207','{cleaning}','Achrafieh',0,false,'{1,2,3,4,5}','{"8–11 AM","11 AM–2 PM"}');

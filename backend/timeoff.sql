-- Baytna — day-off exceptions for providers (and company-wide holidays).
-- Run once in the Supabase SQL Editor. Keeps existing data.

create table if not exists time_off (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid references providers(id) on delete cascade,  -- null = holiday for everyone
  date date not null,
  reason text,
  created_at timestamptz not null default now()
);

alter table time_off enable row level security;
create policy "anon rw time_off" on time_off for all using (true) with check (true);

-- Allow the admin to edit providers (insert / update / delete).
drop policy if exists "anon read providers" on providers;
create policy "anon rw providers" on providers for all using (true) with check (true);

-- Baytna — per-provider day-off exceptions.
-- Run once in the Supabase SQL Editor. Keeps existing data.

create table if not exists time_off (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references providers(id) on delete cascade,
  date date not null,
  reason text,
  created_at timestamptz not null default now()
);

-- If an earlier version allowed company-wide holidays (null provider), clean up.
delete from time_off where provider_id is null;
alter table time_off alter column provider_id set not null;

alter table time_off enable row level security;
drop policy if exists "anon rw time_off" on time_off;
create policy "anon rw time_off" on time_off for all using (true) with check (true);

-- Allow the admin to edit providers (insert / update / delete).
drop policy if exists "anon read providers" on providers;
drop policy if exists "anon rw providers" on providers;
create policy "anon rw providers" on providers for all using (true) with check (true);

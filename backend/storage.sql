-- Baytna — photo storage for booking requests.
-- Run once in the Supabase SQL Editor. Keeps existing data.

-- Store the uploaded photo URL on the booking.
alter table bookings add column if not exists photo_url text;

-- Public bucket for booking photos.
insert into storage.buckets (id, name, public)
values ('booking-photos', 'booking-photos', true)
on conflict (id) do nothing;

-- Prototype policies: anyone can upload to this bucket, and read is public.
drop policy if exists "upload booking photos" on storage.objects;
create policy "upload booking photos" on storage.objects
  for insert with check (bucket_id = 'booking-photos');

drop policy if exists "read booking photos" on storage.objects;
create policy "read booking photos" on storage.objects
  for select using (bucket_id = 'booking-photos');

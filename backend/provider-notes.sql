-- Baytna — free-text notes on providers (searchable in the admin).
-- Run once in the Supabase SQL Editor. Keeps existing data.

alter table providers add column if not exists notes text;

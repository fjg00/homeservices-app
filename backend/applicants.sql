-- Baytna — provider applications from the website "Work with us" form.
-- Run this once in the Supabase SQL Editor (it does NOT touch existing tables).

create table if not exists applicants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  trade text,
  areas text,
  note text,
  status text not null default 'new',   -- new | approved | rejected
  created_at timestamptz not null default now()
);

alter table applicants enable row level security;

-- Anyone can submit an application (public form); reads allowed for the admin.
create policy "anon insert applicants" on applicants for insert with check (true);
create policy "anon read applicants"   on applicants for select using (true);
create policy "anon update applicants" on applicants for update using (true) with check (true);

-- Live updates so new applications appear in the admin instantly.
alter publication supabase_realtime add table applicants;

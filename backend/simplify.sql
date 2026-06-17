-- Baytna — simplify the bookings table to match the new flow.
-- Run once in the Supabase SQL Editor. Keeps your existing data.

alter table bookings drop column if exists photo_url;
alter table bookings drop column if exists day_label;
alter table bookings drop column if exists time_window;
alter table bookings drop column if exists quote_note;

alter table bookings rename column quote_amount to amount;
alter table bookings rename column quote_currency to currency;

drop table if exists reviews cascade;

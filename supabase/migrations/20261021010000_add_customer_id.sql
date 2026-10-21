-- Multiple customers (couples) share this database. Every RSVP belongs to one customer.
--
-- Run after 20261021000000_create_rsvps.sql (SQL Editor -> paste -> Run, or `supabase db push`).
-- Safe to run on a database where the first migration already holds RSVPs: existing rows are
-- assigned to 'harshwedsrimi'.
--
-- To add a new couple later:
--   insert into public.customers (id, name) values ('newcouple', 'New Couple');
-- and set `customerId` in that site's src/config/site.ts.

-- 1. Customers -----------------------------------------------------------------------------

create table if not exists public.customers (
  id          text primary key check (id ~ '^[a-z0-9][a-z0-9_-]{1,62}$'),
  name        text not null,
  created_at  timestamptz not null default now()
);

-- Not readable or writable from any website. Manage customers in the dashboard.
alter table public.customers enable row level security;
revoke all on public.customers from anon, authenticated;

insert into public.customers (id, name)
values ('harshwedsrimi', 'Harsh & Rimi')
on conflict (id) do nothing;

-- 2. customer_id on every RSVP -------------------------------------------------------------

alter table public.rsvps add column if not exists customer_id text;

-- RSVPs saved before this migration belong to Harsh & Rimi.
update public.rsvps set customer_id = 'harshwedsrimi' where customer_id is null;

alter table public.rsvps alter column customer_id set not null;

-- Only known customers: a typo or made-up id is rejected.
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'rsvps_customer_id_fkey') then
    alter table public.rsvps
      add constraint rsvps_customer_id_fkey
      foreign key (customer_id) references public.customers (id)
      on update cascade on delete restrict;
  end if;
end $$;

-- 3. One RSVP per guest, per customer ------------------------------------------------------
-- The same person may RSVP to two different couples' weddings, but only once to each.

drop index if exists public.rsvps_email_unique;
drop index if exists public.rsvps_phone_unique;

create unique index if not exists rsvps_customer_email_unique
  on public.rsvps (customer_id, email_normalized) where email_normalized is not null;
create unique index if not exists rsvps_customer_phone_unique
  on public.rsvps (customer_id, phone_normalized) where phone_normalized is not null;

-- Fast "all RSVPs for this couple, newest first" in the dashboard / exports.
create index if not exists rsvps_customer_created_idx on public.rsvps (customer_id, created_at desc);

comment on column public.rsvps.customer_id is 'Which couple (customers.id) this RSVP belongs to, e.g. harshwedsrimi.';

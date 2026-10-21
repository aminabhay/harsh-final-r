-- RSVPs for Harsh & Rimi's wedding site.
--
-- Run this once in the Supabase dashboard (SQL Editor -> New query -> paste -> Run),
-- or with the Supabase CLI: `supabase db push`.
--
-- Security model
--   * The website uses the public anon (publishable) key. With Row Level Security on, that key
--     can only INSERT rows. There is no SELECT/UPDATE/DELETE policy, so nobody can read, edit or
--     delete RSVPs from the browser. Guests' contact details stay private.
--   * You read the RSVPs in the Supabase dashboard (Table Editor) or with the service_role key
--     on a server. Never put the service_role key in the website.
--
-- One RSVP per guest
--   * The same email (case-insensitive) or the same phone number (last 10 digits, ignoring
--     spaces, dashes and the country code) cannot RSVP twice. The database enforces this with
--     unique indexes, so it holds even if someone bypasses the website.

create table if not exists public.rsvps (
  id                uuid primary key default gen_random_uuid(),
  created_at        timestamptz not null default now(),

  -- Unique per form fill: protects against accidental double submits (network retries).
  submission_id     uuid not null unique,

  -- Which invite link the guest used: '' (default) -> 'reception', ?invite=... -> 'wedding' / 'all'.
  audience          text not null check (audience in ('reception', 'wedding', 'all')),

  full_name         text not null check (char_length(btrim(full_name)) between 2 and 120),
  contact_type      text not null check (contact_type in ('email', 'phone')),
  email             text check (email is null or char_length(email) <= 254),
  phone             text check (phone is null or char_length(phone) <= 32),

  attending         boolean not null,
  events            text[] not null default '{}'
                      check (events <@ array['sangeet', 'haldi', 'wedding', 'reception']::text[]),
  -- Total people in the party including the guest; 0 when not attending.
  party_size        smallint not null default 0 check (party_size between 0 and 10),

  dietary           text check (dietary is null or char_length(dietary) <= 500),
  message           text check (message is null or char_length(message) <= 2000),
  song_request      text check (song_request is null or char_length(song_request) <= 200),

  -- Normalised copies used for the one-RSVP-per-guest rule.
  email_normalized  text generated always as (nullif(lower(btrim(email)), '')) stored,
  phone_normalized  text generated always as (nullif(right(regexp_replace(coalesce(phone, ''), '\D', '', 'g'), 10), '')) stored,

  -- Exactly the contact method the guest chose must be present.
  constraint rsvps_contact_present check (
    (contact_type = 'email' and email is not null and phone is null) or
    (contact_type = 'phone' and phone is not null and email is null)
  ),
  -- Attending guests choose at least one celebration and bring at least themselves.
  constraint rsvps_attending_consistent check (
    (attending and cardinality(events) > 0 and party_size >= 1) or
    (not attending and cardinality(events) = 0 and party_size = 0)
  )
);

-- One RSVP per email / per phone number. The website shows "already RSVP'd" when these fire.
create unique index if not exists rsvps_email_unique on public.rsvps (email_normalized) where email_normalized is not null;
create unique index if not exists rsvps_phone_unique on public.rsvps (phone_normalized) where phone_normalized is not null;

alter table public.rsvps enable row level security;

-- The website (anon / publishable key) may only add RSVPs. No read, update or delete policies.
drop policy if exists "Guests can submit an RSVP" on public.rsvps;
create policy "Guests can submit an RSVP"
  on public.rsvps
  for insert
  to anon, authenticated
  with check (true);

-- Belt and braces: the browser roles get INSERT only on this table.
revoke all on public.rsvps from anon, authenticated;
grant insert on public.rsvps to anon, authenticated;

comment on table public.rsvps is 'Wedding RSVPs. Insert-only from the website; read in the dashboard.';

/**
 * RSVP integration settings.
 *
 * Primary: Supabase. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in `.env`
 * (see .env.example) and run supabase/migrations/*.sql once. RSVPs are then saved to the
 * `rsvps` table, one per email / phone number.
 *
 * Fallback: if Supabase isn't configured, `endpoint` (a service accepting a JSON POST, e.g.
 * Formspree) is used. If neither is set, nothing is sent and the guest sees a "wasn't sent" error.
 *
 * Payload shape: see `RsvpPayload` in src/lib/rsvp.ts.
 */

export const rsvpConfig = {
  endpoint: '',
  /** Extra headers for `endpoint`, e.g. { Accept: 'application/json' } for Formspree. Never put secrets here. */
  headers: { Accept: 'application/json' } as Record<string, string>,
  /** Upper bound for the party size field (the database allows up to 10). */
  maxPartySize: 10,
  timeoutMs: 15000,
};

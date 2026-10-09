/**
 * RSVP integration settings.
 *
 * Set `endpoint` to a service that accepts a JSON POST (e.g. Formspree, Getform, a Google Apps
 * Script web app or your own API). It must return a 2xx on success.
 * While `endpoint` is empty, submissions are NOT sent and the guest sees a "wasn't sent" error.
 *
 * Payload shape: see `RsvpPayload` in src/lib/rsvp.ts.
 */

export const rsvpConfig = {
  endpoint: '',
  /** Extra headers, e.g. { Accept: 'application/json' } for Formspree. Never put secrets here. */
  headers: { Accept: 'application/json' } as Record<string, string>,
  /** Upper bound for the party size field. */
  maxPartySize: 10,
  timeoutMs: 15000,
};

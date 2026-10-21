import { rsvpConfig } from '../config/rsvp';
import { getSupabase, isSupabaseConfigured } from './supabase';
import type { EventId } from '../config/events';

export interface RsvpPayload {
  /** Which customer (couple) the RSVP belongs to; see site.customerId. */
  customerId: string;
  /** Unique per form fill; lets the backend ignore accidental duplicates. */
  submissionId: string;
  /** Which link the guest used: 'reception' (default link), 'wedding' or 'all'. */
  audience: string;
  fullName: string;
  contact: string;
  contactType: 'email' | 'phone';
  attending: boolean;
  events: EventId[];
  /** Total people in the party INCLUDING the guest filling the form. */
  partySize: number;
  dietary: string;
  message: string;
  songRequest: string;
  submittedAt: string;
}

export type SubmitResult =
  | { ok: true }
  /** This email / phone number has already RSVP'd (one RSVP per guest). */
  | { ok: false; duplicate: true }
  | { ok: false; duplicate?: false; error: string };

export const hasEndpoint = () => isSupabaseConfigured() || !!rsvpConfig.endpoint;

/** Postgres unique_violation, as returned by Supabase/PostgREST. */
const UNIQUE_VIOLATION = '23505';

async function submitToSupabase(p: RsvpPayload): Promise<SubmitResult> {
  const timeout = new Promise<SubmitResult>((resolve) =>
    setTimeout(() => resolve({ ok: false, error: 'The RSVP service took too long to respond.' }), rsvpConfig.timeoutMs),
  );
  const send = (async (): Promise<SubmitResult> => {
    try {
      const supabase = await getSupabase();
      // Insert only (no read-back): the browser is never allowed to read RSVPs.
      const { error } = await supabase.from('rsvps').insert({
        customer_id: p.customerId,
        submission_id: p.submissionId,
        audience: p.audience,
        full_name: p.fullName,
        contact_type: p.contactType,
        email: p.contactType === 'email' ? p.contact : null,
        phone: p.contactType === 'phone' ? p.contact : null,
        attending: p.attending,
        events: p.events,
        party_size: p.partySize,
        dietary: p.dietary || null,
        message: p.message || null,
        song_request: p.songRequest || null,
      });
      if (!error) return { ok: true };
      if (error.code === UNIQUE_VIOLATION) {
        // Same form sent twice (e.g. a retry after a dropped connection): it already arrived.
        if (/submission_id/.test(`${error.message} ${error.details ?? ''}`)) return { ok: true };
        // This email or phone number has RSVP'd before.
        return { ok: false, duplicate: true };
      }
      if (error.code === 'PGRST205' || error.code === '42P01') {
        console.error('[rsvp] The `rsvps` table does not exist in this Supabase project. Run the SQL files in supabase/migrations/ (SQL Editor), in order.');
      } else if (error.code === '23503') {
        console.error('[rsvp] customer_id is not in the `customers` table. Run supabase/migrations/20261021010000_add_customer_id.sql or add the customer row.');
      } else if (error.code === '42501') {
        console.error('[rsvp] Permission denied inserting into `rsvps`. Re-run the migrations so the insert policy and grants exist.');
      }
      console.warn('[rsvp] Supabase rejected the RSVP', error);
      return { ok: false, error: 'The RSVP service couldn’t save your answers.' };
    } catch (err) {
      console.warn('[rsvp] Supabase request failed', err);
      return { ok: false, error: 'We could not reach the RSVP service. Please check your connection.' };
    }
  })();
  return Promise.race([send, timeout]);
}

export async function submitRsvp(payload: RsvpPayload): Promise<SubmitResult> {
  if (isSupabaseConfigured()) return submitToSupabase(payload);

  if (!rsvpConfig.endpoint) {
    // No RSVP service configured yet (.env / src/config/rsvp.ts). Never pretend it was sent.
    console.warn('[rsvp] No RSVP service configured (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY); submission not sent.');
    return { ok: false, error: 'RSVPs can’t be received right now.' };
  }

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), rsvpConfig.timeoutMs);
  try {
    const res = await fetch(rsvpConfig.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...rsvpConfig.headers },
      body: JSON.stringify(payload),
      signal: ctrl.signal,
    });
    if (!res.ok) return { ok: false, error: `The RSVP service responded with an error (${res.status}).` };
    return { ok: true };
  } catch (err) {
    const aborted = err instanceof DOMException && err.name === 'AbortError';
    return {
      ok: false,
      error: aborted ? 'The RSVP service took too long to respond.' : 'We could not reach the RSVP service. Please check your connection.',
    };
  } finally {
    clearTimeout(timer);
  }
}

/** RFC 4122 v4 UUID (the database column is a uuid). */
export const newSubmissionId = (): string => {
  const c = globalThis.crypto as Crypto & { randomUUID?: () => string };
  if (c.randomUUID) return c.randomUUID();
  const b = new Uint8Array(16);
  c.getRandomValues(b);
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  const h = [...b].map((x) => x.toString(16).padStart(2, '0')).join('');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
};

export function looksLikeEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
}

export function looksLikePhone(v: string) {
  const digits = v.replace(/[^\d]/g, '');
  return /^[+\d][\d\s\-().]*$/.test(v.trim()) && digits.length >= 7 && digits.length <= 15;
}

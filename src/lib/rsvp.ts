import { rsvpConfig } from '../config/rsvp';
import type { EventId } from '../config/events';

export interface RsvpPayload {
  /** Unique per form fill; lets the backend ignore accidental duplicates. */
  submissionId: string;
  fullName: string;
  contact: string;
  contactType: 'email' | 'phone';
  events: EventId[];
  /** Total people in the party INCLUDING the guest filling the form. */
  partySize: number;
  dietary: string;
  message: string;
  songRequest: string;
  submittedAt: string;
}

export type SubmitResult = { ok: true } | { ok: false; error: string };

export const hasEndpoint = () => !!rsvpConfig.endpoint;

export async function submitRsvp(payload: RsvpPayload): Promise<SubmitResult> {
  if (!hasEndpoint()) {
    // No RSVP service configured yet (src/config/rsvp.ts). Never pretend it was sent.
    console.warn('[rsvp] No endpoint configured in src/config/rsvp.ts; submission not sent.');
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

export const newSubmissionId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

export function looksLikeEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
}

export function looksLikePhone(v: string) {
  const digits = v.replace(/[^\d]/g, '');
  return /^[+\d][\d\s\-().]*$/.test(v.trim()) && digits.length >= 7 && digits.length <= 15;
}

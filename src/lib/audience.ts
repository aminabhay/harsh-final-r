import { AUDIENCE_PARAM, audiences, type Audience } from '../config/audiences';
import { events, type EventId, type WeddingEvent } from '../config/events';

/** Resolved once from the link the guest opened (see config/audiences.ts). */
function resolve(): Audience {
  if (typeof window === 'undefined') return audiences.reception;
  const code = new URLSearchParams(window.location.search).get(AUDIENCE_PARAM)?.trim().toLowerCase();
  const match = Object.values(audiences).find((a) => a.code && a.code.toLowerCase() === code);
  return match ?? audiences.reception;
}

export const audience: Audience = resolve();

/** Celebrations this guest may see, in chronological order. */
export const visibleEvents: WeddingEvent[] = events.filter((e) => audience.events.includes(e.id));

export const canSee = (id: EventId) => audience.events.includes(id);

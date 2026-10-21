import type { EventId } from './events';

/**
 * Who sees which celebrations. The audience comes from the link the guest was sent:
 *
 *   https://site/                     -> reception guests (the default, most common)
 *   https://site/?invite=kolkata      -> wedding guests
 *   https://site/?invite=family       -> everything
 *
 * Change the codes below to anything you like (letters, numbers, hyphens). An unknown or
 * missing code falls back to the default audience. This curates what each guest sees; it is
 * not access control (a guest who edits their link can change what they see).
 */

export type AudienceId = 'reception' | 'wedding' | 'all';

export interface Audience {
  id: AudienceId;
  /** Value of the `invite` URL parameter; null for the default link. */
  code: string | null;
  /** Celebrations this guest sees (event cards, 3D pavilions, RSVP choices). */
  events: EventId[];
  /** The event the countdown counts down to. */
  countdownTo: EventId;
  /** Mention the reception (12 Dec, Navi Mumbai) on the invitation card and hero. */
  mentionReception: boolean;
  /** Show the wedding ceremony time on the invitation card (only for wedding guests). */
  showWeddingTime: boolean;
}

export const AUDIENCE_PARAM = 'invite';

export const audiences: Record<AudienceId, Audience> = {
  reception: {
    id: 'reception',
    code: null,
    events: ['reception'],
    countdownTo: 'reception',
    mentionReception: true,
    showWeddingTime: false,
  },
  wedding: {
    id: 'wedding',
    code: 'kolkata',
    events: ['wedding'],
    countdownTo: 'wedding',
    mentionReception: false,
    showWeddingTime: true,
  },
  all: {
    id: 'all',
    code: 'family',
    events: ['sangeet', 'haldi', 'wedding', 'reception'],
    countdownTo: 'wedding',
    mentionReception: true,
    showWeddingTime: true,
  },
};

import type { EventId } from './events';

/**
 * Who sees which celebrations. The audience comes from the link the guest was sent:
 *
 *   https://site/                     -> reception guests (the default, most common; they
 *                                        never see the wedding date)
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
  /** The date revealed on the invitation card and in the hero. Guests never see the date
   *  of an event outside `events`. */
  headline: EventId;
  /** Line under the names on the invitation card. */
  cardLine: string;
  /** Also mention the reception (12 Dec, Navi Mumbai) under the headline date. */
  mentionReception: boolean;
}

export const AUDIENCE_PARAM = 'invite';

export const audiences: Record<AudienceId, Audience> = {
  reception: {
    id: 'reception',
    code: null,
    events: ['reception'],
    countdownTo: 'reception',
    headline: 'reception',
    cardLine: 'invite you to their wedding reception',
    mentionReception: false,
  },
  wedding: {
    id: 'wedding',
    code: 'kolkata',
    events: ['wedding'],
    countdownTo: 'wedding',
    headline: 'wedding',
    cardLine: 'are getting married',
    mentionReception: false,
  },
  all: {
    id: 'all',
    code: 'family',
    events: ['sangeet', 'haldi', 'wedding', 'reception'],
    countdownTo: 'wedding',
    headline: 'wedding',
    cardLine: 'are getting married',
    mentionReception: true,
  },
};

/**
 * Central site configuration.
 * Edit this file for couple/family facts, the wedding year and global switches.
 */

export const site = {
  /**
   * The wedding year has NOT been confirmed yet.
   * Leave as `null` until it is. While null:
   *  - only day + month are shown,
   *  - the countdown is hidden,
   *  - calendar export (.ics / Google Calendar) is hidden.
   * Example once confirmed: `weddingYear: 2026`.
   */
  weddingYear: 2026 as number | null,

  /** All ceremony times are shown in this timezone and never converted to the visitor's local time. */
  timezone: 'Asia/Kolkata',
  /** Fixed UTC offset for Asia/Kolkata (India has no daylight saving). Used for calendar files. */
  timezoneOffsetMinutes: 330,

  /**
   * PROVISIONAL: event end times were not supplied. Calendar exports need a duration,
   * so this value is used ONLY for calendar files once a year is set. It is never displayed.
   */
  calendarDurationHours: 3,

  couple: {
    names: 'Harsh & Rimi',
    fullNames: { harsh: 'Harsh Patil', rimi: 'Rimi Mondal' },
    harsh: {
      name: 'Harsh',
      hometown: 'Mumbai',
      formerly: 'Professional footballer',
      now: 'Head Coach of Skorost United',
      parents: ['Rajesh', 'Rupali'],
    },
    rimi: {
      name: 'Rimi',
      hometown: 'Kolkata',
      formerly: 'Chef',
      now: 'Hospitality manager in the Maldives',
      previously: 'Worked in Qatar',
    },
  },

  pet: {
    name: 'Pari',
    description: 'Their beloved dog, and already part of the family.',
  },
} as const;

export const hasConfirmedYear = (): boolean => typeof site.weddingYear === 'number';

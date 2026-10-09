/**
 * Celebration details. Keep them in chronological order.
 * Times are local Asia/Kolkata wall-clock times (24h) and are displayed as-is.
 */

export type EventId = 'sangeet' | 'haldi' | 'wedding' | 'reception';

export interface WeddingEvent {
  id: EventId;
  name: string;
  /** Month is 1-based. The year comes from site.weddingYear. */
  month: number;
  day: number;
  /** 24h local time in Asia/Kolkata. */
  time: { hour: number; minute: number };
  /** Shown after the time, e.g. "onwards". */
  timeSuffix?: string;
  venue: string;
  address: string;
  city: string;
  mapsUrl: string;
  /** Short visual mood used for the 3D pavilion + card accent. */
  accent: string;
  mood: string;
  /** Clothing request for THIS event only. */
  attireNote?: string;
}

export const events: WeddingEvent[] = [
  {
    id: 'sangeet',
    name: 'Sangeet',
    month: 12,
    day: 4,
    time: { hour: 18, minute: 0 },
    venue: 'Bipasha Apartments',
    address:
      'Bipasha Apartments, Heder Hat, Borakhola, Nandan Kanan, Santoshpur, Kolkata, West Bengal 700075',
    city: 'Kolkata',
    mapsUrl: 'https://maps.app.goo.gl/qb16uPjEHc2udp6v6',
    accent: '#D8C9EA',
    mood: 'Music, fairy lights and a lavender stage.',
  },
  {
    id: 'haldi',
    name: 'Haldi',
    month: 12,
    day: 5,
    time: { hour: 9, minute: 30 },
    venue: 'Bipasha Apartments',
    address:
      'Bipasha Apartments, Heder Hat, Borakhola, Nandan Kanan, Santoshpur, Kolkata, West Bengal 700075',
    city: 'Kolkata',
    mapsUrl: 'https://maps.app.goo.gl/qb16uPjEHc2udp6v6',
    accent: '#F3DE8A',
    mood: 'Morning sunshine, petals and butter-yellow cheer.',
  },
  {
    id: 'wedding',
    name: 'Wedding',
    month: 12,
    day: 6,
    time: { hour: 17, minute: 30 },
    timeSuffix: 'onwards',
    venue: 'Rajapur Boys Club',
    address:
      'Rajapur Boys Club, 10a, Braja Mohan Mondal Rd, East Rajapur, Santoshpur, Kolkata, West Bengal 700075',
    city: 'Kolkata',
    mapsUrl: 'https://maps.app.goo.gl/ekE7GZDx9U6SLX4F9',
    accent: '#EBC4CF',
    mood: 'Blush flowers and an ivory welcome.',
    attireNote: 'Please refrain from wearing red attire for the wedding.',
  },
  {
    id: 'reception',
    name: 'Reception',
    month: 12,
    day: 12,
    time: { hour: 18, minute: 30 },
    timeSuffix: 'onwards',
    venue: 'NMSA Sports Association',
    address:
      'NMSA Sports Association, Premnath Maruti Patil Marg, near MGM Hospital, Sports Association Park, Sector 1A, Vashi, Navi Mumbai, Maharashtra 400703',
    city: 'Navi Mumbai',
    mapsUrl: 'https://maps.app.goo.gl/c8xyHugAgPwiNawL6',
    accent: '#B98276',
    mood: 'Rose-gold evening lights in Navi Mumbai.',
  },
];

export const eventById = (id: EventId) => events.find((e) => e.id === id)!;

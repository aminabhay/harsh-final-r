import { site, hasConfirmedYear } from '../config/site';
import type { WeddingEvent } from '../config/events';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const pad = (n: number) => String(n).padStart(2, '0');

/** "4 December" or, once the year is confirmed, "Friday, 4 December 2026". */
export function formatEventDate(e: WeddingEvent): string {
  if (!hasConfirmedYear()) return `${e.day} ${MONTHS[e.month - 1]}`;
  const d = new Date(Date.UTC(site.weddingYear!, e.month - 1, e.day));
  const weekday = d.toLocaleDateString('en-GB', { weekday: 'long', timeZone: 'UTC' });
  return `${weekday}, ${e.day} ${MONTHS[e.month - 1]} ${site.weddingYear}`;
}

export function formatShortDate(e: WeddingEvent): { day: string; month: string } {
  return { day: String(e.day), month: MONTHS[e.month - 1].slice(0, 3) };
}

/** Wall-clock time in Asia/Kolkata, e.g. "6:00 PM". Never converted to the viewer's zone. */
export function formatEventTime(e: WeddingEvent): string {
  const h = e.time.hour % 12 || 12;
  const ampm = e.time.hour < 12 ? 'AM' : 'PM';
  return `${h}:${pad(e.time.minute)} ${ampm}${e.timeSuffix ? ` ${e.timeSuffix}` : ''}`;
}

/** Absolute instant of the event start, or null while the year is unconfirmed. */
export function eventStartUtc(e: WeddingEvent): Date | null {
  if (!hasConfirmedYear()) return null;
  const utcMs = Date.UTC(site.weddingYear!, e.month - 1, e.day, e.time.hour, e.time.minute) - site.timezoneOffsetMinutes * 60_000;
  return new Date(utcMs);
}

const icsStamp = (d: Date) =>
  `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`;

const icsEscape = (s: string) => s.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');

/** Returns an .ics file body, or null if the year has not been confirmed. */
export function buildIcs(e: WeddingEvent): string | null {
  const start = eventStartUtc(e);
  if (!start) return null;
  const end = new Date(start.getTime() + site.calendarDurationHours * 3_600_000);
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Harsh and Rimi//Pari Little World//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${e.id}-${site.weddingYear}@harsh-and-rimi`,
    `DTSTAMP:${icsStamp(new Date())}`,
    `DTSTART:${icsStamp(start)}`,
    `DTEND:${icsStamp(end)}`,
    `SUMMARY:${icsEscape(`${e.name} · Harsh & Rimi`)}`,
    `LOCATION:${icsEscape(e.address)}`,
    `DESCRIPTION:${icsEscape(`${e.venue}\n${e.address}\nMap: ${e.mapsUrl}${e.attireNote ? `\n${e.attireNote}` : ''}`)}`,
    `URL:${e.mapsUrl}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  return lines.join('\r\n');
}

export function googleCalendarUrl(e: WeddingEvent): string | null {
  const start = eventStartUtc(e);
  if (!start) return null;
  const end = new Date(start.getTime() + site.calendarDurationHours * 3_600_000);
  const p = new URLSearchParams({
    action: 'TEMPLATE',
    text: `${e.name} · Harsh & Rimi`,
    dates: `${icsStamp(start)}/${icsStamp(end)}`,
    details: `${e.venue}\nMap: ${e.mapsUrl}${e.attireNote ? `\n${e.attireNote}` : ''}`,
    location: e.address,
    ctz: site.timezone,
  });
  return `https://calendar.google.com/calendar/render?${p.toString()}`;
}

export function downloadIcs(e: WeddingEvent) {
  const body = buildIcs(e);
  if (!body) return;
  const url = URL.createObjectURL(new Blob([body], { type: 'text/calendar;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = `harsh-rimi-${e.id}.ics`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

import { useEffect, useState } from 'react';
import { eventById, type WeddingEvent } from '../config/events';
import { audience, visibleEvents } from '../lib/audience';
import { story } from '../config/story';
import { eventStartUtc, formatEventDate, formatEventTime, formatShortDate } from '../lib/dates';
import { Calendar, Clock, Info, Pin } from './icons';
import { PariSays } from './PariSays';

/* ------------------------------------------------------------------ */
/* Event details (used in cards and in the dialog opened from 3D)       */
/* ------------------------------------------------------------------ */

export function EventDetails({ event: e, headingLevel = 'h3' }: { event: WeddingEvent; headingLevel?: 'h3' | 'none' }) {
  return (
    <div className="event-details">
      {headingLevel === 'h3' && <h3 className="event-card__name">{e.name}</h3>}
      <p className="event-meta">
        <Calendar /> <span>{formatEventDate(e)}</span>
      </p>
      <p className="event-meta">
        <Clock /> <span>{formatEventTime(e)} <span className="tz">IST</span></span>
      </p>
      <p className="event-meta event-meta--venue">
        <Pin />
        <span>
          <strong>{e.venue}</strong>
          <br />
          <span className="address">{e.address}</span>
        </span>
      </p>
      {e.attireNote && (
        <p className="attire-note" role="note">
          <Info /> <strong>{e.attireNote}</strong>
        </p>
      )}
      <div className="event-actions">
        <a className="btn btn--primary btn--small" href={e.mapsUrl} target="_blank" rel="noopener noreferrer">
          <Pin /> Open in Google Maps<span className="visually-hidden"> (opens in a new tab)</span>
        </a>
      </div>
    </div>
  );
}

function EventCard({ event: e }: { event: WeddingEvent }) {
  const d = formatShortDate(e);
  return (
    <article className={`event-card event-card--${e.id}`} aria-labelledby={`ev-${e.id}`} style={{ ['--accent' as string]: e.accent }}>
      <header className="event-card__head">
        <div className="event-card__date" aria-hidden="true">
          <span className="event-card__day">{d.day}</span>
          <span className="event-card__month">{d.month}</span>
        </div>
        <div>
          <p className="event-card__city">{e.city}</p>
          <h3 id={`ev-${e.id}`} className="event-card__name">
            {e.name}
          </h3>
          <p className="event-card__mood">{e.mood}</p>
        </div>
      </header>
      <EventDetails event={e} headingLevel="none" />
    </article>
  );
}

/* ------------------------------------------------------------------ */
/* Countdown (only when the year is confirmed)                          */
/* ------------------------------------------------------------------ */

export function Countdown() {
  const target = eventById(audience.countdownTo);
  const start = eventStartUtc(target);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!start) return;
    const t = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(t);
  }, [start]);
  if (!start) return null;
  const ms = start.getTime() - now;
  if (ms <= 0) return null;
  const days = Math.floor(ms / 86_400_000);
  const hours = Math.floor((ms % 86_400_000) / 3_600_000);
  return (
    <p className="countdown">
      <strong>{days}</strong> days <strong>{hours}</strong> hours until the {target.name.toLowerCase()}
    </p>
  );
}

/* ------------------------------------------------------------------ */
/* Section                                                               */
/* ------------------------------------------------------------------ */

const NUMBERS = ['', 'One', 'Two', 'Three', 'Four', 'Five'];
const IST = 'All times are India Standard Time.';

/** "Join us for the reception in Navi Mumbai." / "Four celebrations across Kolkata and Navi Mumbai." */
function introFor(list: WeddingEvent[]): string {
  if (list.length === 1) return `Join us for the ${list[0].name.toLowerCase()} in ${list[0].city}. ${IST}`;
  const cities = [...new Set(list.map((e) => e.city))];
  const where = cities.length === 1 ? `in ${cities[0]}` : `across ${cities.slice(0, -1).join(', ')} and ${cities[cities.length - 1]}`;
  return `${NUMBERS[list.length] ?? list.length} celebrations ${where}. ${IST}`;
}

export function CelebrationsSection() {
  const s = story.celebrations;
  return (
    <section id="celebrations" data-chapter="celebrations" className="chapter chapter--celebrations" aria-labelledby="celebrations-title">
      <div className="chapter__panel chapter__panel--intro">
        <p className="eyebrow">{s.eyebrow}</p>
        <h2 id="celebrations-title" className="chapter__title">
          {visibleEvents.length === 1 ? `The ${visibleEvents[0].name.toLowerCase()}` : s.title}
        </h2>
        <p>{introFor(visibleEvents)}</p>
        <Countdown />
        <PariSays>{s.pari}</PariSays>
        <p className="hint hint--3d">
          {visibleEvents.length === 1 ? 'Tap the little pavilion in the garden' : 'Tap a little pavilion in the garden'}, or read on below.
        </p>
      </div>
      <div className="event-list">
        {visibleEvents.map((e) => (
          <EventCard key={e.id} event={e} />
        ))}
        <PariSays>{s.pariSecond}</PariSays>
      </div>
    </section>
  );
}

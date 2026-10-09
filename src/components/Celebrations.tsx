import { useEffect, useState } from 'react';
import { events, eventById, type WeddingEvent } from '../config/events';
import { story } from '../config/story';
import { hasConfirmedYear } from '../config/site';
import { downloadIcs, eventStartUtc, formatEventDate, formatEventTime, formatShortDate, googleCalendarUrl } from '../lib/dates';
import { Calendar, Clock, Copy, Info, Pin } from './icons';
import { PariSays } from './PariSays';

/* ------------------------------------------------------------------ */
/* Copy-address with a clipboard fallback and a polite announcement     */
/* ------------------------------------------------------------------ */

async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fall through */
  }
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    ta.remove();
    return ok;
  } catch {
    return false;
  }
}

function CopyAddress({ address }: { address: string }) {
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle');
  useEffect(() => {
    if (state === 'idle') return;
    const t = setTimeout(() => setState('idle'), 2400);
    return () => clearTimeout(t);
  }, [state]);
  return (
    <>
      <button type="button" className="btn btn--ghost btn--small" onClick={async () => setState((await copyText(address)) ? 'copied' : 'failed')}>
        <Copy /> {state === 'copied' ? 'Address copied' : 'Copy address'}
      </button>
      <span className="visually-hidden" role="status">
        {state === 'copied' ? 'Address copied to clipboard' : state === 'failed' ? 'Could not copy. Please select the address text instead.' : ''}
      </span>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Event details (used in cards and in the dialog opened from 3D)       */
/* ------------------------------------------------------------------ */

export function EventDetails({ event: e, headingLevel = 'h3' }: { event: WeddingEvent; headingLevel?: 'h3' | 'none' }) {
  const confirmed = hasConfirmedYear();
  const gcal = googleCalendarUrl(e);
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
        <CopyAddress address={e.address} />
        {confirmed && (
          <>
            <button type="button" className="btn btn--ghost btn--small" onClick={() => downloadIcs(e)}>
              <Calendar /> Add to calendar (.ics)
            </button>
            {gcal && (
              <a className="btn btn--ghost btn--small" href={gcal} target="_blank" rel="noopener noreferrer">
                Google Calendar<span className="visually-hidden"> (opens in a new tab)</span>
              </a>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function EventCard({ event: e }: { event: WeddingEvent }) {
  const d = formatShortDate(e);
  return (
    <article className={`event-card event-card--${e.id}`} aria-labelledby={`ev-${e.id}`} style={{ ['--accent' as string]: e.accent }}>
      <div className="event-card__date" aria-hidden="true">
        <span className="event-card__day">{d.day}</span>
        <span className="event-card__month">{d.month}</span>
      </div>
      <div className="event-card__body">
        <p className="event-card__city">{e.city}</p>
        <h3 id={`ev-${e.id}`} className="event-card__name">
          {e.name}
        </h3>
        <p className="event-card__mood">{e.mood}</p>
        <EventDetails event={e} headingLevel="none" />
      </div>
    </article>
  );
}

/* ------------------------------------------------------------------ */
/* Countdown (only when the year is confirmed)                          */
/* ------------------------------------------------------------------ */

export function Countdown() {
  const wedding = eventById('wedding');
  const start = eventStartUtc(wedding);
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
      <strong>{days}</strong> days <strong>{hours}</strong> hours until the wedding
    </p>
  );
}

/* ------------------------------------------------------------------ */
/* Section                                                               */
/* ------------------------------------------------------------------ */

const venues = (() => {
  const map = new Map<string, { venue: string; address: string; mapsUrl: string; names: string[] }>();
  events.forEach((e) => {
    const v = map.get(e.venue) ?? { venue: e.venue, address: e.address, mapsUrl: e.mapsUrl, names: [] };
    v.names.push(e.name);
    map.set(e.venue, v);
  });
  return [...map.values()];
})();

export function CelebrationsSection() {
  const s = story.celebrations;
  return (
    <section id="celebrations" data-chapter="celebrations" className="chapter chapter--celebrations" aria-labelledby="celebrations-title">
      <div className="chapter__panel chapter__panel--intro">
        <p className="eyebrow">{s.eyebrow}</p>
        <h2 id="celebrations-title" className="chapter__title">
          {s.title}
        </h2>
        <p>{s.intro}</p>
        <Countdown />
        <PariSays>{s.pari}</PariSays>
        <p className="hint hint--3d">Tap a little pavilion in the garden, or read on below.</p>
      </div>
      <div className="event-list">
        {events.map((e) => (
          <EventCard key={e.id} event={e} />
        ))}
        <div id="directions" className="directions" aria-labelledby="directions-title">
          <h3 id="directions-title">Directions</h3>
          <ul>
            {venues.map((v) => (
              <li key={v.venue}>
                <p>
                  <strong>{v.venue}</strong> <span className="directions__for">· {v.names.join(' & ')}</span>
                </p>
                <p className="address">{v.address}</p>
                <a href={v.mapsUrl} target="_blank" rel="noopener noreferrer">
                  Open in Google Maps<span className="visually-hidden"> (opens in a new tab)</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
        <PariSays>{s.pariSecond}</PariSays>
      </div>
    </section>
  );
}

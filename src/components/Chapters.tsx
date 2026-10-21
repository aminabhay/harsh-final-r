import { useEffect, type CSSProperties, type ReactNode } from 'react';
import { story } from '../config/story';
import { images, type ImageKey } from '../config/images';
import type { ChapterId } from '../config/world';
import { useChapterStep } from '../lib/scroll';
import { ui, useUi } from '../lib/ui';
import { site } from '../config/site';
import { eventById } from '../config/events';
import { audience } from '../lib/audience';
import { formatEventDate } from '../lib/dates';
import { openTicket, openFamilyPhoto, openAlbum } from '../lib/actions';
import { Countdown } from './Celebrations';
import { ArrowDown } from './icons';
import { PariSays } from './PariSays';

/* ------------------------------------------------------------------ */
/* Opening: the invitation                                              */
/* ------------------------------------------------------------------ */

const REVEAL_MS = 1900;

/**
 * The first downward scroll (wheel, swipe or keyboard) at the top of the page only opens the
 * envelope and reveals the date. Once the card is out, scrolling continues as normal.
 * Scrolling all the way back up closes the envelope again (the same animation in reverse)
 * and hides the date, ready to be revealed once more.
 */
function useEnvelopeScrollGate(enabled: boolean, reduced: boolean) {
  useEffect(() => {
    if (!enabled) return;
    let unlockAt = 0;
    let touchY = 0;
    const atTop = () => window.scrollY < 8;
    const gate = (e: Event) => {
      if (!atTop()) return;
      if (!ui.get().envelopeOpen) {
        e.preventDefault();
        ui.set({ envelopeOpen: true });
        unlockAt = performance.now() + (reduced ? 400 : REVEAL_MS);
      } else if (performance.now() < unlockAt) {
        e.preventDefault();
      }
    };
    // Close again when the guest comes back to the very top...
    let leftTop = window.scrollY > 40;
    const close = () => {
      if (ui.get().envelopeOpen && performance.now() >= unlockAt) ui.set({ envelopeOpen: false });
    };
    const onScroll = () => {
      if (window.scrollY > 40) leftTop = true;
      else if (window.scrollY <= 2 && leftTop) {
        leftTop = false;
        close();
      }
    };
    // ...or keeps scrolling up while already at the top.
    const upAtTop = () => {
      if (atTop()) close();
    };
    const onWheel = (e: WheelEvent) => {
      if (e.deltaY > 0) gate(e);
      else if (e.deltaY < 0) upAtTop();
    };
    const onTouchStart = (e: TouchEvent) => {
      touchY = e.touches[0].clientY;
    };
    const onTouchMove = (e: TouchEvent) => {
      const dy = touchY - e.touches[0].clientY;
      if (dy > 4) gate(e);
      else if (dy < -4) upAtTop();
    };
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      if (el.closest('input, textarea, select, button, a, [contenteditable]')) return;
      if (['ArrowDown', 'PageDown', ' ', 'Spacebar'].includes(e.key)) gate(e);
      else if (['ArrowUp', 'PageUp', 'Home'].includes(e.key)) upAtTop();
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('keydown', onKey);
    };
  }, [enabled, reduced]);
}

const wedding = eventById('wedding');
const reception = eventById('reception');

export function Hero({ reduced, is3d }: { reduced: boolean; is3d: boolean }) {
  const s = story.invite;
  const open = useUi((st) => st.envelopeOpen);
  useEnvelopeScrollGate(is3d, reduced);
  const revealed = open || !is3d;
  return (
    <section id="top" data-chapter="invite" className="hero" aria-labelledby="hero-title">
      <div className="hero__panel">
        <p className="eyebrow">{s.eyebrow}</p>
        <h1 id="hero-title" className="hero__title">
          <span className="hero__name">{site.couple.fullNames.harsh}</span> <span className="amp">&amp;</span>{' '}
          <span className="hero__name">{site.couple.fullNames.rimi}</span>
        </h1>
        <p className="hero__subtitle">{s.subtitle}</p>
        {/* The date reveal: collapses away while the envelope is closed. */}
        <div className={`hero__reveal${revealed ? ' is-revealed' : ''}`} aria-hidden={!revealed}>
          <div className="hero__reveal-inner">
            <p className="hero__date">
              <span className="hero__date-day">{formatEventDate(wedding)}</span>
              <span className="hero__date-place">
                {wedding.city}
                {audience.mentionReception && ` · Reception ${reception.day} December, ${reception.city}`}
              </span>
            </p>
            <Countdown />
          </div>
        </div>
        <PariSays>{s.pari}</PariSays>
      </div>
      <figure className="simple-figure hero__figure">
        <img src={images.photoThree.src} alt={images.photoThree.alt} style={{ objectPosition: images.photoThree.focus }} />
      </figure>
      <a className="scroll-cue" href="#story">
        <ArrowDown /> <span>Scroll to begin the story</span>
      </a>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Travel zone: empty page space where the journey to the next island  */
/* plays out, with no card on screen (see lib/scroll.ts).              */
/* ------------------------------------------------------------------ */

export function TravelZone({ from, travel }: { from: ChapterId; travel?: string }) {
  return <div className="travel-zone" data-travel={from} aria-hidden="true" style={travel ? ({ '--travel': travel } as CSSProperties) : undefined} />;
}

/* ------------------------------------------------------------------ */
/* Generic chapter shell                                                */
/* ------------------------------------------------------------------ */

function ChapterSection({
  id,
  anchor,
  side,
  length,
  eyebrow,
  kicker,
  title,
  simpleImage,
  children,
}: {
  id: ChapterId;
  anchor?: string;
  side: 'left' | 'right';
  length: string;
  eyebrow: string;
  kicker?: string;
  title: string;
  simpleImage?: ImageKey;
  children: ReactNode;
}) {
  const img = simpleImage ? images[simpleImage] : null;
  return (
    <section id={anchor} data-chapter={id} className={`chapter chapter--${side}`} style={{ '--len': length } as CSSProperties} aria-labelledby={`${id}-title`}>
      <div className="chapter__panel">
        <p className="eyebrow">
          {eyebrow}
          {kicker && <span className="eyebrow__kicker"> · {kicker}</span>}
        </p>
        <h2 id={`${id}-title`} className="chapter__title">
          {title}
        </h2>
        {children}
      </div>
      {img && (
        <figure className="simple-figure">
          <img src={img.src} alt={img.alt} loading="lazy" style={{ objectPosition: img.focus }} />
        </figure>
      )}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Chapter one: an illustrative phone sequence (no real messages)      */
/* ------------------------------------------------------------------ */

const openFirstChat = () => ui.openDialog({ type: 'lightbox', items: [images.firstChat], index: 0, title: 'Their first chat' });

function PhoneSequence() {
  const step = useChapterStep('pitch', 4, 0.06, 0.5);
  const steps = story.pitch.steps;
  return (
    <div className="phone-seq">
      <button type="button" className="phone" data-step={step} onClick={openFirstChat} aria-label="Read their first chat">
        <span className="phone__screen">
          {/* Their real first chat, shown whole. */}
          <img className="phone__chat" src={images.firstChat.src} alt="" />
          <span className={`phone__state phone__state--days${step === 2 ? ' is-on' : ''}`} aria-hidden="true">
            {[1, 2, 3].map((d) => (
              <span key={d} className="mock-day" style={{ ['--i' as string]: d }}>
                <span>Day</span>
                <strong>{d}</strong>
              </span>
            ))}
          </span>
        </span>
      </button>
      <div>
        <ol className="phone-steps" aria-label="How it happened">
          {steps.map((s, i) => (
            <li key={s.short} className={i === step ? 'is-current' : i < step ? 'is-done' : ''} aria-current={i === step ? 'step' : undefined}>
              {s.label}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Chapter three: three places, plotted to scale (equirectangular)      */
/* ------------------------------------------------------------------ */

function LocationMap() {
  const places = story.proposal.places;
  const W = 320;
  const H = 130;
  const lon0 = 48;
  const lon1 = 92;
  const lat0 = 30;
  const scale = W / (lon1 - lon0);
  const xy = (lat: number, lon: number) => [(lon - lon0) * scale, (lat0 - lat) * scale] as const;
  const q = places.find((p) => p.id === 'qatar')!;
  const [qx, qy] = xy(q.lat, q.lon);
  return (
    <figure className="loc-map">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-labelledby="loc-map-title">
        <title id="loc-map-title">Mumbai, his home; Kolkata, her home; and Qatar, where their promise began.</title>
        {Array.from({ length: 5 }, (_, i) => (
          <line key={i} x1={0} x2={W} y1={20 + i * 25} y2={20 + i * 25} className="loc-map__grid" />
        ))}
        {places
          .filter((p) => p.id !== 'qatar')
          .map((p) => {
            const [x, y] = xy(p.lat, p.lon);
            const mx = (x + qx) / 2;
            const my = Math.min(y, qy) - 34;
            return <path key={p.id} d={`M${x},${y} Q${mx},${my} ${qx},${qy}`} className="loc-map__path" />;
          })}
        {places.map((p) => {
          const [x, y] = xy(p.lat, p.lon);
          const anchor = p.id === 'kolkata' ? 'end' : p.id === 'qatar' ? 'start' : 'middle';
          const dx = p.id === 'kolkata' ? -10 : p.id === 'qatar' ? 10 : 0;
          const dy = p.id === 'mumbai' ? 22 : 4;
          return (
            <g key={p.id}>
              <circle cx={x} cy={y} r={p.id === 'qatar' ? 6 : 5} className={`loc-map__dot loc-map__dot--${p.id}`} />
              <text x={x + dx} y={y + dy} textAnchor={anchor} className="loc-map__label">
                {p.name}
              </text>
              <text x={x + dx} y={y + dy + 13} textAnchor={anchor} className="loc-map__note">
                {p.note}
              </text>
            </g>
          );
        })}
      </svg>
    </figure>
  );
}

/* ------------------------------------------------------------------ */
/* Chapters                                                              */
/* ------------------------------------------------------------------ */

export function StoryChapters() {
  const p = story.pitch;
  const c = story.cinema;
  const q = story.proposal;
  const f = story.family;
  const h = story.home;
  return (
    <>
      <ChapterSection id="pitch" anchor="story" side="left" length="170vh" eyebrow={p.eyebrow} kicker={p.kicker} title={p.title} simpleImage="photoMatchday">
        {p.body.map((t) => (
          <p key={t}>{t}</p>
        ))}
        <PhoneSequence />
      </ChapterSection>
      <TravelZone from="pitch" />

      <ChapterSection id="cinema" side="right" length="150vh" eyebrow={c.eyebrow} kicker={c.kicker} title={c.title} simpleImage="firstDate">
        {c.body.map((t) => (
          <p key={t}>{t}</p>
        ))}
        <p className="hint">
          <span className="hint--3d">{c.ticketHint} </span>
          <button type="button" className="btn btn--ghost btn--small" onClick={openTicket}>
            📷 {c.ticketButton}
          </button>
        </p>
        <PariSays>{c.pari}</PariSays>
      </ChapterSection>
      <TravelZone from="cinema" />

      <ChapterSection id="proposal" side="left" length="230vh" eyebrow={q.eyebrow} kicker={q.kicker} title={q.title} simpleImage="qatarProposal">
        <p className="lede">{q.support}</p>
        {q.body.map((t) => (
          <p key={t}>{t}</p>
        ))}
        <blockquote className="centre-line">{q.centre}</blockquote>
        <LocationMap />
        <PariSays>{q.pari}</PariSays>
      </ChapterSection>
      <TravelZone from="proposal" />

      <ChapterSection id="family" anchor="family" side="right" length="160vh" eyebrow={f.eyebrow} title={f.title}>
        <ul className="family-list">
          {f.groups.map((g) => {
            const img = images[g.id as ImageKey];
            return (
              <li key={g.id} className="family-item">
                <button type="button" className="family-item__photo" onClick={() => openFamilyPhoto(g.id as ImageKey)} aria-label={`View photo: ${g.heading}`}>
                  <img src={img.src} alt="" loading="lazy" style={{ objectPosition: img.focus }} />
                </button>
                <div>
                  <h3>{g.heading}</h3>
                  <p>{g.text}</p>
                  {g.sub && <p className="family-item__sub">{g.sub}</p>}
                </div>
              </li>
            );
          })}
        </ul>
        <PariSays>{f.pari}</PariSays>
      </ChapterSection>
      <TravelZone from="family" />

      <ChapterSection id="home" side="left" length="150vh" eyebrow={h.eyebrow} kicker={h.kicker} title={h.title} simpleImage="photoHome">
        {h.body.map((t) => (
          <p key={t}>{t}</p>
        ))}
        <div className="chips" role="group" aria-label="Things to explore in their home">
          <button type="button" className="chip" onClick={() => openAlbum(0)}>
            🖼 {h.interactions.album}
          </button>
        </div>
        <PariSays>{h.pari}</PariSays>
      </ChapterSection>
      <TravelZone from="home" />
    </>
  );
}

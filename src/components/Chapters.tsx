import { useEffect, type CSSProperties, type ReactNode } from 'react';
import { story } from '../config/story';
import { images, type ImageKey } from '../config/images';
import type { ChapterId } from '../config/world';
import { useChapterStep } from '../lib/scroll';
import { ui, useUi } from '../lib/ui';
import { site } from '../config/site';
import { eventById } from '../config/events';
import { formatEventDate } from '../lib/dates';
import { openTicket, openFamilyPhoto, openAlbum, openKeepsake, greetPari } from '../lib/actions';
import { Countdown } from './Celebrations';
import { ArrowDown, Heart, Paw } from './icons';
import { PariSays } from './PariSays';

/* ------------------------------------------------------------------ */
/* Opening: the invitation                                              */
/* ------------------------------------------------------------------ */

const REVEAL_MS = 1900;

/**
 * The first downward scroll (wheel, swipe or keyboard) at the top of the page only opens the
 * envelope and reveals the date. Once the card is out, scrolling continues as normal.
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
    const onWheel = (e: WheelEvent) => {
      if (e.deltaY > 0) gate(e);
    };
    const onTouchStart = (e: TouchEvent) => {
      touchY = e.touches[0].clientY;
    };
    const onTouchMove = (e: TouchEvent) => {
      if (touchY - e.touches[0].clientY > 4) gate(e);
    };
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      if (el.closest('input, textarea, select, button, a, [contenteditable]')) return;
      if (['ArrowDown', 'PageDown', ' ', 'Spacebar'].includes(e.key)) gate(e);
    };
    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('keydown', onKey);
    };
  }, [enabled, reduced]);
}

const wedding = eventById('wedding');

export function Hero({ reduced, is3d }: { reduced: boolean; is3d: boolean }) {
  const s = story.invite;
  const open = useUi((st) => st.envelopeOpen);
  useEnvelopeScrollGate(is3d, reduced);
  const follow = () => {
    const wasOpen = ui.get().envelopeOpen;
    ui.set({ envelopeOpen: true });
    const go = () => document.getElementById('story')?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
    // Let the envelope open and the date show before the camera travels on.
    setTimeout(go, reduced || wasOpen ? 0 : REVEAL_MS + 300);
  };
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
        <p className={`hero__date${revealed ? ' is-revealed' : ''}`}>
          <span className="hero__date-day">{formatEventDate(wedding)}</span>
          <span className="hero__date-place">
            {wedding.city} · Reception 12 December, Navi Mumbai
          </span>
        </p>
        <Countdown />
        <PariSays>{s.pari}</PariSays>
        <div className="hero__actions">
          <button type="button" className="btn btn--primary" onClick={follow}>
            <Paw /> {s.primaryCta}
          </button>
          <a className="btn btn--ghost" href="#celebrations">
            {s.secondaryCta}
          </a>
        </div>
      </div>
      <figure className="simple-figure hero__figure">
        <img src={images.couplePortrait.src} alt={images.couplePortrait.alt} style={{ objectPosition: images.couplePortrait.focus }} />
      </figure>
      <a className="scroll-cue" href="#story">
        <ArrowDown /> <span>Scroll to begin the story</span>
      </a>
    </section>
  );
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

function PhoneSequence() {
  const step = useChapterStep('pitch', 4, 0.06, 0.5);
  const steps = story.pitch.steps;
  return (
    <div className="phone-seq">
      <div className="phone" aria-hidden="true" data-step={step}>
        <div className="phone__screen">
          <div className={`phone__state phone__state--profile${step === 0 ? ' is-on' : ''}`}>
            <div className="mock-card">
              <div className="mock-avatar">R</div>
              <p className="mock-name">Rimi</p>
              <p className="mock-sub">Kolkata</p>
              <span className="mock-line" />
              <span className="mock-line mock-line--short" />
              <div className="mock-actions">
                <span>✕</span>
                <span className="is-like">♥</span>
              </div>
            </div>
          </div>
          <div className={`phone__state phone__state--dm${step === 1 ? ' is-on' : ''}`}>
            <div className="mock-dm-head">
              <span className="mock-ring">R</span>
              <span>rimi</span>
            </div>
            <div className="mock-bubble mock-bubble--out">
              <span className="mock-line" />
              <span className="mock-line mock-line--short" />
            </div>
            <p className="mock-seen">Sent</p>
          </div>
          <div className={`phone__state phone__state--days${step === 2 ? ' is-on' : ''}`}>
            {[1, 2, 3].map((d) => (
              <div key={d} className="mock-day" style={{ ['--i' as string]: d }}>
                <span>Day</span>
                <strong>{d}</strong>
              </div>
            ))}
          </div>
          <div className={`phone__state phone__state--reply${step === 3 ? ' is-on' : ''}`}>
            <div className="mock-notif">
              <span className="mock-ring">R</span>
              <span>
                <strong>Rimi</strong> replied
              </span>
              <Heart className="mock-heart" />
            </div>
          </div>
        </div>
      </div>
      <ol className="phone-steps" aria-label="How it happened">
        {steps.map((s, i) => (
          <li key={s.short} className={i === step ? 'is-current' : i < step ? 'is-done' : ''} aria-current={i === step ? 'step' : undefined}>
            {s.label}
          </li>
        ))}
      </ol>
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
      <ChapterSection id="pitch" anchor="story" side="left" length="290vh" eyebrow={p.eyebrow} kicker={p.kicker} title={p.title} simpleImage="album04">
        {p.body.map((t) => (
          <p key={t}>{t}</p>
        ))}
        <PhoneSequence />
        <PariSays>{p.pari}</PariSays>
      </ChapterSection>

      <ChapterSection id="cinema" side="right" length="200vh" eyebrow={c.eyebrow} kicker={c.kicker} title={c.title} simpleImage="firstDate">
        {c.body.map((t) => (
          <p key={t}>{t}</p>
        ))}
        <p className="hint">
          <span className="hint--3d">{c.ticketHint} </span>
          <button type="button" className="btn btn--ghost btn--small" onClick={openTicket}>
            🎟 {c.ticketButton}
          </button>
        </p>
        <PariSays>{c.pari}</PariSays>
      </ChapterSection>

      <ChapterSection id="proposal" side="left" length="230vh" eyebrow={q.eyebrow} kicker={q.kicker} title={q.title} simpleImage="qatarProposal">
        <p className="lede">{q.support}</p>
        {q.body.map((t) => (
          <p key={t}>{t}</p>
        ))}
        <blockquote className="centre-line">{q.centre}</blockquote>
        <LocationMap />
        <PariSays>{q.pari}</PariSays>
      </ChapterSection>

      <ChapterSection id="family" anchor="family" side="right" length="220vh" eyebrow={f.eyebrow} title={f.title}>
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

      <ChapterSection id="home" side="left" length="210vh" eyebrow={h.eyebrow} kicker={h.kicker} title={h.title} simpleImage="maldivesMemory">
        {h.body.map((t) => (
          <p key={t}>{t}</p>
        ))}
        <div className="chips" role="group" aria-label="Things to explore in their home">
          <button type="button" className="chip chip--3d" onClick={() => ui.kick()}>
            ⚽ {h.interactions.football}
          </button>
          <button type="button" className="chip" onClick={() => openAlbum(0)}>
            🖼 {h.interactions.album}
          </button>
          <button type="button" className="chip" onClick={openKeepsake}>
            🧳 {h.interactions.keepsake}
          </button>
          <button type="button" className="chip" onClick={greetPari}>
            <Paw width={16} height={16} /> {h.interactions.pari}
          </button>
        </div>
        <PariSays>{h.pari}</PariSays>
      </ChapterSection>
    </>
  );
}

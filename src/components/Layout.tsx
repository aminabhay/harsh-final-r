import { useEffect, useRef, useState } from 'react';
import { characters } from '../config/models';
import { useActiveChapter } from '../lib/scroll';
import { useUi, ui } from '../lib/ui';
import { CHAPTERS } from '../config/world';
import { Close, Menu, Note, Paw } from './icons';
import { music, musicSupported, useMusicPlaying } from '../lib/music';

/* ------------------------------------------------------------------ */
/* Navigation                                                            */
/* ------------------------------------------------------------------ */

const LINKS = [
  { href: '#story', label: 'Our Story', chapters: ['pitch', 'cinema', 'proposal', 'home'] },
  { href: '#family', label: 'Family', chapters: ['family'] },
  { href: '#celebrations', label: 'Celebrations', chapters: ['celebrations'] },
  { href: '#photos', label: 'Photos', chapters: ['photos'] },
  { href: '#rsvp', label: 'RSVP', chapters: ['rsvp'] },
];

export function Nav({ simple, canUse3d, onToggleSimple }: { simple: boolean; canUse3d: boolean; onToggleSimple: () => void }) {
  const active = CHAPTERS[useActiveChapter()];
  const [open, setOpen] = useState(false);
  const menuBtn = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        menuBtn.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <header className="site-header">
      <a className="skip-link" href="#celebrations">
        Skip to celebrations
      </a>
      <a className="brand" href="#top" aria-label="Harsh & Rimi, back to the invitation">
        <span className="brand__mark" aria-hidden="true">
          <Paw width={18} height={18} />
        </span>
        <span className="brand__name">
          Harsh <span className="amp">&amp;</span> Rimi
        </span>
      </a>
      <MusicToggle />
      <button
        ref={menuBtn}
        type="button"
        className="icon-btn nav-toggle"
        aria-expanded={open}
        aria-controls="site-nav"
        aria-label={open ? 'Close menu' : 'Open menu'}
        onClick={() => setOpen((v) => !v)}
      >
        {open ? <Close /> : <Menu />}
      </button>
      <nav id="site-nav" className={`site-nav${open ? ' is-open' : ''}`} aria-label="Main">
        <ul>
          {LINKS.map((l) => (
            <li key={l.href}>
              <a href={l.href} aria-current={l.chapters.includes(active) ? 'location' : undefined} onClick={() => setOpen(false)}>
                {l.label}
              </a>
            </li>
          ))}
          {canUse3d && (
            <li>
              <button type="button" className="view-toggle" onClick={onToggleSimple} aria-pressed={simple}>
                {simple ? '3D story view' : 'Simple view'}
              </button>
            </li>
          )}
        </ul>
      </nav>
    </header>
  );
}

/* ------------------------------------------------------------------ */
/* Soft music toggle (never autoplays)                                  */
/* ------------------------------------------------------------------ */

function MusicToggle() {
  const playing = useMusicPlaying();
  if (!musicSupported()) return null;
  return (
    <button type="button" className={`music-toggle${playing ? ' is-playing' : ''}`} aria-pressed={playing} onClick={() => music.toggle()}>
      <span className="music-toggle__icon" aria-hidden="true">
        <Note width={18} height={18} />
      </span>
      <span className="music-toggle__label">{playing ? 'Pause music' : 'Play music'}</span>
      <span className="music-toggle__bars" aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Ask Pari: a tiny navigation helper (not a chatbot)                   */
/* ------------------------------------------------------------------ */

export function AskPari() {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const btn = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        btn.current?.focus();
      }
    };
    const onDown = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onDown);
    root.current?.querySelector<HTMLAnchorElement>('a')?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onDown);
    };
  }, [open]);

  const items = [
    { href: '#celebrations', label: 'Celebrations' },
    { href: '#directions', label: 'Directions' },
    { href: '#rsvp', label: 'RSVP' },
    { href: '#story', label: 'Back to the story' },
  ];
  return (
    <div className="ask-pari" ref={root}>
      {open && (
        <div className="ask-pari__menu" id="ask-pari-menu">
          <p className="ask-pari__title">Where shall I take you?</p>
          <ul>
            {items.map((i) => (
              <li key={i.href}>
                <a href={i.href} onClick={() => setOpen(false)}>
                  {i.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
      <button ref={btn} type="button" className="ask-pari__btn" aria-expanded={open} aria-controls="ask-pari-menu" onClick={() => setOpen((v) => !v)}>
        <Paw width={22} height={22} />
        <span>Ask Pari</span>
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Pari's short remarks (tap Pari in 3D, or the "say hello" button)     */
/* ------------------------------------------------------------------ */

export function PariToast() {
  const line = useUi((s) => s.pariLine);
  const ping = useUi((s) => s.pariPing);
  useEffect(() => {
    if (!line) return;
    const t = setTimeout(() => ui.set({ pariLine: null }), 4200);
    return () => clearTimeout(t);
  }, [line, ping]);
  return (
    <div className="pari-toast-region" role="status" aria-live="polite">
      {line && (
        <p className="pari-toast" key={ping}>
          <Paw width={16} height={16} /> <span>{line}</span>
        </p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Loading state (real file counts from the three.js loading manager)  */
/* ------------------------------------------------------------------ */

export function LoadingPill() {
  const load = useUi((s) => s.load);
  const [done, setDone] = useState(false);
  const finished = !!load && !load.active && load.total > 0 && load.loaded >= load.total;
  useEffect(() => {
    if (!finished) return setDone(false);
    const t = setTimeout(() => setDone(true), 700);
    return () => clearTimeout(t);
  }, [finished]);
  if (done) return null;
  return (
    <div className="loading-pill" role="status" aria-live="polite">
      <span className="loading-pill__paw" aria-hidden="true">
        <Paw width={16} height={16} />
      </span>
      <span>
        {!load || load.total === 0
          ? 'Pari is preparing the little world…'
          : finished
            ? 'The little world is ready.'
            : `Pari is fetching the little world… ${load.loaded} of ${load.total} files`}
        {load && load.errors > 0 && ` (${load.errors} could not load)`}
      </span>
    </div>
  );
}

export function Notices({ webgl }: { webgl: boolean }) {
  const failed = useUi((s) => s.assetErrors);
  const lost = useUi((s) => s.webglLost);
  if (webgl && !failed.length && !lost) return null;
  return (
    <div className="notices" role="status">
      {!webgl && <p>Your browser can’t show the 3D story, so here’s the simple version. Everything important is below.</p>}
      {lost && <p>The 3D view paused because the graphics context was lost. Everything below still works; reload to bring the little world back.</p>}
      {failed.length > 0 && <p>Sorry, {failed.map((f) => characters[f].label).join(', ')}’s 3D model couldn’t load. The rest of the site works as normal.</p>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Footer                                                                */
/* ------------------------------------------------------------------ */

export function Footer({ canUse3d, simple, onToggleSimple }: { canUse3d: boolean; simple: boolean; onToggleSimple: () => void }) {
  return (
    <footer className="site-footer">
      <p className="site-footer__names">
        Harsh <span className="amp">&amp;</span> Rimi
      </p>
      <p>Hosted with love (and supervision) by Pari.</p>
      <p className="small-note">All celebration times are India Standard Time (Asia/Kolkata).</p>
      {canUse3d && (
        <button type="button" className="link-btn" onClick={onToggleSimple}>
          Switch to {simple ? 'the 3D story' : 'Simple View'}
        </button>
      )}
    </footer>
  );
}

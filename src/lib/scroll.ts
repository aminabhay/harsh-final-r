import { useSyncExternalStore } from 'react';
import { CHAPTERS, type ChapterId } from '../config/world';

/**
 * Maps native page scroll onto the chapter timeline.
 *
 * `f` is a continuous chapter index: 2.0 means "holding on chapter 2", 2.5 means
 * "half-way travelling from chapter 2 to 3".
 *
 * Travel between islands happens ONLY inside a travel zone (`[data-travel]`), an empty
 * stretch of page placed after each chapter. Travel starts once the zone reaches the top
 * of the viewport, i.e. once the previous card has fully scrolled away, and ends
 * 1.4 viewports before the zone ends: a clear stretch so Pari finishes her last steps
 * before the next card can appear.
 * No character ever moves behind a card.
 *
 * `scene[id]` (0..1) drives each island's own animations (calendar pages, the ring box...)
 * while the scene is clear: on portrait screens it follows the card entering from the
 * bottom (finished before the card covers the scene); on wide screens, where the card
 * sits beside the scene, it follows the chapter's own scroll progress.
 *
 * Everything is derived from scroll position alone, so fast scrolling or jumping via links
 * can never desync state.
 */

export const scrollState = {
  f: 0,
  local: Object.fromEntries(CHAPTERS.map((c) => [c, 0])) as Record<ChapterId, number>,
  scene: Object.fromEntries(CHAPTERS.map((c) => [c, 0])) as Record<ChapterId, number>,
  active: 0,
};

type Listener = () => void;
const listeners = new Set<Listener>();
let raf = 0;
let started = false;

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const smoothstep = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

export const isTallViewport = () => window.innerWidth <= 760 || window.innerWidth / window.innerHeight < 0.9;

const PANEL_SEL = '.hero__panel, .chapter__panel, .gallery__inner, .rsvp';

function measure() {
  raf = 0;
  const vh = window.innerHeight;
  const y = window.scrollY;
  const probe = y + vh * 0.5;
  const tall = isTallViewport();

  CHAPTERS.forEach((id) => {
    const el = document.querySelector<HTMLElement>(`[data-chapter="${id}"]`);
    if (!el) return;
    const top = el.getBoundingClientRect().top + y;
    const h = Math.max(1, el.offsetHeight);
    const local = clamp01((probe - top) / h);
    scrollState.local[id] = local;
    let scene = clamp01(local / 0.6);
    if (tall) {
      const panel = el.querySelector<HTMLElement>(PANEL_SEL);
      // 0 while the card is below the screen, 1 once it has risen 30% of the way up.
      if (panel) scene = clamp01((vh - panel.getBoundingClientRect().top) / (vh * 0.3));
    }
    scrollState.scene[id] = scene;
  });

  let f = 0;
  const zones = document.querySelectorAll<HTMLElement>('[data-travel]');
  for (const z of zones) {
    const from = CHAPTERS.indexOf(z.dataset.travel as ChapterId);
    const zs = z.getBoundingClientRect().top + y;
    const len = Math.max(1, z.offsetHeight - vh * 1.4);
    if (y < zs) {
      f = from;
      break;
    }
    if (y <= zs + len) {
      f = from + smoothstep(0, 1, (y - zs) / len);
      break;
    }
    f = from + 1;
  }
  scrollState.f = f;
  scrollState.active = Math.round(f);
  listeners.forEach((l) => l());
}

const schedule = () => {
  if (!raf) raf = requestAnimationFrame(measure);
};

export function startScrollTracking() {
  if (started) return;
  started = true;
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  // Layout can shift as fonts/images load.
  const ro = new ResizeObserver(schedule);
  ro.observe(document.body);
  schedule();
}

export const requestMeasure = schedule;

function subscribe(l: Listener) {
  listeners.add(l);
  return () => listeners.delete(l);
}

/** Index of the chapter currently in view. Re-renders only when it changes. */
export function useActiveChapter(): number {
  return useSyncExternalStore(subscribe, () => scrollState.active, () => 0);
}

/** Discrete step (0..steps-1) through a chapter, for DOM sequences. */
export function useChapterStep(id: ChapterId, steps: number, from = 0.08, to = 0.62): number {
  return useSyncExternalStore(
    subscribe,
    () => {
      const t = (scrollState.local[id] - from) / (to - from);
      return Math.min(steps - 1, Math.max(0, Math.floor(t * steps)));
    },
    () => 0,
  );
}

/** Whether a chapter's local progress has passed a threshold. */
export function useChapterPassed(id: ChapterId, threshold: number): boolean {
  return useSyncExternalStore(
    subscribe,
    () => scrollState.local[id] >= threshold,
    () => false,
  );
}

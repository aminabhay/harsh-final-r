import { useSyncExternalStore } from 'react';
import { CHAPTERS, type ChapterId } from '../config/world';

/**
 * Maps native page scroll onto the chapter timeline.
 *
 * `f` is a continuous chapter index: 2.0 means "holding on chapter 2", 2.5 means
 * "half-way travelling from chapter 2 to 3". Each section holds its camera for most of
 * its height and travels during its last TRAVEL fraction. Everything is derived from
 * scroll position alone, so fast scrolling or jumping via links can never desync state.
 */

const TRAVEL = 0.32;

export const scrollState = {
  f: 0,
  local: Object.fromEntries(CHAPTERS.map((c) => [c, 0])) as Record<ChapterId, number>,
  active: 0,
};

type Listener = () => void;
const listeners = new Set<Listener>();
let raf = 0;
let started = false;

const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

function measure() {
  raf = 0;
  const vh = window.innerHeight;
  const probe = window.scrollY + vh * 0.5;
  let f = 0;
  CHAPTERS.forEach((id, i) => {
    const el = document.querySelector<HTMLElement>(`[data-chapter="${id}"]`);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const h = Math.max(1, el.offsetHeight);
    const local = (probe - top) / h;
    scrollState.local[id] = Math.min(1, Math.max(0, local));
    if (local >= 0 && local < 1) f = i + (i < CHAPTERS.length - 1 ? smoothstep(1 - TRAVEL, 1, local) : 0);
    else if (local >= 1 && i === CHAPTERS.length - 1) f = i;
  });
  const lastEl = document.querySelector<HTMLElement>(`[data-chapter="${CHAPTERS[CHAPTERS.length - 1]}"]`);
  if (lastEl && probe > lastEl.getBoundingClientRect().top + window.scrollY + lastEl.offsetHeight) {
    f = CHAPTERS.length - 1;
  }
  scrollState.f = f;
  const active = Math.round(f);
  scrollState.active = active;
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

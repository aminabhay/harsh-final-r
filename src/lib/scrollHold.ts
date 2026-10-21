import { useEffect } from 'react';
import { motion } from './motion';
import { CHAPTERS } from '../config/world';

/**
 * If the guest scrolls faster than the journey between islands can play, hold the page
 * for a moment so the next card never slides in over a running Pari. Only applies to the
 * guest's own scrolling (wheel, touch, keys); menu links and anchors are never blocked.
 */

const HOLD_AT = 0.06; // chapters of lag before holding
const RELEASE_AT = 0.012;
const MAX_HOLD_MS = 1600; // safety valve

export function useTravelScrollHold(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    const root = document.documentElement;
    let lastInput = 0;
    let holdingSince = 0;
    let raf = 0;
    const input = () => {
      lastInput = performance.now();
    };
    const release = () => {
      holdingSince = 0;
      root.classList.remove('scroll-hold');
    };
    const tick = () => {
      const now = performance.now();
      if (!holdingSince) {
        if (motion.running && motion.lag > HOLD_AT && now - lastInput < 500) {
          holdingSince = now;
          root.classList.add('scroll-hold');
        }
      } else if (motion.lag < RELEASE_AT || !motion.running || now - holdingSince > MAX_HOLD_MS) {
        release();
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    // A single big wheel jump must not carry the page past the clear stretch of the journey
    // that is still playing: stop at its edge until Pari has arrived.
    const onWheel = (e: WheelEvent) => {
      input();
      if (motion.lag < RELEASE_AT) return;
      const from = CHAPTERS[Math.max(0, Math.floor(motion.f + 1e-3))];
      const zone = document.querySelector<HTMLElement>(`[data-travel="${from}"]`);
      if (!zone) return;
      const y = window.scrollY;
      const zs = zone.getBoundingClientRect().top + y;
      const maxY = zs + zone.offsetHeight - window.innerHeight; // next card starts entering below this
      if (e.deltaY > 0 && y + e.deltaY > maxY) {
        e.preventDefault();
        if (y < maxY) window.scrollTo(0, maxY);
      } else if (e.deltaY < 0 && y + e.deltaY < zs) {
        e.preventDefault(); // previous card would re-enter from the top
        if (y > zs) window.scrollTo(0, zs);
      }
    };
    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('touchmove', input, { passive: true });
    window.addEventListener('keydown', input);
    return () => {
      cancelAnimationFrame(raf);
      release();
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchmove', input);
      window.removeEventListener('keydown', input);
    };
  }, [enabled]);
}

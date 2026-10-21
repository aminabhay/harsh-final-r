/**
 * Written every frame by the 3D layer, read by the DOM: how far the on-screen journey
 * (camera + running Pari) lags behind the scroll position.
 */
export const motion = {
  /** |scroll progress - animated progress|, in chapters. */
  lag: 0,
  /** True while Pari is running between islands. */
  running: false,
  /** Animated chapter progress (what is on screen). */
  f: 0,
};

if (import.meta.env.DEV) (window as unknown as { __motion: typeof motion }).__motion = motion;

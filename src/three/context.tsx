import { createContext, useContext, type MutableRefObject } from 'react';

export interface WorldContextValue {
  reduced: boolean;
  tier: 'high' | 'low';
  /** True while the surrounding chapter is near the camera; used to pause idle work. */
  activeRef: MutableRefObject<boolean>;
  /** Local scroll progress (0..1) of the surrounding chapter. */
  progressRef: MutableRefObject<number>;
}

export const WorldContext = createContext<WorldContextValue>({
  reduced: false,
  tier: 'high',
  activeRef: { current: true },
  progressRef: { current: 0 },
});

export const useWorld = () => useContext(WorldContext);

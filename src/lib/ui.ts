import { useSyncExternalStore } from 'react';
import type { EventId } from '../config/events';
import type { SiteImage } from '../config/images';
import type { CharacterId } from '../config/models';

/**
 * Small shared UI store so 3D objects (tapped in the canvas) and DOM controls
 * (buttons, keyboard) open the same accessible dialogs.
 */

export type Dialog =
  | { type: 'event'; id: EventId }
  | { type: 'lightbox'; items: SiteImage[]; index: number; title?: string }
  | { type: 'maldives' }
  | null;

interface UiState {
  dialog: Dialog;
  envelopeOpen: boolean;
  /** Short-lived Pari remark, announced politely to screen readers. */
  pariLine: string | null;
  /** Increments to trigger one-off 3D reactions. */
  pariPing: number;
  footballKick: number;
  assetErrors: CharacterId[];
  webglLost: boolean;
  /** Real file counts from the three.js loading manager (null until the 3D bundle runs). */
  load: { active: boolean; loaded: number; total: number; errors: number } | null;
}

let state: UiState = {
  dialog: null,
  envelopeOpen: false,
  pariLine: null,
  pariPing: 0,
  footballKick: 0,
  assetErrors: [],
  webglLost: false,
  load: null,
};

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export const ui = {
  get: () => state,
  set(patch: Partial<UiState>) {
    state = { ...state, ...patch };
    emit();
  },
  openDialog(d: Dialog) {
    ui.set({ dialog: d });
  },
  closeDialog() {
    ui.set({ dialog: null });
  },
  pari(line: string) {
    ui.set({ pariLine: line, pariPing: state.pariPing + 1 });
  },
  kick() {
    ui.set({ footballKick: state.footballKick + 1 });
  },
  assetFailed(id: CharacterId) {
    if (!state.assetErrors.includes(id)) ui.set({ assetErrors: [...state.assetErrors, id] });
  },
};

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export function useUi<T>(select: (s: UiState) => T): T {
  return useSyncExternalStore(subscribe, () => select(state), () => select(state));
}

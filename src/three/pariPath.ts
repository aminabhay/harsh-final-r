import * as THREE from 'three';
import { CHAPTERS, islands, pariSpots, type V3 } from '../config/world';

/**
 * Pari's route through the world. Between two islands she runs from her resting spot,
 * along the paper path, to her spot on the next island. The paw prints use the same route.
 */

export type IslandId = keyof typeof islands;

export interface Segment {
  from: IslandId;
  to: IslandId;
  /** Chapter index where the journey starts; it ends at f0 + 1. */
  f0: number;
  curve: THREE.CatmullRomCurve3;
  /** Path edges (world space) where the paper path begins and ends. */
  edgeA: THREE.Vector3;
  edgeB: THREE.Vector3;
  /** Fraction of the curve's length at which the paper path starts and ends. */
  tEdgeA: number;
  tEdgeB: number;
}

const PATH_Y = -0.04;
const v = (a: V3) => new THREE.Vector3(...a);

const ROUTE: { from: IslandId; to: IslandId; f0: number }[] = [
  { from: 'invite', to: 'pitch', f0: 0 },
  { from: 'pitch', to: 'cinema', f0: 1 },
  { from: 'cinema', to: 'proposal', f0: 2 },
  { from: 'proposal', to: 'family', f0: 3 },
  { from: 'family', to: 'home', f0: 4 },
  { from: 'home', to: 'celebrations', f0: 5 },
  // "photos" has no island: Pari stays in the garden, then runs on to the RSVP.
  { from: 'celebrations', to: 'rsvp', f0: CHAPTERS.indexOf('photos') },
];

export const segments: Segment[] = ROUTE.map((r) => {
  const A = v(islands[r.from].pos);
  const B = v(islands[r.to].pos);
  const dir = B.clone().sub(A).setY(0).normalize();
  const spotA = A.clone().add(v(pariSpots[r.from].pos));
  const spotB = B.clone().add(v(pariSpots[r.to].pos));
  const edgeA = A.clone().addScaledVector(dir, islands[r.from].radius - 0.2).setY(PATH_Y);
  const edgeB = B.clone().addScaledVector(dir, -(islands[r.to].radius - 0.2)).setY(PATH_Y);
  const pts = [spotA, edgeA, edgeB, spotB];
  const curve = new THREE.CatmullRomCurve3(pts, false, 'centripetal');
  const l1 = spotA.distanceTo(edgeA);
  const l2 = edgeA.distanceTo(edgeB);
  const total = l1 + l2 + edgeB.distanceTo(spotB);
  return { ...r, curve, edgeA, edgeB, tEdgeA: l1 / total, tEdgeB: (l1 + l2) / total };
});

/** Island Pari rests on when she isn't running. */
export function restingIsland(f: number): IslandId {
  const i = Math.max(0, Math.min(CHAPTERS.length - 1, Math.round(f)));
  const id = CHAPTERS[i];
  return id === 'photos' ? 'celebrations' : id;
}

const EDGE = 0.015;

/** Running state for a (smoothed) chapter progress value. */
export function travelAt(f: number): { seg: Segment; t: number } | null {
  for (const seg of segments) {
    const t = f - seg.f0;
    if (t > EDGE && t < 1 - EDGE) return { seg, t: (t - EDGE) / (1 - 2 * EDGE) };
  }
  return null;
}

/** Shared each frame by the running Pari, the resting Paris and the paw prints. */
export const pariState = {
  /** Smoothed chapter progress Pari follows (lags the scroll like the camera does). */
  f: 0,
  running: false,
  restingAt: 'invite' as IslandId,
};

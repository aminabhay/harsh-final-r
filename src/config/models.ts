/**
 * Character model manifest.
 *
 * Source files (untouched originals): /models-source/*.glb
 * Runtime files (meshopt-compressed by `npm run models`): /public/models/*.glb
 *
 * All three models were authored together by the same builder, in metres, feet/paws on y = 0,
 * facing +Z, so they already share believable relative proportions (scale 1).
 * They are rigged and include the clips listed below; no other motions are assumed.
 */

export type CharacterId = 'harsh' | 'rimi' | 'pari';

export interface CharacterSpec {
  id: CharacterId;
  label: string;
  url: string;
  /** Uniform scale applied on top of the authored metre units. */
  scale: number;
  /** Extra yaw (radians) so the model faces +Z in our world. */
  rotationY: number;
  /** Vertical offset so feet/paws rest on the floor. */
  groundOffset: number;
  /** Authored height in metres (from the file's extras). */
  heightM: number;
  /** Radius of the soft contact shadow under the character. */
  shadowRadius: number;
  /** Clip names inside the GLB, keyed by what we use them for. */
  clips: Record<string, string>;
}

const base = import.meta.env.BASE_URL;

export const characters: Record<CharacterId, CharacterSpec> = {
  harsh: {
    id: 'harsh',
    label: 'Harsh',
    url: `${base}models/harsh.glb`,
    scale: 1,
    rotationY: 0,
    groundOffset: 0,
    heightM: 1.905,
    shadowRadius: 0.42,
    // Idle: chest + head breathing. Wave: left arm. Walk: legs + arms (only for real travel).
    clips: { idle: 'Idle', wave: 'Wave', walk: 'Walk' },
  },
  rimi: {
    id: 'rimi',
    label: 'Rimi',
    url: `${base}models/rimi.glb`,
    scale: 1,
    rotationY: 0,
    groundOffset: 0,
    heightM: 1.56,
    shadowRadius: 0.36,
    clips: { idle: 'Idle', wave: 'Wave', walk: 'Walk' },
  },
  pari: {
    id: 'pari',
    label: 'Pari',
    url: `${base}models/pari.glb`,
    scale: 1,
    rotationY: 0,
    groundOffset: 0,
    heightM: 0.7,
    shadowRadius: 0.5,
    // Idle: neck/head. TailWag: tail. Pant: jaw/tongue. LookAround: head/ear.
    // Walk / WalkHappy exist but are not used. Pari never slides across the floor;
    // a paw-print trail links the chapters instead.
    clips: {
      idle: 'Idle',
      tailWag: 'TailWag',
      pant: 'Pant',
      lookAround: 'LookAround',
      walk: 'Walk',
      walkHappy: 'WalkHappy',
    },
  },
};

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

export type CharacterId = 'harsh' | 'rimi' | 'pari' | 'harshWedding' | 'rimiWedding';

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
  /** Download at start-up (true) or only when its scene comes near (false). */
  preload: boolean;
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
    preload: true,
    // Idle: chest + head breathing. Wave: left arm. Walk: legs + arms (only for real travel).
    clips: { idle: 'Idle', wave: 'Wave', walk: 'Walk' },
  },
  rimi: {
    id: 'rimi',
    label: 'Rimi',
    url: `${base}models/rimi.glb`,
    scale: 1,
    rotationY: 0,
    groundOffset: -0.016, // v2 mesh's lowest point is 1.6 cm above y = 0
    heightM: 1.56,
    shadowRadius: 0.36,
    preload: true,
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
    preload: true,
    // Idle: neck/head. TailWag: tail. Pant: jaw/tongue. LookAround: head/ear.
    // WalkHappy (an in-place run cycle) drives Pari's runs between islands
    // (three/RunningPari.tsx); her stride follows the distance covered, so she never slides.
    // Source: character pack v3 (17 Oct 2026). Previous model kept in models-source/archive/.
    clips: {
      idle: 'Idle',
      tailWag: 'TailWag',
      pant: 'Pant',
      lookAround: 'LookAround',
      walk: 'Walk',
      walkHappy: 'WalkHappy',
    },
  },
  // Wedding outfits (builder v2, 21 Oct 2026), used only in the celebrations garden.
  // Same rigs and clips as the everyday models; loaded when that scene comes near.
  harshWedding: {
    id: 'harshWedding',
    label: 'Harsh (wedding outfit)',
    url: `${base}models/wedding-harsh.glb`,
    scale: 1,
    rotationY: 0,
    groundOffset: 0,
    heightM: 1.905,
    shadowRadius: 0.42,
    preload: false,
    clips: { idle: 'Idle', wave: 'Wave', walk: 'Walk' },
  },
  rimiWedding: {
    id: 'rimiWedding',
    label: 'Rimi (wedding outfit)',
    url: `${base}models/wedding-rimi.glb`,
    scale: 1,
    rotationY: 0,
    groundOffset: -0.014, // lowest point of this mesh is 1.4 cm above y = 0
    heightM: 1.56,
    shadowRadius: 0.4,
    preload: false,
    clips: { idle: 'Idle', wave: 'Wave', walk: 'Walk' },
  },
};

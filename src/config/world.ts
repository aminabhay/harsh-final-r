/**
 * Layout of the miniature world: one island per chapter, a camera pose per chapter
 * (separately framed for landscape and portrait screens), and the lighting mood.
 * The order of CHAPTERS must match the order of sections in the page.
 */

export const CHAPTERS = [
  'invite',
  'pitch',
  'cinema',
  'proposal',
  'family',
  'home',
  'celebrations',
  'photos',
  'rsvp',
] as const;

export type ChapterId = (typeof CHAPTERS)[number];
export type V3 = [number, number, number];

/** Island centres. Islands sit on y = 0 and are connected by a paper path with paw prints. */
export const islands: Record<Exclude<ChapterId, 'photos'>, { pos: V3; radius: number }> = {
  invite: { pos: [0, 0, 0], radius: 4.2 },
  pitch: { pos: [20, 0, -6], radius: 6 },
  cinema: { pos: [40, 0, 0], radius: 5.2 },
  proposal: { pos: [60, 0, -6], radius: 5 },
  family: { pos: [80, 0, 0], radius: 5.4 },
  home: { pos: [100, 0, -6], radius: 5.6 },
  celebrations: { pos: [122, 0, 0], radius: 8.5 },
  rsvp: { pos: [144, 0, -6], radius: 4.2 },
};

export interface Pose {
  /** Camera position relative to `anchor`. */
  pos: V3;
  /** Look-at target relative to `anchor`. */
  target: V3;
  /**
   * Shift the rendered image (fractions of the viewport) so text has negative space.
   * x > 0 moves the scene right (text panel on the left); y > 0 moves it up (text below).
   */
  shift: [number, number];
  fov: number;
}

export interface ChapterPose {
  anchor: V3;
  wide: Pose;
  tall: Pose;
}

const at = (id: keyof typeof islands) => islands[id].pos;

export const poses: Record<ChapterId, ChapterPose> = {
  invite: {
    anchor: at('invite'),
    wide: { pos: [0.4, 2.1, 7.2], target: [0.3, 1.05, 0], shift: [0.2, 0], fov: 34 },
    tall: { pos: [0.3, 3.4, 11.8], target: [0.3, 0.55, 0], shift: [0, 0.3], fov: 40 },
  },
  pitch: {
    anchor: at('pitch'),
    wide: { pos: [-1.5, 3.4, 9.5], target: [0.6, 1.0, 0], shift: [0.2, 0], fov: 36 },
    tall: { pos: [-0.8, 4.6, 13], target: [0.4, 0.6, 0], shift: [0, 0.2], fov: 42 },
  },
  cinema: {
    anchor: at('cinema'),
    wide: { pos: [1.2, 2.4, 8.4], target: [0.2, 1.4, -0.6], shift: [-0.2, 0], fov: 36 },
    tall: { pos: [0.6, 3.0, 11.5], target: [0.2, 1.1, -0.6], shift: [0, 0.2], fov: 42 },
  },
  proposal: {
    anchor: at('proposal'),
    wide: { pos: [-0.4, 1.75, 5.6], target: [0.1, 1.15, -0.2], shift: [0.2, 0], fov: 34 },
    tall: { pos: [-0.2, 2.3, 8.2], target: [0.1, 0.9, -0.2], shift: [0, 0.2], fov: 42 },
  },
  family: {
    anchor: at('family'),
    wide: { pos: [0.4, 2.3, 7.6], target: [0.1, 1.15, -0.6], shift: [-0.2, 0], fov: 38 },
    tall: { pos: [0.2, 3.4, 14.5], target: [0.1, 1.0, -0.6], shift: [0, 0.2], fov: 46 },
  },
  home: {
    anchor: at('home'),
    wide: { pos: [-1.0, 3.6, 9.4], target: [0.2, 1.1, -0.6], shift: [0.2, 0], fov: 36 },
    tall: { pos: [-0.4, 4.4, 12.8], target: [0.1, 0.9, -0.6], shift: [0, 0.2], fov: 44 },
  },
  celebrations: {
    anchor: at('celebrations'),
    wide: { pos: [0.6, 4.8, 12.4], target: [0.6, 0.8, -1.2], shift: [0.2, 0], fov: 40 },
    tall: { pos: [0, 15, 25], target: [0, 0, -1.5], shift: [0, 0.2], fov: 46 },
  },
  photos: {
    anchor: at('celebrations'),
    wide: { pos: [12, 14, 20], target: [10, 0, -3], shift: [0, 0], fov: 40 },
    tall: { pos: [12, 18, 26], target: [10, 0, -3], shift: [0, 0], fov: 46 },
  },
  rsvp: {
    anchor: at('rsvp'),
    wide: { pos: [0.6, 1.9, 6.4], target: [0.3, 0.95, 0], shift: [0.22, 0], fov: 34 },
    tall: { pos: [0.3, 2.4, 9.0], target: [0.3, 0.7, 0], shift: [0, 0.22], fov: 42 },
  },
};

/** Closer framing of the opened invitation card (blended in once the envelope opens). */
export const revealPose: { wide: Pose; tall: Pose } = {
  wide: { pos: [-0.15, 1.55, 4.3], target: [-0.4, 1.12, -0.15], shift: [0.2, 0], fov: 34 },
  tall: { pos: [-0.35, 1.95, 7.1], target: [-0.45, 0.95, -0.15], shift: [0, 0.27], fov: 40 },
};

/** Lighting + background mood per chapter (blended while travelling). */
export interface Atmosphere {
  bg: string;
  sky: string;
  ground: string;
  hemi: number;
  sun: string;
  sunIntensity: number;
  accent: string;
  accentIntensity: number;
}

export const atmospheres: Record<ChapterId, Atmosphere> = {
  invite: { bg: '#FFF4EE', sky: '#FFF6F0', ground: '#E8D4C8', hemi: 1.5, sun: '#FFE9D6', sunIntensity: 2.1, accent: '#F5C9C2', accentIntensity: 0.0 },
  // pitch is blended between `pitch` (cool lavender) and `pitchWarm` by the chapter's own progress.
  pitch: { bg: '#E6E0F2', sky: '#E2DAF5', ground: '#B9C7D6', hemi: 1.25, sun: '#D9D4FF', sunIntensity: 1.8, accent: '#C7BBF0', accentIntensity: 18 },
  cinema: { bg: '#E7DCEA', sky: '#EADDF0', ground: '#C9AFC2', hemi: 1.05, sun: '#F1DDF0', sunIntensity: 1.2, accent: '#FFE6B8', accentIntensity: 22 },
  proposal: { bg: '#F6DCD3', sky: '#FFE2D2', ground: '#D9A99A', hemi: 1.15, sun: '#FFC9A3', sunIntensity: 1.7, accent: '#FFB98A', accentIntensity: 16 },
  family: { bg: '#F2F5EC', sky: '#FFF7EC', ground: '#C9DCCB', hemi: 1.5, sun: '#FFF0DC', sunIntensity: 2.1, accent: '#FFE7C9', accentIntensity: 0 },
  home: { bg: '#FBF0EA', sky: '#FFF5EC', ground: '#E3CDBF', hemi: 1.45, sun: '#FFE8D0', sunIntensity: 1.9, accent: '#FFD9B0', accentIntensity: 8 },
  celebrations: { bg: '#F8E6EA', sky: '#FFEFF2', ground: '#D8BFC8', hemi: 1.35, sun: '#FFE1D6', sunIntensity: 1.9, accent: '#FFD6C0', accentIntensity: 10 },
  photos: { bg: '#FBEFEF', sky: '#FFF4F2', ground: '#DCC6CC', hemi: 1.4, sun: '#FFE7DC', sunIntensity: 1.9, accent: '#FFD6C0', accentIntensity: 0 },
  rsvp: { bg: '#FFF4EE', sky: '#FFF6F0', ground: '#E8D4C8', hemi: 1.5, sun: '#FFE9D6', sunIntensity: 2.1, accent: '#F5C9C2', accentIntensity: 0 },
};

export const pitchWarm: Atmosphere = {
  bg: '#F7E1E6', sky: '#FFE6EA', ground: '#D9BFC6', hemi: 1.4, sun: '#FFD9CF', sunIntensity: 2.0, accent: '#FFC9B8', accentIntensity: 16,
};

/** Local accent light position per chapter (relative to its island). */
export const accentLights: Record<ChapterId, V3> = {
  invite: [2, 3, 2],
  pitch: [-3.2, 4.5, -2.6],
  cinema: [-2.2, 2.1, 2.6],
  proposal: [0, 2.6, 1.6],
  family: [0, 3, 2],
  home: [1.6, 3.2, 0.2],
  celebrations: [0, 4, 2],
  photos: [0, 4, 2],
  rsvp: [2, 3, 2],
};

/** Where Pari rests on each island (relative to the island centre) and which way she faces. */
export const pariSpots: Record<keyof typeof islands, { pos: V3; yaw: number }> = {
  invite: { pos: [1.05, 0, 0.35], yaw: -0.55 },
  pitch: { pos: [-1.6, 0, 1.8], yaw: 0.6 },
  cinema: { pos: [0.1, 0, 1.75], yaw: 0.15 },
  proposal: { pos: [1.85, 0, 0.75], yaw: -1.25 },
  family: { pos: [0.55, 0, 1.0], yaw: -0.35 },
  home: { pos: [1.6, 0.1, 0.75], yaw: -0.75 },
  celebrations: { pos: [1.55, 0, 1.85], yaw: -0.5 },
  rsvp: { pos: [0.95, 0, 0.15], yaw: -0.5 },
};

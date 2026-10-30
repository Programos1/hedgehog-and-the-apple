import type { LevelData } from './types';

// Level 4 – Valley of Waterfalls. Built from pieces of the author's reference painting
// (docs/reference/reference_screen_1.png → tools/kits/build-valley-kit.mjs):
// start on a mossy cliff, hop across floating islands above the valley (one of them moves),
// a bonus island above the others, and the leaf shelter on the cliff at the end.
// Falling into the valley is harmless – the hedgehog comes back to the last safe spot.
const VALLEY_KIT = {
  far: 'kit-valley-far',
  mid: 'kit-valley-mid',
  island: 'kit-valley-island',
  cliff: 'kit-valley-cliff',
  rock: 'kit-valley-rock',
  shelter: 'kit-valley-shelter',
  scale: 1.8,
};

const ISLAND = 257; // island width at kit scale 1.8

export const level4: LevelData = {
  id: 4,
  nameKey: 'level4',
  theme: 'valley',
  kit: VALLEY_KIT,
  extra: true,
  width: 3760,
  start: { x: 160, y: 600 },
  ground: [
    { x: 0, w: 560, y: 660, flip: true },
    { x: 3200, w: 560, y: 660 },
  ],
  platforms: [
    { x: 680, y: 610, w: ISLAND },
    { x: 1110, y: 530, w: ISLAND },
    { x: 2320, y: 640, w: ISLAND },
    // Bonus island high above island F – reached with "jump up", out of the way of forward jumps.
    { x: 2840, y: 430, w: ISLAND },
    { x: 2780, y: 600, w: ISLAND },
  ],
  movingPlatforms: [
    // Floating island ferrying the hedgehog over the widest part of the valley.
    { x: 1520, y: 580, w: ISLAND, dx: 380, dy: 0, speed: 110, wait: 1.8 },
  ],
  apples: [
    { x: 420, y: 634, worm: true },
    { x: 1240, y: 504, worm: false },
    { x: 2410, y: 614, worm: true },
    { x: 2970, y: 404, worm: true },
    { x: 3330, y: 634, worm: true },
  ],
  leaves: [
    { x: 810, y: 590 },
    { x: 2530, y: 620 },
    { x: 2910, y: 580 },
  ],
  shelter: { x: 3520, y: 660 },
  cones: [],
  hints: [],
  factId: 'insectivore',
};

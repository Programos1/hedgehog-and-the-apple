import type { LevelData } from './types';

// Level 2 – Forest Path. More gaps, a raised step, a floating leaf raft and the first healthy apple.
export const level2: LevelData = {
  id: 2,
  nameKey: 'level2',
  theme: 'forest',
  width: 5400,
  start: { x: 180, y: 840 },
  ground: [
    { x: 0, w: 1100 },
    { x: 1280, w: 700 },
    { x: 1980, w: 520, y: 820 },
    { x: 2500, w: 300 },
    { x: 3420, w: 1980 },
  ],
  platforms: [
    { x: 600, y: 740, w: 260 },
    { x: 1500, y: 740, w: 240 },
    { x: 1560, y: 580, w: 220 },
  ],
  movingPlatforms: [
    // Leaf raft across the stream; waits at each bank.
    { x: 2800, y: 900, w: 220, dx: 400, dy: 0, speed: 110, wait: 1.8 },
  ],
  apples: [
    { x: 730, y: 714, worm: true },
    { x: 960, y: 874, worm: false },
    { x: 1670, y: 554, worm: true },
    { x: 2250, y: 794, worm: true },
    { x: 3700, y: 874, worm: true },
  ],
  leaves: [
    { x: 300, y: 880 },
    { x: 2400, y: 800 },
    { x: 3950, y: 880 },
  ],
  shelter: { x: 4750, y: 900 },
  cones: [],
  hints: [{ x: 2700, y: 760, icon: 'right' }],
  factId: 'notApples',
};

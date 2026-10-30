import type { LevelData } from './types';

// Level 1 – Sunny Meadow. Tutorial: walk, jump up, jump forward, eat larvae, build the nest.
// Every apple hides a larva. Gaps are short and forgiving.
export const level1: LevelData = {
  id: 1,
  nameKey: 'level1',
  theme: 'meadow',
  width: 3800,
  start: { x: 200, y: 840 },
  ground: [
    { x: 0, w: 1560 },
    { x: 1700, w: 2100 },
  ],
  platforms: [
    { x: 880, y: 740, w: 300 },
    { x: 2350, y: 740, w: 300 },
  ],
  movingPlatforms: [],
  apples: [
    { x: 560, y: 874, worm: true },
    { x: 1030, y: 714, worm: true },
    { x: 2500, y: 714, worm: true },
  ],
  leaves: [
    { x: 2950, y: 880 },
    { x: 3550, y: 880 },
  ],
  shelter: { x: 3250, y: 900 },
  cones: [],
  hints: [
    { x: 330, y: 760, icon: 'right' },
    { x: 1030, y: 600, icon: 'jumpUp' },
    { x: 1460, y: 760, icon: 'jumpForward' },
    { x: 2950, y: 760, icon: 'leaf' },
  ],
  factId: 'insectivore',
};

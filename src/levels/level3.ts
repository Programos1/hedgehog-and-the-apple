import type { LevelData } from './types';

// Level 3 – Rocky Valley. Vertical climbing, a stone lift and falling pine cones (harmless: the hedgehog curls up).
export const level3: LevelData = {
  id: 3,
  nameKey: 'level3',
  theme: 'valley',
  width: 5600,
  start: { x: 180, y: 840 },
  ground: [
    { x: 0, w: 900 },
    { x: 1120, w: 920 },
    { x: 2040, w: 700, y: 580 },
    { x: 2980, w: 760 },
    { x: 3740, w: 1860 },
  ],
  platforms: [
    { x: 400, y: 740, w: 240 },
    { x: 480, y: 580, w: 220 },
    { x: 560, y: 420, w: 200 },
    { x: 3150, y: 740, w: 240 },
    { x: 3230, y: 580, w: 220 },
  ],
  movingPlatforms: [
    // Stone lift up to the high cliff; waits at the bottom and the top.
    { x: 1820, y: 900, w: 200, dx: 0, dy: -320, speed: 90, wait: 2 },
  ],
  apples: [
    { x: 520, y: 714, worm: true },
    { x: 660, y: 394, worm: true },
    { x: 1400, y: 874, worm: false },
    { x: 2300, y: 554, worm: true },
    { x: 2600, y: 554, worm: false },
    { x: 3340, y: 554, worm: true },
    { x: 3950, y: 874, worm: true },
  ],
  leaves: [
    { x: 4300, y: 880 },
    { x: 5100, y: 880 },
    { x: 5400, y: 880 },
  ],
  shelter: { x: 4750, y: 900 },
  cones: [
    { x: 1500, interval: 3.2 },
    { x: 3600, interval: 3.6 },
  ],
  hints: [{ x: 2620, y: 440, icon: 'jumpForward' }],
  factId: 'curlUp',
};

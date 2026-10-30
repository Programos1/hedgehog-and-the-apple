import type { LevelData } from './types';

// Test of a painted level: background = docs/reference/reference_screen_1.png,
// walkable lines traced from the blue marks in docs/reference/scena-test-oznacena.png:
//   node tools/trace-level.mjs docs/reference/reference_screen_1.png docs/reference/scena-test-oznacena.png
//        public/assets/levels/test-scene.png --cropBottom=392 --patches=tools/levels/test-scene.patches.json
// Items sit where the picture showed them. The painting is 2.755x upscaled, so the hedgehog
// (and its jumps) is drawn 1.6x bigger to match the painted proportions.
export const testScene: LevelData = {
  id: 99,
  nameKey: 'testScene',
  theme: 'meadow',
  extra: true,
  painted: { key: 'scene-test', view: 'whole' },
  worldScale: 1.6,
  width: 2683,
  start: { x: 661, y: 520 },
  ground: [],
  surfaces: [
    { points: [[0, 567], [262, 574], [609, 622], [766, 638], [986, 641], [1086, 628], [1149, 610], [1171, 616], [1204, 636]] },
    { points: [[1303, 450], [1328, 391], [1358, 387], [1521, 387], [1626, 397], [1656, 405], [1722, 454]] },
    { points: [[1860, 549], [1893, 538], [2149, 539], [2204, 533], [2681, 539]] },
  ],
  platforms: [],
  movingPlatforms: [],
  apples: [
    { x: 1033, y: 609, worm: true },
    { x: 1576, y: 366, worm: true },
    { x: 2102, y: 513, worm: true },
  ],
  leaves: [
    { x: 400, y: 573 },
    { x: 1440, y: 367 },
  ],
  shelter: { x: 2466, y: 539 },
  shelterPainted: true,
  cones: [],
  hints: [],
  factId: 'notApples',
};

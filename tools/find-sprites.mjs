// Lists the bounding boxes of all larger drawings on a sprite reference sheet with a plain background.
// Usage: node tools/find-sprites.mjs docs/reference/jezek.ikony.png [minArea]
// The printed boxes are then named in tools/sprites.config.json and cut by tools/slice-sprites.mjs.

import fs from 'node:fs';
import { PNG } from 'pngjs';
import { backgroundColor, foregroundMask } from './sprite-utils.mjs';

const [, , file, minAreaArg] = process.argv;
const minArea = Number(minAreaArg ?? 2500);
const png = PNG.sync.read(fs.readFileSync(file));
const bg = backgroundColor(png);
const mask = foregroundMask(png, bg, 40);
const { width: w, height: h } = png;

// Dilate a little so a hedgehog's spikes and body join into one blob.
const R = 4;
const dil = new Uint8Array(w * h);
for (let y = 0; y < h; y++)
  for (let x = 0; x < w; x++) {
    if (!mask[y * w + x]) continue;
    for (let dy = -R; dy <= R; dy++)
      for (let dx = -R; dx <= R; dx++) {
        const nx = x + dx, ny = y + dy;
        if (nx >= 0 && ny >= 0 && nx < w && ny < h) dil[ny * w + nx] = 1;
      }
  }

const seen = new Int32Array(w * h).fill(-1);
const boxes = [];
for (let i = 0; i < w * h; i++) {
  if (!dil[i] || seen[i] >= 0) continue;
  const stack = [i];
  seen[i] = boxes.length;
  let x0 = w, y0 = h, x1 = 0, y1 = 0, area = 0;
  while (stack.length) {
    const p = stack.pop();
    const x = p % w, y = (p / w) | 0;
    if (mask[p]) area++;
    if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
    for (const q of [p - 1, p + 1, p - w, p + w]) {
      if (q < 0 || q >= w * h || seen[q] >= 0 || !dil[q]) continue;
      if (Math.abs((q % w) - x) > 1) continue;
      seen[q] = boxes.length;
      stack.push(q);
    }
  }
  boxes.push({ x: x0, y: y0, w: x1 - x0 + 1, h: y1 - y0 + 1, area });
}

console.log('background', bg);
boxes
  .filter((b) => b.area >= minArea)
  .sort((a, b) => (Math.abs(a.y - b.y) > 60 ? a.y - b.y : a.x - b.x))
  .forEach((b) => console.log(JSON.stringify(b)));

// Cuts a foreground element (rock, island, leaf pile…) out of a painted scene where the background
// is a hazy, lighter, bluer landscape. A pixel is foreground when it is clearly warmer / greener /
// darker than the haze. The biggest connected blob inside the rectangle is kept, holes are filled,
// edges get 1 px of softness.
//
// Usage: node tools/cut-region.mjs <scene.png> <out.png> x y w h [--erase=x,y,w,h;...] [--keepTop=y] [--flip]
//   --erase   rectangles (scene coordinates) to remove from the element (e.g. a painted apple)
//   --flip    mirror horizontally
//   --warmOnly  keep only warm colours (leaves, wood, rock) – drops green background trees

import fs from 'node:fs';
import { PNG } from 'pngjs';

const [, , input, output, ...rest] = process.argv;
const nums = rest.filter((a) => !a.startsWith('--')).map(Number);
const opt = Object.fromEntries(rest.filter((a) => a.startsWith('--')).map((o) => o.replace(/^--/, '').split('=')));
const [rx, ry, rw, rh] = nums;
const src = PNG.sync.read(fs.readFileSync(input));

const erase = (opt.erase ?? '')
  .split(';')
  .filter(Boolean)
  .map((r) => r.split(',').map(Number));

const n = rw * rh;
const fg = new Uint8Array(n);
for (let y = 0; y < rh; y++)
  for (let x = 0; x < rw; x++) {
    const sx = rx + x, sy = ry + y;
    if (erase.some(([ex, ey, ew, eh]) => sx >= ex && sx < ex + ew && sy >= ey && sy < ey + eh)) continue;
    const i = (sy * src.width + sx) * 4;
    const r = src.data[i], g = src.data[i + 1], b = src.data[i + 2];
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    const sat = max ? (max - min) / max : 0;
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    const warm = r - b; // rocks, leaves, wood
    const green = g - b; // moss, grass
    const haze = (b >= r - 8 && sat < 0.45) || (lum > 175 && sat < 0.3) || (opt.warmOnly !== undefined && sat < 0.42);
    const keepGreen = opt.warmOnly === undefined;
    fg[y * rw + x] = !haze && (warm > 35 || (keepGreen && green > 45) || (lum < 70 && sat > 0.25)) && (keepGreen || warm > 25) ? 1 : 0;
  }

// Close small gaps (dilate then erode by 1) so mossy edges stay connected.
const morph = (m, val) => {
  const out = new Uint8Array(n);
  for (let y = 0; y < rh; y++)
    for (let x = 0; x < rw; x++) {
      let hit = val === 1 ? 0 : 1;
      for (let dy = -1; dy <= 1; dy++)
        for (let dx = -1; dx <= 1; dx++) {
          const nx = x + dx, ny = y + dy;
          const v = nx < 0 || ny < 0 || nx >= rw || ny >= rh ? 0 : m[ny * rw + nx];
          if (val === 1 && v) hit = 1;
          if (val === 0 && !v) hit = 0;
        }
      out[y * rw + x] = hit;
    }
  return out;
};
let mask = morph(morph(fg, 1), 0);

// Largest blob only.
const label = new Int32Array(n).fill(-1);
let best = -1, bestSize = 0;
for (let p = 0, id = 0; p < n; p++) {
  if (!mask[p] || label[p] >= 0) continue;
  const st = [p];
  label[p] = id;
  let size = 0;
  while (st.length) {
    const q = st.pop();
    size++;
    const x = q % rw;
    for (const r of [q - 1, q + 1, q - rw, q + rw]) {
      if (r < 0 || r >= n || label[r] >= 0 || !mask[r]) continue;
      if (Math.abs((r % rw) - x) > 1) continue;
      label[r] = id;
      st.push(r);
    }
  }
  if (size > bestSize) [best, bestSize] = [id, size];
  id++;
}
for (let p = 0; p < n; p++) mask[p] = label[p] === best ? 1 : 0;

// Fill holes: background not reachable from the border becomes foreground.
const outside = new Uint8Array(n);
const st = [];
for (let x = 0; x < rw; x++) st.push(x, (rh - 1) * rw + x);
for (let y = 0; y < rh; y++) st.push(y * rw, y * rw + rw - 1);
while (st.length) {
  const p = st.pop();
  if (outside[p] || mask[p]) continue;
  outside[p] = 1;
  const x = p % rw;
  if (x > 0) st.push(p - 1);
  if (x < rw - 1) st.push(p + 1);
  if (p >= rw) st.push(p - rw);
  if (p < n - rw) st.push(p + rw);
}
for (let p = 0; p < n; p++) if (!outside[p]) mask[p] = 1;

// Write (soft 1 px edge), trimmed, optionally mirrored.
let x0 = rw, y0 = rh, x1 = 0, y1 = 0;
for (let p = 0; p < n; p++)
  if (mask[p]) {
    const x = p % rw, y = (p / rw) | 0;
    x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y);
  }
const ow = x1 - x0 + 1, oh = y1 - y0 + 1;
const out = new PNG({ width: ow, height: oh });
out.data.fill(0);
for (let y = 0; y < oh; y++)
  for (let x = 0; x < ow; x++) {
    const p = (y + y0) * rw + (x + x0);
    let a = mask[p] ? 1 : 0;
    if (a) {
      let edge = 0;
      for (const q of [p - 1, p + 1, p - rw, p + rw]) if (q < 0 || q >= n || !mask[q]) edge++;
      if (edge >= 2) a = 0.55;
    }
    const si = ((ry + y + y0) * src.width + (rx + x + x0)) * 4;
    const dx = opt.flip !== undefined ? ow - 1 - x : x;
    const d = (y * ow + dx) * 4;
    for (let k = 0; k < 3; k++) out.data[d + k] = src.data[si + k];
    out.data[d + 3] = Math.round(a * 255);
  }
fs.writeFileSync(output, PNG.sync.write(out));
console.log(`Wrote ${output} (${ow}x${oh}), source box ${rx + x0},${ry + y0} ${ow}x${oh}`);

// Cuts a single outlined object (e.g. the apple) out of a painted, busy background.
// The object must have a dark outline: the background is flood-filled from the image border and
// the fill stops at the outline; what stays connected to the object centre is kept.
//
// Usage: node tools/cut-object.mjs <input.png> <output.png> [--dark=90] [--bite=output-bitten.png]
//   --dark   luminance below which a pixel counts as outline (raise if the background leaks in)
//   --bite   also writes a bitten version (round bite on the right with apple flesh showing)

import fs from 'node:fs';
import { PNG } from 'pngjs';

const [, , input, output, ...opts] = process.argv;
const opt = Object.fromEntries(opts.map((o) => o.replace(/^--/, '').split('=')));
const DARK = Number(opt.dark ?? 90);

const src = PNG.sync.read(fs.readFileSync(input));
const { width: w, height: h, data } = src;
const lum = (p) => 0.299 * data[p * 4] + 0.587 * data[p * 4 + 1] + 0.114 * data[p * 4 + 2];
const isOutline = (p) => lum(p) < DARK;

// 1) Flood the background from the border, blocked by outline pixels.
const bg = new Uint8Array(w * h);
const stack = [];
for (let x = 0; x < w; x++) stack.push(x, (h - 1) * w + x);
for (let y = 0; y < h; y++) stack.push(y * w, y * w + w - 1);
while (stack.length) {
  const p = stack.pop();
  if (bg[p] || isOutline(p)) continue;
  bg[p] = 1;
  const x = p % w;
  if (x > 0) stack.push(p - 1);
  if (x < w - 1) stack.push(p + 1);
  if (p >= w) stack.push(p - w);
  if (p < w * h - w) stack.push(p + w);
}

// 2) Keep the non-background region connected to the centre (drops dark background specks).
const keep = new Uint8Array(w * h);
const c = ((h / 2) | 0) * w + ((w / 2) | 0);
const st = [c];
while (st.length) {
  const p = st.pop();
  if (keep[p] || bg[p]) continue;
  keep[p] = 1;
  const x = p % w;
  if (x > 0) st.push(p - 1);
  if (x < w - 1) st.push(p + 1);
  if (p >= w) st.push(p - w);
  if (p < w * h - w) st.push(p + w);
}

// 3) Trim and write with a soft 1 px edge.
let x0 = w, y0 = h, x1 = 0, y1 = 0;
for (let p = 0; p < w * h; p++)
  if (keep[p]) {
    const x = p % w, y = (p / w) | 0;
    x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y);
  }
const P = 2;
const ow = x1 - x0 + 1 + 2 * P, oh = y1 - y0 + 1 + 2 * P;
const out = new PNG({ width: ow, height: oh });
out.data.fill(0);
for (let y = 0; y < oh; y++)
  for (let x = 0; x < ow; x++) {
    const sx = x + x0 - P, sy = y + y0 - P;
    if (sx < 0 || sy < 0 || sx >= w || sy >= h) continue;
    const p = sy * w + sx;
    let a = keep[p] ? 1 : 0;
    if (!a) {
      // soft edge: background pixel touching the object gets partial alpha
      let n = 0;
      for (const q of [p - 1, p + 1, p - w, p + w]) if (q >= 0 && q < w * h && keep[q]) n++;
      if (n >= 2 && isOutline(p)) a = 0.5;
    }
    const d = (y * ow + x) * 4;
    for (let k = 0; k < 3; k++) out.data[d + k] = data[p * 4 + k];
    out.data[d + 3] = Math.round(a * 255);
  }
fs.writeFileSync(output, PNG.sync.write(out));
console.log(`Wrote ${output} (${ow}x${oh})`);

// 4) Optional bitten version: a round bite on the right side, cream flesh with a darker rim.
if (opt.bite) {
  const b = new PNG({ width: ow, height: oh });
  out.data.copy(b.data);
  // Find the object's right edge on the middle row of its body.
  const cy = Math.round(oh * 0.58);
  let right = ow - 1;
  while (right > 0 && b.data[(cy * ow + right) * 4 + 3] < 128) right--;
  const r = ow * 0.26;
  const bx = right + r * 0.35, by = cy;
  const FLESH = [248, 236, 196], RIM = [214, 190, 140], SEED = [92, 58, 34];
  for (let y = 0; y < oh; y++)
    for (let x = 0; x < ow; x++) {
      const i = (y * ow + x) * 4;
      if (b.data[i + 3] === 0) continue;
      const dist = Math.hypot(x - bx, y - by);
      if (dist < r) b.data[i + 3] = 0;
      else if (dist < r + 2.2) [b.data[i], b.data[i + 1], b.data[i + 2]] = [70, 40, 30];
      else if (dist < r + 9) {
        const col = dist < r + 4 ? RIM : FLESH;
        [b.data[i], b.data[i + 1], b.data[i + 2]] = col;
      }
    }
  // Two seeds peeking out of the flesh
  for (const [sx, sy] of [[bx - r - 5, by - 5], [bx - r - 5, by + 5]])
    for (let y = -3; y <= 3; y++)
      for (let x = -2; x <= 2; x++) {
        if ((x * x) / 4 + (y * y) / 9 > 1) continue;
        const px = Math.round(sx + x), py = Math.round(sy + y);
        const i = (py * ow + px) * 4;
        if (px >= 0 && py >= 0 && px < ow && py < oh && b.data[i + 3]) [b.data[i], b.data[i + 1], b.data[i + 2]] = SEED;
      }
  fs.writeFileSync(opt.bite, PNG.sync.write(b));
  console.log(`Wrote ${opt.bite}`);
}

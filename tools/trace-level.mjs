// Turns an annotated painted scene into walkable surfaces for a level.
//
// Input: the clean painting and the same painting with annotations drawn on top.
//   BLUE lines = outline of things the hedgehog walks on. The TOP edge of every blue shape
//   becomes a walkable surface (sides and bottom are ignored).
//   (Red marks for items are read by eye and written into the level file by hand.)
//
// Usage:
//   node tools/trace-level.mjs <clean.png> <annotated.png> <out-background.png> [--cropBottom=392] [--height=1080] [--patches=p.json]
//
// Prints the surfaces as JSON polylines in GAME coordinates (image scaled to --height px tall),
// ready to paste into a level file, and writes the cropped clean background.

import fs from 'node:fs';
import { PNG } from 'pngjs';

const [, , cleanPath, annotatedPath, outBg, ...opts] = process.argv;
const opt = Object.fromEntries(opts.map((o) => o.replace(/^--/, '').split('=')));
const clean = PNG.sync.read(fs.readFileSync(cleanPath));
const ann = PNG.sync.read(fs.readFileSync(annotatedPath));
const W = clean.width;
const H = Number(opt.cropBottom ?? clean.height);
const gameH = Number(opt.height ?? 1080);
const scale = gameH / H;

// Annotation = pixel that differs from the clean image and is clearly blue.
const isBlue = (i) => {
  const r = ann.data[i], g = ann.data[i + 1], b = ann.data[i + 2];
  const d = Math.abs(r - clean.data[i]) + Math.abs(g - clean.data[i + 1]) + Math.abs(b - clean.data[i + 2]);
  return d > 60 && b - r > 80 && b - g > 40;
};
const mask = new Uint8Array(W * H);
for (let p = 0; p < W * H; p++) mask[p] = isBlue(p * 4) ? 1 : 0;

// Connected blue shapes (8-connectivity, small gaps bridged).
const label = new Int32Array(W * H).fill(-1);
const shapes = [];
for (let p = 0; p < W * H; p++) {
  if (!mask[p] || label[p] >= 0) continue;
  const id = shapes.length;
  const st = [p];
  label[p] = id;
  let n = 0;
  while (st.length) {
    const q = st.pop();
    n++;
    const x = q % W, y = (q / W) | 0;
    for (let dy = -3; dy <= 3; dy++)
      for (let dx = -3; dx <= 3; dx++) {
        const nx = x + dx, ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
        const r = ny * W + nx;
        if (mask[r] && label[r] < 0) {
          label[r] = id;
          st.push(r);
        }
      }
  }
  shapes.push(n);
}

// Top edge of each shape: for every column the highest blue pixel.
const surfaces = [];
shapes.forEach((size, id) => {
  if (size < 40) return;
  const top = new Map();
  for (let p = 0; p < W * H; p++) {
    if (label[p] !== id) continue;
    const x = p % W, y = (p / W) | 0;
    if (!top.has(x) || y < top.get(x)) top.set(x, y);
  }
  const xs = [...top.keys()].sort((a, b) => a - b);
  // Smooth (moving average) so the hedgehog walks without bumps; +1.5 px = centre of the drawn line.
  const pts = xs.map((x, i) => {
    const win = xs.slice(Math.max(0, i - 4), i + 5).map((k) => top.get(k));
    return [x, win.reduce((a, b) => a + b, 0) / win.length + 1.5];
  });
  surfaces.push(simplify(pts, 1.2).map(([x, y]) => [Math.round(x * scale), Math.round(y * scale)]));
});
surfaces.sort((a, b) => a[0][0] - b[0][0]);

// Ramer–Douglas–Peucker polyline simplification.
function simplify(pts, eps) {
  if (pts.length < 3) return pts;
  const [a, b] = [pts[0], pts[pts.length - 1]];
  let idx = 0, dmax = 0;
  for (let i = 1; i < pts.length - 1; i++) {
    const [x, y] = pts[i];
    const d = Math.abs((b[1] - a[1]) * x - (b[0] - a[0]) * y + b[0] * a[1] - b[1] * a[0]) / Math.hypot(b[1] - a[1], b[0] - a[0]);
    if (d > dmax) [dmax, idx] = [d, i];
  }
  if (dmax <= eps) return [a, b];
  return [...simplify(pts.slice(0, idx + 1), eps).slice(0, -1), ...simplify(pts.slice(idx), eps)];
}

// Cropped clean background.
const bg = new PNG({ width: W, height: H });
clean.data.copy(bg.data, 0, 0, W * H * 4);

// Optional clone-stamp patches that hide painted things the game draws itself (characters, items, UI):
// --patches=file.json with [{ "rect": [x, y, w, h], "from": [dx, dy] }, ...] – copies pixels from
// (x+dx, y+dy) of the clean image, with a soft 6 px blend at the patch border.
// { "rect": [...], "inpaint": true } fills the area smoothly from its surroundings instead.
if (opt.patches) {
  for (const { rect, from, inpaint } of JSON.parse(fs.readFileSync(opt.patches, 'utf8'))) {
    const [rx, ry, rw, rh] = rect;
    if (inpaint) {
      // { "rect": [...], "inpaint": true } – smooth fill from the surrounding colours (for busy areas).
      // Start from the average border colour, then relax towards a smooth blend of the surroundings.
      const border = [0, 0, 0];
      let n = 0;
      for (let x = rx - 1; x <= rx + rw; x++)
        for (const y of [ry - 1, ry + rh]) {
          if (x < 0 || y < 0 || x >= W || y >= H) continue;
          for (let k = 0; k < 3; k++) border[k] += bg.data[(y * W + x) * 4 + k];
          n++;
        }
      for (let y = ry; y < ry + rh; y++)
        for (const x of [rx - 1, rx + rw]) {
          if (x < 0 || y < 0 || x >= W || y >= H) continue;
          for (let k = 0; k < 3; k++) border[k] += bg.data[(y * W + x) * 4 + k];
          n++;
        }
      for (let y = Math.max(0, ry); y < Math.min(H, ry + rh); y++)
        for (let x = Math.max(0, rx); x < Math.min(W, rx + rw); x++)
          for (let k = 0; k < 3; k++) bg.data[(y * W + x) * 4 + k] = border[k] / n;
      for (let it = 0; it < 2500; it++)
        for (let y = Math.max(1, ry); y < Math.min(H - 1, ry + rh); y++)
          for (let x = Math.max(1, rx); x < Math.min(W - 1, rx + rw); x++) {
            const d = (y * W + x) * 4;
            for (let k = 0; k < 3; k++)
              bg.data[d + k] = (bg.data[d - 4 + k] + bg.data[d + 4 + k] + bg.data[d - W * 4 + k] + bg.data[d + W * 4 + k]) / 4;
          }
      continue;
    }
    const F = 6;
    for (let y = ry; y < ry + rh; y++)
      for (let x = rx; x < rx + rw; x++) {
        const sx = x + from[0], sy = y + from[1];
        if (x < 0 || y < 0 || x >= W || y >= H || sx < 0 || sy < 0 || sx >= W || sy >= H) continue;
        const edge = Math.min(x - rx, rx + rw - 1 - x, y - ry, ry + rh - 1 - y);
        const t = Math.min(1, (edge + 1) / F);
        const d = (y * W + x) * 4, s = (sy * W + sx) * 4;
        for (let k = 0; k < 3; k++) bg.data[d + k] = Math.round(clean.data[s + k] * t + clean.data[d + k] * (1 - t));
      }
  }
}
fs.writeFileSync(outBg, PNG.sync.write(bg));

console.log(`// background ${outBg}: ${W}x${H}, scale ${scale.toFixed(3)} → world ${Math.round(W * scale)}x${gameH}`);
console.log(JSON.stringify(surfaces.map((points) => ({ points }))));

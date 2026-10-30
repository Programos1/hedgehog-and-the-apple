// Cuts named frames out of a sprite reference sheet with a plain background and packs them into a
// Phaser texture atlas (PNG + JSON hash) with a transparent background.
//
// Usage: node tools/slice-sprites.mjs tools/nibbles.sprites.json
//
// Config format (see tools/nibbles.sprites.json):
//   source:  path to the sheet
//   output:  output path without extension (writes .png and .json)
//   cellGroup frames ("group": "hog") are placed into equal-sized cells, aligned bottom-centre,
//   so animations don't jitter. Other frames keep their own size.
//   mode "largest" keeps only the main drawing (drops dust, motion lines, separate apples);
//   mode "all" keeps everything in the box (e.g. dizzy stars).

import fs from 'node:fs';
import path from 'node:path';
import { PNG } from 'pngjs';
import { backgroundColor, colorDistance } from './sprite-utils.mjs';

const config = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const sheet = PNG.sync.read(fs.readFileSync(config.source));
const bg = backgroundColor(sheet);
const T0 = config.alphaFrom ?? 16; // distance from background where a pixel starts to be visible
const T1 = config.alphaTo ?? 55; // distance where it is fully opaque

function cut(frame) {
  const [bx, by, bw, bh] = frame.box;
  const n = bw * bh;
  const dist = new Float32Array(n);
  for (let y = 0; y < bh; y++)
    for (let x = 0; x < bw; x++) dist[y * bw + x] = colorDistance(sheet.data, ((by + y) * sheet.width + (bx + x)) * 4, bg);

  // Background = background-like pixels reachable from the box border. Enclosed light pixels
  // (eye highlights, light fur) stay opaque.
  const outside = new Uint8Array(n);
  const stack = [];
  for (let x = 0; x < bw; x++) stack.push(x, (bh - 1) * bw + x);
  for (let y = 0; y < bh; y++) stack.push(y * bw, y * bw + bw - 1);
  while (stack.length) {
    const p = stack.pop();
    if (outside[p] || dist[p] >= T1) continue;
    outside[p] = 1;
    const x = p % bw;
    if (x > 0) stack.push(p - 1);
    if (x < bw - 1) stack.push(p + 1);
    if (p >= bw) stack.push(p - bw);
    if (p < n - bw) stack.push(p + bw);
  }
  const alpha = new Float32Array(n);
  for (let p = 0; p < n; p++) alpha[p] = outside[p] ? Math.min(1, Math.max(0, (dist[p] - T0) / (T1 - T0))) : 1;

  // Connected components of clearly visible pixels (8-connectivity).
  const label = new Int32Array(n).fill(-1);
  const sizes = [];
  for (let p = 0; p < n; p++) {
    if (label[p] >= 0 || alpha[p] < 0.5) continue;
    const id = sizes.length;
    let size = 0;
    const st = [p];
    label[p] = id;
    while (st.length) {
      const q = st.pop();
      size++;
      const qx = q % bw, qy = (q / bw) | 0;
      for (let dy = -1; dy <= 1; dy++)
        for (let dx = -1; dx <= 1; dx++) {
          const nx = qx + dx, ny = qy + dy;
          if (nx < 0 || ny < 0 || nx >= bw || ny >= bh) continue;
          const r = ny * bw + nx;
          if (label[r] < 0 && alpha[r] >= 0.5) {
            label[r] = id;
            st.push(r);
          }
        }
    }
    sizes.push(size);
  }
  const main = sizes.indexOf(Math.max(...sizes));
  const keep = (id) => (frame.mode === 'all' ? sizes[id] >= 12 : id === main);

  // Soft edge pixels (alpha < 0.5) belong to whichever kept component is next to them.
  const kept = new Uint8Array(n);
  for (let p = 0; p < n; p++) if (label[p] >= 0 && keep(label[p])) kept[p] = 1;
  const near = new Uint8Array(n);
  for (let p = 0; p < n; p++) {
    if (!kept[p]) continue;
    const x = p % bw, y = (p / bw) | 0;
    for (let dy = -2; dy <= 2; dy++)
      for (let dx = -2; dx <= 2; dx++) {
        const nx = x + dx, ny = y + dy;
        if (nx >= 0 && ny >= 0 && nx < bw && ny < bh) near[ny * bw + nx] = 1;
      }
  }

  let x0 = bw, y0 = bh, x1 = -1, y1 = -1;
  const out = new Uint8ClampedArray(n * 4);
  for (let p = 0; p < n; p++) {
    const a = kept[p] ? 1 : near[p] && label[p] < 0 ? alpha[p] : 0;
    if (a <= 0.02) continue;
    const si = ((by + ((p / bw) | 0)) * sheet.width + (bx + (p % bw))) * 4;
    // Remove the background tint from semi-transparent edge pixels.
    for (let k = 0; k < 3; k++) out[p * 4 + k] = a >= 1 ? sheet.data[si + k] : (sheet.data[si + k] - bg[k] * (1 - a)) / a;
    out[p * 4 + 3] = Math.round(a * 255);
    const x = p % bw, y = (p / bw) | 0;
    if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
  }
  const w = x1 - x0 + 1, h = y1 - y0 + 1;
  const pixels = new Uint8ClampedArray(w * h * 4);
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const s = ((y0 + y) * bw + (x0 + x)) * 4, d = (y * w + x) * 4;
      for (let k = 0; k < 4; k++) pixels[d + k] = out[s + k];
    }
  return { name: frame.name, group: frame.group, w, h, pixels };
}

const frames = config.frames.map(cut);

// Equal cells for animation frames, bottom-centre aligned.
const pad = 2;
const groupCell = {};
for (const f of frames) {
  if (!f.group) continue;
  const c = (groupCell[f.group] ??= { w: 0, h: 0 });
  c.w = Math.max(c.w, f.w);
  c.h = Math.max(c.h, f.h);
}
for (const f of frames) {
  const c = f.group ? groupCell[f.group] : f;
  f.cw = c.w;
  f.ch = c.h;
  f.ox = Math.floor((c.w - f.w) / 2);
  f.oy = c.h - f.h;
}

// Simple shelf packing.
const atlasW = config.atlasWidth ?? 1024;
let cx = 0, cy = 0, rowH = 0;
for (const f of [...frames].sort((a, b) => b.ch - a.ch)) {
  if (cx + f.cw + pad > atlasW) {
    cx = 0;
    cy += rowH + pad;
    rowH = 0;
  }
  f.ax = cx;
  f.ay = cy;
  cx += f.cw + pad;
  rowH = Math.max(rowH, f.ch);
}
const atlasH = cy + rowH;
const atlas = new PNG({ width: atlasW, height: atlasH });
atlas.data.fill(0);
for (const f of frames)
  for (let y = 0; y < f.h; y++)
    for (let x = 0; x < f.w; x++) {
      const s = (y * f.w + x) * 4;
      const d = ((f.ay + f.oy + y) * atlasW + (f.ax + f.ox + x)) * 4;
      for (let k = 0; k < 4; k++) atlas.data[d + k] = f.pixels[s + k];
    }

const json = {
  frames: Object.fromEntries(
    frames.map((f) => [
      f.name,
      {
        frame: { x: f.ax, y: f.ay, w: f.cw, h: f.ch },
        rotated: false,
        trimmed: false,
        spriteSourceSize: { x: 0, y: 0, w: f.cw, h: f.ch },
        sourceSize: { w: f.cw, h: f.ch },
      },
    ]),
  ),
  meta: { image: path.basename(config.output) + '.png', size: { w: atlasW, h: atlasH }, scale: '1', source: config.source },
};

fs.mkdirSync(path.dirname(config.output), { recursive: true });
fs.writeFileSync(config.output + '.png', PNG.sync.write(atlas));
fs.writeFileSync(config.output + '.json', JSON.stringify(json, null, 1));
console.log(`Wrote ${config.output}.png (${atlasW}x${atlasH}) with ${frames.length} frames; cells:`, groupCell);

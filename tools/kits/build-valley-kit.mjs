// Builds the "valley" asset kit from the author's reference scene (docs/reference/reference_screen_1.png):
// parallax background layers + platform pieces + shelter, written to public/assets/kits/valley/.
// Usage: node tools/kits/build-valley-kit.mjs     (npm run kit:valley)

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { PNG } from 'pngjs';

const SRC = 'docs/reference/reference_screen_1.png';
const OUT = 'public/assets/kits/valley';
fs.mkdirSync(OUT, { recursive: true });
const src = PNG.sync.read(fs.readFileSync(SRC));

/** Plain rectangular crop; optional mirror-doubling (for seamless tiling) and top fade. */
function crop(name, x0, y0, w, h, { mirrorTile = false, mirrorV = false, fadeTop = 0 } = {}) {
  const ow = mirrorTile ? w * 2 : w;
  const oh = mirrorV ? h * 2 : h;
  const out = new PNG({ width: ow, height: oh });
  for (let y = 0; y < oh; y++)
    for (let x = 0; x < ow; x++) {
      const sx = x < w ? x : 2 * w - 1 - x; // second half is the mirror image
      const sy = y < h ? y : 2 * h - 1 - y;
      const s = ((y0 + sy) * src.width + (x0 + sx)) * 4;
      const d = (y * ow + x) * 4;
      for (let k = 0; k < 3; k++) out.data[d + k] = src.data[s + k];
      out.data[d + 3] = fadeTop && y < fadeTop ? Math.round((255 * y) / fadeTop) : 255;
    }
  fs.writeFileSync(path.join(OUT, name), PNG.sync.write(out));
  console.log(`${name}: ${ow}x${oh}`);
}

const cut = (name, args) => execFileSync('node', ['tools/cut-region.mjs', SRC, path.join(OUT, name), ...args], { stdio: 'inherit' });

// Far layer: sky, clouds and the volcano (right of the pterodactyl, left of the painted UI).
crop('far.png', 415, 0, 375, 116, { mirrorTile: true });
// Mid layer: waterfalls, forest and river in the valley (between the painted cliffs), top edge fades into the far layer.
crop('mid.png', 440, 212, 240, 140, { mirrorTile: true, fadeTop: 28 });

// Floating island (painted apple removed).
cut('island.png', ['470', '138', '165', '75', '--erase=553,114,40,38']);
// Cliff top: moss + rock face only (no foreground bushes, no apple, no leaf pile).
cut('cliff.png', ['684', '194', '290', '96', '--erase=744,150,40,46;800,150,174,47;684,228,20,62;930,272,44,18;956,252,18,22']);
// Leaf-pile shelter with the signpost (background trees around the sign removed).
cut('shelter.png', ['800', '80', '174', '122', '--warmOnly', '--erase=800,80,66,60;932,80,42,60;935,128,39,32;846,130,42,20;866,78,66,11']);

// Full cliff column: the painted cliff top continues downwards as the same rock face, with irregular
// edges, varied texture rows and a gradual darkening into the valley – one image, no visible seams.
{
  const top = PNG.sync.read(fs.readFileSync(path.join(OUT, 'cliff.png')));
  const W = top.width, H = 440;
  const START = 52; // rows above come straight from the painting
  const BLEND = 24; // rows where painting and generated rock cross-fade
  const PX0 = 60, PW = 180, PY0 = 40, PH = 34; // clean rock patch inside the cliff art
  const out = new PNG({ width: W, height: H });
  out.data.fill(0);
  const reflect = (v, n) => {
    const m = ((v % (2 * n)) + 2 * n) % (2 * n);
    return m < n ? m : 2 * n - 1 - m;
  };
  const px = (img, x, y) => {
    const i = (y * img.width + x) * 4;
    return [img.data[i], img.data[i + 1], img.data[i + 2], img.data[i + 3]];
  };
  // Edges of the painted rock just above the generated part.
  let L0 = 0, R0 = W - 1;
  while (L0 < W && px(top, L0, START)[3] < 250) L0++;
  while (R0 > 0 && px(top, R0, START)[3] < 250) R0--;
  const smooth = (a, b, v) => { const t = Math.min(1, Math.max(0, (v - a) / (b - a))); return t * t * (3 - 2 * t); };
  for (let y = 0; y < H; y++) {
    const dy = y - START;
    const taper = Math.max(0, dy) * 0.05;
    const L = L0 + taper + 5 * Math.sin(y * 0.071) + 3 * Math.sin(y * 0.19 + 2) + 3;
    const R = R0 - taper - 5 * Math.sin(y * 0.083 + 1) - 3 * Math.sin(y * 0.23) - 3;
    const band = Math.floor(Math.max(0, dy) / PH);
    const dark = 1 - 0.82 * smooth(70, 300, y);
    for (let x = 0; x < W; x++) {
      const d = (y * W + x) * 4;
      const orig = px(top, x, Math.min(y, top.height - 1));
      if (y < START) {
        if (y < top.height) for (let k = 0; k < 4; k++) out.data[d + k] = orig[k];
        continue;
      }
      // Generated rock: rows of the clean patch, each band shifted sideways so no pattern repeats;
      // neighbouring bands are cross-faded at their borders so no seam shows.
      const sy = PY0 + reflect(dy, PH);
      const sample = (bd) => px(top, PX0 + reflect(x + bd * 53, PW), sy);
      const f = (Math.max(0, dy) % PH) / PH;
      let rock = sample(band);
      const mix = (a, b, w) => a.map((v, k) => v * (1 - w) + b[k] * w);
      if (f > 0.7) rock = mix(rock, sample(band + 1), 0.5 * smooth(0.7, 1, f));
      else if (f < 0.3 && band > 0) rock = mix(rock, sample(band - 1), 0.5 * smooth(0.3, 0, f));
      // Hanging ferns belong to the top only – turn their green into rock brown further down.
      if (rock[1] > rock[2] + 35) {
        const avg = (rock[0] + rock[1] + rock[2]) / 3;
        rock = [avg * 1.1, avg * 0.85, avg * 0.6, rock[3]];
      }
      const edgeA = Math.min(1, Math.max(0, Math.min(x - L, R - x) / 2.5));
      if (edgeA <= 0) continue;
      let col = rock;
      // Cross-fade from the painting into the generated rock.
      const t = smooth(0, BLEND, dy);
      if (y < top.height && orig[3] > 250 && t < 1) col = rock.map((v, k) => (k < 3 ? orig[k] * (1 - t) + v * t : 255));
      for (let k = 0; k < 3; k++) out.data[d + k] = col[k] * dark;
      out.data[d + 3] = Math.round(255 * edgeA);
    }
  }
  fs.writeFileSync(path.join(OUT, 'cliff-full.png'), PNG.sync.write(out));
  console.log(`cliff-full.png: ${W}x${H}`);
}

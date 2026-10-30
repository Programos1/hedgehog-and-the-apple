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
// Rock texture used to extend cliffs down to the bottom of the screen.
crop('rock.png', 700, 238, 160, 50, { mirrorTile: true, mirrorV: true });

// Floating island (painted apple removed).
cut('island.png', ['470', '138', '165', '75', '--erase=553,114,40,38']);
// Cliff top: moss + rock face only (no foreground bushes, no apple, no leaf pile).
cut('cliff.png', ['684', '194', '290', '96', '--erase=744,150,40,46;800,150,174,47;684,228,20,62;930,272,44,18;956,252,18,22']);
// Leaf-pile shelter with the signpost (background trees around the sign removed).
cut('shelter.png', ['800', '80', '174', '122', '--warmOnly', '--erase=800,80,66,60;932,80,42,60;935,128,39,32;846,130,42,20;866,78,66,11']);

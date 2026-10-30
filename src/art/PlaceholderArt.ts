import Phaser from 'phaser';
import type { Theme } from '../levels/types';

// Procedural placeholder artwork. Everything here is temporary and is replaced
// by real artwork via src/assets/manifest.ts – texture keys and sizes must stay the same.

type G = Phaser.GameObjects.Graphics;

/** Small deterministic RNG so placeholder backgrounds look the same every run. */
function rng(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/** Vertical gradient made of bands (fillGradientStyle is WebGL-only and doesn't work in generateTexture). */
function vGradient(g: G, x: number, y: number, w: number, h: number, top: number, bottom: number, steps = 48): void {
  const a = Phaser.Display.Color.IntegerToColor(top);
  const b = Phaser.Display.Color.IntegerToColor(bottom);
  for (let i = 0; i < steps; i++) {
    const c = Phaser.Display.Color.Interpolate.ColorWithColor(a, b, steps - 1, i);
    g.fillStyle(Phaser.Display.Color.GetColor(c.r, c.g, c.b), 1);
    g.fillRect(x, y + (h * i) / steps, w, Math.ceil(h / steps) + 1);
  }
}

const COLORS = {
  spikes: 0x5a3a22,
  spikesLight: 0x8a6240,
  body: 0x7a5232,
  face: 0xedd1a6,
  nose: 0x2a1a12,
  cheek: 0xf29b9b,
  appleRed: 0xd8392b,
  appleDark: 0xa3241b,
  appleFlesh: 0xf7ebbf,
  leafGreen: 0x5aa83a,
  larva: 0x9ccf4a,
  larvaDark: 0x6e9c2c,
  white: 0xffffff,
  ink: 0x3b2a1e,
};

export function generatePlaceholderArt(scene: Phaser.Scene, skip: (key: string) => boolean): void {
  const make = (key: string, w: number, h: number, draw: (g: G) => void) => {
    if (skip(key) || scene.textures.exists(key)) return;
    const g = scene.make.graphics({}, false);
    draw(g);
    g.generateTexture(key, w, h);
    g.destroy();
  };

  make('hedgehog', 128, 96, (g) => drawHedgehog(g));
  make('hedgehog-curled', 84, 84, (g) => drawCurled(g, 42, 42, 1));
  make('apple', 52, 56, (g) => drawApple(g, 26, 32, 1, false));
  make('apple-bitten', 52, 56, (g) => drawApple(g, 26, 32, 1, true));
  make('larva', 48, 20, (g) => drawLarva(g, 0, 0, 1));
  make('leaf', 56, 40, (g) => drawLeaf(g, 28, 20, 1, 0xe08a2e));
  make('shelter', 300, 200, (g) => drawShelter(g));
  make('pine-cone', 34, 46, (g) => drawCone(g));
  make('water', 128, 200, (g) => drawWater(g));
  make('sign', 120, 150, (g) => drawSign(g));
  make('shadow', 80, 20, (g) => {
    g.fillStyle(0x000000, 0.25);
    g.fillEllipse(40, 10, 80, 20);
  });
  make('sparkle', 24, 24, (g) => {
    g.fillStyle(0xfff6b0, 1);
    g.fillTriangle(12, 0, 15, 12, 9, 12);
    g.fillTriangle(12, 24, 15, 12, 9, 12);
    g.fillTriangle(0, 12, 12, 9, 12, 15);
    g.fillTriangle(24, 12, 12, 9, 12, 15);
  });

  for (const theme of ['meadow', 'forest', 'valley'] as Theme[]) {
    make(`ground-${theme}`, 128, 512, (g) => drawGround(g, theme));
    make(`platform-${theme}`, 64, 36, (g) => drawPlatform(g, theme));
    make(`moving-${theme}`, 64, 36, (g) => drawMoving(g, theme));
    // Backgrounds are generated at half resolution and scaled 2x to save memory on tablets.
    make(`bg-${theme}-sky`, 960, 540, (g) => drawSky(g, theme));
    make(`bg-${theme}-far`, 960, 540, (g) => drawFar(g, theme));
    make(`bg-${theme}-mid`, 960, 540, (g) => drawMid(g, theme));
    make(`bg-${theme}-near`, 960, 540, (g) => drawNear(g, theme));
  }

  make('fact-insectivore', 420, 300, (g) => {
    drawCardBg(g, 0xcfe8a8);
    g.save();
    g.translateCanvas(40, 120);
    g.scaleCanvas(1.6, 1.6);
    drawHedgehog(g);
    g.restore();
    drawBeetle(g, 330, 220);
    drawLarva(g, 300, 120, 1.4);
  });
  make('fact-larva', 420, 300, (g) => {
    drawCardBg(g, 0xf6e2b0);
    drawApple(g, 210, 160, 3.2, true);
    drawLarva(g, 190, 140, 1.8);
  });
  make('fact-curl', 420, 300, (g) => {
    drawCardBg(g, 0xd9e4f0);
    drawCurled(g, 210, 160, 2.4);
  });

  generateIcons(scene, skip);
}

// ---------------------------------------------------------------- characters & objects

function drawHedgehog(g: G): void {
  const cx = 58;
  const cy = 62;
  // Spikes along the back
  for (let a = 175; a <= 352; a += 9) {
    const r = Phaser.Math.DegToRad(a);
    const bx = cx + Math.cos(r) * 48;
    const by = cy + Math.sin(r) * 30;
    const tx = cx + Math.cos(r) * 68;
    const ty = cy + Math.sin(r) * 50;
    const nx = -Math.sin(r) * 7;
    const ny = Math.cos(r) * 7;
    g.fillStyle(a % 2 ? COLORS.spikes : COLORS.spikesLight, 1);
    g.fillTriangle(bx + nx, by + ny, bx - nx, by - ny, tx, ty);
  }
  g.fillStyle(COLORS.body, 1);
  g.fillEllipse(cx, cy, 104, 62);
  // Feet
  g.fillStyle(COLORS.nose, 1);
  g.fillEllipse(38, 90, 22, 11);
  g.fillEllipse(80, 90, 22, 11);
  // Face and snout
  g.fillStyle(COLORS.face, 1);
  g.fillEllipse(92, 66, 52, 44);
  g.fillEllipse(110, 70, 30, 20);
  g.fillCircle(80, 44, 7);
  g.fillStyle(COLORS.nose, 1);
  g.fillCircle(124, 68, 6);
  g.fillCircle(96, 58, 5.5);
  g.fillStyle(COLORS.white, 1);
  g.fillCircle(97.8, 56.2, 1.9);
  g.fillStyle(COLORS.cheek, 0.6);
  g.fillCircle(100, 72, 5);
}

function drawCurled(g: G, cx: number, cy: number, s: number): void {
  for (let a = 0; a < 360; a += 12) {
    const r = Phaser.Math.DegToRad(a);
    const nx = -Math.sin(r) * 6 * s;
    const ny = Math.cos(r) * 6 * s;
    const bx = cx + Math.cos(r) * 26 * s;
    const by = cy + Math.sin(r) * 26 * s;
    g.fillStyle(a % 24 ? COLORS.spikes : COLORS.spikesLight, 1);
    g.fillTriangle(bx + nx, by + ny, bx - nx, by - ny, cx + Math.cos(r) * 41 * s, cy + Math.sin(r) * 41 * s);
  }
  g.fillStyle(COLORS.body, 1);
  g.fillCircle(cx, cy, 28 * s);
  g.fillStyle(COLORS.face, 1);
  g.fillCircle(cx + 10 * s, cy + 12 * s, 9 * s);
  g.fillStyle(COLORS.nose, 1);
  g.fillCircle(cx + 15 * s, cy + 16 * s, 3 * s);
}

function drawApple(g: G, cx: number, cy: number, s: number, bitten: boolean): void {
  g.fillStyle(COLORS.appleDark, 1);
  g.fillCircle(cx, cy + 1 * s, 22 * s);
  g.fillStyle(COLORS.appleRed, 1);
  g.fillCircle(cx - 1 * s, cy, 20 * s);
  g.fillStyle(COLORS.white, 0.45);
  g.fillEllipse(cx - 9 * s, cy - 8 * s, 8 * s, 12 * s);
  g.fillStyle(0x6b4423, 1);
  g.fillRect(cx - 1.5 * s, cy - 28 * s, 3 * s, 10 * s);
  g.fillStyle(COLORS.leafGreen, 1);
  g.fillEllipse(cx + 8 * s, cy - 24 * s, 14 * s, 7 * s);
  if (bitten) {
    g.fillStyle(COLORS.appleFlesh, 1);
    g.fillCircle(cx + 14 * s, cy + 2 * s, 11 * s);
    g.fillStyle(0x5a3a22, 1);
    g.fillEllipse(cx + 9 * s, cy, 3 * s, 5 * s);
    g.fillEllipse(cx + 10 * s, cy + 7 * s, 3 * s, 5 * s);
  }
}

function drawLarva(g: G, ox: number, oy: number, s: number): void {
  for (let i = 0; i < 5; i++) {
    g.fillStyle(i % 2 ? COLORS.larvaDark : COLORS.larva, 1);
    g.fillCircle(ox + (8 + i * 8) * s, oy + (11 + (i % 2) * 2) * s, 7 * s);
  }
  g.fillStyle(0x4d3b22, 1);
  g.fillCircle(ox + 42 * s, oy + 10 * s, 6 * s);
  g.fillStyle(COLORS.white, 1);
  g.fillCircle(ox + 44 * s, oy + 8 * s, 2 * s);
}

function drawBeetle(g: G, cx: number, cy: number): void {
  g.fillStyle(0x1f2a44, 1);
  g.fillEllipse(cx, cy, 50, 36);
  g.fillCircle(cx + 26, cy - 2, 10);
  g.lineStyle(3, 0x1f2a44, 1);
  for (const dx of [-12, 0, 12]) g.lineBetween(cx + dx, cy + 14, cx + dx - 6, cy + 26);
  g.lineStyle(2, 0x5b7bb5, 1);
  g.lineBetween(cx - 4, cy - 17, cx - 4, cy + 17);
}

function drawLeaf(g: G, cx: number, cy: number, s: number, color: number): void {
  g.fillStyle(color, 1);
  g.fillEllipse(cx, cy, 48 * s, 28 * s);
  g.fillTriangle(cx - 24 * s, cy, cx - 30 * s, cy - 4 * s, cx - 30 * s, cy + 4 * s);
  g.lineStyle(2 * s, 0x8a4a14, 0.8);
  g.lineBetween(cx - 26 * s, cy, cx + 22 * s, cy);
  for (const dx of [-10, 0, 10]) {
    g.lineBetween(cx + dx * s, cy, cx + (dx + 7) * s, cy - 9 * s);
    g.lineBetween(cx + dx * s, cy, cx + (dx + 7) * s, cy + 9 * s);
  }
}

function drawShelter(g: G): void {
  const r = rng(7);
  g.fillStyle(0x7a4a22, 1);
  g.fillEllipse(150, 200, 290, 370);
  const palette = [0xe08a2e, 0xc8651f, 0xd9a338, 0xa8481c, 0xb97a2a];
  for (let i = 0; i < 70; i++) {
    const a = Phaser.Math.DegToRad(180 + r() * 180);
    const d = 0.25 + r() * 0.75;
    const x = 150 + Math.cos(a) * 130 * d;
    const y = 196 + Math.sin(a) * 170 * d;
    g.save();
    g.translateCanvas(x, y);
    g.rotateCanvas(r() * Math.PI);
    drawLeaf(g, 0, 0, 0.7 + r() * 0.5, palette[i % palette.length]);
    g.restore();
  }
  g.fillStyle(0x2a1a10, 1);
  g.fillEllipse(150, 200, 92, 120);
}

function drawCone(g: G): void {
  g.fillStyle(0x6b4423, 1);
  g.fillEllipse(17, 26, 30, 40);
  g.fillStyle(0x8f5e33, 1);
  for (let row = 0; row < 4; row++) {
    for (let c = 0; c < 3; c++) g.fillTriangle(7 + c * 8, 12 + row * 8, 15 + c * 8, 12 + row * 8, 11 + c * 8, 18 + row * 8);
  }
  g.fillStyle(0x4a2e18, 1);
  g.fillRect(15, 0, 4, 8);
}

function drawWater(g: G): void {
  vGradient(g, 0, 0, 128, 200, 0x6fc3e6, 0x2e6f9e, 24);
  g.fillStyle(0xbfe9f7, 1);
  for (let x = 0; x < 128; x += 32) g.fillEllipse(x + 16, 4, 32, 10);
  g.fillStyle(0xffffff, 0.35);
  g.fillEllipse(40, 40, 30, 4);
  g.fillEllipse(96, 90, 24, 4);
}

function drawSign(g: G): void {
  g.fillStyle(0x7a5232, 1);
  g.fillRect(54, 90, 12, 60);
  g.fillStyle(0xc9965a, 1);
  g.fillRoundedRect(4, 4, 112, 96, 18);
  g.lineStyle(5, 0x7a5232, 1);
  g.strokeRoundedRect(4, 4, 112, 96, 18);
}

function drawCardBg(g: G, color: number): void {
  g.fillStyle(color, 1);
  g.fillRoundedRect(0, 0, 420, 300, 28);
  g.fillStyle(0xffffff, 0.35);
  g.fillEllipse(210, 270, 360, 50);
}

// ---------------------------------------------------------------- terrain

const THEME = {
  meadow: { dirt: 0x9a6a3c, dirtDark: 0x7c5230, top: 0x6cbf3f, topLight: 0x8fd65a },
  forest: { dirt: 0x6e4a2c, dirtDark: 0x543820, top: 0x3f8f45, topLight: 0x5aa85a },
  valley: { dirt: 0x8d8278, dirtDark: 0x6d645c, top: 0xb59f7a, topLight: 0xcdb991 },
};

function drawGround(g: G, theme: Theme): void {
  const c = THEME[theme];
  const r = rng(theme.length * 31);
  // Tall tile so the grass only appears on the top surface (it repeats horizontally only).
  vGradient(g, 0, 0, 128, 512, c.dirt, c.dirtDark, 16);
  g.fillStyle(c.dirtDark, 1);
  for (let i = 0; i < 30; i++) g.fillEllipse(r() * 128, 30 + r() * 470, 10 + r() * 16, 6 + r() * 8);
  g.fillStyle(c.top, 1);
  g.fillRect(0, 0, 128, 20);
  for (let x = 0; x <= 128; x += 16) g.fillCircle(x, 20, 8);
  g.fillStyle(c.topLight, 1);
  g.fillRect(0, 0, 128, 6);
}

function drawPlatform(g: G, theme: Theme): void {
  const c = THEME[theme];
  if (theme === 'valley') {
    g.fillStyle(0x9c9288, 1);
    g.fillRect(0, 4, 64, 32);
    g.fillStyle(0x7d746b, 1);
    g.fillRect(0, 26, 64, 10);
    g.fillStyle(0xbdb2a6, 1);
    g.fillRect(0, 0, 64, 8);
    return;
  }
  // Log with a grassy/mossy top
  g.fillStyle(0x8a5a32, 1);
  g.fillRect(0, 6, 64, 30);
  g.lineStyle(2, 0x6b4423, 1);
  g.lineBetween(0, 18, 64, 18);
  g.lineBetween(0, 28, 64, 28);
  g.fillStyle(c.top, 1);
  g.fillRect(0, 0, 64, 9);
  g.fillStyle(c.topLight, 1);
  g.fillRect(0, 0, 64, 3);
}

function drawMoving(g: G, theme: Theme): void {
  if (theme === 'valley') {
    g.fillStyle(0x8a7f74, 1);
    g.fillRect(0, 0, 64, 36);
    g.fillStyle(0xd8c49a, 1);
    g.fillRect(0, 0, 64, 6);
    g.fillStyle(0x6b5a48, 1);
    g.fillRect(28, 10, 8, 26);
    return;
  }
  // Big floating leaf raft
  g.fillStyle(0x4f9a35, 1);
  g.fillRect(0, 2, 64, 22);
  g.fillStyle(0x6cbf3f, 1);
  g.fillRect(0, 0, 64, 8);
  g.lineStyle(2, 0x2f6b22, 1);
  g.lineBetween(0, 13, 64, 13);
  g.lineBetween(32, 13, 44, 4);
  g.lineBetween(32, 13, 44, 22);
}

// ---------------------------------------------------------------- parallax backgrounds (960x540)

function drawSky(g: G, theme: Theme): void {
  const sky = {
    meadow: [0x7cc6e8, 0xd9f1fb],
    forest: [0x6fae9a, 0xcfe6c9],
    valley: [0xf0a35e, 0xfde2a8],
  }[theme];
  vGradient(g, 0, 0, 960, 540, sky[0], sky[1]);
  g.fillStyle(theme === 'valley' ? 0xfff1c2 : 0xfff6cf, theme === 'valley' ? 1 : 0.9);
  g.fillCircle(theme === 'valley' ? 640 : 780, theme === 'valley' ? 330 : 90, theme === 'valley' ? 60 : 44);
  g.fillStyle(0xffffff, theme === 'forest' ? 0.4 : 0.8);
  const r = rng(3);
  for (let i = 0; i < 5; i++) {
    const x = r() * 960;
    const y = 40 + r() * 140;
    g.fillEllipse(x, y, 120, 34);
    g.fillEllipse(x + 40, y - 14, 80, 36);
    g.fillEllipse(x - 36, y - 6, 70, 28);
  }
}

function drawFar(g: G, theme: Theme): void {
  const col = { meadow: 0x9bbad1, forest: 0x7fa68f, valley: 0xc78a6a }[theme];
  const r = rng(11 + theme.length);
  g.fillStyle(col, 1);
  const pts: Phaser.Math.Vector2[] = [new Phaser.Math.Vector2(0, 540)];
  let x = 0;
  while (x <= 960) {
    pts.push(new Phaser.Math.Vector2(x, 230 + r() * 120));
    x += 90 + r() * 80;
    pts.push(new Phaser.Math.Vector2(x, 330 + r() * 60));
    x += 60 + r() * 60;
  }
  pts.push(new Phaser.Math.Vector2(960, 300), new Phaser.Math.Vector2(960, 540));
  g.fillPoints(pts, true);
  if (theme !== 'forest') {
    // Snow / sunlit peaks
    g.fillStyle(0xffffff, theme === 'valley' ? 0.25 : 0.6);
    for (let i = 1; i < pts.length - 2; i += 2) g.fillTriangle(pts[i].x - 18, pts[i].y + 26, pts[i].x + 18, pts[i].y + 26, pts[i].x, pts[i].y);
  }
}

function drawMid(g: G, theme: Theme): void {
  const r = rng(21 + theme.length);
  if (theme === 'forest') {
    for (let i = 0; i < 14; i++) {
      const x = r() * 960;
      g.fillStyle(0x4a6b4a, 1);
      g.fillRect(x - 10, 200, 20, 340);
      g.fillStyle(0x3f7a4a, 1);
      g.fillCircle(x, 200, 60 + r() * 30);
    }
    return;
  }
  if (theme === 'valley') {
    g.fillStyle(0x9a6f5a, 1);
    g.fillRect(560, 140, 220, 400);
    g.fillStyle(0xbfe6f5, 0.9);
    g.fillRect(640, 150, 50, 390); // waterfall
    g.fillStyle(0xffffff, 0.6);
    g.fillEllipse(665, 520, 140, 40);
    g.fillStyle(0xa87a62, 1);
    for (let i = 0; i < 6; i++) g.fillEllipse(r() * 960, 470, 200 + r() * 140, 200 + r() * 120);
    return;
  }
  g.fillStyle(0x86c96a, 1);
  for (let i = 0; i < 5; i++) g.fillEllipse(i * 240 + r() * 60, 480, 420, 220);
  for (let i = 0; i < 5; i++) {
    const x = 80 + i * 200 + r() * 60;
    g.fillStyle(0x6b4a2e, 1);
    g.fillRect(x - 7, 300, 14, 110);
    g.fillStyle(0x4f9e3a, 1);
    g.fillCircle(x, 290, 46);
    g.fillCircle(x - 30, 314, 32);
    g.fillCircle(x + 30, 314, 32);
    g.fillStyle(COLORS.appleRed, 1);
    g.fillCircle(x - 16, 300, 5);
    g.fillCircle(x + 20, 282, 5);
  }
}

function drawNear(g: G, theme: Theme): void {
  const r = rng(41 + theme.length);
  const bush = { meadow: 0x4f9e3a, forest: 0x2f6b3a, valley: 0x7d8a52 }[theme];
  g.fillStyle(bush, 1);
  for (let i = 0; i < 8; i++) {
    const x = i * 130 + r() * 50;
    g.fillCircle(x, 520, 50 + r() * 30);
    g.fillCircle(x + 40, 530, 40 + r() * 20);
  }
  if (theme === 'meadow') {
    const flowers = [0xffffff, 0xf7d14a, 0xf28fb3, 0xb18be8];
    for (let i = 0; i < 26; i++) {
      g.fillStyle(flowers[i % flowers.length], 1);
      g.fillCircle(r() * 960, 480 + r() * 60, 5);
    }
  }
  if (theme === 'forest') {
    for (let i = 0; i < 7; i++) {
      const x = r() * 960;
      g.fillStyle(0xf2efe6, 1);
      g.fillRect(x - 4, 500, 8, 20);
      g.fillStyle(0xc0392b, 1);
      g.fillEllipse(x, 500, 30, 18);
      g.fillStyle(0xffffff, 1);
      g.fillCircle(x - 5, 497, 2.5);
      g.fillCircle(x + 6, 499, 2);
    }
  }
}

// ---------------------------------------------------------------- UI icons (96x96, white)

function generateIcons(scene: Phaser.Scene, skip: (key: string) => boolean): void {
  const W = 0xffffff;
  const icon = (key: string, draw: (g: G) => void) => {
    const full = `icon-${key}`;
    if (skip(full) || scene.textures.exists(full)) return;
    const g = scene.make.graphics({}, false);
    g.fillStyle(W, 1);
    g.lineStyle(12, W, 1);
    draw(g);
    g.generateTexture(full, 96, 96);
    g.destroy();
  };
  icon('left', (g) => g.fillTriangle(16, 48, 66, 14, 66, 82));
  icon('right', (g) => g.fillTriangle(80, 48, 30, 14, 30, 82));
  icon('jumpUp', (g) => {
    g.fillTriangle(48, 8, 18, 44, 78, 44);
    g.fillRect(40, 40, 16, 46);
  });
  icon('jumpForward', (g) => {
    g.beginPath();
    g.arc(48, 82, 34, Math.PI, Math.PI * 1.72, false);
    g.strokePath();
    g.fillTriangle(84, 54, 58, 40, 80, 24);
    g.fillCircle(14, 84, 7);
  });
  icon('pause', (g) => {
    g.fillRoundedRect(22, 16, 18, 64, 6);
    g.fillRoundedRect(56, 16, 18, 64, 6);
  });
  icon('play', (g) => g.fillTriangle(28, 12, 28, 84, 84, 48));
  icon('lock', (g) => {
    g.fillRoundedRect(20, 44, 56, 42, 8);
    g.beginPath();
    g.arc(48, 44, 18, Math.PI, 0, false);
    g.strokePath();
  });
  icon('sound', (g) => {
    g.fillRect(14, 34, 20, 28);
    g.fillTriangle(30, 34, 56, 12, 56, 84);
    g.fillTriangle(30, 62, 56, 12, 56, 84);
    g.lineStyle(7, W, 1);
    g.beginPath();
    g.arc(56, 48, 26, -0.8, 0.8, false);
    g.strokePath();
  });
  icon('mute', (g) => {
    g.fillRect(14, 34, 20, 28);
    g.fillTriangle(30, 34, 56, 12, 56, 84);
    g.fillTriangle(30, 62, 56, 12, 56, 84);
    g.lineStyle(8, W, 1);
    g.lineBetween(64, 34, 86, 62);
    g.lineBetween(86, 34, 64, 62);
  });
  icon('replay', (g) => {
    g.beginPath();
    g.arc(48, 50, 28, Math.PI * 1.25, Math.PI * 2.9, false);
    g.strokePath();
    g.fillTriangle(14, 14, 40, 26, 16, 44);
  });
  icon('home', (g) => {
    g.fillTriangle(48, 10, 8, 48, 88, 48);
    g.fillRect(22, 46, 52, 38);
  });
  icon('next', (g) => {
    g.fillTriangle(14, 14, 14, 82, 56, 48);
    g.fillTriangle(46, 14, 46, 82, 88, 48);
  });
}

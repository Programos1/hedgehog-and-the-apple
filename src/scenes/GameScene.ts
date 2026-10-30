import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH, GROUND_Y } from '../config';
import { Controls } from '../input/Controls';
import { Hedgehog } from '../entities/Hedgehog';
import { AudioManager } from '../audio/AudioManager';
import { LEVELS } from '../levels';
import type { AppleDef, ConeDef, LevelData, MovingPlatformDef } from '../levels/types';

// Gameplay scene: builds a level from data and runs the core loop:
// find apples -> sniff -> eat the larva -> spit the apple out; collect leaves on the way and bring them
// to the shelter, which always stands at the end of the level (no need to walk back).
// There is no losing: water or a falling pine cone only sends the hedgehog back / makes it curl up.

export interface HudState {
  levelId: number;
  wormsEaten: number;
  wormsTotal: number;
  leavesDelivered: number;
  leavesTotal: number;
}

interface AppleObj {
  def: AppleDef;
  sprite: Phaser.GameObjects.Image;
  done: boolean;
}

interface LeafObj {
  sprite: Phaser.GameObjects.Image;
  state: 'ground' | 'carried' | 'delivered';
}

interface Mover {
  def: MovingPlatformDef;
  sprite: Phaser.GameObjects.TileSprite;
  body: Phaser.Physics.Arcade.Body;
  forward: boolean;
  waitLeft: number;
}

export class GameScene extends Phaser.Scene {
  private level!: LevelData;
  private hedgehog!: Hedgehog;
  private apples: AppleObj[] = [];
  private leaves: LeafObj[] = [];
  private movers: Mover[] = [];
  private waterZones: Phaser.Geom.Rectangle[] = [];
  private shelter!: Phaser.GameObjects.Image;
  private shelterLeaves = 0;
  private carried: LeafObj[] = [];
  private lastSafe = new Phaser.Math.Vector2();
  private safeTimer = 0;
  private onMover = false;
  private finished = false;
  private guide!: Phaser.GameObjects.Container;
  private guideArrow!: Phaser.GameObjects.Image;
  private guideIcon!: Phaser.GameObjects.Image;
  private halo!: Phaser.GameObjects.Arc;
  /** Seconds since the last progress (larva eaten, leaf picked/delivered). Drives stronger hints. */
  private stuckTime = 0;
  /** Set when the hedgehog reaches the shelter while something is still missing. */
  private missingAtShelter = false;
  private trailTimer = 0;
  private parallax: { layer: Phaser.GameObjects.TileSprite; factor: number }[] = [];
  private hud!: HudState;
  /** Apples and leaves grow a bit in painted levels drawn at a larger scale. */
  private itemScale = 1;

  constructor() {
    super('Game');
  }

  init(data: { levelId?: number }): void {
    this.level = LEVELS.find((l) => l.id === data.levelId) ?? LEVELS[0];
    this.apples = [];
    this.leaves = [];
    this.movers = [];
    this.waterZones = [];
    this.parallax = [];
    this.carried = [];
    this.shelterLeaves = 0;
    this.stuckTime = 0;
    this.missingAtShelter = false;
    this.trailTimer = 0;
    this.finished = false;
    this.onMover = false;
  }

  create(): void {
    const L = this.level;
    this.physics.world.setBounds(0, -400, L.width, GAME_HEIGHT + 800, true, true, false, false);
    this.cameras.main.setBounds(0, 0, L.width, GAME_HEIGHT);

    const k = L.worldScale ?? 1;
    this.itemScale = k === 1 ? 1 : k * 0.8;
    if (L.painted) this.buildPainted(L.painted.key);
    else this.buildBackground();
    const solids = this.buildGround();
    const surfaces = this.buildSurfaces();
    const oneWay = this.buildPlatforms();
    this.buildMovers();
    this.buildHints();

    this.shelter = this.add.image(L.shelter.x, L.shelter.y + 6, 'shelter').setOrigin(0.5, 1).setDepth(5);
    if (L.shelterPainted) this.shelter.setAlpha(0);

    for (const def of L.apples) {
      const sprite = this.add.image(def.x, def.y, 'apple').setDepth(10).setScale(this.itemScale);
      // Level data gives the centre of a 56 px tall apple; keep the bottom on the ground for any artwork size.
      sprite.y = def.y + 28 - sprite.displayHeight / 2;
      this.tweens.add({ targets: sprite, angle: { from: -4, to: 4 }, duration: 1400, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
      this.apples.push({ def, sprite, done: false });
    }
    for (const p of L.leaves) {
      const sprite = this.add.image(p.x, p.y, 'leaf').setDepth(10).setScale(this.itemScale);
      this.tweens.add({ targets: sprite, y: p.y - 6, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
      this.leaves.push({ sprite, state: 'ground' });
    }

    this.hedgehog = new Hedgehog(this, L.start.x, L.start.y, k);
    this.lastSafe.set(L.start.x, L.start.y);
    this.physics.add.collider(this.hedgehog, solids);
    this.physics.add.collider(this.hedgehog, oneWay);
    this.physics.add.collider(this.hedgehog, surfaces);
    this.physics.add.collider(
      this.hedgehog,
      this.movers.map((m) => m.sprite),
      () => (this.onMover = true),
    );

    for (const cone of L.cones) this.scheduleCone(cone);

    this.createGuide();

    const cam = this.cameras.main;
    cam.startFollow(this.hedgehog.visual, true, 0.08, 0.08, 0, 120);
    cam.setDeadzone(240, 200);
    if (L.painted?.view === 'whole') this.showWholePicture();
    cam.fadeIn(400);

    this.hud = {
      levelId: L.id,
      wormsEaten: 0,
      wormsTotal: L.apples.filter((a) => a.worm).length,
      leavesDelivered: 0,
      leavesTotal: L.leaves.length,
    };
    Controls.bindKeyboard(this);
    this.scene.launch('Hud', { hud: this.hud });
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.scene.stop('Hud'));
    this.events.on(Phaser.Scenes.Events.RESUME, () => Controls.clearTaps());

  }

  update(_time: number, deltaMs: number): void {
    const dt = Math.min(deltaMs / 1000, 0.05);
    Controls.update();

    if (Controls.consume('pause') && !this.finished) {
      this.scene.pause();
      this.scene.launch('Pause', { levelId: this.level.id });
      return;
    }

    const jumpUp = Controls.consume('jumpUp');
    const jumpForward = Controls.consume('jumpForward');
    this.hedgehog.control(dt, Controls.direction, jumpUp, jumpForward);
    this.onMover = false;

    this.updateMovers(dt);
    this.updateParallax();
    this.trackSafeSpot(dt);
    this.checkWater();
    this.checkPickups();
    this.updateGuide(dt);
  }

  // ------------------------------------------------------------------ world building

  private buildBackground(): void {
    const theme = this.level.theme;
    const layers: [string, number][] = [
      [`bg-${theme}-sky`, 0],
      [`bg-${theme}-far`, 0.15],
      [`bg-${theme}-mid`, 0.4],
      [`bg-${theme}-near`, 0.7],
    ];
    layers.forEach(([key, factor], i) => {
      const tex = this.textures.get(key).getSourceImage();
      // Placeholder backgrounds are half resolution, real ones full HD – scale to fill the screen height.
      const scale = GAME_HEIGHT / tex.height;
      const layer = this.add
        .tileSprite(0, 0, GAME_WIDTH / scale, tex.height, key)
        .setOrigin(0, 0)
        .setScale(scale)
        .setScrollFactor(0)
        .setDepth(-10 + i);
      this.parallax.push({ layer, factor });
    });
  }

  private updateParallax(): void {
    const sx = this.cameras.main.scrollX;
    for (const { layer, factor } of this.parallax) layer.tilePositionX = (sx * factor) / layer.scaleX;
  }

  /** Painted level: one picture scaled to the screen height is the whole world. */
  private buildPainted(key: string): void {
    const img = this.add.image(0, 0, key).setOrigin(0, 0).setDepth(-10);
    img.setScale(GAME_HEIGHT / img.height);
  }

  /**
   * Zooms the camera out so the whole painting is on screen, centred vertically. The empty bands
   * above and below continue the picture's edge colours, so it looks like one scene.
   */
  private showWholePicture(): void {
    const cam = this.cameras.main;
    const w = this.level.width;
    const zoom = Math.min(1, GAME_WIDTH / w);
    const visibleH = GAME_HEIGHT / zoom;
    const band = (visibleH - GAME_HEIGHT) / 2;
    cam.setZoom(zoom);
    cam.setBounds(0, -band, w, visibleH);
    if (band <= 0) return;

    // Dark warm frame above and below the painting (like a picture-book page); a soft shadow
    // at the painting's edges blends it in. The HUD sits in the top band, touch buttons in the bottom one.
    const FRAME = 0x231d14;
    const fade = 40 / zoom;
    const gfx = this.add.graphics().setDepth(5);
    gfx.fillStyle(FRAME, 1);
    gfx.fillRect(0, -band - 2, w, band + 2);
    gfx.fillRect(0, GAME_HEIGHT, w, band + 2);
    gfx.fillGradientStyle(FRAME, FRAME, FRAME, FRAME, 1, 1, 0, 0);
    gfx.fillRect(0, 0, w, fade);
    gfx.fillGradientStyle(FRAME, FRAME, FRAME, FRAME, 0, 0, 1, 1);
    gfx.fillRect(0, GAME_HEIGHT - fade, w, fade);

  }

  /**
   * Walkable lines from a painted scene. Each line becomes a row of thin one-way strips, so the
   * hedgehog follows gentle slopes and can always jump up through them from below.
   */
  private buildSurfaces(): Phaser.Physics.Arcade.StaticGroup {
    const group = this.physics.add.staticGroup();
    const STEP = 8;
    for (const s of this.level.surfaces ?? []) {
      const pts = s.points;
      for (let x = pts[0][0]; x < pts[pts.length - 1][0]; x += STEP) {
        const y = this.surfaceY(pts, x + STEP / 2);
        const strip = this.add.zone(x, y, STEP + 2, 24).setOrigin(0, 0);
        group.add(strip);
        const body = strip.body as Phaser.Physics.Arcade.StaticBody;
        body.checkCollision.down = false;
        body.checkCollision.left = false;
        body.checkCollision.right = false;
      }
    }
    group.refresh();
    return group;
  }

  private surfaceY(pts: [number, number][], x: number): number {
    for (let i = 1; i < pts.length; i++) {
      const [x0, y0] = pts[i - 1];
      const [x1, y1] = pts[i];
      if (x <= x1) return y0 + ((y1 - y0) * (x - x0)) / Math.max(1, x1 - x0);
    }
    return pts[pts.length - 1][1];
  }

  private buildGround(): Phaser.Physics.Arcade.StaticGroup {
    const group = this.physics.add.staticGroup();
    const segments = [...this.level.ground].sort((a, b) => a.x - b.x);
    const tex = `ground-${this.level.theme}`;
    segments.forEach((seg, i) => {
      const top = seg.y ?? GROUND_Y;
      const ground = this.add.tileSprite(seg.x, top, seg.w, GAME_HEIGHT - top + 200, tex).setOrigin(0, 0).setDepth(2);
      group.add(ground);

      const next = segments[i + 1];
      const gapStart = seg.x + seg.w;
      if (next && next.x > gapStart) this.addWater(gapStart, next.x - gapStart);
    });
    group.refresh();
    return group;
  }

  private addWater(x: number, w: number): void {
    this.add.tileSprite(x, GROUND_Y + 40, w, GAME_HEIGHT - GROUND_Y + 160, 'water').setOrigin(0, 0).setDepth(1).setAlpha(0.95);
    // The trigger sits a bit lower than the surface, so the hedgehog visibly drops in.
    this.waterZones.push(new Phaser.Geom.Rectangle(x - 10, GROUND_Y + 70, w + 20, 600));
  }

  private buildPlatforms(): Phaser.Physics.Arcade.StaticGroup {
    const group = this.physics.add.staticGroup();
    for (const p of this.level.platforms) {
      const plat = this.add.tileSprite(p.x, p.y, p.w, 36, `platform-${this.level.theme}`).setOrigin(0, 0).setDepth(3);
      group.add(plat);
      const body = plat.body as Phaser.Physics.Arcade.StaticBody;
      // One-way: solid only from above, so the hedgehog can jump up through it.
      body.checkCollision.down = false;
      body.checkCollision.left = false;
      body.checkCollision.right = false;
    }
    group.refresh();
    return group;
  }

  private buildMovers(): void {
    for (const def of this.level.movingPlatforms) {
      const sprite = this.add.tileSprite(def.x, def.y, def.w, 36, `moving-${this.level.theme}`).setOrigin(0, 0).setDepth(3);
      this.physics.add.existing(sprite);
      const body = sprite.body as Phaser.Physics.Arcade.Body;
      body.setAllowGravity(false).setImmovable(true);
      body.checkCollision.down = false;
      body.checkCollision.left = false;
      body.checkCollision.right = false;
      this.movers.push({ def, sprite, body, forward: true, waitLeft: def.wait ?? 1.5 });
    }
  }

  private updateMovers(dt: number): void {
    for (const m of this.movers) {
      if (m.waitLeft > 0) {
        m.waitLeft -= dt;
        m.body.setVelocity(0, 0);
        continue;
      }
      const tx = m.def.x + (m.forward ? m.def.dx : 0);
      const ty = m.def.y + (m.forward ? m.def.dy : 0);
      const dx = tx - m.body.x;
      const dy = ty - m.body.y;
      const dist = Math.hypot(dx, dy);
      if (dist < m.def.speed * dt) {
        m.body.reset(tx, ty);
        m.forward = !m.forward;
        m.waitLeft = m.def.wait ?? 1.5;
      } else {
        m.body.setVelocity((dx / dist) * m.def.speed, (dy / dist) * m.def.speed);
      }
    }
  }

  private buildHints(): void {
    const isTouch = this.sys.game.device.input.touch;
    for (const h of this.level.hints) {
      this.add.image(h.x, h.y, 'sign').setDepth(4).setScale(0.9);
      const iconKey = h.icon === 'apple' ? 'apple' : h.icon === 'leaf' ? 'leaf' : h.icon === 'shelter' ? 'shelter' : `icon-${h.icon}`;
      const icon = this.add.image(h.x, h.y - (isTouch ? 22 : 30), iconKey).setDepth(5);
      if (iconKey.startsWith('icon-')) icon.setTint(0x5a3a22).setScale(isTouch ? 0.6 : 0.5);
      else icon.setScale(iconKey === 'shelter' ? 0.25 : 1.1);
      if (!isTouch) {
        const keyLabel = { right: '→', jumpUp: '↑', jumpForward: 'mezerník' }[h.icon as string];
        if (keyLabel) {
          this.add
            .text(h.x, h.y + 10, keyLabel, { fontFamily: 'Trebuchet MS', fontSize: '22px', color: '#fff8e6', stroke: '#5a3a22', strokeThickness: 5 })
            .setOrigin(0.5, 0)
            .setDepth(6);
        }
      }
      this.tweens.add({ targets: icon, scale: icon.scale * 1.1, duration: 700, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    }
  }

  // ------------------------------------------------------------------ safety & hazards

  private trackSafeSpot(dt: number): void {
    const h = this.hedgehog;
    if (!h.grounded || this.onMover || h.mode === 'busy' || h.mode === 'curled') return;
    this.safeTimer += dt;
    if (this.safeTimer > 0.4) {
      this.safeTimer = 0;
      this.lastSafe.set(h.body.center.x, h.body.bottom - 2);
    }
  }

  private checkWater(): void {
    const h = this.hedgehog;
    if (h.mode === 'busy') return;
    const feet = h.feet;
    const fellOut = feet.y > GAME_HEIGHT + 80;
    if (!fellOut && !this.waterZones.some((z) => z.contains(feet.x, feet.y))) return;

    h.setBusy(true);
    AudioManager.sfx(fellOut ? 'curl' : 'splash');
    if (!fellOut) this.splash(feet.x, GROUND_Y + 50);
    h.visual.setAlpha(0);
    this.time.delayedCall(700, () => {
      h.teleport(this.lastSafe.x, this.lastSafe.y - h.body.height / 2);
      h.visual.setAlpha(1);
      this.tweens.add({ targets: h.visual, alpha: { from: 0.3, to: 1 }, duration: 150, repeat: 3, yoyo: true, onComplete: () => h.visual.setAlpha(1) });
      h.setBusy(false);
    });
  }

  private splash(x: number, y: number): void {
    for (let i = 0; i < 8; i++) {
      const drop = this.add.circle(x, y, 8, 0xbfe9f7).setDepth(25);
      this.tweens.add({
        targets: drop,
        x: x + Phaser.Math.Between(-80, 80),
        y: y - Phaser.Math.Between(60, 160),
        alpha: 0,
        duration: 600,
        ease: 'Quad.out',
        onComplete: () => drop.destroy(),
      });
    }
  }

  /** Top of the ground (tiles or painted surfaces) at x, the first one at or below `fromY`. */
  private groundTopAt(x: number, fromY = -Infinity): number | null {
    const seg = this.level.ground.find((s) => x >= s.x && x <= s.x + s.w);
    if (seg) return seg.y ?? GROUND_Y;
    const ys = (this.level.surfaces ?? [])
      .filter((s) => x >= s.points[0][0] && x <= s.points[s.points.length - 1][0])
      .map((s) => this.surfaceY(s.points, x))
      .filter((y) => y >= fromY - 10)
      .sort((a, b) => a - b);
    return ys[0] ?? null;
  }

  private scheduleCone(def: ConeDef): void {
    this.time.addEvent({
      delay: def.interval * 1000,
      loop: true,
      callback: () => this.dropCone(def.x),
    });
  }

  private dropCone(x: number): void {
    const floor = this.groundTopAt(x) ?? GROUND_Y + 60;
    // A growing shadow warns where the cone will land.
    const shadow = this.add.image(x, floor, 'shadow').setScale(0.2).setAlpha(0.4).setDepth(6);
    this.tweens.add({ targets: shadow, scale: 1, alpha: 0.8, duration: 900 });
    const cone = this.add.image(x, -60, 'pine-cone').setDepth(15);
    this.tweens.add({
      targets: cone,
      y: floor - 22,
      angle: 200,
      delay: 600,
      duration: 700,
      ease: 'Quad.in',
      onUpdate: () => {
        const h = this.hedgehog;
        if (h.mode !== 'curled' && Math.abs(cone.x - h.body.center.x) < 50 && Math.abs(cone.y - h.body.center.y) < 45) {
          h.curlUp();
        }
      },
      onComplete: () => {
        shadow.destroy();
        this.tweens.add({ targets: cone, x: x + 60, y: floor - 60, angle: 360, alpha: 0, duration: 500, onComplete: () => cone.destroy() });
      },
    });
  }

  // ------------------------------------------------------------------ core loop

  private near(sprite: Phaser.GameObjects.Image, rx: number, ry: number): boolean {
    const b = this.hedgehog.body;
    return Math.abs(sprite.x - b.center.x) < rx && Math.abs(sprite.y - b.center.y) < ry;
  }

  private checkPickups(): void {
    const h = this.hedgehog;
    if (this.finished || h.mode === 'busy' || h.mode === 'curled' || !h.grounded) return;

    for (const apple of this.apples) {
      if (!apple.done && this.near(apple.sprite, 70 * h.k, 60 * h.k)) {
        this.inspectApple(apple);
        return;
      }
    }

    const leaf = this.leaves.find((l) => l.state === 'ground' && this.near(l.sprite, 70 * h.k, 60 * h.k));
    if (leaf) this.pickLeaf(leaf);

    const atShelter = Math.abs(this.shelter.x - h.body.center.x) < 130 * h.k && Math.abs(this.shelter.y - h.body.bottom) < 80 * h.k;
    if (!atShelter) return;
    if (this.carried.length) this.deliverLeaves();
    else if (this.allDone()) this.finishLevel();
    else this.missingAtShelter = true;
  }

  private inspectApple(apple: AppleObj): void {
    const h = this.hedgehog;
    apple.done = true;
    h.setBusy(true);
    h.facing = apple.sprite.x >= h.body.center.x ? 1 : -1;
    this.tweens.killTweensOf(apple.sprite);
    apple.sprite.setAngle(0);

    const sniff = this.tweens.chain({
      targets: h.image,
      tweens: [
        {
          angle: 8,
          duration: 140,
          yoyo: true,
          repeat: 2,
          onStart: () => {
            h.setPose('sniff');
            AudioManager.sfx('sniff');
          },
        },
        { angle: 0, duration: 60 },
      ],
      onComplete: () => (apple.def.worm ? this.eatLarva(apple) : this.rejectApple(apple)),
    });
    sniff.play();
    this.tweens.add({ targets: apple.sprite, x: apple.sprite.x + 3, duration: 60, yoyo: true, repeat: 5 });
  }

  /** Larva crawls out, the hedgehog eats it and spits the apple away. */
  private eatLarva(apple: AppleObj): void {
    const h = this.hedgehog;
    const a = apple.sprite;
    a.setTexture('apple-bitten');
    const larva = this.add.image(a.x, a.y - 4, 'larva').setDepth(12).setScale(0.3);
    AudioManager.sfx('discover');
    this.sparkles(a.x, a.y - 30);

    const mouth = () => new Phaser.Math.Vector2(h.body.center.x + h.facing * 60, h.body.bottom - 26);

    this.tweens.chain({
      tweens: [
        { targets: larva, scale: 1, y: a.y - 46, duration: 500, ease: 'Back.out' },
        { targets: larva, angle: { from: -10, to: 10 }, duration: 160, yoyo: true, repeat: 2 },
        {
          targets: larva,
          x: () => mouth().x,
          y: () => mouth().y,
          scale: 0.2,
          duration: 350,
          ease: 'Quad.in',
          onComplete: () => {
            larva.destroy();
            AudioManager.sfx('yum');
            h.setPose('eat');
          },
        },
        { targets: h.image, scaleY: h.baseScale * 0.92, scaleX: h.baseScale * 1.05, duration: 110, yoyo: true, repeat: 2 },
        {
          // Spit the apple out – the hedgehog only wanted the larva!
          targets: h.image,
          angle: -10,
          duration: 120,
          yoyo: true,
          onStart: () => {
            h.setPose('spit');
            AudioManager.sfx('spit');
            this.spitApple(a);
          },
        },
      ],
      onComplete: () => {
        this.progressMade();
        this.hud.wormsEaten++;
        this.events.emit('hud', this.hud);
        h.setBusy(false);
        if (this.allDone()) this.celebrateReady();
      },
    });
  }

  private spitApple(a: Phaser.GameObjects.Image): void {
    const h = this.hedgehog;
    const dir = h.facing;
    const startX = a.x;
    const landX = startX + dir * 200;
    // Lands on the ground below; over a gap it drops down and fades away.
    const ground = this.groundTopAt(landX, a.y);
    const floor = (ground ?? a.y + 260) - a.displayHeight / 2 + 4;
    const startY = a.y;
    this.tweens.addCounter({
      from: 0,
      to: 1,
      duration: 650,
      onUpdate: (tw) => {
        const t = tw.getValue() ?? 0;
        a.x = startX + dir * 200 * t;
        a.y = Phaser.Math.Linear(startY, floor, t) - Math.sin(t * Math.PI) * 120;
        a.angle = 540 * t * dir;
        if (ground === null) a.setAlpha(1 - t);
      },
      onComplete: () => (ground === null ? a.setVisible(false) : this.tweens.add({ targets: a, alpha: 0.55, duration: 400 })),
    });
  }

  /** Healthy apple: nothing to eat inside, so the hedgehog leaves it alone. */
  private rejectApple(apple: AppleObj): void {
    const h = this.hedgehog;
    AudioManager.sfx('nope');
    const bx = h.body.center.x;
    const by = h.body.top - 70;
    const bubble = this.add.container(bx, by).setDepth(30);
    bubble.add(this.add.circle(0, 0, 44, 0xffffff).setStrokeStyle(4, 0x5a3a22));
    bubble.add(this.add.image(0, 0, 'larva').setScale(1.1));
    const cross = this.add.graphics();
    cross.lineStyle(8, 0xd8392b, 1);
    cross.lineBetween(-26, -26, 26, 26);
    cross.lineBetween(26, -26, -26, 26);
    bubble.add(cross);
    bubble.setScale(0);
    this.tweens.chain({
      targets: bubble,
      tweens: [
        { scale: 1, duration: 250, ease: 'Back.out' },
        { scale: 1, duration: 900 },
        { scale: 0, duration: 200, onComplete: () => bubble.destroy() },
      ],
    });
    // Shake the head "no".
    this.tweens.add({
      targets: h.image,
      angle: { from: -6, to: 6 },
      duration: 120,
      yoyo: true,
      repeat: 3,
      onComplete: () => {
        h.image.setAngle(0);
        h.setBusy(false);
      },
    });
    apple.sprite.setAlpha(0.8);
  }

  private pickLeaf(leaf: LeafObj): void {
    this.tweens.killTweensOf(leaf.sprite);
    leaf.state = 'carried';
    this.progressMade();
    AudioManager.sfx('pickup');
    // Leaves pile up on the hedgehog's back, so it can carry them all to the shelter at the end.
    const i = this.carried.length;
    this.carried.push(leaf);
    leaf.sprite.setPosition(i * 9 - 4, -i * 11).setAngle(-15 + (i % 2) * 25).setScale(1.2);
    this.hedgehog.carrySlot.add(leaf.sprite);
    this.tweens.add({ targets: leaf.sprite, scale: { from: 1.8, to: 1.2 }, duration: 250, ease: 'Back.out' });
  }

  private deliverLeaves(): void {
    const h = this.hedgehog;
    const leaves = this.carried;
    this.carried = [];
    this.progressMade();
    leaves.forEach((leaf, n) => {
      leaf.state = 'delivered';
      h.carrySlot.remove(leaf.sprite);
      this.add.existing(leaf.sprite);
      leaf.sprite.setPosition(h.body.center.x, h.body.top - 20 - n * 10).setDepth(8).setScale(this.itemScale);

      // Leaves land on the shelter one after another, so the nest visibly grows.
      const i = this.shelterLeaves++;
      const tx = this.shelter.x - 90 + ((i * 47) % 180);
      const ty = this.shelter.y - 150 - (i % 3) * 14;
      this.tweens.add({
        targets: leaf.sprite,
        x: tx,
        y: ty,
        angle: Phaser.Math.Between(-40, 40),
        scale: 1.4 * this.itemScale,
        delay: n * 220,
        duration: 500,
        ease: 'Quad.out',
        onStart: () => {
          AudioManager.sfx('deliver');
          this.tweens.add({ targets: this.shelter, scaleY: 1.06, duration: 150, yoyo: true });
        },
        onComplete: () => {
          this.sparkles(tx, ty);
          this.hud.leavesDelivered++;
          this.events.emit('hud', this.hud);
          if (this.allDone()) this.celebrateReady();
        },
      });
    });
  }

  private allDone(): boolean {
    return this.hud.wormsEaten >= this.hud.wormsTotal && this.hud.leavesDelivered >= this.hud.leavesTotal;
  }

  /** Shelter glows: the nest is ready, the hedgehog can go to sleep. */
  private celebrateReady(): void {
    this.tweens.add({ targets: this.shelter, scale: 1.04, duration: 500, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    this.time.addEvent({
      delay: 400,
      loop: true,
      callback: () => this.sparkles(this.shelter.x + Phaser.Math.Between(-100, 100), this.shelter.y - Phaser.Math.Between(40, 170)),
    });
  }

  private finishLevel(): void {
    if (this.finished) return;
    this.finished = true;
    const h = this.hedgehog;
    h.setBusy(true);
    AudioManager.sfx('complete');
    this.tweens.add({
      targets: h.visual,
      x: this.shelter.x,
      y: this.shelter.y,
      scaleY: 0.4,
      alpha: 0,
      duration: 900,
      ease: 'Quad.in',
    });
    this.time.delayedCall(1300, () => {
      this.scene.pause();
      this.scene.launch('LevelComplete', { levelId: this.level.id });
    });
  }

  private sparkles(x: number, y: number): void {
    for (let i = 0; i < 6; i++) {
      const s = this.add.image(x, y, 'sparkle').setDepth(26).setScale(0.6);
      this.tweens.add({
        targets: s,
        x: x + Phaser.Math.Between(-60, 60),
        y: y + Phaser.Math.Between(-60, 30),
        scale: 0,
        angle: 180,
        duration: 700,
        onComplete: () => s.destroy(),
      });
    }
  }

  // ------------------------------------------------------------------ guidance for small kids
  //
  // Level 0: nothing – the child explores freely.
  // Level 1: something was missed behind the hedgehog (or no progress for 12 s) → arrow at the
  //          screen edge with a picture of what is missing.
  // Level 2: no progress for a while, or the hedgehog reached the shelter with something missing →
  //          big pulsing arrow, a sparkle trail leading the way and a glowing halo around the item.

  private progressMade(): void {
    this.stuckTime = 0;
    this.missingAtShelter = false;
  }

  private createGuide(): void {
    const bg = this.add.circle(0, 0, 62, 0x3b2a1e, 0.55).setStrokeStyle(5, 0xffe27a);
    this.guideArrow = this.add.image(0, 0, 'icon-right').setTint(0xffe27a).setScale(0.8);
    this.guideIcon = this.add.image(0, 0, 'leaf');
    this.guide = this.add.container(0, 0, [bg, this.guideArrow, this.guideIcon]).setScrollFactor(0).setDepth(40).setVisible(false);
    this.halo = this.add.circle(0, 0, 70, 0xfff3a0, 0.35).setStrokeStyle(6, 0xffe27a, 0.9).setDepth(9).setVisible(false);
  }

  /** The next thing the child should go for, and whether it was left behind. */
  private nextTarget(): { x: number; y: number; icon: string; missed: boolean } | null {
    const hx = this.hedgehog.body.center.x;
    const remaining = [
      ...this.apples.filter((a) => !a.done && a.def.worm).map((a) => ({ x: a.sprite.x, y: a.sprite.y, icon: 'apple' })),
      ...this.leaves.filter((l) => l.state === 'ground').map((l) => ({ x: l.sprite.x, y: l.sprite.y, icon: 'leaf' })),
    ];
    if (!remaining.length) return { x: this.shelter.x, y: this.shelter.y - 80, icon: 'shelter', missed: false };
    const byDistance = (a: { x: number }, b: { x: number }) => Math.abs(a.x - hx) - Math.abs(b.x - hx);
    const behind = remaining.filter((t) => t.x < hx - 150).sort(byDistance);
    if (behind.length) return { ...behind[0], missed: true };
    return { ...remaining.sort(byDistance)[0], missed: false };
  }

  private updateGuide(dt: number): void {
    const h = this.hedgehog;
    const target = this.nextTarget();
    if (h.mode !== 'busy') this.stuckTime += dt;
    if (!target || this.finished || h.mode === 'busy') {
      this.guide.setVisible(false);
      this.halo.setVisible(false);
      return;
    }

    const strong = this.missingAtShelter || (target.missed && this.stuckTime > 10) || this.stuckTime > 20;
    const show = target.missed || this.stuckTime > 12 || strong;

    // World → screen position (works with camera zoom too).
    const cam = this.cameras.main;
    const view = cam.worldView;
    const sx = (target.x - view.x) * cam.zoom;
    const onScreen = sx > 60 && sx < GAME_WIDTH - 60;

    // Edge arrow with a picture of the missing item.
    if (show && !onScreen) {
      const dir = sx > GAME_WIDTH / 2 ? 1 : -1;
      const t = this.time.now / (strong ? 120 : 220);
      const sy = Phaser.Math.Clamp((target.y - view.y) * cam.zoom, 260, 720);
      this.guide
        .setVisible(true)
        .setPosition(dir > 0 ? GAME_WIDTH - 90 + Math.sin(t) * 10 : 90 - Math.sin(t) * 10, sy)
        .setScale(strong ? 1.35 + Math.sin(t) * 0.12 : 1);
      this.guideArrow.setTexture(dir > 0 ? 'icon-right' : 'icon-left').setX(dir * 34);
      this.guideIcon
        .setTexture(target.icon)
        .setX(-dir * 18)
        .setScale(target.icon === 'shelter' ? 0.2 : 1);
    } else {
      this.guide.setVisible(false);
    }

    // Strong help: glowing halo around the item and a sparkle trail from the hedgehog towards it.
    this.halo.setVisible(strong).setPosition(target.x, target.y);
    if (strong) {
      this.halo.setScale(1 + Math.sin(this.time.now / 150) * 0.12);
      this.trailTimer -= dt;
      if (this.trailTimer <= 0) {
        this.trailTimer = 0.18;
        this.trailSparkle(target.x, target.y);
      }
    }
  }

  private trailSparkle(tx: number, ty: number): void {
    const from = this.hedgehog.body.center;
    const angle = Phaser.Math.Angle.Between(from.x, from.y, tx, ty);
    const dist = Math.min(420, Phaser.Math.Distance.Between(from.x, from.y, tx, ty));
    const s = this.add.image(from.x, from.y - 30, 'sparkle').setDepth(26).setTint(0xffe27a);
    this.tweens.add({
      targets: s,
      x: from.x + Math.cos(angle) * dist,
      y: from.y - 30 + Math.sin(angle) * dist,
      scale: { from: 2.2, to: 0.6 },
      alpha: { from: 1, to: 0.2 },
      duration: 1000,
      ease: 'Sine.out',
      onComplete: () => s.destroy(),
    });
  }
}

import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH, GROUND_Y } from '../config';
import { Controls } from '../input/Controls';
import { Hedgehog } from '../entities/Hedgehog';
import { AudioManager } from '../audio/AudioManager';
import { LEVELS } from '../levels';
import type { AppleDef, ConeDef, LevelData, MovingPlatformDef, PointDef } from '../levels/types';
import type { MusicKey } from '../assets/manifest';

// Gameplay scene: builds a level from data and runs the core loop:
// find apples -> sniff -> eat the larva -> spit the apple out; carry leaves to the shelter to build the nest.
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
  private carried: LeafObj | null = null;
  private lastSafe = new Phaser.Math.Vector2();
  private safeTimer = 0;
  private onMover = false;
  private finished = false;
  private guide!: Phaser.GameObjects.Image;
  private parallax: { layer: Phaser.GameObjects.TileSprite; factor: number }[] = [];
  private hud!: HudState;

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
    this.carried = null;
    this.shelterLeaves = 0;
    this.finished = false;
    this.onMover = false;
  }

  create(): void {
    const L = this.level;
    this.physics.world.setBounds(0, -400, L.width, GAME_HEIGHT + 800, true, true, false, false);
    this.cameras.main.setBounds(0, 0, L.width, GAME_HEIGHT);

    this.buildBackground();
    const solids = this.buildGround();
    const oneWay = this.buildPlatforms();
    this.buildMovers();
    this.buildHints();

    this.shelter = this.add.image(L.shelter.x, L.shelter.y + 6, 'shelter').setOrigin(0.5, 1).setDepth(5);

    for (const def of L.apples) {
      const sprite = this.add.image(def.x, def.y, 'apple').setDepth(10);
      this.tweens.add({ targets: sprite, angle: { from: -4, to: 4 }, duration: 1400, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
      this.apples.push({ def, sprite, done: false });
    }
    for (const p of L.leaves) {
      const sprite = this.add.image(p.x, p.y, 'leaf').setDepth(10);
      this.tweens.add({ targets: sprite, y: p.y - 6, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
      this.leaves.push({ sprite, state: 'ground' });
    }

    this.hedgehog = new Hedgehog(this, L.start.x, L.start.y);
    this.lastSafe.set(L.start.x, L.start.y);
    this.physics.add.collider(this.hedgehog, solids);
    this.physics.add.collider(this.hedgehog, oneWay);
    this.physics.add.collider(
      this.hedgehog,
      this.movers.map((m) => m.sprite),
      () => (this.onMover = true),
    );

    for (const cone of L.cones) this.scheduleCone(cone);

    this.guide = this.add.image(0, 0, 'icon-right').setScale(0.55).setTint(0xffe27a).setDepth(30).setVisible(false);

    const cam = this.cameras.main;
    cam.startFollow(this.hedgehog.visual, true, 0.08, 0.08, 0, 120);
    cam.setDeadzone(240, 200);
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

    AudioManager.playMusic(L.theme as MusicKey);
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
    this.updateGuide();
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
    if (!this.waterZones.some((z) => z.contains(feet.x, feet.y))) return;

    h.setBusy(true);
    AudioManager.sfx('splash');
    this.splash(feet.x, GROUND_Y + 50);
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

  private groundTopAt(x: number): number | null {
    const seg = this.level.ground.find((s) => x >= s.x && x <= s.x + s.w);
    return seg ? (seg.y ?? GROUND_Y) : null;
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
      if (!apple.done && this.near(apple.sprite, 70, 60)) {
        this.inspectApple(apple);
        return;
      }
    }

    if (!this.carried) {
      const leaf = this.leaves.find((l) => l.state === 'ground' && this.near(l.sprite, 70, 60));
      if (leaf) this.pickLeaf(leaf);
    }

    const atShelter = Math.abs(this.shelter.x - h.body.center.x) < 110 && Math.abs(this.shelter.y - h.body.bottom) < 80;
    if (atShelter && this.carried) this.deliverLeaf(this.carried);
    else if (atShelter && this.allDone()) this.finishLevel();
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
        { angle: 8, duration: 140, yoyo: true, repeat: 2, onStart: () => AudioManager.sfx('sniff') },
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
          },
        },
        { targets: h.image, scaleY: 0.88, scaleX: 1.08, duration: 110, yoyo: true, repeat: 2 },
        {
          // Spit the apple out – the hedgehog only wanted the larva!
          targets: h.image,
          angle: -10,
          duration: 120,
          yoyo: true,
          onStart: () => {
            AudioManager.sfx('spit');
            this.spitApple(a);
          },
        },
      ],
      onComplete: () => {
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
    const floor = (this.groundTopAt(landX) ?? this.groundTopAt(startX) ?? GROUND_Y) - 24;
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
      },
      onComplete: () => this.tweens.add({ targets: a, alpha: 0.55, duration: 400 }),
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
    this.carried = leaf;
    AudioManager.sfx('pickup');
    leaf.sprite.removeFromDisplayList();
    leaf.sprite.setPosition(0, 0).setAngle(-15).setScale(1.2);
    this.hedgehog.carrySlot.add(leaf.sprite);
  }

  private deliverLeaf(leaf: LeafObj): void {
    const h = this.hedgehog;
    this.carried = null;
    leaf.state = 'delivered';
    h.carrySlot.remove(leaf.sprite);
    this.add.existing(leaf.sprite);
    leaf.sprite.setPosition(h.body.center.x, h.body.top - 20).setDepth(8).setScale(1);

    // Each delivered leaf lands on the shelter, so the nest visibly grows.
    const i = this.shelterLeaves++;
    const tx = this.shelter.x - 80 + ((i * 70) % 170);
    const ty = this.shelter.y - 150 - (i % 2) * 20;
    AudioManager.sfx('deliver');
    this.tweens.add({
      targets: leaf.sprite,
      x: tx,
      y: ty,
      angle: Phaser.Math.Between(-40, 40),
      scale: 1.4,
      duration: 500,
      ease: 'Quad.out',
      onComplete: () => this.sparkles(tx, ty),
    });
    this.tweens.add({ targets: this.shelter, scaleY: 1.06, duration: 150, yoyo: true });
    this.hud.leavesDelivered++;
    this.events.emit('hud', this.hud);
    if (this.allDone()) this.celebrateReady();
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

  private nextTarget(): PointDef | null {
    if (this.carried || this.allDone()) return { x: this.shelter.x, y: this.shelter.y };
    const h = this.hedgehog.body.center;
    const targets: PointDef[] = [
      ...this.apples.filter((a) => !a.done && a.def.worm).map((a) => ({ x: a.sprite.x, y: a.sprite.y })),
      ...this.leaves.filter((l) => l.state === 'ground').map((l) => ({ x: l.sprite.x, y: l.sprite.y })),
    ];
    targets.sort((a, b) => Math.abs(a.x - h.x) - Math.abs(b.x - h.x));
    return targets[0] ?? null;
  }

  /** A gentle arrow above the hedgehog points to the next goal when it is off screen. */
  private updateGuide(): void {
    const target = this.nextTarget();
    const cam = this.cameras.main;
    const visible = target && target.x > cam.scrollX + 60 && target.x < cam.scrollX + GAME_WIDTH - 60;
    if (!target || visible || this.hedgehog.mode === 'busy') {
      this.guide.setVisible(false);
      return;
    }
    const dir = target.x > this.hedgehog.body.center.x ? 1 : -1;
    const bob = Math.sin(this.time.now / 200) * 8;
    this.guide
      .setVisible(true)
      .setTexture(dir > 0 ? 'icon-right' : 'icon-left')
      .setPosition(this.hedgehog.body.center.x + dir * (90 + bob), this.hedgehog.body.top - 70);
  }
}

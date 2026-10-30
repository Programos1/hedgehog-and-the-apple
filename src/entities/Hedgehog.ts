import Phaser from 'phaser';
import { HEDGEHOG_BODY, PHYSICS, jumpVelocities } from '../config';
import { AudioManager } from '../audio/AudioManager';
import { NIBBLES_ATLAS, NIBBLES_SCALE, hasNibblesArt } from './NibblesAnims';

// The player character – Nibbles the hedgehog.
// Physics lives on an invisible arcade sprite; the visible hedgehog is a separate container
// that follows it, so squash/flip animations never disturb collisions.
//
// Movement rules (designed for small kids):
// - walk left/right with one button,
// - jumps start only from standing still; pressing jump while walking makes the hedgehog brake first,
// - every jump has a fixed, predictable arc (no air control, no variable height).
//
// Visuals: frame animations from the Nibbles atlas (tools/slice-sprites.mjs) when available,
// otherwise the procedural placeholder with simple bob/tilt animation.

export type HedgehogMode = 'idle' | 'walk' | 'braking' | 'crouch' | 'air' | 'busy' | 'curled';
export type JumpKind = 'up' | 'forward';
/** Poses used by scripted sequences (apple inspection etc.). */
export type HedgehogPose = 'normal' | 'sniff' | 'eat' | 'spit' | 'hurt';

/** Short crouch before take-off so the jump reads clearly. */
const CROUCH_TIME = 0.09;
/** Walking down a bumpy painted slope briefly leaves the ground – don't treat that as a fall. */
const COYOTE_TIME = 0.1;

export class Hedgehog extends Phaser.Physics.Arcade.Sprite {
  declare body: Phaser.Physics.Arcade.Body;

  mode: HedgehogMode = 'idle';
  facing: 1 | -1 = 1;
  readonly visual: Phaser.GameObjects.Container;
  readonly image: Phaser.GameObjects.Sprite;
  /** Slot on the hedgehog's back where carried leaves are shown. */
  readonly carrySlot: Phaser.GameObjects.Container;
  /** Base display scale of the image; animations scale relative to it. */
  readonly baseScale: number;
  private readonly framed: boolean;

  private pendingJump: JumpKind | null = null;
  private crouchTimer = 0;
  private landTimer = 0;
  private airVx = 0;
  private jumpGrace = 0;
  private animTime = 0;
  private offGround = 0;
  /** World scale: size, speed and jump sizes are multiplied by it. */
  readonly k: number;
  private readonly jump: ReturnType<typeof jumpVelocities>;

  constructor(scene: Phaser.Scene, x: number, y: number, k = 1) {
    super(scene, x, y, 'hedgehog');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setVisible(false);
    this.setOrigin(0.5, 1);
    this.k = k;
    this.jump = jumpVelocities(k);
    const bw = HEDGEHOG_BODY.width * k, bh = HEDGEHOG_BODY.height * k;
    this.body.setSize(bw, bh);
    this.body.setOffset((this.width - bw) / 2, this.height - bh);
    this.setCollideWorldBounds(true);

    this.framed = hasNibblesArt(scene);
    this.baseScale = (this.framed ? NIBBLES_SCALE : 1) * k;
    this.image = this.framed
      ? scene.add.sprite(0, 0, NIBBLES_ATLAS, 'idle_0').setOrigin(0.5, 1)
      : scene.add.sprite(0, 0, 'hedgehog').setOrigin(0.5, 1);
    this.image.setScale(this.baseScale);
    this.carrySlot = scene.add.container((this.framed ? -22 : -14) * k, (this.framed ? -100 : -78) * k).setScale(k);
    this.visual = scene.add.container(x, y, [this.image, this.carrySlot]).setDepth(20);

    scene.events.on(Phaser.Scenes.Events.POST_UPDATE, this.syncVisual, this);
    this.once(Phaser.GameObjects.Events.DESTROY, () => {
      scene.events.off(Phaser.Scenes.Events.POST_UPDATE, this.syncVisual, this);
      this.visual.destroy();
    });
  }

  get grounded(): boolean {
    return this.body.blocked.down || this.body.touching.down;
  }

  /** Bottom-center of the physics body. */
  get feet(): Phaser.Math.Vector2 {
    return new Phaser.Math.Vector2(this.body.center.x, this.body.bottom);
  }

  /** Per-frame movement. `dir` is -1/0/1, jump flags are single presses. */
  control(dt: number, dir: -1 | 0 | 1, jumpUp: boolean, jumpForward: boolean): void {
    this.animTime += dt;
    if (this.landTimer > 0) this.landTimer -= dt;
    if (this.mode === 'busy' || this.mode === 'curled') {
      if (this.grounded) this.body.setVelocityX(0);
      return;
    }
    if (this.jumpGrace > 0) this.jumpGrace -= dt;

    if (this.mode === 'crouch') {
      this.body.setVelocityX(0);
      this.crouchTimer -= dt;
      if (this.crouchTimer <= 0 && this.pendingJump) this.launch(this.pendingJump);
      return;
    }

    this.offGround = this.grounded ? 0 : this.offGround + dt;
    const onGround = this.grounded || (this.mode !== 'air' && this.offGround < COYOTE_TIME && this.body.velocity.y >= 0);
    if (!onGround) {
      if (this.mode !== 'air') {
        // Walked off a ledge: keep the walking speed for a natural fall.
        this.airVx = this.body.velocity.x;
        this.mode = 'air';
        this.pendingJump = null;
      }
      this.body.setVelocityX(this.airVx);
      return;
    }

    if (this.mode === 'air' && this.jumpGrace <= 0) this.land();
    if (this.mode === 'air') return;

    const requested: JumpKind | null = jumpUp ? 'up' : jumpForward ? 'forward' : null;
    if (requested && !this.pendingJump) this.pendingJump = requested;

    if (this.pendingJump) {
      // Brake to a stop, then jump – the child never has to time the stop perfectly.
      const vx = this.body.velocity.x;
      const next = Math.sign(vx) * Math.max(0, Math.abs(vx) - PHYSICS.brakeDecel * dt);
      this.body.setVelocityX(next);
      this.mode = 'braking';
      if (Math.abs(next) < 1) {
        this.mode = 'crouch';
        this.crouchTimer = this.framed ? CROUCH_TIME : 0;
        if (this.crouchTimer <= 0) this.launch(this.pendingJump);
      }
      return;
    }

    this.body.setVelocityX(dir * PHYSICS.walkSpeed * this.k);
    if (dir !== 0) this.facing = dir;
    this.mode = dir === 0 ? 'idle' : 'walk';
  }

  private launch(kind: JumpKind): void {
    this.pendingJump = null;
    this.mode = 'air';
    this.jumpGrace = 0.1;
    if (kind === 'up') {
      this.airVx = 0;
      this.body.setVelocityY(-this.jump.vUp);
    } else {
      this.airVx = this.facing * this.jump.vFwdX;
      this.body.setVelocityY(-this.jump.vFwdY);
    }
    this.body.setVelocityX(this.airVx);
    AudioManager.sfx('jump');
    const s = this.baseScale;
    this.scene.tweens.add({ targets: this.image, scaleY: s * 1.1, scaleX: s * 0.94, duration: 120, yoyo: true });
  }

  private land(): void {
    this.mode = 'idle';
    this.airVx = 0;
    this.landTimer = 0.2;
    this.body.setVelocityX(0);
    AudioManager.sfx('land');
    const s = this.baseScale;
    this.scene.tweens.add({ targets: this.image, scaleY: s * 0.88, scaleX: s * 1.08, duration: 90, yoyo: true });
  }

  /** Stops all movement and hands control to a scripted sequence. */
  setBusy(busy: boolean): void {
    this.pendingJump = null;
    this.mode = busy ? 'busy' : 'idle';
    this.body.setVelocityX(0);
    if (!busy) this.setPose('normal');
  }

  /** Shows a pose during scripted sequences (no-op for the placeholder art). */
  setPose(pose: HedgehogPose): void {
    if (!this.framed) return;
    switch (pose) {
      case 'sniff':
        this.image.stop().setFrame('discover_0');
        break;
      case 'eat':
        this.image.play('nib-eat', true);
        break;
      case 'spit':
        this.image.play('nib-spit', true);
        break;
      case 'hurt':
        this.image.stop().setFrame('hurt_0');
        break;
      default:
        this.image.play('nib-idle', true);
    }
  }

  /** Harmless "hit": the hedgehog curls up for a moment, like real hedgehogs do when scared. */
  curlUp(duration = 1300): void {
    if (this.mode === 'curled') return;
    this.mode = 'curled';
    this.pendingJump = null;
    this.body.setVelocityX(0);
    AudioManager.sfx('curl');
    if (this.framed) {
      this.setPose('hurt');
    } else {
      this.image.setTexture('hedgehog-curled');
      this.scene.tweens.add({ targets: this.image, angle: 360 * this.facing, duration: 500 });
    }
    this.scene.time.delayedCall(duration, () => {
      if (this.mode !== 'curled') return;
      if (!this.framed) this.image.setTexture('hedgehog').setAngle(0);
      this.mode = 'idle';
      this.setPose('normal');
    });
  }

  teleport(x: number, y: number): void {
    this.body.reset(x, y);
    this.mode = 'idle';
    this.airVx = 0;
    this.pendingJump = null;
    this.syncVisual();
  }

  private syncVisual(): void {
    if (!this.body) return;
    this.visual.setPosition(this.body.center.x, this.body.bottom + 4);
    this.visual.scaleX = this.facing;
    if (this.mode === 'curled' || this.mode === 'busy') return;
    if (this.framed) this.animateFrames();
    else this.animatePlaceholder();
  }

  /** Chooses the atlas animation/frame for the current movement state. */
  private animateFrames(): void {
    const img = this.image;
    const vy = this.body.velocity.y;
    switch (this.mode) {
      case 'walk':
        img.play('nib-walk', true);
        break;
      case 'braking':
        img.stop().setFrame('idle_0');
        break;
      case 'crouch':
        img.stop().setFrame('jump_0');
        break;
      case 'air': {
        const forward = this.airVx !== 0;
        const frame = vy < -220 ? 'jump_1' : vy < 220 ? 'jump_2' : forward ? 'jump_3' : 'fall_0';
        img.stop().setFrame(frame);
        break;
      }
      default:
        if (this.landTimer > 0) img.stop().setFrame(this.landTimer > 0.1 ? 'jump_4' : 'land_2');
        else img.play('nib-idle', true);
    }
  }

  /** Lightweight procedural animation for the placeholder hedgehog. */
  private animatePlaceholder(): void {
    const img = this.image;
    if (this.mode === 'walk') {
      img.y = -Math.abs(Math.sin(this.animTime * 11)) * 5;
      img.angle = Math.sin(this.animTime * 11) * 3;
    } else if (this.mode === 'air') {
      img.y = 0;
      img.angle = this.airVx === 0 ? 0 : Phaser.Math.Clamp(this.body.velocity.y / 40, -12, 12);
    } else {
      img.y = 0;
      img.angle = 0;
      if (!this.scene.tweens.isTweening(img)) img.scaleY = 1 + Math.sin(this.animTime * 3) * 0.015;
    }
  }
}

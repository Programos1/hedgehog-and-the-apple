import Phaser from 'phaser';
import { HEDGEHOG_BODY, JUMP, PHYSICS } from '../config';
import { AudioManager } from '../audio/AudioManager';

// The player character.
// Physics lives on an invisible arcade sprite; the visible hedgehog is a separate container
// that follows it, so squash/bob/flip animations never disturb collisions.
//
// Movement rules (designed for small kids):
// - walk left/right with one button,
// - jumps start only from standing still; pressing jump while walking makes the hedgehog brake first,
// - every jump has a fixed, predictable arc (no air control, no variable height).

export type HedgehogMode = 'idle' | 'walk' | 'braking' | 'air' | 'busy' | 'curled';
export type JumpKind = 'up' | 'forward';

export class Hedgehog extends Phaser.Physics.Arcade.Sprite {
  declare body: Phaser.Physics.Arcade.Body;

  mode: HedgehogMode = 'idle';
  facing: 1 | -1 = 1;
  readonly visual: Phaser.GameObjects.Container;
  readonly image: Phaser.GameObjects.Image;
  /** Slot on the hedgehog's back where a carried leaf is shown. */
  readonly carrySlot: Phaser.GameObjects.Container;

  private pendingJump: JumpKind | null = null;
  private airVx = 0;
  private jumpGrace = 0;
  private animTime = 0;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'hedgehog');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setVisible(false);
    this.setOrigin(0.5, 1);
    this.body.setSize(HEDGEHOG_BODY.width, HEDGEHOG_BODY.height);
    this.body.setOffset((this.width - HEDGEHOG_BODY.width) / 2, this.height - HEDGEHOG_BODY.height);
    this.setCollideWorldBounds(true);

    this.image = scene.add.image(0, 0, 'hedgehog').setOrigin(0.5, 1);
    this.carrySlot = scene.add.container(-14, -78);
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
    if (this.mode === 'busy' || this.mode === 'curled') {
      if (this.grounded) this.body.setVelocityX(0);
      return;
    }
    if (this.jumpGrace > 0) this.jumpGrace -= dt;

    if (!this.grounded) {
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
      if (Math.abs(next) < 1) this.jump(this.pendingJump);
      return;
    }

    this.body.setVelocityX(dir * PHYSICS.walkSpeed);
    if (dir !== 0) this.facing = dir;
    this.mode = dir === 0 ? 'idle' : 'walk';
  }

  private jump(kind: JumpKind): void {
    this.pendingJump = null;
    this.mode = 'air';
    this.jumpGrace = 0.1;
    if (kind === 'up') {
      this.airVx = 0;
      this.body.setVelocityY(-JUMP.vUp);
    } else {
      this.airVx = this.facing * JUMP.vFwdX;
      this.body.setVelocityY(-JUMP.vFwdY);
    }
    this.body.setVelocityX(this.airVx);
    AudioManager.sfx('jump');
    this.scene.tweens.add({ targets: this.image, scaleY: 1.12, scaleX: 0.92, duration: 120, yoyo: true });
  }

  private land(): void {
    this.mode = 'idle';
    this.airVx = 0;
    this.body.setVelocityX(0);
    AudioManager.sfx('land');
    this.scene.tweens.add({ targets: this.image, scaleY: 0.85, scaleX: 1.1, duration: 90, yoyo: true });
  }

  /** Stops all movement and hands control to a scripted sequence. */
  setBusy(busy: boolean): void {
    this.pendingJump = null;
    this.mode = busy ? 'busy' : 'idle';
    this.body.setVelocityX(0);
  }

  /** Harmless "hit": the hedgehog curls into a ball for a moment, like real hedgehogs do. */
  curlUp(duration = 1300): void {
    if (this.mode === 'curled') return;
    this.mode = 'curled';
    this.pendingJump = null;
    this.body.setVelocityX(0);
    AudioManager.sfx('curl');
    this.image.setTexture('hedgehog-curled');
    this.scene.tweens.add({ targets: this.image, angle: 360 * this.facing, duration: 500 });
    this.scene.time.delayedCall(duration, () => {
      if (this.mode !== 'curled') return;
      this.image.setTexture('hedgehog').setAngle(0);
      this.mode = 'idle';
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

    // Lightweight procedural animation until real sprite animations exist.
    if (this.mode === 'walk') {
      this.image.y = -Math.abs(Math.sin(this.animTime * 11)) * 5;
      this.image.angle = Math.sin(this.animTime * 11) * 3;
    } else if (this.mode === 'air') {
      this.image.y = 0;
      this.image.angle = Phaser.Math.Clamp(this.body.velocity.y / 40, -12, 12) * (this.airVx === 0 ? 0 : 1);
    } else {
      this.image.y = 0;
      this.image.angle = 0;
      this.image.scaleY = this.scene.tweens.isTweening(this.image) ? this.image.scaleY : 1 + Math.sin(this.animTime * 3) * 0.015;
    }
  }
}

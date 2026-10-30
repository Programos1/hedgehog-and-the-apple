import Phaser from 'phaser';
import { AudioManager } from '../audio/AudioManager';

// Big round icon button used everywhere in the UI. Sized for small fingers.

export interface RoundButtonOptions {
  radius?: number;
  color?: number;
  /** Called on press (finger down). */
  onDown?: () => void;
  /** Called when the finger is lifted or slides off the button. */
  onUp?: () => void;
  /** Called on a completed tap (down + up on the button). */
  onTap?: () => void;
  silent?: boolean;
}

export class RoundButton extends Phaser.GameObjects.Container {
  private readonly circle: Phaser.GameObjects.Arc;
  readonly icon: Phaser.GameObjects.Image;
  private pressed = false;

  constructor(scene: Phaser.Scene, x: number, y: number, iconKey: string, opts: RoundButtonOptions = {}) {
    super(scene, x, y);
    const r = opts.radius ?? 80;
    const shadow = scene.add.circle(0, 8, r, 0x000000, 0.25);
    this.circle = scene.add.circle(0, 0, r, opts.color ?? 0xe0892e).setStrokeStyle(6, 0xfff3d6);
    this.icon = scene.add.image(0, 0, iconKey).setScale((r * 1.1) / 96);
    this.add([shadow, this.circle, this.icon]);
    this.setSize(r * 2, r * 2);
    this.setInteractive(new Phaser.Geom.Circle(r, r, r), Phaser.Geom.Circle.Contains);
    scene.add.existing(this);

    this.on(Phaser.Input.Events.POINTER_DOWN, () => {
      this.pressed = true;
      this.setScale(0.92);
      if (!opts.silent) AudioManager.sfx('tap');
      opts.onDown?.();
    });
    const release = (tapped: boolean) => {
      if (!this.pressed) return;
      this.pressed = false;
      this.setScale(1);
      opts.onUp?.();
      if (tapped) opts.onTap?.();
    };
    this.on(Phaser.Input.Events.POINTER_UP, () => release(true));
    this.on(Phaser.Input.Events.POINTER_OUT, () => release(false));
  }

  setIcon(key: string): this {
    this.icon.setTexture(key);
    return this;
  }

  setEnabled(enabled: boolean): this {
    this.setAlpha(enabled ? 1 : 0.5);
    if (enabled) this.setInteractive();
    else this.disableInteractive();
    return this;
  }
}

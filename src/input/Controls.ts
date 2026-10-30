import Phaser from 'phaser';

// Unified input layer: keyboard and on-screen touch buttons produce the same actions.
// Design rule for small kids: one button = one action, never a combination.
// Holding left and right together cancels movement instead of doing something surprising.

export type TapAction = 'jumpUp' | 'jumpForward' | 'pause';

class ControlsState {
  private keyLeft = false;
  private keyRight = false;
  private touchLeft = false;
  private touchRight = false;
  private queued = new Set<TapAction>();
  private keys: Record<string, Phaser.Input.Keyboard.Key> | null = null;

  /** Registers keyboard keys for the given scene. Call once in the gameplay scene's create(). */
  bindKeyboard(scene: Phaser.Scene): void {
    const kb = scene.input.keyboard;
    if (!kb) return;
    const K = Phaser.Input.Keyboard.KeyCodes;
    this.keys = kb.addKeys({
      left: K.LEFT,
      a: K.A,
      right: K.RIGHT,
      d: K.D,
      up: K.UP,
      w: K.W,
      space: K.SPACE,
      esc: K.ESC,
      p: K.P,
    }) as Record<string, Phaser.Input.Keyboard.Key>;

    const on = (key: Phaser.Input.Keyboard.Key, action: TapAction) => key.on('down', () => this.press(action));
    on(this.keys.up, 'jumpUp');
    on(this.keys.w, 'jumpUp');
    on(this.keys.space, 'jumpForward');
    on(this.keys.esc, 'pause');
    on(this.keys.p, 'pause');

    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.keys = null;
      this.reset();
    });
  }

  /** Polls held keys. Call every frame before reading direction. */
  update(): void {
    if (!this.keys) return;
    this.keyLeft = this.keys.left.isDown || this.keys.a.isDown;
    this.keyRight = this.keys.right.isDown || this.keys.d.isDown;
  }

  setTouchHeld(dir: 'left' | 'right', held: boolean): void {
    if (dir === 'left') this.touchLeft = held;
    else this.touchRight = held;
  }

  press(action: TapAction): void {
    this.queued.add(action);
  }

  /** Returns true once per press. */
  consume(action: TapAction): boolean {
    return this.queued.delete(action);
  }

  clearTaps(): void {
    this.queued.clear();
  }

  /** -1 = left, 1 = right, 0 = none (or both held). */
  get direction(): -1 | 0 | 1 {
    const left = this.keyLeft || this.touchLeft;
    const right = this.keyRight || this.touchRight;
    if (left === right) return 0;
    return left ? -1 : 1;
  }

  reset(): void {
    this.keyLeft = this.keyRight = this.touchLeft = this.touchRight = false;
    this.queued.clear();
  }
}

export const Controls = new ControlsState();

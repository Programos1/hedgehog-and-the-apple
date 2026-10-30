import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '../config';
import { Controls } from '../input/Controls';
import { RoundButton } from '../ui/RoundButton';
import type { HudState } from './GameScene';
import { NIBBLES_ATLAS, hasNibblesArt } from '../entities/NibblesAnims';

// Heads-up display drawn over the game: goals as picture slots (no numbers to read),
// a pause button and – on touch devices – four big control buttons.

export class HudScene extends Phaser.Scene {
  private wormSlots: Phaser.GameObjects.Image[] = [];
  private leafSlots: Phaser.GameObjects.Image[] = [];

  constructor() {
    super('Hud');
  }

  create(data: { hud: HudState }): void {
    this.input.addPointer(3);
    const hud = data.hud;

    // Goal panel: hedgehog portrait + one slot per larva and per leaf.
    const slots = hud.wormsTotal + hud.leavesTotal;
    const panelW = 160 + slots * 78;
    this.add.rectangle(24, 24, panelW, 120, 0x3b2a1e, 0.55).setOrigin(0, 0).setStrokeStyle(4, 0xfff3d6, 0.8);
    this.add.circle(84, 84, 48, 0xf6e2b0).setStrokeStyle(4, 0xfff3d6);
    if (hasNibblesArt(this)) this.add.image(84, 126, NIBBLES_ATLAS, 'face_happy').setOrigin(0.5, 1).setScale(0.8);
    else this.add.image(84, 112, 'hedgehog').setOrigin(0.5, 1).setScale(0.62);

    let x = 170;
    this.wormSlots = [];
    for (let i = 0; i < hud.wormsTotal; i++, x += 78) this.wormSlots.push(this.add.image(x, 84, 'larva').setScale(1.3));
    x += 10;
    this.leafSlots = [];
    for (let i = 0; i < hud.leavesTotal; i++, x += 78) this.leafSlots.push(this.add.image(x, 84, 'leaf').setScale(1.1));
    this.refresh(hud);

    const game = this.scene.get('Game');
    game.events.on('hud', this.refresh, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => game.events.off('hud', this.refresh, this));

    new RoundButton(this, GAME_WIDTH - 90, 90, 'icon-pause', { radius: 56, color: 0x6c8fb3, onTap: () => Controls.press('pause') });

    if (this.showTouchControls()) this.createTouchControls();
  }

  private showTouchControls(): boolean {
    const param = new URLSearchParams(location.search).get('touch');
    if (param === '1') return true;
    if (param === '0') return false;
    return this.sys.game.device.input.touch;
  }

  private createTouchControls(): void {
    const y = GAME_HEIGHT - 130;
    const r = 105;
    const alpha = 0.85;
    const hold = (dir: 'left' | 'right') => ({
      radius: r,
      silent: true,
      onDown: () => Controls.setTouchHeld(dir, true),
      onUp: () => Controls.setTouchHeld(dir, false),
    });
    new RoundButton(this, 150, y, 'icon-left', hold('left')).setAlpha(alpha);
    new RoundButton(this, 390, y, 'icon-right', hold('right')).setAlpha(alpha);
    new RoundButton(this, GAME_WIDTH - 390, y, 'icon-jumpUp', {
      radius: r,
      color: 0x5aa83a,
      silent: true,
      onDown: () => Controls.press('jumpUp'),
    }).setAlpha(alpha);
    new RoundButton(this, GAME_WIDTH - 150, y, 'icon-jumpForward', {
      radius: r,
      color: 0x5aa83a,
      silent: true,
      onDown: () => Controls.press('jumpForward'),
    }).setAlpha(alpha);
  }

  private refresh(hud: HudState): void {
    this.wormSlots.forEach((img, i) => this.setSlot(img, i < hud.wormsEaten));
    this.leafSlots.forEach((img, i) => this.setSlot(img, i < hud.leavesDelivered));
  }

  private setSlot(img: Phaser.GameObjects.Image, filled: boolean): void {
    const wasFilled = img.getData('filled') === true;
    img.setData('filled', filled);
    if (filled) {
      img.clearTint().setAlpha(1);
      if (!wasFilled) this.tweens.add({ targets: img, scale: img.scale * 1.4, duration: 180, yoyo: true });
    } else {
      img.setTint(0x222222).setAlpha(0.45);
    }
  }
}

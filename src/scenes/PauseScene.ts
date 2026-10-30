import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '../config';
import { AudioManager } from '../audio/AudioManager';
import { RoundButton } from '../ui/RoundButton';
import { t } from '../data/texts';

// Pause overlay: continue, restart level, back to menu, sound on/off.

export class PauseScene extends Phaser.Scene {
  constructor() {
    super('Pause');
  }

  create(data: { levelId: number }): void {
    this.scene.pause('Hud');
    this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x1d2a18, 0.7).setOrigin(0).setInteractive();
    this.add
      .text(GAME_WIDTH / 2, 300, t('paused'), { fontFamily: 'Trebuchet MS', fontSize: '84px', color: '#fff3d6', stroke: '#3b2a1e', strokeThickness: 10 })
      .setOrigin(0.5);

    const cy = 560;
    new RoundButton(this, GAME_WIDTH / 2, cy, 'icon-play', { radius: 120, color: 0x5aa83a, onTap: () => this.resume() });
    new RoundButton(this, GAME_WIDTH / 2 - 300, cy, 'icon-replay', { radius: 80, onTap: () => this.restart(data.levelId) });
    new RoundButton(this, GAME_WIDTH / 2 + 300, cy, 'icon-home', { radius: 80, onTap: () => this.home() });
    const sound = new RoundButton(this, GAME_WIDTH / 2, cy + 260, AudioManager.muted ? 'icon-mute' : 'icon-sound', {
      radius: 60,
      color: 0x6c8fb3,
      onTap: () => sound.setIcon(AudioManager.toggleMute() ? 'icon-mute' : 'icon-sound'),
    });

    this.input.keyboard?.once('keydown-ESC', () => this.resume());
    this.input.keyboard?.once('keydown-P', () => this.resume());
  }

  private resume(): void {
    this.scene.resume('Hud');
    this.scene.resume('Game');
    this.scene.stop();
  }

  private restart(levelId: number): void {
    this.scene.stop('Hud');
    this.scene.stop();
    this.scene.start('Game', { levelId });
  }

  private home(): void {
    this.scene.stop('Hud');
    this.scene.stop('Game');
    this.scene.start('Menu');
  }
}

import Phaser from 'phaser';
import { COPYRIGHT, GAME_HEIGHT, GAME_WIDTH } from '../config';
import { AudioManager } from '../audio/AudioManager';
import { RoundButton } from '../ui/RoundButton';
import { LEVELS } from '../levels';
import { Progress } from '../systems/Progress';
import { t } from '../data/texts';
import { NIBBLES_ATLAS, hasNibblesArt } from '../entities/NibblesAnims';

// Main menu: title, three big level cards (locked ones show a padlock), sound toggle, copyright.

export class MenuScene extends Phaser.Scene {
  constructor() {
    super('Menu');
  }

  create(): void {
    for (const [key, i] of [['bg-meadow-sky', 0], ['bg-meadow-far', 1], ['bg-meadow-mid', 2], ['bg-meadow-near', 3]] as const) {
      const img = this.add.image(0, 0, key).setOrigin(0).setDepth(i);
      img.setScale(GAME_HEIGHT / img.height);
    }
    const style = { fontFamily: 'Trebuchet MS', color: '#fff3d6', stroke: '#3b2a1e', strokeThickness: 14 };
    this.add.text(GAME_WIDTH / 2, 150, t('title'), { ...style, fontSize: '100px' }).setOrigin(0.5).setDepth(10);

    const hero = hasNibblesArt(this)
      ? this.add.sprite(GAME_WIDTH / 2 - 120, 400, NIBBLES_ATLAS, 'idle_0').setOrigin(0.5, 1).setScale(2).play('nib-idle')
      : this.add.image(GAME_WIDTH / 2 - 120, 340, 'hedgehog').setScale(1.8);
    hero.setDepth(10);
    this.add.image(GAME_WIDTH / 2 + 120, 330, 'apple').setScale(1.8).setDepth(10);
    this.tweens.add({ targets: hero, y: hero.y - 20, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.inOut' });

    const unlocked = Progress.get().unlocked;
    LEVELS.forEach((level, i) => {
      const x = GAME_WIDTH / 2 + (i - (LEVELS.length - 1) / 2) * 460;
      const y = 680;
      const open = level.extra || level.id <= unlocked;
      const card = this.add.container(x, y).setDepth(10);
      const frame = this.add.rectangle(0, 0, 420, 270, 0x3b2a1e, 0.6).setStrokeStyle(8, open ? 0xfff3d6 : 0x888888);
      const thumb = this.add.image(0, -10, level.painted?.key ?? level.kit?.mid ?? `bg-${level.theme}-mid`).setDisplaySize(390, 210);
      const sky = this.add.image(0, -10, level.painted?.key ?? level.kit?.far ?? `bg-${level.theme}-sky`).setDisplaySize(390, 210);
      card.add([frame, sky, thumb]);
      card.add(this.add.text(0, 165, t(level.nameKey), { ...style, fontSize: '40px', strokeThickness: 8 }).setOrigin(0.5));
      if (open) {
        card.add(new RoundButton(this, 0, -10, 'icon-play', { radius: 70, color: 0x5aa83a, onTap: () => this.startLevel(level.id) }));
      } else {
        thumb.setTint(0x666666);
        sky.setTint(0x666666);
        card.add(this.add.image(0, -10, 'icon-lock').setScale(1.2));
      }
    });

    const sound = new RoundButton(this, GAME_WIDTH - 90, 90, AudioManager.muted ? 'icon-mute' : 'icon-sound', {
      radius: 56,
      color: 0x6c8fb3,
      onTap: () => sound.setIcon(AudioManager.toggleMute() ? 'icon-mute' : 'icon-sound'),
    }).setDepth(10);

    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT - 28, COPYRIGHT, { fontFamily: 'Trebuchet MS', fontSize: '22px', color: '#fff3d6', stroke: '#3b2a1e', strokeThickness: 4 })
      .setOrigin(0.5, 1)
      .setDepth(10);

    this.cameras.main.fadeIn(300);
  }

  private startLevel(levelId: number): void {
    // Fullscreen hides browser bars on phones/tablets; must be triggered by a tap.
    if (this.sys.game.device.input.touch && !this.scale.isFullscreen) {
      try {
        this.scale.startFullscreen();
      } catch {
        // Not supported (e.g. iOS Safari) – play in the normal window.
      }
    }
    this.scene.start('Game', { levelId });
  }
}

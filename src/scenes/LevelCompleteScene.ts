import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '../config';
import { RoundButton } from '../ui/RoundButton';
import { FACTS } from '../data/facts';
import { LEVELS } from '../levels';
import { Progress } from '../systems/Progress';
import { t } from '../data/texts';
import { NIBBLES_ATLAS, hasNibblesArt } from '../entities/NibblesAnims';

// Shown after the hedgehog goes to sleep in its nest: celebration + "Did you know?" fact card.

/** Nibbles pose drawn on top of a fact card (card-local coordinates, card is 420x300). */
const FACT_POSES: Record<string, { frame: string; x: number; y: number; scale: number }> = {
  insectivore: { frame: 'eat_0', x: -70, y: 120, scale: 1.7 },
  curlUp: { frame: 'hurt_0', x: 0, y: 125, scale: 2 },
};

export class LevelCompleteScene extends Phaser.Scene {
  constructor() {
    super('LevelComplete');
  }

  create(data: { levelId: number }): void {
    const level = LEVELS.find((l) => l.id === data.levelId) ?? LEVELS[0];
    const next = LEVELS.find((l) => l.id === level.id + 1);
    if (next) Progress.unlock(next.id);
    this.scene.stop('Hud');

    this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x1d2a18, 0.75).setOrigin(0).setInteractive();
    const cx = GAME_WIDTH / 2;
    const style = { fontFamily: 'Trebuchet MS', color: '#fff3d6', stroke: '#3b2a1e', strokeThickness: 10 };

    if (hasNibblesArt(this)) {
      // Happy Nibbles peeking out of the finished nest
      const nest = this.add.image(cx - 560, 640, NIBBLES_ATLAS, 'celebrate_0').setOrigin(0.5, 1).setScale(2.2);
      this.tweens.add({ targets: nest, scaleY: 2.3, duration: 700, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    } else {
      // Sleeping hedgehog in its nest
      this.add.image(cx - 560, 560, 'shelter').setScale(1.1);
      const zzz = this.add.text(cx - 470, 330, 'z z z', { ...style, fontSize: '56px' }).setOrigin(0.5);
      this.tweens.add({ targets: zzz, y: 300, alpha: 0.4, duration: 1200, yoyo: true, repeat: -1 });
    }

    const fact = FACTS[level.factId];
    this.add.text(cx + 160, 130, t('didYouKnow'), { ...style, fontSize: '64px' }).setOrigin(0.5);
    const card = this.add.container(cx + 160, 410, [this.add.image(0, 0, fact.image)]).setScale(0);
    const pose = FACT_POSES[fact.id];
    if (pose && hasNibblesArt(this)) card.add(this.add.image(pose.x, pose.y, NIBBLES_ATLAS, pose.frame).setOrigin(0.5, 1).setScale(pose.scale));
    this.tweens.add({ targets: card, scale: 1.15, duration: 500, ease: 'Back.out', delay: 300 });
    this.add
      .text(cx + 160, 600, fact.text, { ...style, fontSize: '38px', strokeThickness: 7, align: 'center', wordWrap: { width: 780 } })
      .setOrigin(0.5, 0);

    if (!next) this.add.text(cx, 40, t('allDone'), { ...style, fontSize: '44px' }).setOrigin(0.5, 0);

    const by = GAME_HEIGHT - 130;
    new RoundButton(this, cx - 680, by, 'icon-home', { radius: 75, onTap: () => this.go('Menu') });
    new RoundButton(this, cx - 440, by, 'icon-replay', { radius: 75, onTap: () => this.go('Game', level.id) });
    if (next) {
      const nextBtn = new RoundButton(this, cx + 160, by, 'icon-next', { radius: 110, color: 0x5aa83a, onTap: () => this.go('Game', next.id) });
      this.tweens.add({ targets: nextBtn, scale: 1.08, duration: 600, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    }
  }

  private go(scene: 'Menu' | 'Game', levelId?: number): void {
    this.scene.stop('Game');
    this.scene.start(scene, { levelId });
  }
}

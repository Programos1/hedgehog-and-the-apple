import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH, PHYSICS } from './config';
import { AudioManager } from './audio/AudioManager';
import { BootScene } from './scenes/BootScene';
import { MenuScene } from './scenes/MenuScene';
import { GameScene } from './scenes/GameScene';
import { HudScene } from './scenes/HudScene';
import { PauseScene } from './scenes/PauseScene';
import { LevelCompleteScene } from './scenes/LevelCompleteScene';

// Nibbles' Little Adventure – © 2026 Tomáš Horák. All rights reserved.

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: '#2f4a2a',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: 'arcade',
    arcade: { gravity: { x: 0, y: PHYSICS.gravity }, debug: new URLSearchParams(location.search).has('debug') },
  },
  input: { activePointers: 4 },
  scene: [BootScene, MenuScene, GameScene, HudScene, PauseScene, LevelCompleteScene],
});

AudioManager.init(game);

// Expose the game for automated browser tests and debugging.
(window as unknown as { __game: Phaser.Game }).__game = game;

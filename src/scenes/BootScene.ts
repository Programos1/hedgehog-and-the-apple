import Phaser from 'phaser';
import { ATLAS_MANIFEST, AUDIO_MANIFEST, IMAGE_MANIFEST } from '../assets/manifest';
import { createNibblesAnims } from '../entities/NibblesAnims';
import { generatePlaceholderArt } from '../art/PlaceholderArt';

// Loads real assets listed in the manifest, then fills every missing texture with a placeholder.

export class BootScene extends Phaser.Scene {
  private failed = new Set<string>();

  constructor() {
    super('Boot');
  }

  preload(): void {
    this.load.on(Phaser.Loader.Events.FILE_LOAD_ERROR, (file: Phaser.Loader.File) => {
      console.warn(`Asset failed to load, using placeholder: ${file.key} (${file.src})`);
      this.failed.add(file.key);
    });
    for (const [key, path] of Object.entries(IMAGE_MANIFEST)) if (path) this.load.image(key, path);
    for (const [key, atlas] of Object.entries(ATLAS_MANIFEST)) if (atlas) this.load.atlas(key, atlas.image, atlas.json);
    for (const [key, path] of Object.entries(AUDIO_MANIFEST.sfx)) if (path) this.load.audio(`sfx-${key}`, path);
    for (const [key, path] of Object.entries(AUDIO_MANIFEST.music)) if (path) this.load.audio(`music-${key}`, path);
  }

  create(): void {
    generatePlaceholderArt(this, (key) => this.textures.exists(key) && !this.failed.has(key));
    createNibblesAnims(this);
    this.scene.start('Menu');
  }
}

import Phaser from 'phaser';

// Frame animations for Nibbles, built from the texture atlas cut out of the reference sheet
// (docs/reference/jezek.ikony.png → tools/slice-sprites.mjs → public/assets/images/nibbles.*).

export const NIBBLES_ATLAS = 'nibbles';
/** The sheet frames are ~110 px wide; this scale makes Nibbles ~130 px in the 1920x1080 game. */
export const NIBBLES_SCALE = 1.2;

export function hasNibblesArt(scene: Phaser.Scene): boolean {
  return scene.textures.exists(NIBBLES_ATLAS) && scene.textures.get(NIBBLES_ATLAS).has('idle_0');
}

export function createNibblesAnims(scene: Phaser.Scene): void {
  if (!hasNibblesArt(scene)) return;
  const frames = (...names: string[]) => names.map((frame) => ({ key: NIBBLES_ATLAS, frame }));
  const add = (key: string, names: string[], frameRate: number, repeat = -1, yoyo = false) => {
    if (!scene.anims.exists(key)) scene.anims.create({ key, frames: frames(...names), frameRate, repeat, yoyo });
  };
  add('nib-idle', ['idle_0', 'idle_1', 'idle_2', 'idle_3'], 3, -1, true);
  add('nib-walk', ['walk_0', 'walk_1', 'walk_2', 'walk_3'], 8);
  add('nib-eat', ['eat_0', 'eat_1'], 6);
  add('nib-spit', ['spit_0', 'spit_1'], 8, 0);
}

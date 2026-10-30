// Asset manifest – the single place where real artwork and audio are plugged in.
//
// Every texture key used by the game has a procedural placeholder (src/art/PlaceholderArt.ts).
// To replace a placeholder, put the file into public/assets/... and write its path here.
// No gameplay code needs to change. See docs/ASSETS.md for sizes and naming.

export const IMAGE_MANIFEST: Record<string, string | null> = {
  // Characters and objects
  hedgehog: null, // 128x96, facing right, feet at the bottom edge
  'hedgehog-curled': null, // 84x84
  apple: 'assets/images/apple.png', // ~60x70, cut from docs/reference/jablko.png (npm run apple)
  'apple-bitten': 'assets/images/apple-bitten.png',
  larva: null, // 48x20
  leaf: null, // 56x40
  shelter: null, // 300x200, bottom edge = ground
  'pine-cone': null, // 34x46
  // Theme tiles (meadow / forest / valley)
  'ground-meadow': null, // 128x512 tile (repeats horizontally), grass on top
  'ground-forest': null,
  'ground-valley': null,
  'platform-meadow': null, // 64x36 tile
  'platform-forest': null,
  'platform-valley': null,
  'moving-meadow': null, // 64x36 tile
  'moving-forest': null,
  'moving-valley': null,
  water: null, // 128x200 tile
  // Parallax backgrounds, 1920x1080 each, transparent except the sky layer
  'bg-meadow-sky': null,
  'bg-meadow-far': null,
  'bg-meadow-mid': null,
  'bg-meadow-near': null,
  'bg-forest-sky': null,
  'bg-forest-far': null,
  'bg-forest-mid': null,
  'bg-forest-near': null,
  'bg-valley-sky': null,
  'bg-valley-far': null,
  'bg-valley-mid': null,
  'bg-valley-near': null,
  // Painted level backgrounds (tools/trace-level.mjs)
  'scene-test': 'assets/levels/test-scene.png',
  // Fact card illustrations, 420x300
  'fact-insectivore': null,
  'fact-larva': null,
  'fact-curl': null,
};

// Texture atlases (PNG + Phaser JSON hash). nibbles = the hedgehog, cut from
// docs/reference/jezek.ikony.png by `npm run sprites`.
export const ATLAS_MANIFEST: Record<string, { image: string; json: string } | null> = {
  nibbles: { image: 'assets/images/nibbles.png', json: 'assets/images/nibbles.json' },
};

export type SfxKey =
  | 'jump'
  | 'land'
  | 'pickup'
  | 'sniff'
  | 'discover'
  | 'yum'
  | 'spit'
  | 'nope'
  | 'deliver'
  | 'splash'
  | 'curl'
  | 'complete'
  | 'tap';

export const AUDIO_MANIFEST: {
  sfx: Record<SfxKey, string | null>;
  musicPlaylist: string[];
} = {
  sfx: {
    jump: null,
    land: null,
    pickup: null,
    sniff: null,
    discover: null,
    yum: null,
    spit: null,
    nope: null,
    deliver: null,
    splash: null,
    curl: null,
    complete: null,
    tap: null,
  },
  // One soundtrack for the whole game (menu and all levels): the tracks play one after another
  // and the playlist loops. They are streamed, not preloaded, so the game starts quickly.
  musicPlaylist: [
    'assets/audio/music/music-01.mp3',
    'assets/audio/music/music-02.mp3',
    'assets/audio/music/music-03.mp3',
    'assets/audio/music/music-04.mp3',
    'assets/audio/music/music-05.mp3',
    'assets/audio/music/music-06.mp3',
  ],
};

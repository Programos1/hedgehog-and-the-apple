// Asset manifest – the single place where real artwork and audio are plugged in.
//
// Every texture key used by the game has a procedural placeholder (src/art/PlaceholderArt.ts).
// To replace a placeholder, put the file into public/assets/... and write its path here.
// No gameplay code needs to change. See docs/ASSETS.md for sizes and naming.

export const IMAGE_MANIFEST: Record<string, string | null> = {
  // Characters and objects
  hedgehog: null, // 128x96, facing right, feet at the bottom edge
  'hedgehog-curled': null, // 84x84
  apple: null, // 52x56
  'apple-bitten': null, // 52x56
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
  // Fact card illustrations, 420x300
  'fact-insectivore': null,
  'fact-larva': null,
  'fact-curl': null,
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

export type MusicKey = 'menu' | 'meadow' | 'forest' | 'valley';

export const AUDIO_MANIFEST: {
  sfx: Record<SfxKey, string | null>;
  music: Record<MusicKey, string | null>;
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
  // Instrumental loops (e.g. from Suno), .mp3 or .ogg, path relative to public/
  music: {
    menu: null,
    meadow: null,
    forest: null,
    valley: null,
  },
};

// Level data format. Levels are plain data so they can later be generated from Tiled maps.

export type Theme = 'meadow' | 'forest' | 'valley';

export interface GroundSegment {
  /** Left edge. */
  x: number;
  /** Width. */
  w: number;
  /** Top surface Y (defaults to GROUND_Y). */
  y?: number;
}

/** One-way platform: the hedgehog can jump up through it and land on top. */
export interface PlatformDef {
  x: number;
  y: number;
  w: number;
}

export interface MovingPlatformDef extends PlatformDef {
  /** Travel offset from the start position. */
  dx: number;
  dy: number;
  /** Speed in px/s. */
  speed: number;
  /** Seconds to wait at each end, so small kids have time to step on. */
  wait?: number;
}

export interface AppleDef {
  x: number;
  y: number;
  /** true = a larva hides inside; false = healthy apple the hedgehog just sniffs and leaves. */
  worm: boolean;
}

export interface PointDef {
  x: number;
  y: number;
}

export type HintIcon = 'right' | 'jumpUp' | 'jumpForward' | 'apple' | 'leaf' | 'shelter';

export interface HintDef extends PointDef {
  icon: HintIcon;
}

export interface ConeDef {
  /** X where pine cones fall. */
  x: number;
  /** Seconds between falls. */
  interval: number;
}

/** Walkable line traced from a painted scene (tools/trace-level.mjs), one-way from above. */
export interface SurfaceDef {
  points: [number, number][];
}

/** A level whose look is one painted picture instead of tiles. */
export interface PaintedDef {
  /** Texture key of the background picture (scaled to the game height). */
  key: string;
  /**
   * 'scroll' (default): the picture fills the screen height and the camera scrolls along it.
   * 'whole': the whole picture is visible at once, like the painted design; free space above and
   * below is filled with matching colour (the HUD and the touch buttons sit there).
   */
  view?: 'scroll' | 'whole';
}

export interface LevelData {
  id: number;
  /** i18n key of the level name. */
  nameKey: string;
  theme: Theme;
  width: number;
  start: PointDef;
  ground: GroundSegment[];
  platforms: PlatformDef[];
  movingPlatforms: MovingPlatformDef[];
  /** Water fills every gap between ground segments automatically. */
  apples: AppleDef[];
  leaves: PointDef[];
  /**
   * Always at the end of the level, so the child never has to walk back.
   * Keep ~650 px of ground after it, so the camera shows it mid-screen and not under the touch buttons.
   */
  shelter: PointDef;
  cones: ConeDef[];
  hints: HintDef[];
  /** Id of the fact card shown when the level is finished. */
  factId: string;
  /** Painted background (replaces parallax + ground tiles). */
  painted?: PaintedDef;
  /** Walkable lines for painted levels. */
  surfaces?: SurfaceDef[];
  /** Size of the hedgehog and its jumps relative to the tiled levels (default 1). */
  worldScale?: number;
  /** The shelter is part of the painting – only its trigger area is used. */
  shelterPainted?: boolean;
  /** Not part of the 1→2→3 progression; always playable from the menu. */
  extra?: boolean;
}

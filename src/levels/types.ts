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
}

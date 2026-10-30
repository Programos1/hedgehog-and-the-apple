// Global tuning values. Level layouts are designed around the fixed jump sizes below,
// so changing them may make some platforms unreachable.

export const GAME_WIDTH = 1920;
export const GAME_HEIGHT = 1080;

/** Y coordinate of the default ground surface. */
export const GROUND_Y = 900;

export const PHYSICS = {
  gravity: 1500,
  /** Slow, calm walking speed (px/s). */
  walkSpeed: 230,
  /** How fast the hedgehog brakes when the child presses jump while walking (px/s^2). */
  brakeDecel: 2600,
  /** Jump straight up: apex height in px. */
  jumpUpHeight: 190,
  /** Jump forward: apex height and horizontal distance in px (same start/end height). */
  jumpForwardHeight: 150,
  jumpForwardDistance: 330,
};

/**
 * Jump velocities (v = sqrt(2 g h), airtime = 2 v / g) for a given world scale.
 * Painted levels can be drawn at a different scale; their jumps grow with the hedgehog.
 */
export function jumpVelocities(scale = 1) {
  const vUp = Math.sqrt(2 * PHYSICS.gravity * PHYSICS.jumpUpHeight * scale);
  const vFwdY = Math.sqrt(2 * PHYSICS.gravity * PHYSICS.jumpForwardHeight * scale);
  const airtime = (2 * vFwdY) / PHYSICS.gravity;
  return { vUp, vFwdY, vFwdX: (PHYSICS.jumpForwardDistance * scale) / airtime };
}

/** Hedgehog physics body size. */
export const HEDGEHOG_BODY = { width: 84, height: 60 };

export const STORAGE_KEY = 'jezek.progress.v1';

export const COPYRIGHT = '© 2026 Tomáš Horák · Všechna práva vyhrazena';

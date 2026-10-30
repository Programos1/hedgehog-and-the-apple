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
  jumpForwardHeight: 120,
  jumpForwardDistance: 330,
};

/** Derived jump velocities (v = sqrt(2 g h), airtime = 2 v / g). */
export const JUMP = (() => {
  const vUp = Math.sqrt(2 * PHYSICS.gravity * PHYSICS.jumpUpHeight);
  const vFwdY = Math.sqrt(2 * PHYSICS.gravity * PHYSICS.jumpForwardHeight);
  const airtime = (2 * vFwdY) / PHYSICS.gravity;
  return { vUp, vFwdY, vFwdX: PHYSICS.jumpForwardDistance / airtime };
})();

/** Hedgehog physics body size. */
export const HEDGEHOG_BODY = { width: 84, height: 60 };

export const STORAGE_KEY = 'jezek.progress.v1';

export const COPYRIGHT = '© 2026 Tomáš Horák · Všechna práva vyhrazena';

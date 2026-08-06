import type { Point } from "../levels/levelTypes";

export const PLAYABLE_WIDTH = 960;
export const PLAYABLE_HEIGHT = 540;
export const RAMP_ROTATION_STEP = Math.PI / 36;

export interface RampGeometry {
  width: number;
  height: number;
  rotation: number;
}

export function clampRampPosition(
  position: Readonly<Point>,
  ramp: Readonly<RampGeometry>,
): Point {
  const cosine = Math.abs(Math.cos(ramp.rotation));
  const sine = Math.abs(Math.sin(ramp.rotation));
  const halfWidth = (ramp.width * cosine + ramp.height * sine) / 2;
  const halfHeight = (ramp.width * sine + ramp.height * cosine) / 2;

  return {
    x: Math.min(Math.max(position.x, halfWidth), PLAYABLE_WIDTH - halfWidth),
    y: Math.min(Math.max(position.y, halfHeight), PLAYABLE_HEIGHT - halfHeight),
  };
}

export function rotateRampByStep(rotation: number, direction: -1 | 1): number {
  const nextRotation = rotation + direction * RAMP_ROTATION_STEP;
  return Math.atan2(Math.sin(nextRotation), Math.cos(nextRotation));
}

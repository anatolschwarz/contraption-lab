import type { Point } from "../levels/levelTypes";

export const PLAYABLE_WIDTH = 960;
export const PLAYABLE_HEIGHT = 540;

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

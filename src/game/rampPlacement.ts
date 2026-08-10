import type { Point } from "../levels/levelTypes";

export const PLAYABLE_WIDTH = 960;
export const PLAYABLE_HEIGHT = 540;
export const RAMP_ROTATION_STEP = Math.PI / 36;

export interface RampGeometry {
  width: number;
  height: number;
  rotation: number;
}

export interface RectanglePlacement extends Point, RampGeometry {}

export interface CircleGeometry extends Point {
  radius: number;
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

export function isRectanglePlacementValid(
  ramp: Readonly<RectanglePlacement>,
  ball: Readonly<CircleGeometry> | undefined,
  otherRectangles: ReadonlyArray<Readonly<RectanglePlacement>>,
): boolean {
  return (
    (ball === undefined || !rampPenetratesCircle(ramp, ball)) &&
    !otherRectangles.some((otherRectangle) =>
      rectanglesPenetrate(ramp, otherRectangle),
    )
  );
}

export function clampCirclePosition(
  position: Readonly<Point>,
  radius: number,
): Point {
  return {
    x: Math.min(Math.max(position.x, radius), PLAYABLE_WIDTH - radius),
    y: Math.min(Math.max(position.y, radius), PLAYABLE_HEIGHT - radius),
  };
}

export function isCirclePlacementValid(
  circle: Readonly<CircleGeometry>,
  rectangles: ReadonlyArray<Readonly<RectanglePlacement>>,
  otherCircles: ReadonlyArray<Readonly<CircleGeometry>> = [],
): boolean {
  return (
    !rectangles.some((rectangle) => rampPenetratesCircle(rectangle, circle)) &&
    !otherCircles.some(
      (otherCircle) =>
        (circle.x - otherCircle.x) ** 2 + (circle.y - otherCircle.y) ** 2 <
        (circle.radius + otherCircle.radius) ** 2,
    )
  );
}

function rampPenetratesCircle(
  ramp: Readonly<RectanglePlacement>,
  circle: Readonly<CircleGeometry>,
): boolean {
  const cosine = Math.cos(ramp.rotation);
  const sine = Math.sin(ramp.rotation);
  const offsetX = circle.x - ramp.x;
  const offsetY = circle.y - ramp.y;
  const localX = offsetX * cosine + offsetY * sine;
  const localY = -offsetX * sine + offsetY * cosine;
  const closestX = Math.min(Math.max(localX, -ramp.width / 2), ramp.width / 2);
  const closestY = Math.min(
    Math.max(localY, -ramp.height / 2),
    ramp.height / 2,
  );
  const distanceX = localX - closestX;
  const distanceY = localY - closestY;

  return distanceX ** 2 + distanceY ** 2 < circle.radius ** 2;
}

function rectanglesPenetrate(
  first: Readonly<RectanglePlacement>,
  second: Readonly<RectanglePlacement>,
): boolean {
  return [...rectangleAxes(first), ...rectangleAxes(second)].every((axis) => {
    const firstProjection = projectRectangle(first, axis);
    const secondProjection = projectRectangle(second, axis);
    return (
      Math.min(firstProjection.max, secondProjection.max) -
        Math.max(firstProjection.min, secondProjection.min) >
      0
    );
  });
}

function rectangleAxes(rectangle: Readonly<RectanglePlacement>): Point[] {
  const cosine = Math.cos(rectangle.rotation);
  const sine = Math.sin(rectangle.rotation);
  return [
    { x: cosine, y: sine },
    { x: -sine, y: cosine },
  ];
}

function projectRectangle(
  rectangle: Readonly<RectanglePlacement>,
  axis: Readonly<Point>,
): { min: number; max: number } {
  const cosine = Math.cos(rectangle.rotation);
  const sine = Math.sin(rectangle.rotation);
  const projectionCenter = rectangle.x * axis.x + rectangle.y * axis.y;
  const projectionRadius =
    (rectangle.width / 2) * Math.abs(cosine * axis.x + sine * axis.y) +
    (rectangle.height / 2) * Math.abs(-sine * axis.x + cosine * axis.y);
  return {
    min: projectionCenter - projectionRadius,
    max: projectionCenter + projectionRadius,
  };
}

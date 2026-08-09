import type { PatrolMovementDefinition, Point } from "../levels/levelTypes";

export interface PatrolState {
  direction: -1 | 1;
  position: number;
}

/**
 * Matter options for actors that move under their own patrol velocity. Actors
 * remain ordinary dynamic collision bodies so collision events and physical
 * responses use the same path as other game objects.
 */
export const COLLISION_ACTOR_BODY_OPTIONS = {
  isSensor: false,
  isStatic: false,
  ignoreGravity: true,
  friction: 0,
  frictionAir: 0,
  frictionStatic: 0,
} as const;

export function resolvePatrolDirection(
  movement: Readonly<PatrolMovementDefinition>,
  position: number,
  direction: -1 | 1,
): -1 | 1 {
  if (direction === 1 && position >= movement.max) return -1;
  if (direction === -1 && position <= movement.min) return 1;
  return direction;
}

export function getPatrolVelocity(
  movement: Readonly<PatrolMovementDefinition>,
  direction: -1 | 1,
): Point {
  const speed = movement.speed * direction;
  return movement.axis === "horizontal"
    ? { x: speed, y: 0 }
    : { x: 0, y: speed };
}

export function advancePatrol(
  movement: Readonly<PatrolMovementDefinition>,
  state: Readonly<PatrolState>,
  deltaMs: number,
): PatrolState {
  const range = movement.max - movement.min;
  const cycle = range * 2;
  const travelled =
    state.position -
    movement.min +
    state.direction * movement.speed * (deltaMs / 1_000);
  const normalized = ((travelled % cycle) + cycle) % cycle;
  const movingForward = normalized < range;
  return {
    position: movingForward
      ? movement.min + normalized
      : movement.max - (normalized - range),
    direction: movingForward ? 1 : -1,
  };
}

export function getActorPosition(
  axis: PatrolMovementDefinition["axis"],
  patrolPosition: number,
  fixedPosition: number,
): Point {
  return axis === "horizontal"
    ? { x: patrolPosition, y: fixedPosition }
    : { x: fixedPosition, y: patrolPosition };
}

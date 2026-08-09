import { describe, expect, it } from "vitest";
import {
  COLLISION_ACTOR_BODY_OPTIONS,
  advancePatrol,
  getActorPosition,
  getPatrolVelocity,
  resolvePatrolDirection,
} from "../src/game/autonomousActors";
import type { PatrolMovementDefinition } from "../src/levels/levelTypes";

const horizontalPatrol: PatrolMovementDefinition = {
  type: "patrol",
  axis: "horizontal",
  speed: 90,
  min: 100,
  max: 300,
  direction: 1,
};

describe("autonomous patrol movement", () => {
  it("advances deterministically and reverses at patrol bounds", () => {
    expect(
      advancePatrol(horizontalPatrol, { position: 100, direction: 1 }, 1_000),
    ).toEqual({ position: 190, direction: 1 });
    expect(
      advancePatrol(horizontalPatrol, { position: 280, direction: 1 }, 500),
    ).toEqual({ position: 275, direction: -1 });
  });

  it("maps patrol positions to the configured horizontal or vertical axis", () => {
    expect(getActorPosition("horizontal", 250, 150)).toEqual({
      x: 250,
      y: 150,
    });
    expect(getActorPosition("vertical", 250, 150)).toEqual({ x: 150, y: 250 });
  });

  it("reproduces a run-start patrol state", () => {
    const runStart = { position: 180, direction: -1 as const };
    const firstRun = advancePatrol(horizontalPatrol, runStart, 750);
    const rerun = advancePatrol(horizontalPatrol, runStart, 750);
    expect(rerun).toEqual(firstRun);
  });

  it("uses a gravity-free dynamic body so solid blocks physically stop actors", () => {
    expect(COLLISION_ACTOR_BODY_OPTIONS).toMatchObject({
      isSensor: false,
      isStatic: false,
      ignoreGravity: true,
      friction: 0,
      frictionAir: 0,
      frictionStatic: 0,
    });
  });

  it("drives a collision-enabled actor by patrol velocity and reverses at its bounds", () => {
    expect(getPatrolVelocity(horizontalPatrol, 1)).toEqual({ x: 90, y: 0 });
    expect(resolvePatrolDirection(horizontalPatrol, 300, 1)).toBe(-1);
    expect(resolvePatrolDirection(horizontalPatrol, 100, -1)).toBe(1);
  });
});

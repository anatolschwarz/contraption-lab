import { describe, expect, it } from "vitest";
import {
  consumeSimulationSteps,
  SIMULATION_STEP_MS,
} from "../src/game/simulationClock";

function runClock(frameDeltas: readonly number[]): {
  remainingMs: number;
  stepCount: number;
} {
  let remainingMs = 0;
  let stepCount = 0;

  for (const deltaMs of frameDeltas) {
    const result = consumeSimulationSteps(remainingMs, deltaMs);
    remainingMs = result.remainingMs;
    stepCount += result.stepCount;
  }

  return { remainingMs, stepCount };
}

describe("simulation clock", () => {
  it("runs the same fixed physics steps regardless of render-frame partitioning", () => {
    const oneLongFrame = runClock([1_000]);
    const sixtyFrames = runClock(
      Array.from({ length: 60 }, () => SIMULATION_STEP_MS),
    );

    expect(oneLongFrame).toEqual({ remainingMs: 0, stepCount: 60 });
    expect(sixtyFrames).toEqual(oneLongFrame);
  });

  it("does not advance for negative elapsed time", () => {
    expect(consumeSimulationSteps(0, -100)).toEqual({
      remainingMs: 0,
      stepCount: 0,
    });
  });
});

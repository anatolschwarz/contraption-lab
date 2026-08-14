import { describe, expect, it } from "vitest";
import rawGoodMorningMarble from "../src/levels/goodMorningMarble.json";
import {
  simulateReferenceSolution,
  type SimulationResult,
} from "../src/game/headlessSimulation";
import { builtInPuzzles } from "../src/levels/puzzleCatalog";
import { snapRampPlacement } from "../src/game/rampPlacement";
import { validateLevel } from "../src/levels/validateLevel";

const level = validateLevel(rawGoodMorningMarble);

describe("Good Morning, Marble", () => {
  it("is the sixth built-in Basic level with one player Plank", () => {
    expect(
      builtInPuzzles.find((puzzle) => puzzle.id === level.id),
    ).toMatchObject({
      id: level.id,
      difficulty: "Basic",
      order: 6,
    });
    expect(level.inventory).toEqual({ ramp: 1 });
    expect(level.ramps).toEqual([]);
  });

  it("snaps a nearby Plank to the data-defined bridge target", () => {
    const target = level.rampSnapTargets?.[0];
    expect(target).toBeDefined();
    expect(snapRampPlacement({ x: 475, y: 250 }, 0, [target!])).toEqual({
      position: { x: target!.x, y: target!.y },
      rotation: target!.rotation,
    });
  });

  it("solves deterministically from its encoded main reference solution", () => {
    const solution = level.referenceSolutions?.[0];
    expect(solution).toBeDefined();
    expect(solution?.ramps).toEqual(
      rawGoodMorningMarble.referenceSolutions[0]!.ramps,
    );

    const first = simulateReferenceSolution(level, solution!, {
      maxTicks: 1_200,
    });
    const second = simulateReferenceSolution(level, solution!, {
      maxTicks: 1_200,
    });

    expect(first.ticks).toBe(435);
    expect(first.solved).toBe(true);
    expect(first.events.at(-1)).toMatchObject({
      type: "goal",
      ballId: "morning-marble",
    });
    expect(second).toEqual(first satisfies SimulationResult);
  });
});

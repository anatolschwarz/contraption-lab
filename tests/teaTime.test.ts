import { describe, expect, it } from "vitest";
import rawTeaTime from "../src/levels/teaTime.json";
import {
  simulate,
  simulateReferenceSolution,
} from "../src/game/headlessSimulation";
import { builtInPuzzles } from "../src/levels/puzzleCatalog";
import { validateLevel } from "../src/levels/validateLevel";
import {
  createInitialGameState,
  transitionGameState,
} from "../src/state/gameState";

const level = validateLevel(rawTeaTime);

describe("Tea Time", () => {
  it("is the eighth Basic catalog level with a Teapot and one Plank", () => {
    expect(builtInPuzzles.at(-1)).toMatchObject({
      id: "tea-time-008",
      order: 8,
      difficulty: "Basic",
    });
    expect(level.inventory).toEqual({ ramp: 1, teapot: 1 });
    expect(level.referenceSolutions?.map((solution) => solution.id)).toEqual([
      "normal-plank-pour-through",
      "star-no-plank-direct-roll",
    ]);
  });

  it("redirects through explicit Teapot sensor geometry in both named routes", () => {
    for (const solution of level.referenceSolutions ?? []) {
      const first = simulateReferenceSolution(level, solution, {
        maxTicks: 1_200,
      });
      expect(first.solved).toBe(true);
      expect(
        first.events.some(
          (event) =>
            event.type === "redirect" &&
            event.participant === "ball:tea-marble",
        ),
      ).toBe(true);
      expect(first.events.at(-1)).toMatchObject({
        type: "goal",
        ballId: "tea-marble",
      });
      expect(
        simulateReferenceSolution(level, solution, { maxTicks: 1_200 }),
      ).toEqual(first);
    }
  });

  it("does not solve when no Teapot contact can redirect the marble", () => {
    const result = simulate(level, {}, { maxTicks: 1_200 });

    expect(result.solved).toBe(false);
    expect(result.events).not.toContainEqual({
      type: "goal",
      tick: expect.any(Number),
      ballId: "tea-marble",
    });
    expect(result.events.some((event) => event.type === "redirect")).toBe(
      false,
    );
  });

  it("keeps the star route materially Plank-free", () => {
    const normal = level.referenceSolutions![0]!;
    const star = level.referenceSolutions![1]!;
    expect(normal.ramps).toHaveLength(1);
    expect(star.ramps).toBeUndefined();
    expect(
      simulateReferenceSolution(level, normal, { maxTicks: 1_200 }).events.some(
        (event) =>
          event.type === "contact" &&
          event.participants.includes("ramp:l3-plank"),
      ),
    ).toBe(true);
  });

  it("places the cup below the tabletop geometry", () => {
    const tabletop = level.blocks.find(
      (block) => block.id === "tabletop-left-geometry",
    );
    expect(tabletop).toBeDefined();
    expect(level.goal.y).toBeGreaterThan(tabletop!.y);
  });

  it("validates Teapot reference placements", () => {
    const duplicate = structuredClone(rawTeaTime);
    duplicate.referenceSolutions[1]!.teapots!.push({
      ...duplicate.referenceSolutions[1]!.teapots![0]!,
    });
    expect(() => validateLevel(duplicate)).toThrow(
      "Teapot placement ids must be unique",
    );
  });

  it("restores Teapot and Plank inventory on rerun and reset", () => {
    const initial = createInitialGameState(level.inventory);
    const withTeapot = transitionGameState(initial, {
      type: "spawn-tray-teapot",
      componentId: "tray-teapot-1",
    });
    const placed = transitionGameState(withTeapot, {
      type: "spawn-tray-ramp",
      componentId: "tray-ramp-1",
    });
    expect(placed.trayTeapotCount).toBe(0);
    expect(placed.trayRampCount).toBe(0);
    const running = transitionGameState(placed, "toggle-simulation");
    expect(transitionGameState(running, "rerun")).toMatchObject({
      trayTeapotCount: 0,
      trayRampCount: 0,
    });
    expect(transitionGameState(running, "reset")).toMatchObject({
      trayTeapotCount: 1,
      trayRampCount: 1,
    });
  });
});

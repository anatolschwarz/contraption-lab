import { describe, expect, it } from "vitest";
import rawBoing from "../src/levels/boing.json";
import { simulateReferenceSolution } from "../src/game/headlessSimulation";
import { builtInPuzzles } from "../src/levels/puzzleCatalog";
import { validateLevel } from "../src/levels/validateLevel";
import {
  createInitialGameState,
  transitionGameState,
} from "../src/state/gameState";

const level = validateLevel(rawBoing);

describe("Boing", () => {
  it("is the seventh Basic catalog level with one Spring mattress", () => {
    expect(builtInPuzzles.at(-1)).toMatchObject({
      id: "boing-007",
      order: 7,
      difficulty: "Basic",
    });
    expect(level.inventory).toEqual({ mattress: 1 });
    expect(level.referenceSolutions?.[0]?.mattresses).toEqual(
      rawBoing.referenceSolutions[0]!.mattresses,
    );
  });

  it("solves deterministically from its encoded mattress route", () => {
    const solution = level.referenceSolutions![0]!;
    const first = simulateReferenceSolution(level, solution, {
      maxTicks: 1_200,
    });
    const second = simulateReferenceSolution(level, solution, {
      maxTicks: 1_200,
    });
    expect(first.solved).toBe(true);
    expect(first.ticks).toBe(256);
    expect(
      first.events.some(
        (event) =>
          event.type === "contact" &&
          event.participants.includes("mattress:l2-mattress"),
      ),
    ).toBe(true);
    expect(first.events.at(-1)).toMatchObject({
      type: "goal",
      ballId: "boing-marble",
    });
    expect(second).toEqual(first);
  });

  it("bounces a ball deterministically from the declared mattress restitution", () => {
    const solution = level.referenceSolutions![0]!;
    const baseline = simulateReferenceSolution(level, solution, {
      maxTicks: 240,
    });
    const softer = simulateReferenceSolution(
      level,
      {
        ...solution,
        mattresses: solution.mattresses!.map((mattress) => ({
          ...mattress,
          restitution: 0.5,
        })),
      },
      { maxTicks: 240 },
    );
    const baselineBall = baseline.bodies.find(
      (body) => body.id === "boing-marble",
    );
    const softerBall = softer.bodies.find((body) => body.id === "boing-marble");
    expect(baselineBall?.y).toBeLessThan(softerBall!.y);
    expect(baseline).toEqual(
      simulateReferenceSolution(level, solution, { maxTicks: 240 }),
    );
  });

  it("rejects empty reference placements and duplicate mattress ids", () => {
    const empty = structuredClone(rawBoing);
    empty.referenceSolutions = [{ id: "empty", mattresses: [] }];
    expect(() => validateLevel(empty)).toThrow(
      "must contain at least one placement",
    );

    const duplicate = structuredClone(rawBoing);
    const mattress = duplicate.referenceSolutions[0]!.mattresses[0]!;
    duplicate.referenceSolutions[0]!.mattresses.push({ ...mattress });
    expect(() => validateLevel(duplicate)).toThrow(
      "Mattress placement ids must be unique",
    );
  });

  it("restores the mattress inventory on reset and rerun", () => {
    const initial = createInitialGameState(level.inventory);
    const placed = transitionGameState(initial, {
      type: "spawn-tray-mattress",
      componentId: "tray-mattress-1",
    });
    expect(placed.trayMattressCount).toBe(0);
    const running = transitionGameState(placed, "toggle-simulation");
    expect(transitionGameState(running, "rerun").trayMattressCount).toBe(0);
    expect(transitionGameState(running, "reset").trayMattressCount).toBe(1);
  });
});

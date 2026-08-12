import { describe, expect, it } from "vitest";
import rawBridgeTheGap from "../src/levels/bridgeTheGap.json";
import rawDownTheRamp from "../src/levels/downTheRamp.json";
import rawPrototype from "../src/levels/prototype.json";
import {
  simulate,
  type SimulationPlacements,
} from "../src/game/headlessSimulation";
import { validateLevel } from "../src/levels/validateLevel";

const prototype = validateLevel(rawPrototype);
const downTheRamp = validateLevel(rawDownTheRamp);
const bridgeTheGap = validateLevel(rawBridgeTheGap);

const LEGACY_SOLUTION: SimulationPlacements = {
  ramps: [
    {
      id: "upper-ramp",
      x: 265,
      y: 245,
      width: 260,
      height: 24,
      rotation: (5 * Math.PI) / 36,
    },
    {
      id: "lower-ramp",
      x: 540,
      y: 395,
      width: 310,
      height: 24,
      rotation: (5 * Math.PI) / 36,
    },
  ],
};

const DOWN_THE_RAMP_SOLUTION: SimulationPlacements = {
  ramps: [
    {
      id: "reference-upper-ramp",
      x: 375,
      y: 270,
      width: 200,
      height: 24,
      rotation: (4 * Math.PI) / 36,
    },
    {
      id: "reference-lower-ramp",
      x: 565,
      y: 338,
      width: 200,
      height: 24,
      rotation: (4 * Math.PI) / 36,
    },
  ],
};

const BRIDGE_THE_GAP_SOLUTION: SimulationPlacements = {
  ramps: [
    {
      id: "reference-upper-ramp",
      x: 370,
      y: 290,
      width: 200,
      height: 24,
      rotation: (3 * Math.PI) / 36,
    },
    {
      id: "reference-lower-ramp",
      x: 565,
      y: 342,
      width: 200,
      height: 24,
      rotation: (3 * Math.PI) / 36,
    },
  ],
};

describe("headless simulation", () => {
  it.each([
    [prototype, LEGACY_SOLUTION],
    [downTheRamp, DOWN_THE_RAMP_SOLUTION],
    [bridgeTheGap, BRIDGE_THE_GAP_SOLUTION],
  ] as const)(
    "solves the known %s reference placement",
    (level, placements) => {
      const result = simulate(level, placements, { maxTicks: 1_200 });

      expect(result.solved).toBe(true);
      expect(result.ticks).toBeLessThanOrEqual(1_200);
      expect(result.events.at(-1)).toMatchObject({ type: "goal" });
    },
  );

  it("rejects an incorrect reference placement", () => {
    const result = simulate(downTheRamp, {}, { maxTicks: 300 });

    expect(result).toMatchObject({ solved: false, ticks: 300 });
    expect(result.events.at(-1)).toEqual({ type: "max-ticks", tick: 300 });
  });

  it("returns the same result and trace for repeated inputs", () => {
    expect(
      simulate(bridgeTheGap, BRIDGE_THE_GAP_SOLUTION, { maxTicks: 1_200 }),
    ).toEqual(
      simulate(bridgeTheGap, BRIDGE_THE_GAP_SOLUTION, { maxTicks: 1_200 }),
    );
  });

  it("stops at the configured max tick limit", () => {
    const result = simulate(downTheRamp, DOWN_THE_RAMP_SOLUTION, {
      maxTicks: 1,
    });

    expect(result).toMatchObject({ solved: false, ticks: 1 });
    expect(result.events.at(-1)).toEqual({ type: "max-ticks", tick: 1 });
  });

  it("does not mutate a level or placements", () => {
    const levelBefore = structuredClone(downTheRamp);
    const placementsBefore = structuredClone(DOWN_THE_RAMP_SOLUTION);

    simulate(downTheRamp, DOWN_THE_RAMP_SOLUTION, { maxTicks: 1_200 });

    expect(downTheRamp).toEqual(levelBefore);
    expect(DOWN_THE_RAMP_SOLUTION).toEqual(placementsBefore);
  });

  it("uses the shared contact executor for declared headless actions", () => {
    const actionLevel = validateLevel({
      ...rawDownTheRamp,
      gravity: { x: 0, y: 0 },
      contactRules: [
        {
          contacts: ["ball", "block"],
          action: {
            type: "impulse",
            target: { type: "contact", index: 0 },
            impulse: { x: 3, y: -2 },
          },
        },
      ],
      balls: [
        {
          ...rawDownTheRamp.balls[0],
          x: 250,
          y: 200,
        },
      ],
      blocks: [
        {
          id: "contact-surface",
          ownership: "fixed",
          x: 250,
          y: 200,
          width: 100,
          height: 100,
        },
      ],
      floor: { ...rawDownTheRamp.floor, y: 520 },
      goal: { ...rawDownTheRamp.goal, x: 700, y: 300 },
    });

    const result = simulate(actionLevel, {}, { maxTicks: 1 });

    expect(result.events).toContainEqual({
      type: "impulse",
      tick: 1,
      participant: "ball:down-ramp-ball",
      impulse: { x: 3, y: -2 },
    });
    expect(simulate(actionLevel, {}, { maxTicks: 1 })).toEqual(result);
  });
});

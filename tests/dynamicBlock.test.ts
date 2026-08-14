import { describe, expect, it } from "vitest";
import {
  isEditablePart,
  isPlayerPart,
  type BlockDefinition,
  type LevelDefinition,
} from "../src/levels/levelTypes";
import { validateLevel } from "../src/levels/validateLevel";
import {
  simulate,
  type SimulationBodyState,
} from "../src/game/headlessSimulation";

/**
 * Focused coverage for milestone #28 (dynamic/toppling Block capability).
 *
 * Deterministic verification lives in the headless runner: a dynamic Block is a
 * Matter dynamic rigid body whose toppling geometry is explicit gameplay data
 * (width/height/rotation), independent of any artwork. The runner exposes each
 * body's terminal transform so toppling, motion transfer, Reset (initial-state
 * reconstruction), and deterministic repeat/Rerun replay are all checkable.
 */

const FLOOR = { x: 480, y: 530, width: 960, height: 20 } as const; // top surface y = 520
const UNREACHABLE_GOAL = { x: 60, y: 60, width: 40, height: 40 } as const;

/** A harmless fixed Ball parked on the floor so `validateLevel` has its >=1 ball. */
const PARKED_BALL = {
  id: "parked-ball",
  x: 900,
  y: 480,
  radius: 20,
  ownership: "fixed",
} as const;

function buildLevel(
  blocks: readonly BlockDefinition[],
  overrides: Partial<LevelDefinition> = {},
): LevelDefinition {
  return validateLevel({
    id: "dynamic-block-fixture",
    levelName: "Dynamic Block Fixture",
    title: "Dynamic Block Fixture",
    difficulty: "Basic",
    order: 1,
    inventory: { ball: 0, bird: 0, block: 0, ramp: 0 },
    contactRules: [],
    actors: [],
    balls: [{ ...PARKED_BALL }],
    ramps: [],
    blocks: blocks.map((block) => ({ ...block })),
    floor: { ...FLOOR },
    goal: { ...UNREACHABLE_GOAL },
    gravity: { x: 0, y: 1 },
    ...overrides,
  });
}

function findBody(
  result: { bodies: readonly SimulationBodyState[] },
  id: string,
): SimulationBodyState {
  const body = result.bodies.find((candidate) => candidate.id === id);
  if (!body) throw new Error(`Expected a terminal body for "${id}".`);
  return body;
}

describe("dynamic Block schema & validation", () => {
  it("accepts and preserves dynamic + rotation fields", () => {
    const level = buildLevel([
      {
        id: "spinner",
        x: 300,
        y: 300,
        width: 24,
        height: 160,
        ownership: "fixed",
        dynamic: true,
        rotation: 0.3,
      },
    ]);

    expect(level.blocks[0]).toMatchObject({ dynamic: true, rotation: 0.3 });
  });

  it("treats a legacy Block with neither field as valid (static default)", () => {
    const level = buildLevel([
      {
        id: "legacy",
        x: 300,
        y: 300,
        width: 120,
        height: 40,
        ownership: "fixed",
      },
    ]);

    const block = level.blocks.at(0);
    if (!block) throw new Error("Expected the legacy block to be present.");
    expect(block.dynamic).toBeUndefined();
    expect(block.rotation).toBeUndefined();
  });

  it("rejects a non-boolean dynamic flag", () => {
    expect(() =>
      buildLevel([
        {
          id: "bad-dynamic",
          x: 300,
          y: 300,
          width: 24,
          height: 160,
          ownership: "fixed",
          // @ts-expect-error deliberately invalid dynamic value
          dynamic: "yes",
        },
      ]),
    ).toThrow(/blocks/);
  });

  it("rejects a non-finite rotation", () => {
    expect(() =>
      buildLevel([
        {
          id: "bad-rotation",
          x: 300,
          y: 300,
          width: 24,
          height: 160,
          ownership: "fixed",
          // @ts-expect-error deliberately invalid rotation value
          rotation: "sideways",
        },
      ]),
    ).toThrow(/blocks/);
  });
});

describe("dynamic Block ownership & inventory", () => {
  it("is orthogonal to ownership (fixed and player both validate and are preserved)", () => {
    const level = buildLevel([
      {
        id: "fixed-dynamic",
        x: 250,
        y: 300,
        width: 24,
        height: 160,
        ownership: "fixed",
        dynamic: true,
      },
      {
        id: "player-dynamic",
        x: 650,
        y: 300,
        width: 24,
        height: 160,
        ownership: "player",
        dynamic: true,
      },
    ]);

    expect(level.blocks).toMatchObject([
      { id: "fixed-dynamic", ownership: "fixed", dynamic: true },
      { id: "player-dynamic", ownership: "player", dynamic: true },
    ]);
  });

  it("does not change ownership/editability classification", () => {
    const fixed = { ownership: "fixed" as const, dynamic: true };
    const player = { ownership: "player" as const, dynamic: true };

    expect(isPlayerPart(fixed)).toBe(false);
    expect(isPlayerPart(player)).toBe(true);
    expect(isEditablePart(fixed, false)).toBe(false);
    expect(isEditablePart(fixed, true)).toBe(true);
    expect(isEditablePart(player, false)).toBe(true);
  });

  it("does not consume Block inventory (inventory is preserved as declared)", () => {
    const level = buildLevel(
      [
        {
          id: "fixed-dynamic",
          x: 300,
          y: 300,
          width: 24,
          height: 160,
          ownership: "fixed",
          dynamic: true,
        },
      ],
      { inventory: { ball: 0, bird: 0, block: 2, ramp: 0 } },
    );

    expect(level.inventory.block).toBe(2);
  });
});

describe("dynamic Block headless behavior", () => {
  it("leaves a static (default) Block exactly in place under gravity", () => {
    const level = buildLevel([
      {
        id: "static-block",
        x: 300,
        y: 300,
        width: 120,
        height: 40,
        ownership: "fixed",
      },
    ]);

    const terminal = findBody(
      simulate(level, {}, { maxTicks: 300 }),
      "static-block",
    );

    expect(terminal).toEqual({
      id: "static-block",
      tag: "block",
      x: 300,
      y: 300,
      angle: 0,
    });
  });

  it("topples a Block leaning past its critical angle", () => {
    const initialY = 440;
    const initialRotation = 0.5;
    const level = buildLevel([
      {
        id: "leaning-block",
        x: 300,
        y: initialY,
        width: 24,
        height: 160,
        ownership: "fixed",
        dynamic: true,
        rotation: initialRotation,
      },
    ]);

    const terminal = findBody(
      simulate(level, {}, { maxTicks: 600 }),
      "leaning-block",
    );

    // Falls further over (toward lying flat) and settles lower on the floor.
    expect(terminal.angle).toBeGreaterThan(initialRotation + 0.3);
    expect(terminal.y).toBeGreaterThan(initialY);
  });

  it("transfers motion to a neighbouring dynamic Block (chain/topple)", () => {
    const bInitialX = 520;
    const bInitialY = 500;
    const level = buildLevel([
      {
        id: "a",
        x: 380,
        y: 420,
        width: 20,
        height: 200,
        ownership: "fixed",
        dynamic: true,
        rotation: 0.5,
      },
      {
        id: "b",
        x: bInitialX,
        y: bInitialY,
        width: 40,
        height: 40,
        ownership: "fixed",
        dynamic: true,
      },
    ]);

    const result = simulate(level, {}, { maxTicks: 600 });

    const contact = result.events.find(
      (event) =>
        event.type === "contact" &&
        event.participants[0] === "block:a" &&
        event.participants[1] === "block:b",
    );
    expect(contact, "expected a block:a<->block:b contact").toBeDefined();
    expect((contact as { tick: number }).tick).toBeGreaterThan(0);

    const b = findBody(result, "b");
    const displacement =
      Math.hypot(b.x - bInitialX, b.y - bInitialY) + Math.abs(b.angle);
    expect(displacement).toBeGreaterThan(3);
  });

  it("produces identical results and terminal transforms on repeat runs (deterministic Rerun replay)", () => {
    const blocks: readonly BlockDefinition[] = [
      {
        id: "a",
        x: 380,
        y: 420,
        width: 20,
        height: 200,
        ownership: "fixed",
        dynamic: true,
        rotation: 0.5,
      },
      {
        id: "b",
        x: 520,
        y: 500,
        width: 40,
        height: 40,
        ownership: "fixed",
        dynamic: true,
      },
    ];

    const first = simulate(buildLevel(blocks), {}, { maxTicks: 600 });
    const second = simulate(buildLevel(blocks), {}, { maxTicks: 600 });

    expect(first).toEqual(second);
  });

  it("reconstructs the exact initial JSON transform for Reset (no stepping)", () => {
    const level = buildLevel([
      {
        id: "leaning-block",
        x: 300,
        y: 440,
        width: 24,
        height: 160,
        ownership: "fixed",
        dynamic: true,
        rotation: 0.5,
      },
    ]);

    const initial = findBody(
      simulate(level, {}, { maxTicks: 0 }),
      "leaning-block",
    );

    expect(initial).toEqual({
      id: "leaning-block",
      tag: "block",
      x: 300,
      y: 440,
      angle: 0.5,
    });
  });
});

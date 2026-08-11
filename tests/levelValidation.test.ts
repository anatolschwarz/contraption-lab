import { describe, expect, it } from "vitest";
import rawLevel from "../src/levels/prototype.json";
import { validateLevel } from "../src/levels/validateLevel";

describe("validateLevel", () => {
  it("accepts the bundled prototype level", () => {
    expect(validateLevel(rawLevel)).toEqual(rawLevel);
  });

  it("rejects malformed level data with a useful message", () => {
    const invalid = {
      ...rawLevel,
      balls: [{ ...rawLevel.balls[0], radius: -1 }, rawLevel.balls[1]],
    };
    expect(() => validateLevel(invalid)).toThrow(/balls.*positive radi/i);
  });

  it("accepts unplaced player-owned Ball inventory", () => {
    const playerOwned = validateLevel({
      ...rawLevel,
      inventory: { ...rawLevel.inventory, ball: 1 },
      balls: [
        rawLevel.balls[0],
        { ...rawLevel.balls[1], initiallyPlaced: false },
      ],
    });
    expect(playerOwned.balls[1]).toMatchObject({
      ownership: "player",
      initiallyPlaced: false,
    });
    expect(playerOwned.inventory.ball).toBe(1);
  });

  it("rejects incoherent Ball ownership, placement, and inventory", () => {
    expect(() =>
      validateLevel({
        ...rawLevel,
        balls: [
          { ...rawLevel.balls[0], initiallyPlaced: false },
          rawLevel.balls[1],
        ],
        inventory: { ...rawLevel.inventory, ball: 1 },
      }),
    ).toThrow(/fixed Ball.*initially placed/i);
    expect(() =>
      validateLevel({
        ...rawLevel,
        inventory: { ...rawLevel.inventory, ball: 1 },
      }),
    ).toThrow(/Ball inventory.*initially unplaced/i);
    expect(() =>
      validateLevel({
        ...rawLevel,
        balls: [
          rawLevel.balls[0],
          { ...rawLevel.balls[1], initiallyPlaced: false },
        ],
      }),
    ).toThrow(/Ball inventory.*initially unplaced/i);
    expect(() =>
      validateLevel({
        ...rawLevel,
        inventory: { ...rawLevel.inventory, ball: 2 },
        balls: [
          rawLevel.balls[0],
          { ...rawLevel.balls[1], initiallyPlaced: false },
        ],
      }),
    ).toThrow(/Ball inventory.*initially unplaced/i);
  });

  it("requires unique Ball ids", () => {
    expect(() =>
      validateLevel({
        ...rawLevel,
        balls: [
          rawLevel.balls[0],
          { ...rawLevel.balls[1], id: "prototype-ball" },
        ],
      }),
    ).toThrow(/Ball ids.*unique/i);
  });

  it("accepts an omitted time limit and rejects invalid limits clearly", () => {
    const untimed = Object.fromEntries(
      Object.entries(rawLevel).filter(([key]) => key !== "timeLimitSeconds"),
    );
    expect(validateLevel(untimed).timeLimitSeconds).toBeUndefined();
    expect(() => validateLevel({ ...rawLevel, timeLimitSeconds: 0 })).toThrow(
      /timeLimitSeconds.*positive finite number/i,
    );
    expect(() => validateLevel({ ...rawLevel, timeLimitSeconds: -5 })).toThrow(
      /timeLimitSeconds.*positive finite number/i,
    );
    expect(() =>
      validateLevel({ ...rawLevel, timeLimitSeconds: "fast" }),
    ).toThrow(/timeLimitSeconds.*positive finite number/i);
  });

  it("rejects missing level fields", () => {
    expect(() => validateLevel({ id: "incomplete" })).toThrow(/levelName/i);
    expect(() =>
      validateLevel({ id: "incomplete", levelName: "Incomplete" }),
    ).toThrow(/title/i);
  });

  it("requires valid puzzle difficulty metadata and global order", () => {
    expect(() => validateLevel({ ...rawLevel, difficulty: "Expert" })).toThrow(
      /difficulty.*Basic.*Medium.*Hard/i,
    );
    expect(() => validateLevel({ ...rawLevel, order: 0 })).toThrow(
      /order.*positive integer/i,
    );
  });

  it("requires non-negative integer inventory counts", () => {
    expect(() =>
      validateLevel({ ...rawLevel, inventory: { block: -1, ramp: 0 } }),
    ).toThrow(/inventory.*non-negative integer/i);
    expect(() =>
      validateLevel({ ...rawLevel, inventory: { block: 1, ramp: 0.5 } }),
    ).toThrow(/inventory.*non-negative integer/i);
    expect(() =>
      validateLevel({ ...rawLevel, inventory: { block: 1 } }),
    ).toThrow(/inventory/i);
  });

  it("requires known contact tags and supported actions", () => {
    expect(() =>
      validateLevel({
        ...rawLevel,
        contactRules: [
          {
            contacts: ["ball", "unknown"],
            action: { type: "destroy", target: "unknown" },
          },
        ],
      }),
    ).toThrow(/known contact tags/i);
    expect(() =>
      validateLevel({
        ...rawLevel,
        contactRules: [
          {
            contacts: ["ball", "block"],
            action: { type: "bounce", target: "block" },
          },
        ],
      }),
    ).toThrow(/unknown or invalid action/i);
    expect(() =>
      validateLevel({
        ...rawLevel,
        contactRules: [
          {
            contacts: ["ball", "block"],
            action: { type: "destroy", target: "ramp" },
          },
        ],
      }),
    ).toThrow(/destroy one of its contact tags/i);
  });

  it("requires valid actor patrol definitions", () => {
    const actor = rawLevel.actors[0]!;
    expect(() =>
      validateLevel({
        ...rawLevel,
        actors: [{ ...actor, movement: { ...actor.movement, speed: 0 } }],
      }),
    ).toThrow(/invalid patrol movement/i);
    expect(() =>
      validateLevel({ ...rawLevel, actors: [{ ...actor, tag: "unknown" }] }),
    ).toThrow(/valid bird definition/i);
    expect(() =>
      validateLevel({
        ...rawLevel,
        actors: [
          {
            ...actor,
            movement: { ...actor.movement, min: 10, max: 20 },
          },
        ],
      }),
    ).toThrow(/patrol bounds/i);
  });

  it("allows empty part arrays while retaining unique ids for defined parts", () => {
    expect(validateLevel({ ...rawLevel, ramps: [], blocks: [] })).toMatchObject(
      {
        ramps: [],
        blocks: [],
      },
    );
    expect(() =>
      validateLevel({
        ...rawLevel,
        ramps: [rawLevel.ramps[0], { ...rawLevel.ramps[1], id: "upper-ramp" }],
      }),
    ).toThrow(/unique/i);
  });

  it("requires uniquely identified blocks that do not reuse ramp ids", () => {
    expect(() =>
      validateLevel({
        ...rawLevel,
        blocks: [rawLevel.blocks[0], { ...rawLevel.blocks[0] }],
      }),
    ).toThrow(/block ids.*unique/i);
    expect(() =>
      validateLevel({
        ...rawLevel,
        blocks: [{ ...rawLevel.blocks[0], id: "upper-ramp" }],
      }),
    ).toThrow(/component ids.*unique/i);
  });

  it("requires explicit fixed or player ownership for every part", () => {
    expect(() =>
      validateLevel({
        ...rawLevel,
        balls: [
          { ...rawLevel.balls[0], ownership: "unknown" },
          rawLevel.balls[1],
        ],
      }),
    ).toThrow(/ball/i);
    expect(() =>
      validateLevel({
        ...rawLevel,
        ramps: [{ ...rawLevel.ramps[0], ownership: "unknown" }],
      }),
    ).toThrow(/ramps/i);
    expect(() =>
      validateLevel({
        ...rawLevel,
        blocks: [{ ...rawLevel.blocks[0], ownership: "unknown" }],
      }),
    ).toThrow(/blocks/i);
  });
});

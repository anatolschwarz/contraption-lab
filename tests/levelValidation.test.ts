import { describe, expect, it } from "vitest";
import rawLevel from "../src/levels/prototype.json";
import { validateLevel } from "../src/levels/validateLevel";

describe("validateLevel", () => {
  it("accepts the bundled prototype level", () => {
    expect(validateLevel(rawLevel)).toEqual(rawLevel);
  });

  it("rejects malformed level data with a useful message", () => {
    const invalid = { ...rawLevel, ball: { x: 10, y: 10, radius: -1 } };
    expect(() => validateLevel(invalid)).toThrow(/ball.*positive radius/i);
  });

  it("rejects missing level fields", () => {
    expect(() => validateLevel({ id: "incomplete" })).toThrow(/title/i);
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

  it("requires at least two ramps with unique ids", () => {
    expect(() =>
      validateLevel({ ...rawLevel, ramps: [rawLevel.ramps[0]] }),
    ).toThrow(/at least two/i);
    expect(() =>
      validateLevel({
        ...rawLevel,
        ramps: [rawLevel.ramps[0], { ...rawLevel.ramps[1], id: "upper-ramp" }],
      }),
    ).toThrow(/unique/i);
  });

  it("requires uniquely identified blocks that do not reuse ramp ids", () => {
    expect(() => validateLevel({ ...rawLevel, blocks: [] })).toThrow(
      /at least one/i,
    );
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
    ).toThrow(/editable component ids.*unique/i);
  });

  it("requires explicit fixed or player ownership for every part", () => {
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

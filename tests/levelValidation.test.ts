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
});

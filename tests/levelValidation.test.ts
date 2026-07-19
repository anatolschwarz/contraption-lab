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
});

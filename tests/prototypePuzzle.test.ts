import { describe, expect, it } from "vitest";
import rawLevel from "../src/levels/prototype.json";
import { validateLevel } from "../src/levels/validateLevel";

describe("the bundled relay-ramp puzzle", () => {
  const level = validateLevel(rawLevel);

  it("defines two uniquely identified ramps outside the ball's fall path", () => {
    expect(level.ramps.map((ramp) => ramp.id)).toEqual([
      "upper-ramp",
      "lower-ramp",
    ]);
    for (const ramp of level.ramps) {
      const rampHalfWidth =
        (Math.abs(Math.cos(ramp.rotation)) * ramp.width +
          Math.abs(Math.sin(ramp.rotation)) * ramp.height) /
        2;
      expect(level.ball.x + level.ball.radius).toBeLessThan(
        ramp.x - rampHalfWidth,
      );
    }
  });

  it("places the goal away from the untouched ball", () => {
    expect(Math.abs(level.goal.x - level.ball.x)).toBeGreaterThan(
      level.goal.width / 2 + level.ball.radius,
    );
  });
});

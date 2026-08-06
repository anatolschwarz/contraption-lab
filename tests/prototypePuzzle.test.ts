import { describe, expect, it } from "vitest";
import rawLevel from "../src/levels/prototype.json";
import { validateLevel } from "../src/levels/validateLevel";

describe("the bundled puzzle", () => {
  const level = validateLevel(rawLevel);

  it("starts with the ramp outside the ball's fall path", () => {
    const rampHalfWidth =
      (Math.abs(Math.cos(level.ramp.rotation)) * level.ramp.width +
        Math.abs(Math.sin(level.ramp.rotation)) * level.ramp.height) /
      2;

    expect(level.ball.x + level.ball.radius).toBeLessThan(
      level.ramp.x - rampHalfWidth,
    );
  });

  it("places the goal away from the untouched ball", () => {
    expect(Math.abs(level.goal.x - level.ball.x)).toBeGreaterThan(
      level.goal.width / 2 + level.ball.radius,
    );
  });
});

import { describe, expect, it } from "vitest";
import rawLevel from "../src/levels/prototype.json";
import { isPlayerPart } from "../src/levels/levelTypes";
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

  it("defines a fixed guide block away from the untouched puzzle path", () => {
    expect(level.blocks.map((block) => block.id)).toEqual(["guide-block"]);
    const block = level.blocks[0]!;
    expect(level.ball.x + level.ball.radius).toBeLessThan(
      block.x - block.width / 2,
    );
    for (const ramp of level.ramps) {
      expect(block.y + block.height / 2).toBeLessThan(ramp.y - ramp.height / 2);
    }
  });

  it("labels ramps as preplaced player parts and the guide block as fixed", () => {
    expect(level.ramps.every(isPlayerPart)).toBe(true);
    expect(level.blocks.every(isPlayerPart)).toBe(false);
  });

  it("defines the initial tray inventory", () => {
    expect(level.inventory).toEqual({ block: 2, ramp: 4 });
  });

  it("declares the block-destruction contact demo", () => {
    expect(level.contactRules).toEqual([
      {
        contacts: ["ball", "block"],
        action: { type: "destroy", target: "block" },
      },
    ]);
  });
});

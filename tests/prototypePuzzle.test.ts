import { describe, expect, it } from "vitest";
import rawLevel from "../src/levels/prototype.json";
import { isPlayerPart } from "../src/levels/levelTypes";
import { validateLevel } from "../src/levels/validateLevel";

describe("the bundled relay-ramp puzzle", () => {
  const level = validateLevel(rawLevel);
  const fixedBall = level.balls.find((ball) => ball.id === "prototype-ball")!;
  const playerBall = level.balls.find((ball) => ball.id === "player-ball")!;

  it("defines Basic metadata and first global puzzle order", () => {
    expect(level.difficulty).toBe("Basic");
    expect(level.order).toBe(1);
  });

  it("uses a puzzle-defined 45-second time limit", () => {
    expect(level.timeLimitSeconds).toBe(45);
  });

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
      expect(fixedBall.x + fixedBall.radius).toBeLessThan(
        ramp.x - rampHalfWidth,
      );
    }
  });

  it("places the goal away from the untouched ball", () => {
    expect(Math.abs(level.goal.x - fixedBall.x)).toBeGreaterThan(
      level.goal.width / 2 + fixedBall.radius,
    );
  });

  it("defines a fixed guide block away from the untouched puzzle path", () => {
    expect(level.blocks.map((block) => block.id)).toEqual(["guide-block"]);
    const block = level.blocks[0]!;
    expect(fixedBall.x + fixedBall.radius).toBeLessThan(
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

  it("defines independent fixed and player-owned Balls", () => {
    expect(fixedBall.ownership).toBe("fixed");
    expect(playerBall.ownership).toBe("player");
    expect(fixedBall.id).not.toBe(playerBall.id);
  });

  it("defines the initial tray inventory", () => {
    expect(level.inventory).toEqual({ ball: 0, bird: 0, block: 2, ramp: 4 });
  });

  it("declares the block-destruction contact demo", () => {
    expect(level.contactRules).toContainEqual({
      contacts: ["ball", "block"],
      action: { type: "destroy", target: "block" },
    });
  });

  it("defines fixed and player-owned Birds with slower horizontal patrols", () => {
    expect(level.actors).toEqual([
      {
        id: "patrol-bird",
        tag: "bird",
        ownership: "fixed",
        x: 680,
        y: 150,
        width: 36,
        height: 24,
        movement: {
          type: "patrol",
          axis: "horizontal",
          speed: 20,
          min: 680,
          max: 920,
          direction: 1,
        },
      },
      {
        id: "player-bird",
        tag: "bird",
        ownership: "player",
        x: 140,
        y: 300,
        width: 36,
        height: 24,
        movement: {
          type: "patrol",
          axis: "horizontal",
          speed: 20,
          min: 90,
          max: 300,
          direction: 1,
        },
      },
    ]);
    expect(level.contactRules).toContainEqual({
      contacts: ["bird", "block"],
      action: { type: "destroy", target: "block" },
    });
    expect(level.contactRules).toContainEqual({
      contacts: ["bird", "ramp"],
      action: { type: "destroy", target: "ramp" },
    });
  });
});

import { describe, expect, it } from "vitest";
import {
  clampRampPosition,
  isRampPlacementValid,
  RAMP_ROTATION_STEP,
  rotateRampByStep,
} from "../src/game/rampPlacement";

describe("clampRampPosition", () => {
  const ramp = { width: 100, height: 20, rotation: 0 };

  it("keeps an axis-aligned ramp inside the playable area", () => {
    expect(clampRampPosition({ x: -10, y: 600 }, ramp)).toEqual({
      x: 50,
      y: 530,
    });
  });

  it("uses the ramp rotation when calculating its bounds", () => {
    const position = clampRampPosition(
      { x: 0, y: 0 },
      { width: 100, height: 20, rotation: Math.PI / 2 },
    );
    expect(position.x).toBeCloseTo(10);
    expect(position.y).toBeCloseTo(50);
  });

  it("rotates in fixed 5-degree steps", () => {
    expect(RAMP_ROTATION_STEP).toBeCloseTo(Math.PI / 36);
    expect(rotateRampByStep(0, 1)).toBeCloseTo(Math.PI / 36);
    expect(rotateRampByStep(0, -1)).toBeCloseTo(-Math.PI / 36);
  });
});

describe("isRampPlacementValid", () => {
  const ball = { x: 120, y: 120, radius: 20 };
  const otherRamp = {
    x: 320,
    y: 260,
    width: 180,
    height: 24,
    rotation: Math.PI / 6,
  };
  const candidate = { width: 160, height: 24, rotation: 0 };

  it("accepts a clear ramp placement", () => {
    expect(
      isRampPlacementValid({ ...candidate, x: 300, y: 150 }, ball, [otherRamp]),
    ).toBe(true);
  });

  it("rejects a ramp placement that penetrates the ball", () => {
    expect(
      isRampPlacementValid({ ...candidate, x: 120, y: 120 }, ball, [otherRamp]),
    ).toBe(false);
  });

  it("allows the intentional goal overlap used by the solution", () => {
    expect(
      isRampPlacementValid(
        {
          x: 540,
          y: 395,
          width: 310,
          height: 24,
          rotation: (5 * Math.PI) / 36,
        },
        { x: 215, y: 135, radius: 24 },
        [
          {
            x: 265,
            y: 245,
            width: 260,
            height: 24,
            rotation: (5 * Math.PI) / 36,
          },
        ],
      ),
    ).toBe(true);
  });

  it("rejects a rotated ramp placement that penetrates another ramp", () => {
    expect(
      isRampPlacementValid(
        { ...candidate, x: 320, y: 260, rotation: Math.PI / 6 },
        ball,
        [otherRamp],
      ),
    ).toBe(false);
  });
});

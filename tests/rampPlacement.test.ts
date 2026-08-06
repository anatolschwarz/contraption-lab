import { describe, expect, it } from "vitest";
import {
  clampRampPosition,
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

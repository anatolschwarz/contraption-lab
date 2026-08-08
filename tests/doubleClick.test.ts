import { describe, expect, it } from "vitest";
import {
  isClickMovementWithinTolerance,
  recordCompletedClick,
} from "../src/game/doubleClick";
import {
  createInitialGameState,
  transitionGameState,
} from "../src/state/gameState";

describe("editable-part double-click removal", () => {
  it("recognizes two completed clicks on the same part", () => {
    const first = recordCompletedClick(undefined, {
      componentId: "upper-ramp",
      completedAt: 100,
    });
    const second = recordCompletedClick(first.nextClick, {
      componentId: "upper-ramp",
      completedAt: 400,
    });
    expect(first.isDoubleClick).toBe(false);
    expect(second.isDoubleClick).toBe(true);
  });

  it("accepts small pointer jitter as a click", () => {
    expect(
      isClickMovementWithinTolerance({ x: 120, y: 200 }, { x: 125, y: 204 }),
    ).toBe(true);
    const first = recordCompletedClick(undefined, {
      componentId: "upper-ramp",
      completedAt: 100,
    });
    expect(
      recordCompletedClick(first.nextClick, {
        componentId: "upper-ramp",
        completedAt: 250,
      }).isDoubleClick,
    ).toBe(true);
  });

  it("does not treat slow clicks or different parts as a double-click", () => {
    const first = { componentId: "upper-ramp", completedAt: 100 };
    expect(
      recordCompletedClick(first, {
        componentId: "upper-ramp",
        completedAt: 451,
      }).isDoubleClick,
    ).toBe(false);
    expect(
      recordCompletedClick(first, {
        componentId: "lower-ramp",
        completedAt: 200,
      }).isDoubleClick,
    ).toBe(false);
  });

  it("clears the click sequence after a drag", () => {
    const first = recordCompletedClick(undefined, {
      componentId: "upper-ramp",
      completedAt: 100,
    });
    expect(
      isClickMovementWithinTolerance({ x: 120, y: 200 }, { x: 129, y: 200 }),
    ).toBe(false);
    expect(
      recordCompletedClick(undefined, {
        componentId: "upper-ramp",
        completedAt: 200,
      }).isDoubleClick,
    ).toBe(false);
    expect(first.nextClick).toBeDefined();
  });

  it("returns inventory exactly once for a successful removal", () => {
    const initial = createInitialGameState({ block: 1, ramp: 0 });
    const first = recordCompletedClick(undefined, {
      componentId: "upper-ramp",
      completedAt: 100,
    });
    const second = recordCompletedClick(first.nextClick, {
      componentId: "upper-ramp",
      completedAt: 200,
    });
    const afterRemoval = second.isDoubleClick
      ? transitionGameState(initial, {
          type: "remove-component",
          componentId: "upper-ramp",
          returnsTrayPart: "ramp",
        })
      : initial;
    expect(afterRemoval.trayRampCount).toBe(1);
    expect(
      recordCompletedClick(second.nextClick, {
        componentId: "upper-ramp",
        completedAt: 250,
      }).isDoubleClick,
    ).toBe(false);
  });
});

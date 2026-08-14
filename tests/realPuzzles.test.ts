import { describe, expect, it } from "vitest";
import rawBridgeTheGap from "../src/levels/bridgeTheGap.json";
import rawDownTheRamp from "../src/levels/downTheRamp.json";
import {
  builtInPuzzles,
  getBuiltInPuzzle,
  getBuiltInPuzzlePosition,
} from "../src/levels/puzzleCatalog";
import { validateLevel } from "../src/levels/validateLevel";
import {
  createInitialProgression,
  createPuzzleRuntime,
  getPuzzleProgress,
} from "../src/state/progression";
import { transitionGameState } from "../src/state/gameState";
import {
  isRectanglePlacementValid,
  type RectanglePlacement,
} from "../src/game/rampPlacement";

const downTheRamp = validateLevel(rawDownTheRamp);
const bridgeTheGap = validateLevel(rawBridgeTheGap);
const DOWN_THE_RAMP_PATH: RectanglePlacement[] = [
  { x: 375, y: 270, width: 200, height: 24, rotation: (4 * Math.PI) / 36 },
  { x: 565, y: 338, width: 200, height: 24, rotation: (4 * Math.PI) / 36 },
];
const BRIDGE_THE_GAP_PATH: RectanglePlacement[] = [
  { x: 370, y: 290, width: 200, height: 24, rotation: (3 * Math.PI) / 36 },
  { x: 565, y: 342, width: 200, height: 24, rotation: (3 * Math.PI) / 36 },
];

describe("the first real puzzle pair", () => {
  it("loads Down the Ramp with its 10-second timer and two Ramp inventory", () => {
    expect(downTheRamp).toMatchObject({
      id: "down-the-ramp-004",
      levelName: "Upper Platform",
      title: "Down the Ramp",
      difficulty: "Basic",
      order: 4,
      timeLimitSeconds: 10,
      inventory: { ball: 0, bird: 0, block: 0, ramp: 2 },
      ramps: [],
    });
    expect(downTheRamp.balls).toEqual([
      expect.objectContaining({
        id: "down-ramp-ball",
        ownership: "fixed",
        x: 290,
        y: 196,
      }),
    ]);
    expect(downTheRamp.blocks.map((block) => block.id)).toEqual([
      "upper-platform",
      "goal-platform",
    ]);
  });

  it("loads Bridge the Gap with its 12-second timer and two Ramp inventory", () => {
    expect(bridgeTheGap).toMatchObject({
      id: "bridge-the-gap-005",
      levelName: "Open Gap",
      title: "Bridge the Gap",
      difficulty: "Basic",
      order: 5,
      timeLimitSeconds: 12,
      inventory: { ball: 0, bird: 0, block: 0, ramp: 2 },
      ramps: [],
    });
    expect(bridgeTheGap.balls).toEqual([
      expect.objectContaining({
        id: "bridge-ball",
        ownership: "fixed",
        x: 285,
        y: 210,
      }),
    ]);
    expect(bridgeTheGap.blocks.map((block) => block.id)).toEqual([
      "left-platform",
      "right-platform",
    ]);
  });

  it("keeps the real puzzle pair ahead of the appended Chapter-1 level", () => {
    expect(getBuiltInPuzzle("down-the-ramp-004")).toEqual(downTheRamp);
    expect(getBuiltInPuzzle("bridge-the-gap-005")).toEqual(bridgeTheGap);
    expect(getBuiltInPuzzlePosition(downTheRamp.id)).toBe(4);
    expect(getBuiltInPuzzlePosition(bridgeTheGap.id)).toBe(5);
    expect(builtInPuzzles.slice(-3).map((puzzle) => puzzle.id)).toEqual([
      bridgeTheGap.id,
      "good-morning-marble-006",
      "boing-007",
    ]);
  });

  it.each([downTheRamp, bridgeTheGap])(
    "keeps %s valid through Run, Rerun, and Reset state transitions",
    (puzzle) => {
      const initial = createPuzzleRuntime(puzzle).gameState;
      const running = transitionGameState(initial, "toggle-simulation");
      const rerun = transitionGameState(running, "rerun");
      const reset = transitionGameState(running, "reset");

      expect(rerun).toMatchObject({
        mode: "running",
        timeRemainingMs: puzzle.timeLimitSeconds! * 1_000,
        trayRampCount: 2,
        ballTransforms: initial.ballTransforms,
      });
      expect(reset).toEqual(initial);
    },
  );

  it("keeps the pair locked until the preceding catalog levels are completed", () => {
    const progress = getPuzzleProgress(
      builtInPuzzles,
      createInitialProgression(),
    );
    expect(progress.slice(-2).map(({ availability }) => availability)).toEqual([
      "locked",
      "locked",
    ]);
  });

  it.each([
    [downTheRamp, DOWN_THE_RAMP_PATH],
    [bridgeTheGap, BRIDGE_THE_GAP_PATH],
  ] as const)(
    "keeps the intended %s Ramp path valid in Edit",
    (puzzle, path) => {
      const ball = puzzle.balls[0]!;
      const fixedPlatforms: RectanglePlacement[] = puzzle.blocks.map(
        (block) => ({
          ...block,
          rotation: 0,
        }),
      );

      for (const ramp of path) {
        expect(
          isRectanglePlacementValid(ramp, ball, [
            ...fixedPlatforms,
            ...path.filter((other) => other !== ramp),
          ]),
        ).toBe(true);
      }
    },
  );
});

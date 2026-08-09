import { describe, expect, it } from "vitest";
import {
  builtInPuzzles,
  getBuiltInPuzzlePosition,
} from "../src/levels/puzzleCatalog";
import {
  PROGRESSION_STORAGE_KEY,
  canSelectPuzzle,
  completePuzzle,
  createInitialProgression,
  createPuzzleRuntime,
  getNextUnlockedPuzzle,
  getPuzzleProgress,
  loadProgression,
  saveProgression,
  setUnlockAll,
  switchPuzzle,
  type StorageAdapter,
} from "../src/state/progression";
import { transitionGameState } from "../src/state/gameState";

class MemoryStorage implements StorageAdapter {
  private readonly values = new Map<string, string>();

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }
}

const [basic, medium, hard] = builtInPuzzles;

describe("built-in puzzle progression", () => {
  it("uses catalog order for persistent level numbers", () => {
    expect(getBuiltInPuzzlePosition(basic!.id)).toBe(1);
    expect(getBuiltInPuzzlePosition(medium!.id)).toBe(2);
    expect(getBuiltInPuzzlePosition(hard!.id)).toBe(3);
  });

  it("initially unlocks only the first puzzle", () => {
    const progress = getPuzzleProgress(
      builtInPuzzles,
      createInitialProgression(),
    );

    expect(progress.map(({ availability }) => availability)).toEqual([
      "available",
      "locked",
      "locked",
    ]);
  });

  it("marks a completed puzzle and unlocks the next one", () => {
    const progression = completePuzzle(
      createInitialProgression(),
      basic!.id,
      builtInPuzzles,
    );

    expect(progression.completedPuzzleIds).toEqual([basic!.id]);
    expect(getPuzzleProgress(builtInPuzzles, progression)).toMatchObject([
      { availability: "completed" },
      { availability: "available" },
      { availability: "locked" },
    ]);
  });

  it("keeps built-in puzzle definitions unchanged by progression state", () => {
    const before = JSON.stringify(builtInPuzzles);
    const progression = setUnlockAll(
      completePuzzle(createInitialProgression(), basic!.id, builtInPuzzles),
      true,
    );

    getPuzzleProgress(builtInPuzzles, progression);

    expect(JSON.stringify(builtInPuzzles)).toBe(before);
  });

  it("persists earned completion state across a storage reload", () => {
    const storage = new MemoryStorage();
    const progression = completePuzzle(
      createInitialProgression(),
      basic!.id,
      builtInPuzzles,
    );

    saveProgression(storage, progression);

    expect(storage.getItem(PROGRESSION_STORAGE_KEY)).toBeTruthy();
    expect(loadProgression(storage, builtInPuzzles)).toEqual(progression);
  });

  it("makes every built-in puzzle selectable when Unlock all is enabled", () => {
    const progression = setUnlockAll(createInitialProgression(), true);

    expect(getPuzzleProgress(builtInPuzzles, progression)).toEqual(
      builtInPuzzles.map((puzzle) => ({
        puzzle,
        availability: "available",
      })),
    );
  });

  it("keeps earned progress when Unlock all is disabled", () => {
    const earned = completePuzzle(
      createInitialProgression(),
      basic!.id,
      builtInPuzzles,
    );
    const restoredRules = setUnlockAll(setUnlockAll(earned, true), false);

    expect(restoredRules).toEqual({
      completedPuzzleIds: [basic!.id],
      unlockAll: false,
    });
    expect(getPuzzleProgress(builtInPuzzles, restoredRules)).toMatchObject([
      { availability: "completed" },
      { availability: "available" },
      { availability: "locked" },
    ]);
  });

  it("rejects a locked puzzle selection", () => {
    const runtime = createPuzzleRuntime(basic!);
    const progression = createInitialProgression();
    const rejected = switchPuzzle(
      runtime,
      hard!.id,
      builtInPuzzles,
      progression,
    );

    expect(canSelectPuzzle(hard!.id, builtInPuzzles, progression)).toBe(false);
    expect(rejected).toEqual(runtime);
  });

  it("isolates runtime state when switching to an unlocked puzzle", () => {
    const initialRuntime = createPuzzleRuntime(basic!);
    const changedRuntime = {
      ...initialRuntime,
      gameState: transitionGameState(
        initialRuntime.gameState,
        "toggle-simulation",
      ),
    };
    const progression = completePuzzle(
      createInitialProgression(),
      basic!.id,
      builtInPuzzles,
    );
    const mediumRuntime = switchPuzzle(
      changedRuntime,
      medium!.id,
      builtInPuzzles,
      progression,
    );

    expect(mediumRuntime.puzzleId).toBe(medium!.id);
    expect(mediumRuntime.gameState).toMatchObject({
      mode: "edit",
      rampTransforms: {},
      blockTransforms: {},
      trayBlockCount: medium!.inventory.block,
      trayRampCount: medium!.inventory.ramp,
    });
    expect(mediumRuntime.gameState.runSnapshot).toBeUndefined();
  });

  it("finds the next unlocked puzzle and handles the last puzzle", () => {
    const afterBasic = completePuzzle(
      createInitialProgression(),
      basic!.id,
      builtInPuzzles,
    );
    const afterAll = [basic, medium, hard].reduce(
      (progression, puzzle) =>
        completePuzzle(progression, puzzle!.id, builtInPuzzles),
      createInitialProgression(),
    );

    expect(getNextUnlockedPuzzle(basic!.id, builtInPuzzles, afterBasic)).toBe(
      medium,
    );
    expect(
      getNextUnlockedPuzzle(hard!.id, builtInPuzzles, afterAll),
    ).toBeUndefined();
  });
});

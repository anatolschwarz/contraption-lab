import { describe, expect, it } from "vitest";
import {
  getEnabledControls,
  INITIAL_GAME_STATE,
  transitionGameState,
} from "../src/state/gameState";

describe("game-state transitions", () => {
  it("starts in Edit with only valid actions enabled", () => {
    expect(INITIAL_GAME_STATE).toEqual({
      mode: "edit",
      succeeded: false,
      selectedComponent: null,
    });
    expect(getEnabledControls(INITIAL_GAME_STATE)).toEqual({
      edit: false,
      run: true,
      pause: false,
      reset: true,
    });
  });

  it("runs, pauses, and resumes", () => {
    const running = transitionGameState(INITIAL_GAME_STATE, "run");
    const paused = transitionGameState(running, "pause");
    expect(running.mode).toBe("running");
    expect(paused.mode).toBe("paused");
    expect(transitionGameState(paused, "run").mode).toBe("running");
  });

  it("selects and deselects the ramp only in Edit mode", () => {
    const selected = transitionGameState(INITIAL_GAME_STATE, "select-ramp");
    expect(selected.selectedComponent).toBe("ramp");
    expect(transitionGameState(selected, "deselect").selectedComponent).toBe(
      null,
    );

    const running = transitionGameState(selected, "run");
    const paused = transitionGameState(running, "pause");
    expect(running.selectedComponent).toBeNull();
    expect(transitionGameState(running, "select-ramp")).toEqual(running);
    expect(transitionGameState(paused, "select-ramp")).toEqual(paused);
  });

  it("pauses and locks controls after success", () => {
    const running = transitionGameState(INITIAL_GAME_STATE, "run");
    const success = transitionGameState(running, "success");
    expect(success).toEqual({
      mode: "paused",
      succeeded: true,
      selectedComponent: null,
    });
    expect(getEnabledControls(success)).toEqual({
      edit: false,
      run: false,
      pause: false,
      reset: true,
    });
  });
});

describe("reset behavior", () => {
  it("returns an identical fresh initial state every time", () => {
    const changed = {
      mode: "paused" as const,
      succeeded: true,
      selectedComponent: "ramp" as const,
    };
    const firstReset = transitionGameState(changed, "reset");
    const secondReset = transitionGameState(firstReset, "reset");
    expect(firstReset).toEqual(INITIAL_GAME_STATE);
    expect(secondReset).toEqual(firstReset);
    expect(secondReset).not.toBe(firstReset);
  });
});

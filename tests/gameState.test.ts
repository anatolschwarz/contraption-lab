import { describe, expect, it } from "vitest";
import {
  getEnabledControls,
  INITIAL_GAME_STATE,
  getSimulationButtonLabel,
  transitionGameState,
  updateRampTransform,
} from "../src/state/gameState";

describe("game-state transitions", () => {
  it("starts in Edit with only valid actions enabled", () => {
    expect(INITIAL_GAME_STATE).toEqual({
      mode: "edit",
      succeeded: false,
      rampPosition: null,
      rampRotation: null,
      selectedComponent: null,
    });
    expect(getEnabledControls(INITIAL_GAME_STATE)).toEqual({
      edit: false,
      simulation: true,
      reset: true,
    });
    expect(getSimulationButtonLabel(INITIAL_GAME_STATE)).toBe("Run");
  });

  it("toggles simulation between Run and Pause", () => {
    const running = transitionGameState(
      INITIAL_GAME_STATE,
      "toggle-simulation",
    );
    const paused = transitionGameState(running, "toggle-simulation");
    expect(running.mode).toBe("running");
    expect(getSimulationButtonLabel(running)).toBe("Pause");
    expect(paused.mode).toBe("paused");
    expect(getSimulationButtonLabel(paused)).toBe("Run");
    expect(transitionGameState(paused, "toggle-simulation").mode).toBe(
      "running",
    );
  });

  it("selects and deselects the ramp only in Edit mode", () => {
    const selected = transitionGameState(INITIAL_GAME_STATE, "select-ramp");
    expect(selected.selectedComponent).toBe("ramp");
    expect(transitionGameState(selected, "deselect").selectedComponent).toBe(
      null,
    );

    const running = transitionGameState(selected, "toggle-simulation");
    const paused = transitionGameState(running, "toggle-simulation");
    expect(running.selectedComponent).toBeNull();
    expect(transitionGameState(running, "select-ramp")).toEqual(running);
    expect(transitionGameState(paused, "select-ramp")).toEqual(paused);
  });

  it("persists the ramp transform through Run and Pause, but not Reset", () => {
    const selected = transitionGameState(INITIAL_GAME_STATE, "select-ramp");
    const moved = updateRampTransform(selected, {
      position: { x: 420, y: 300 },
      rotation: 0.5,
    });
    expect(moved.rampPosition).toEqual({ x: 420, y: 300 });
    expect(moved.rampRotation).toBe(0.5);

    const running = transitionGameState(moved, "toggle-simulation");
    const paused = transitionGameState(running, "toggle-simulation");
    expect(running.rampPosition).toEqual({ x: 420, y: 300 });
    expect(paused.rampPosition).toEqual({ x: 420, y: 300 });
    expect(running.rampRotation).toBe(0.5);
    expect(paused.rampRotation).toBe(0.5);
    expect(
      updateRampTransform(running, {
        position: { x: 500, y: 360 },
        rotation: 0.6,
      }),
    ).toEqual(running);
    expect(transitionGameState(paused, "reset").rampPosition).toBeNull();
    expect(transitionGameState(paused, "reset").rampRotation).toBeNull();
  });

  it("only updates the ramp transform for a selected ramp in Edit mode", () => {
    expect(
      updateRampTransform(INITIAL_GAME_STATE, {
        position: { x: 420, y: 300 },
        rotation: 0.5,
      }),
    ).toEqual(INITIAL_GAME_STATE);
  });

  it("pauses and locks controls after success", () => {
    const running = transitionGameState(
      INITIAL_GAME_STATE,
      "toggle-simulation",
    );
    const success = transitionGameState(running, "success");
    expect(success).toEqual({
      mode: "paused",
      succeeded: true,
      rampPosition: null,
      rampRotation: null,
      selectedComponent: null,
    });
    expect(getEnabledControls(success)).toEqual({
      edit: false,
      simulation: false,
      reset: true,
    });
  });
});

describe("reset behavior", () => {
  it("returns an identical fresh initial state every time", () => {
    const changed = {
      mode: "paused" as const,
      succeeded: true,
      rampPosition: { x: 420, y: 300 },
      rampRotation: 0.5,
      selectedComponent: "ramp" as const,
    };
    const firstReset = transitionGameState(changed, "reset");
    const secondReset = transitionGameState(firstReset, "reset");
    expect(firstReset).toEqual(INITIAL_GAME_STATE);
    expect(secondReset).toEqual(firstReset);
    expect(secondReset).not.toBe(firstReset);
    expect(getSimulationButtonLabel(firstReset)).toBe("Run");
  });
});

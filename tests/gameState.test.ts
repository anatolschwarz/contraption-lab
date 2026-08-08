import { describe, expect, it } from "vitest";
import {
  getEnabledControls,
  getSimulationButtonLabel,
  INITIAL_GAME_STATE,
  TRAY_BLOCK_ID,
  TRAY_RAMP_ID_PREFIX,
  transitionGameState,
  updateBlockTransform,
  updateRampTransform,
} from "../src/state/gameState";

const upperRampTransform = {
  position: { x: 260, y: 240 },
  rotation: 0.35,
};
const lowerRampTransform = {
  position: { x: 510, y: 350 },
  rotation: 0.35,
};
const blockTransform = { position: { x: 830, y: 180 } };

describe("game-state transitions", () => {
  it("starts in Edit with only valid actions enabled", () => {
    expect(INITIAL_GAME_STATE).toEqual({
      mode: "edit",
      succeeded: false,
      rampTransforms: {},
      blockTransforms: {},
      selectedComponentId: null,
      trayBlockCount: 1,
      trayRampCount: 0,
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

  it("selects exactly one editable component only in Edit mode", () => {
    const upperSelected = transitionGameState(INITIAL_GAME_STATE, {
      type: "select-component",
      componentId: "upper-ramp",
    });
    const blockSelected = transitionGameState(upperSelected, {
      type: "spawn-tray-block",
    });
    expect(upperSelected.selectedComponentId).toBe("upper-ramp");
    expect(blockSelected.selectedComponentId).toBe(TRAY_BLOCK_ID);
    expect(
      transitionGameState(blockSelected, "deselect").selectedComponentId,
    ).toBeNull();

    const running = transitionGameState(upperSelected, "toggle-simulation");
    expect(running.selectedComponentId).toBeNull();
    expect(
      transitionGameState(running, {
        type: "select-component",
        componentId: TRAY_BLOCK_ID,
      }),
    ).toEqual(running);
  });

  it("moves and rotates only the selected ramp", () => {
    const upperSelected = transitionGameState(INITIAL_GAME_STATE, {
      type: "select-component",
      componentId: "upper-ramp",
    });
    const movedUpper = updateRampTransform(
      upperSelected,
      "upper-ramp",
      upperRampTransform,
    );
    const attemptedLower = updateRampTransform(
      movedUpper,
      "lower-ramp",
      lowerRampTransform,
    );
    expect(movedUpper.rampTransforms).toEqual({
      "upper-ramp": upperRampTransform,
    });
    expect(attemptedLower).toEqual(movedUpper);
  });

  it("moves only the selected block", () => {
    const selected = transitionGameState(INITIAL_GAME_STATE, {
      type: "spawn-tray-block",
    });
    const moved = updateBlockTransform(selected, TRAY_BLOCK_ID, blockTransform);
    const attemptedRamp = updateRampTransform(
      moved,
      "upper-ramp",
      upperRampTransform,
    );
    expect(moved.blockTransforms).toEqual({ [TRAY_BLOCK_ID]: blockTransform });
    expect(attemptedRamp).toEqual(moved);
  });

  it("uses the one available tray block only in Edit mode", () => {
    const spawned = transitionGameState(INITIAL_GAME_STATE, {
      type: "spawn-tray-block",
    });
    expect(spawned.trayBlockCount).toBe(0);
    expect(spawned.selectedComponentId).toBe(TRAY_BLOCK_ID);
    expect(transitionGameState(spawned, { type: "spawn-tray-block" })).toEqual(
      spawned,
    );

    const running = transitionGameState(spawned, "toggle-simulation");
    expect(transitionGameState(running, { type: "spawn-tray-block" })).toEqual(
      running,
    );
    expect(transitionGameState(spawned, "reset").trayBlockCount).toBe(1);
    expect(transitionGameState(spawned, "reset").trayRampCount).toBe(0);
  });

  it("clears selection and returns removed tray parts to inventory", () => {
    const spawned = transitionGameState(INITIAL_GAME_STATE, {
      type: "spawn-tray-block",
    });
    const removedTrayBlock = transitionGameState(spawned, {
      type: "remove-component",
      componentId: TRAY_BLOCK_ID,
      returnsTrayPart: "block",
    });
    expect(removedTrayBlock.selectedComponentId).toBeNull();
    expect(removedTrayBlock.trayBlockCount).toBe(1);

    const selectedRamp = transitionGameState(INITIAL_GAME_STATE, {
      type: "select-component",
      componentId: "upper-ramp",
    });
    const movedRamp = updateRampTransform(
      selectedRamp,
      "upper-ramp",
      upperRampTransform,
    );
    const removedRamp = transitionGameState(movedRamp, {
      type: "remove-component",
      componentId: "upper-ramp",
      returnsTrayPart: "ramp",
    });
    expect(removedRamp.rampTransforms).toEqual({});
    expect(removedRamp.selectedComponentId).toBeNull();
    expect(removedRamp.trayRampCount).toBe(1);

    const selectedLowerRamp = transitionGameState(removedRamp, {
      type: "select-component",
      componentId: "lower-ramp",
    });
    const removedLowerRamp = transitionGameState(selectedLowerRamp, {
      type: "remove-component",
      componentId: "lower-ramp",
      returnsTrayPart: "ramp",
    });
    expect(removedLowerRamp.trayRampCount).toBe(2);

    const running = transitionGameState(movedRamp, "toggle-simulation");
    expect(
      transitionGameState(running, {
        type: "remove-component",
        componentId: "upper-ramp",
        returnsTrayPart: "ramp",
      }),
    ).toEqual(running);
  });

  it("cycles player ramps through removal, tray placement, and reset", () => {
    const afterRemovingUpper = transitionGameState(INITIAL_GAME_STATE, {
      type: "remove-component",
      componentId: "upper-ramp",
      returnsTrayPart: "ramp",
    });
    expect(afterRemovingUpper.trayRampCount).toBe(1);

    const afterRemovingBoth = transitionGameState(afterRemovingUpper, {
      type: "remove-component",
      componentId: "lower-ramp",
      returnsTrayPart: "ramp",
    });
    expect(afterRemovingBoth.trayRampCount).toBe(2);

    const firstTrayRampId = `${TRAY_RAMP_ID_PREFIX}1`;
    const afterPlacingFirst = transitionGameState(afterRemovingBoth, {
      type: "spawn-tray-ramp",
      componentId: firstTrayRampId,
    });
    expect(afterPlacingFirst.trayRampCount).toBe(1);
    expect(afterPlacingFirst.selectedComponentId).toBe(firstTrayRampId);

    const secondTrayRampId = `${TRAY_RAMP_ID_PREFIX}2`;
    const afterPlacingBoth = transitionGameState(afterPlacingFirst, {
      type: "spawn-tray-ramp",
      componentId: secondTrayRampId,
    });
    expect(afterPlacingBoth.trayRampCount).toBe(0);
    expect(afterPlacingBoth.selectedComponentId).toBe(secondTrayRampId);

    const afterRemovingTrayRamps = transitionGameState(
      transitionGameState(afterPlacingBoth, {
        type: "remove-component",
        componentId: firstTrayRampId,
        returnsTrayPart: "ramp",
      }),
      {
        type: "remove-component",
        componentId: secondTrayRampId,
        returnsTrayPart: "ramp",
      },
    );
    expect(afterRemovingTrayRamps.trayRampCount).toBe(2);
    expect(transitionGameState(afterRemovingTrayRamps, "reset")).toEqual(
      INITIAL_GAME_STATE,
    );
  });

  it("persists both ramp transforms through Run and Pause, but not Reset", () => {
    const upperSelected = transitionGameState(INITIAL_GAME_STATE, {
      type: "select-component",
      componentId: "upper-ramp",
    });
    const movedUpper = updateRampTransform(
      upperSelected,
      "upper-ramp",
      upperRampTransform,
    );
    const lowerSelected = transitionGameState(movedUpper, {
      type: "select-component",
      componentId: "lower-ramp",
    });
    const movedBoth = updateRampTransform(
      lowerSelected,
      "lower-ramp",
      lowerRampTransform,
    );
    const blockSelected = transitionGameState(movedBoth, {
      type: "spawn-tray-block",
    });
    const movedAll = updateBlockTransform(
      blockSelected,
      TRAY_BLOCK_ID,
      blockTransform,
    );

    const running = transitionGameState(movedAll, "toggle-simulation");
    const paused = transitionGameState(running, "toggle-simulation");
    expect(running.rampTransforms).toEqual({
      "upper-ramp": upperRampTransform,
      "lower-ramp": lowerRampTransform,
    });
    expect(paused.rampTransforms).toEqual(running.rampTransforms);
    expect(running.blockTransforms).toEqual({
      [TRAY_BLOCK_ID]: blockTransform,
    });
    expect(paused.blockTransforms).toEqual(running.blockTransforms);
    expect(transitionGameState(paused, "reset").rampTransforms).toEqual({});
    expect(transitionGameState(paused, "reset").blockTransforms).toEqual({});
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
      rampTransforms: {},
      blockTransforms: {},
      selectedComponentId: null,
      trayBlockCount: 1,
      trayRampCount: 0,
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
      rampTransforms: {
        "upper-ramp": upperRampTransform,
        "lower-ramp": lowerRampTransform,
      },
      blockTransforms: { [TRAY_BLOCK_ID]: blockTransform },
      selectedComponentId: TRAY_BLOCK_ID,
      trayBlockCount: 0 as const,
      trayRampCount: 0 as const,
    };
    const firstReset = transitionGameState(changed, "reset");
    const secondReset = transitionGameState(firstReset, "reset");
    expect(firstReset).toEqual(INITIAL_GAME_STATE);
    expect(secondReset).toEqual(firstReset);
    expect(secondReset).not.toBe(firstReset);
    expect(getSimulationButtonLabel(firstReset)).toBe("Run");
  });
});

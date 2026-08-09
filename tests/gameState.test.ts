import { describe, expect, it } from "vitest";
import {
  getEnabledControls,
  getSimulationButtonLabel,
  createInitialGameState,
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
const initialInventory = { block: 1, ramp: 0 };
const initialGameState = createInitialGameState(initialInventory);

describe("game-state transitions", () => {
  it("starts in Edit with only valid actions enabled", () => {
    expect(initialGameState).toEqual({
      initialInventory,
      mode: "edit",
      succeeded: false,
      rampTransforms: {},
      blockTransforms: {},
      selectedComponentId: null,
      trayBlockCount: 1,
      trayRampCount: 0,
    });
    expect(getEnabledControls(initialGameState)).toEqual({
      edit: false,
      simulation: true,
      reset: true,
    });
    expect(getSimulationButtonLabel(initialGameState)).toBe("Run");
  });

  it("uses level-defined inventory counts for initial state and reset", () => {
    const configured = createInitialGameState({ block: 3, ramp: 2 });
    expect(configured.trayBlockCount).toBe(3);
    expect(configured.trayRampCount).toBe(2);

    const afterPlacement = transitionGameState(configured, {
      type: "spawn-tray-ramp",
      componentId: `${TRAY_RAMP_ID_PREFIX}1`,
    });
    expect(afterPlacement.trayRampCount).toBe(1);
    expect(transitionGameState(afterPlacement, "reset")).toEqual(configured);
  });

  it("toggles simulation between Run and Pause", () => {
    const running = transitionGameState(initialGameState, "toggle-simulation");
    const paused = transitionGameState(running, "toggle-simulation");
    expect(running.mode).toBe("running");
    expect(getSimulationButtonLabel(running)).toBe("Pause");
    expect(paused.mode).toBe("paused");
    expect(getSimulationButtonLabel(paused)).toBe("Run");
    expect(transitionGameState(paused, "toggle-simulation").mode).toBe(
      "running",
    );
  });

  it("leaves untimed puzzles without timer state", () => {
    expect(initialGameState.timeLimitSeconds).toBeUndefined();
    expect(initialGameState.timeRemainingMs).toBeUndefined();
    expect(
      transitionGameState(initialGameState, {
        type: "advance-time",
        deltaMs: 1_000,
      }),
    ).toEqual(initialGameState);
  });

  it("selects exactly one editable component only in Edit mode", () => {
    const upperSelected = transitionGameState(initialGameState, {
      type: "select-component",
      componentId: "upper-ramp",
    });
    const blockSelected = transitionGameState(upperSelected, {
      type: "spawn-tray-block",
      componentId: TRAY_BLOCK_ID,
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
    const upperSelected = transitionGameState(initialGameState, {
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
    const selected = transitionGameState(initialGameState, {
      type: "spawn-tray-block",
      componentId: TRAY_BLOCK_ID,
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
    const spawned = transitionGameState(initialGameState, {
      type: "spawn-tray-block",
      componentId: TRAY_BLOCK_ID,
    });
    expect(spawned.trayBlockCount).toBe(0);
    expect(spawned.selectedComponentId).toBe(TRAY_BLOCK_ID);
    expect(
      transitionGameState(spawned, {
        type: "spawn-tray-block",
        componentId: "tray-block-2",
      }),
    ).toEqual(spawned);

    const running = transitionGameState(spawned, "toggle-simulation");
    expect(
      transitionGameState(running, {
        type: "spawn-tray-block",
        componentId: "tray-block-2",
      }),
    ).toEqual(running);
    expect(transitionGameState(spawned, "reset").trayBlockCount).toBe(1);
    expect(transitionGameState(spawned, "reset").trayRampCount).toBe(0);
  });

  it("clears selection and returns removed tray parts to inventory", () => {
    const spawned = transitionGameState(initialGameState, {
      type: "spawn-tray-block",
      componentId: TRAY_BLOCK_ID,
    });
    const removedTrayBlock = transitionGameState(spawned, {
      type: "remove-component",
      componentId: TRAY_BLOCK_ID,
      returnsTrayPart: "block",
    });
    expect(removedTrayBlock.selectedComponentId).toBeNull();
    expect(removedTrayBlock.trayBlockCount).toBe(1);

    const selectedRamp = transitionGameState(initialGameState, {
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
    const afterRemovingUpper = transitionGameState(initialGameState, {
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
      initialGameState,
    );
  });

  it("reruns the captured Run-start transforms and inventory", () => {
    const removedUpperRamp = transitionGameState(initialGameState, {
      type: "remove-component",
      componentId: "upper-ramp",
      returnsTrayPart: "ramp",
    });
    const trayRampId = `${TRAY_RAMP_ID_PREFIX}1`;
    const spawnedRamp = transitionGameState(removedUpperRamp, {
      type: "spawn-tray-ramp",
      componentId: trayRampId,
    });
    const movedTrayRamp = updateRampTransform(spawnedRamp, trayRampId, {
      position: { x: 420, y: 330 },
      rotation: 0.2,
    });
    const running = transitionGameState(movedTrayRamp, "toggle-simulation");
    const rerun = transitionGameState(
      transitionGameState(running, "success"),
      "rerun",
    );

    expect(running.runSnapshot).toEqual({
      rampTransforms: {
        [trayRampId]: { position: { x: 420, y: 330 }, rotation: 0.2 },
      },
      blockTransforms: {},
      trayBlockCount: 1,
      trayRampCount: 0,
    });
    expect(rerun).toMatchObject({
      mode: "running",
      succeeded: false,
      selectedComponentId: null,
      rampTransforms: running.runSnapshot?.rampTransforms,
      trayBlockCount: 1,
      trayRampCount: 0,
    });
  });

  it("replaces the rerun snapshot when Edit changes are run again", () => {
    const firstRun = transitionGameState(initialGameState, "toggle-simulation");
    const edit = transitionGameState(
      transitionGameState(firstRun, "toggle-simulation"),
      "edit",
    );
    const selectedLower = transitionGameState(edit, {
      type: "select-component",
      componentId: "lower-ramp",
    });
    const secondRun = transitionGameState(
      updateRampTransform(selectedLower, "lower-ramp", lowerRampTransform),
      "toggle-simulation",
    );

    expect(secondRun.runSnapshot?.rampTransforms).toEqual({
      "lower-ramp": lowerRampTransform,
    });
  });

  it("persists both ramp transforms through Run and Pause, but not Reset", () => {
    const upperSelected = transitionGameState(initialGameState, {
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
      componentId: TRAY_BLOCK_ID,
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
    const running = transitionGameState(initialGameState, "toggle-simulation");
    const success = transitionGameState(running, "success");
    expect(success).toEqual({
      initialInventory,
      mode: "paused",
      succeeded: true,
      rampTransforms: {},
      blockTransforms: {},
      selectedComponentId: null,
      trayBlockCount: 1,
      trayRampCount: 0,
      runSnapshot: {
        rampTransforms: {},
        blockTransforms: {},
        trayBlockCount: 1,
        trayRampCount: 0,
      },
    });
    expect(getEnabledControls(success)).toEqual({
      edit: false,
      simulation: false,
      reset: true,
    });
  });
});

describe("timed puzzle state", () => {
  const timedInitialState = createInitialGameState(initialInventory, 10);

  it("starts its countdown on Run and freezes it while paused", () => {
    const running = transitionGameState(timedInitialState, "toggle-simulation");
    const advanced = transitionGameState(running, {
      type: "advance-time",
      deltaMs: 2_500,
    });
    const paused = transitionGameState(advanced, "toggle-simulation");
    const pausedTick = transitionGameState(paused, {
      type: "advance-time",
      deltaMs: 5_000,
    });
    const resumed = transitionGameState(pausedTick, "toggle-simulation");

    expect(running.timeRemainingMs).toBe(10_000);
    expect(advanced.timeRemainingMs).toBe(7_500);
    expect(pausedTick.timeRemainingMs).toBe(7_500);
    expect(resumed).toMatchObject({ mode: "running", timeRemainingMs: 7_500 });
  });

  it("reruns with the full limit and Reset restores Edit with the original timer", () => {
    const running = transitionGameState(timedInitialState, "toggle-simulation");
    const elapsed = transitionGameState(running, {
      type: "advance-time",
      deltaMs: 9_000,
    });
    const rerun = transitionGameState(elapsed, "rerun");
    const reset = transitionGameState(elapsed, "reset");

    expect(rerun).toMatchObject({ mode: "running", timeRemainingMs: 10_000 });
    expect(reset).toEqual(timedInitialState);
  });

  it("stops on Success and enters Failed when the timer reaches zero first", () => {
    const running = transitionGameState(timedInitialState, "toggle-simulation");
    const partiallyElapsed = transitionGameState(running, {
      type: "advance-time",
      deltaMs: 4_000,
    });
    const success = transitionGameState(partiallyElapsed, "success");
    const tickAfterSuccess = transitionGameState(success, {
      type: "advance-time",
      deltaMs: 6_000,
    });
    const timeout = transitionGameState(running, {
      type: "advance-time",
      deltaMs: 10_000,
    });

    expect(tickAfterSuccess).toMatchObject({
      mode: "paused",
      succeeded: true,
      timeRemainingMs: 6_000,
    });
    expect(timeout).toMatchObject({
      mode: "failed",
      succeeded: false,
      timeRemainingMs: 0,
    });
    expect(getEnabledControls(timeout)).toEqual({
      edit: false,
      simulation: false,
      reset: true,
    });
  });
});

describe("reset behavior", () => {
  it("returns an identical fresh initial state every time", () => {
    const changed = {
      initialInventory,
      mode: "paused" as const,
      succeeded: true,
      rampTransforms: {
        "upper-ramp": upperRampTransform,
        "lower-ramp": lowerRampTransform,
      },
      blockTransforms: { [TRAY_BLOCK_ID]: blockTransform },
      selectedComponentId: TRAY_BLOCK_ID,
      trayBlockCount: 0,
      trayRampCount: 0,
    };
    const firstReset = transitionGameState(changed, "reset");
    const secondReset = transitionGameState(firstReset, "reset");
    expect(firstReset).toEqual(initialGameState);
    expect(secondReset).toEqual(firstReset);
    expect(secondReset).not.toBe(firstReset);
    expect(getSimulationButtonLabel(firstReset)).toBe("Run");
  });
});

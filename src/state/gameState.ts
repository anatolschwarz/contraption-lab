import type { Point } from "../levels/levelTypes";

export type GameMode = "edit" | "running" | "paused";
export type SelectableComponent = "ramp";

export interface RampTransform {
  position: Point;
  rotation: number;
}

export type GameAction =
  | "edit"
  | "toggle-simulation"
  | "reset"
  | "success"
  | "select-ramp"
  | "deselect";

export interface GameState {
  mode: GameMode;
  succeeded: boolean;
  rampPosition: Point | null;
  rampRotation: number | null;
  selectedComponent: SelectableComponent | null;
}

export const INITIAL_GAME_STATE: Readonly<GameState> = Object.freeze({
  mode: "edit",
  succeeded: false,
  rampPosition: null,
  rampRotation: null,
  selectedComponent: null,
});

export interface EnabledControls {
  edit: boolean;
  simulation: boolean;
  reset: boolean;
}

export function transitionGameState(
  state: Readonly<GameState>,
  action: GameAction,
): GameState {
  if (action === "reset") {
    return { ...INITIAL_GAME_STATE };
  }
  if (action === "success" && state.mode === "running") {
    return {
      mode: "paused",
      succeeded: true,
      rampPosition: state.rampPosition,
      rampRotation: state.rampRotation,
      selectedComponent: null,
    };
  }
  if (state.succeeded) {
    return { ...state };
  }
  if (action === "select-ramp" && state.mode === "edit") {
    return { ...state, selectedComponent: "ramp" };
  }
  if (action === "deselect" && state.mode === "edit") {
    return { ...state, selectedComponent: null };
  }
  if (
    action === "toggle-simulation" &&
    (state.mode === "edit" || state.mode === "paused")
  ) {
    return {
      mode: "running",
      succeeded: false,
      rampPosition: state.rampPosition,
      rampRotation: state.rampRotation,
      selectedComponent: null,
    };
  }
  if (action === "toggle-simulation" && state.mode === "running") {
    return {
      mode: "paused",
      succeeded: false,
      rampPosition: state.rampPosition,
      rampRotation: state.rampRotation,
      selectedComponent: null,
    };
  }
  if (action === "edit" && state.mode !== "edit") {
    return {
      mode: "edit",
      succeeded: false,
      rampPosition: state.rampPosition,
      rampRotation: state.rampRotation,
      selectedComponent: null,
    };
  }
  return { ...state };
}

export function updateRampTransform(
  state: Readonly<GameState>,
  transform: Readonly<RampTransform>,
): GameState {
  if (
    state.mode !== "edit" ||
    state.succeeded ||
    state.selectedComponent !== "ramp"
  ) {
    return { ...state };
  }
  return {
    ...state,
    rampPosition: { ...transform.position },
    rampRotation: transform.rotation,
  };
}

export function getEnabledControls(
  state: Readonly<GameState>,
): EnabledControls {
  if (state.succeeded) {
    return { edit: false, simulation: false, reset: true };
  }
  return {
    edit: state.mode !== "edit",
    simulation: true,
    reset: true,
  };
}

export function getSimulationButtonLabel(
  state: Readonly<GameState>,
): "Run" | "Pause" {
  return state.mode === "running" ? "Pause" : "Run";
}

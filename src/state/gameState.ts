import type { Point } from "../levels/levelTypes";

export type GameMode = "edit" | "running" | "paused";

export interface RampTransform {
  position: Point;
  rotation: number;
}

export interface SelectRampAction {
  type: "select-ramp";
  rampId: string;
}

export type GameAction =
  | "edit"
  | "toggle-simulation"
  | "reset"
  | "success"
  | "deselect"
  | SelectRampAction;

export interface GameState {
  mode: GameMode;
  succeeded: boolean;
  rampTransforms: Record<string, RampTransform>;
  selectedRampId: string | null;
}

export const INITIAL_GAME_STATE: Readonly<GameState> = Object.freeze({
  mode: "edit",
  succeeded: false,
  rampTransforms: {},
  selectedRampId: null,
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
    return { ...INITIAL_GAME_STATE, rampTransforms: {} };
  }
  if (action === "success" && state.mode === "running") {
    return {
      mode: "paused",
      succeeded: true,
      rampTransforms: { ...state.rampTransforms },
      selectedRampId: null,
    };
  }
  if (state.succeeded) {
    return { ...state, rampTransforms: { ...state.rampTransforms } };
  }
  if (typeof action === "object" && action.type === "select-ramp") {
    return state.mode === "edit"
      ? { ...state, selectedRampId: action.rampId }
      : { ...state, rampTransforms: { ...state.rampTransforms } };
  }
  if (action === "deselect" && state.mode === "edit") {
    return { ...state, selectedRampId: null };
  }
  if (
    action === "toggle-simulation" &&
    (state.mode === "edit" || state.mode === "paused")
  ) {
    return {
      mode: "running",
      succeeded: false,
      rampTransforms: { ...state.rampTransforms },
      selectedRampId: null,
    };
  }
  if (action === "toggle-simulation" && state.mode === "running") {
    return {
      mode: "paused",
      succeeded: false,
      rampTransforms: { ...state.rampTransforms },
      selectedRampId: null,
    };
  }
  if (action === "edit" && state.mode !== "edit") {
    return {
      mode: "edit",
      succeeded: false,
      rampTransforms: { ...state.rampTransforms },
      selectedRampId: null,
    };
  }
  return { ...state, rampTransforms: { ...state.rampTransforms } };
}

export function updateRampTransform(
  state: Readonly<GameState>,
  rampId: string,
  transform: Readonly<RampTransform>,
): GameState {
  if (
    state.mode !== "edit" ||
    state.succeeded ||
    state.selectedRampId !== rampId
  ) {
    return { ...state, rampTransforms: { ...state.rampTransforms } };
  }
  return {
    ...state,
    rampTransforms: {
      ...state.rampTransforms,
      [rampId]: {
        position: { ...transform.position },
        rotation: transform.rotation,
      },
    },
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

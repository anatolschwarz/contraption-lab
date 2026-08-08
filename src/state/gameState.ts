import type { Point } from "../levels/levelTypes";

export type GameMode = "edit" | "running" | "paused";

export interface RampTransform {
  position: Point;
  rotation: number;
}

export interface BlockTransform {
  position: Point;
}

export interface SelectComponentAction {
  type: "select-component";
  componentId: string;
}

export type GameAction =
  | "edit"
  | "toggle-simulation"
  | "reset"
  | "success"
  | "deselect"
  | SelectComponentAction;

export interface GameState {
  mode: GameMode;
  succeeded: boolean;
  rampTransforms: Record<string, RampTransform>;
  blockTransforms: Record<string, BlockTransform>;
  selectedComponentId: string | null;
}

export const INITIAL_GAME_STATE: Readonly<GameState> = Object.freeze({
  mode: "edit",
  succeeded: false,
  rampTransforms: {},
  blockTransforms: {},
  selectedComponentId: null,
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
    return {
      ...INITIAL_GAME_STATE,
      rampTransforms: {},
      blockTransforms: {},
    };
  }
  if (action === "success" && state.mode === "running") {
    return {
      mode: "paused",
      succeeded: true,
      rampTransforms: { ...state.rampTransforms },
      blockTransforms: { ...state.blockTransforms },
      selectedComponentId: null,
    };
  }
  if (state.succeeded) {
    return {
      ...state,
      rampTransforms: { ...state.rampTransforms },
      blockTransforms: { ...state.blockTransforms },
    };
  }
  if (typeof action === "object" && action.type === "select-component") {
    return state.mode === "edit"
      ? { ...state, selectedComponentId: action.componentId }
      : {
          ...state,
          rampTransforms: { ...state.rampTransforms },
          blockTransforms: { ...state.blockTransforms },
        };
  }
  if (action === "deselect" && state.mode === "edit") {
    return { ...state, selectedComponentId: null };
  }
  if (
    action === "toggle-simulation" &&
    (state.mode === "edit" || state.mode === "paused")
  ) {
    return {
      mode: "running",
      succeeded: false,
      rampTransforms: { ...state.rampTransforms },
      blockTransforms: { ...state.blockTransforms },
      selectedComponentId: null,
    };
  }
  if (action === "toggle-simulation" && state.mode === "running") {
    return {
      mode: "paused",
      succeeded: false,
      rampTransforms: { ...state.rampTransforms },
      blockTransforms: { ...state.blockTransforms },
      selectedComponentId: null,
    };
  }
  if (action === "edit" && state.mode !== "edit") {
    return {
      mode: "edit",
      succeeded: false,
      rampTransforms: { ...state.rampTransforms },
      blockTransforms: { ...state.blockTransforms },
      selectedComponentId: null,
    };
  }
  return {
    ...state,
    rampTransforms: { ...state.rampTransforms },
    blockTransforms: { ...state.blockTransforms },
  };
}

export function updateRampTransform(
  state: Readonly<GameState>,
  rampId: string,
  transform: Readonly<RampTransform>,
): GameState {
  if (
    state.mode !== "edit" ||
    state.succeeded ||
    state.selectedComponentId !== rampId
  ) {
    return {
      ...state,
      rampTransforms: { ...state.rampTransforms },
      blockTransforms: { ...state.blockTransforms },
    };
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

export function updateBlockTransform(
  state: Readonly<GameState>,
  blockId: string,
  transform: Readonly<BlockTransform>,
): GameState {
  if (
    state.mode !== "edit" ||
    state.succeeded ||
    state.selectedComponentId !== blockId
  ) {
    return {
      ...state,
      rampTransforms: { ...state.rampTransforms },
      blockTransforms: { ...state.blockTransforms },
    };
  }
  return {
    ...state,
    rampTransforms: { ...state.rampTransforms },
    blockTransforms: {
      ...state.blockTransforms,
      [blockId]: { position: { ...transform.position } },
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

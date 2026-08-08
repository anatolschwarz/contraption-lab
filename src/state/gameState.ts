import type { Point } from "../levels/levelTypes";

export type GameMode = "edit" | "running" | "paused";
export const TRAY_BLOCK_ID = "tray-block-1";

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

export interface SpawnTrayBlockAction {
  type: "spawn-tray-block";
}

export interface RemoveComponentAction {
  type: "remove-component";
  componentId: string;
  returnsTrayBlock: boolean;
}

export type GameAction =
  | "edit"
  | "toggle-simulation"
  | "reset"
  | "success"
  | "deselect"
  | SelectComponentAction
  | SpawnTrayBlockAction
  | RemoveComponentAction;

export interface GameState {
  mode: GameMode;
  succeeded: boolean;
  rampTransforms: Record<string, RampTransform>;
  blockTransforms: Record<string, BlockTransform>;
  selectedComponentId: string | null;
  trayBlockCount: 0 | 1;
}

export const INITIAL_GAME_STATE: Readonly<GameState> = Object.freeze({
  mode: "edit",
  succeeded: false,
  rampTransforms: {},
  blockTransforms: {},
  selectedComponentId: null,
  trayBlockCount: 1,
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
      trayBlockCount: state.trayBlockCount,
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
  if (typeof action === "object" && action.type === "spawn-tray-block") {
    return state.mode === "edit" && state.trayBlockCount > 0
      ? {
          ...state,
          selectedComponentId: TRAY_BLOCK_ID,
          trayBlockCount: 0,
        }
      : {
          ...state,
          rampTransforms: { ...state.rampTransforms },
          blockTransforms: { ...state.blockTransforms },
        };
  }
  if (typeof action === "object" && action.type === "remove-component") {
    if (state.mode !== "edit") {
      return {
        ...state,
        rampTransforms: { ...state.rampTransforms },
        blockTransforms: { ...state.blockTransforms },
      };
    }
    const rampTransforms = Object.fromEntries(
      Object.entries(state.rampTransforms).filter(
        ([componentId]) => componentId !== action.componentId,
      ),
    );
    const blockTransforms = Object.fromEntries(
      Object.entries(state.blockTransforms).filter(
        ([componentId]) => componentId !== action.componentId,
      ),
    );
    return {
      ...state,
      rampTransforms,
      blockTransforms,
      selectedComponentId: null,
      trayBlockCount: action.returnsTrayBlock ? 1 : state.trayBlockCount,
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
      trayBlockCount: state.trayBlockCount,
    };
  }
  if (action === "toggle-simulation" && state.mode === "running") {
    return {
      mode: "paused",
      succeeded: false,
      rampTransforms: { ...state.rampTransforms },
      blockTransforms: { ...state.blockTransforms },
      selectedComponentId: null,
      trayBlockCount: state.trayBlockCount,
    };
  }
  if (action === "edit" && state.mode !== "edit") {
    return {
      mode: "edit",
      succeeded: false,
      rampTransforms: { ...state.rampTransforms },
      blockTransforms: { ...state.blockTransforms },
      selectedComponentId: null,
      trayBlockCount: state.trayBlockCount,
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

import type { InventoryDefinition, Point } from "../levels/levelTypes";

export type GameMode = "edit" | "running" | "paused";
export const TRAY_BLOCK_ID = "tray-block-1";
export const TRAY_BLOCK_ID_PREFIX = "tray-block-";
export const TRAY_RAMP_ID_PREFIX = "tray-ramp-";

export interface RampTransform {
  position: Point;
  rotation: number;
}

export interface BlockTransform {
  position: Point;
}

export interface RunSnapshot {
  rampTransforms: Record<string, RampTransform>;
  blockTransforms: Record<string, BlockTransform>;
  trayBlockCount: number;
  trayRampCount: number;
}

export interface SelectComponentAction {
  type: "select-component";
  componentId: string;
}

export interface SpawnTrayBlockAction {
  type: "spawn-tray-block";
  componentId: string;
}

export interface SpawnTrayRampAction {
  type: "spawn-tray-ramp";
  componentId: string;
}

export interface RemoveComponentAction {
  type: "remove-component";
  componentId: string;
  returnsTrayPart: "block" | "ramp" | null;
}

export type GameAction =
  | "edit"
  | "toggle-simulation"
  | "rerun"
  | "reset"
  | "success"
  | "deselect"
  | SelectComponentAction
  | SpawnTrayBlockAction
  | SpawnTrayRampAction
  | RemoveComponentAction;

export interface GameState {
  initialInventory: InventoryDefinition;
  mode: GameMode;
  succeeded: boolean;
  rampTransforms: Record<string, RampTransform>;
  blockTransforms: Record<string, BlockTransform>;
  selectedComponentId: string | null;
  trayBlockCount: number;
  trayRampCount: number;
  runSnapshot?: RunSnapshot;
}

export function createInitialGameState(
  inventory: Readonly<InventoryDefinition>,
): GameState {
  return {
    initialInventory: { ...inventory },
    mode: "edit",
    succeeded: false,
    rampTransforms: {},
    blockTransforms: {},
    selectedComponentId: null,
    trayBlockCount: inventory.block,
    trayRampCount: inventory.ramp,
  };
}

export interface EnabledControls {
  edit: boolean;
  simulation: boolean;
  reset: boolean;
}

function createRunSnapshot(state: Readonly<GameState>): RunSnapshot {
  return {
    rampTransforms: { ...state.rampTransforms },
    blockTransforms: { ...state.blockTransforms },
    trayBlockCount: state.trayBlockCount,
    trayRampCount: state.trayRampCount,
  };
}

function cloneRunSnapshot(
  snapshot: Readonly<RunSnapshot> | undefined,
): RunSnapshot | undefined {
  return (
    snapshot && {
      rampTransforms: { ...snapshot.rampTransforms },
      blockTransforms: { ...snapshot.blockTransforms },
      trayBlockCount: snapshot.trayBlockCount,
      trayRampCount: snapshot.trayRampCount,
    }
  );
}

export function transitionGameState(
  state: Readonly<GameState>,
  action: GameAction,
): GameState {
  if (action === "reset") {
    return createInitialGameState(state.initialInventory);
  }
  if (action === "rerun" && state.mode !== "edit" && state.runSnapshot) {
    return {
      mode: "running",
      succeeded: false,
      initialInventory: { ...state.initialInventory },
      rampTransforms: { ...state.runSnapshot.rampTransforms },
      blockTransforms: { ...state.runSnapshot.blockTransforms },
      selectedComponentId: null,
      trayBlockCount: state.runSnapshot.trayBlockCount,
      trayRampCount: state.runSnapshot.trayRampCount,
      runSnapshot: cloneRunSnapshot(state.runSnapshot),
    };
  }
  if (action === "success" && state.mode === "running") {
    return {
      mode: "paused",
      succeeded: true,
      initialInventory: { ...state.initialInventory },
      rampTransforms: { ...state.rampTransforms },
      blockTransforms: { ...state.blockTransforms },
      selectedComponentId: null,
      trayBlockCount: state.trayBlockCount,
      trayRampCount: state.trayRampCount,
      runSnapshot: cloneRunSnapshot(state.runSnapshot),
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
          selectedComponentId: action.componentId,
          trayBlockCount: state.trayBlockCount - 1,
        }
      : {
          ...state,
          rampTransforms: { ...state.rampTransforms },
          blockTransforms: { ...state.blockTransforms },
        };
  }
  if (typeof action === "object" && action.type === "spawn-tray-ramp") {
    return state.mode === "edit" && state.trayRampCount > 0
      ? {
          ...state,
          selectedComponentId: action.componentId,
          trayRampCount: state.trayRampCount - 1,
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
      trayBlockCount:
        action.returnsTrayPart === "block"
          ? state.trayBlockCount + 1
          : state.trayBlockCount,
      trayRampCount:
        action.returnsTrayPart === "ramp"
          ? state.trayRampCount + 1
          : state.trayRampCount,
    };
  }
  if (action === "deselect" && state.mode === "edit") {
    return { ...state, selectedComponentId: null };
  }
  if (action === "toggle-simulation" && state.mode === "edit") {
    return {
      mode: "running",
      succeeded: false,
      initialInventory: { ...state.initialInventory },
      rampTransforms: { ...state.rampTransforms },
      blockTransforms: { ...state.blockTransforms },
      selectedComponentId: null,
      trayBlockCount: state.trayBlockCount,
      trayRampCount: state.trayRampCount,
      runSnapshot: createRunSnapshot(state),
    };
  }
  if (action === "toggle-simulation" && state.mode === "paused") {
    return {
      mode: "running",
      succeeded: false,
      initialInventory: { ...state.initialInventory },
      rampTransforms: { ...state.rampTransforms },
      blockTransforms: { ...state.blockTransforms },
      selectedComponentId: null,
      trayBlockCount: state.trayBlockCount,
      trayRampCount: state.trayRampCount,
      runSnapshot: cloneRunSnapshot(state.runSnapshot),
    };
  }
  if (action === "toggle-simulation" && state.mode === "running") {
    return {
      mode: "paused",
      succeeded: false,
      initialInventory: { ...state.initialInventory },
      rampTransforms: { ...state.rampTransforms },
      blockTransforms: { ...state.blockTransforms },
      selectedComponentId: null,
      trayBlockCount: state.trayBlockCount,
      trayRampCount: state.trayRampCount,
      runSnapshot: cloneRunSnapshot(state.runSnapshot),
    };
  }
  if (action === "edit" && state.mode !== "edit") {
    return {
      mode: "edit",
      succeeded: false,
      initialInventory: { ...state.initialInventory },
      rampTransforms: { ...state.rampTransforms },
      blockTransforms: { ...state.blockTransforms },
      selectedComponentId: null,
      trayBlockCount: state.trayBlockCount,
      trayRampCount: state.trayRampCount,
      runSnapshot: cloneRunSnapshot(state.runSnapshot),
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

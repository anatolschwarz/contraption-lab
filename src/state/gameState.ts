import type {
  CompleteInventoryDefinition,
  InventoryDefinition,
  Point,
} from "../levels/levelTypes";
import {
  createEmptyInventory,
  type InventoryPartKey,
} from "../levels/partRegistry";

export type GameMode = "edit" | "running" | "paused" | "failed";
export const TRAY_BLOCK_ID = "tray-block-1";
export const TRAY_BALL_ID_PREFIX = "tray-ball-";
export const TRAY_BLOCK_ID_PREFIX = "tray-block-";
export const TRAY_RAMP_ID_PREFIX = "tray-ramp-";
export const TRAY_MATTRESS_ID_PREFIX = "tray-mattress-";
export const TRAY_TEAPOT_ID_PREFIX = "tray-teapot-";

export interface RampTransform {
  position: Point;
  rotation: number;
}

export interface BlockTransform {
  position: Point;
}

export interface BallTransform {
  position: Point;
}

export interface HeldPlacement {
  part: InventoryPartKey;
  id: string;
  transform: RampTransform;
}

export interface BeginHeldPlacementAction {
  type: "begin-held-placement";
  placement: HeldPlacement;
}

export interface UpdateHeldPlacementAction {
  type: "update-held-placement";
  transform: RampTransform;
}

export interface CommitHeldPlacementAction {
  type: "commit-held-placement";
}

export interface RunSnapshot {
  rampTransforms: Record<string, RampTransform>;
  blockTransforms: Record<string, BlockTransform>;
  ballTransforms: Record<string, BallTransform>;
  trayBallCount: number;
  trayBirdCount: number;
  trayBlockCount: number;
  trayRampCount: number;
  trayMattressCount: number;
  trayTeapotCount: number;
}

export interface SelectComponentAction {
  type: "select-component";
  componentId: string;
}

export interface SpawnTrayBlockAction {
  type: "spawn-tray-block";
  componentId: string;
}

export interface SpawnTrayBallAction {
  type: "spawn-tray-ball";
  componentId: string;
  transform: BallTransform;
}

export interface SpawnTrayBirdAction {
  type: "spawn-tray-bird";
  componentId: string;
}

export interface SpawnTrayRampAction {
  type: "spawn-tray-ramp";
  componentId: string;
}
export interface SpawnTrayMattressAction {
  type: "spawn-tray-mattress";
  componentId: string;
}
export interface SpawnTrayTeapotAction {
  type: "spawn-tray-teapot";
  componentId: string;
}

export interface RemoveComponentAction {
  type: "remove-component";
  componentId: string;
  returnsTrayPart:
    "ball" | "bird" | "block" | "ramp" | "mattress" | "teapot" | null;
}

export interface AdvanceTimeAction {
  type: "advance-time";
  deltaMs: number;
  enforceTimer?: boolean;
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
  | SpawnTrayBallAction
  | SpawnTrayBirdAction
  | SpawnTrayRampAction
  | SpawnTrayMattressAction
  | SpawnTrayTeapotAction
  | BeginHeldPlacementAction
  | UpdateHeldPlacementAction
  | CommitHeldPlacementAction
  | { type: "cancel-held-placement" }
  | RemoveComponentAction
  | AdvanceTimeAction;

export interface GameState {
  initialInventory: CompleteInventoryDefinition;
  initialBallTransforms: Record<string, BallTransform>;
  mode: GameMode;
  succeeded: boolean;
  timeLimitSeconds?: number;
  timeRemainingMs?: number;
  rampTransforms: Record<string, RampTransform>;
  blockTransforms: Record<string, BlockTransform>;
  ballTransforms: Record<string, BallTransform>;
  selectedComponentId: string | null;
  heldPlacement: HeldPlacement | null;
  trayBallCount: number;
  trayBirdCount: number;
  trayBlockCount: number;
  trayRampCount: number;
  trayMattressCount: number;
  trayTeapotCount: number;
  runSnapshot?: RunSnapshot;
}

export function createInitialGameState(
  inventory: Readonly<InventoryDefinition>,
  timeLimitSeconds?: number,
  ballTransforms: Readonly<Record<string, BallTransform>> = {},
): GameState {
  const normalizedInventory = createEmptyInventory(inventory);
  const normalizedBallTransforms = Object.fromEntries(
    Object.entries(ballTransforms).map(([id, transform]) => [
      id,
      { position: { ...transform.position } },
    ]),
  );
  return {
    initialInventory: { ...normalizedInventory },
    initialBallTransforms: { ...normalizedBallTransforms },
    mode: "edit",
    succeeded: false,
    ...(timeLimitSeconds === undefined
      ? {}
      : {
          timeLimitSeconds,
          timeRemainingMs: timeLimitSeconds * 1_000,
        }),
    rampTransforms: {},
    blockTransforms: {},
    ballTransforms: { ...normalizedBallTransforms },
    selectedComponentId: null,
    heldPlacement: null,
    trayBallCount: normalizedInventory.ball,
    trayBirdCount: normalizedInventory.bird,
    trayBlockCount: normalizedInventory.block,
    trayRampCount: normalizedInventory.ramp,
    trayMattressCount: normalizedInventory.mattress,
    trayTeapotCount: normalizedInventory.teapot,
  };
}

function cloneTimerState(
  state: Readonly<GameState>,
): Pick<GameState, "timeLimitSeconds" | "timeRemainingMs"> {
  return state.timeLimitSeconds === undefined
    ? {}
    : {
        timeLimitSeconds: state.timeLimitSeconds,
        timeRemainingMs: state.timeRemainingMs,
      };
}

function resetTimerState(
  state: Readonly<GameState>,
): Pick<GameState, "timeLimitSeconds" | "timeRemainingMs"> {
  return state.timeLimitSeconds === undefined
    ? {}
    : {
        timeLimitSeconds: state.timeLimitSeconds,
        timeRemainingMs: state.timeLimitSeconds * 1_000,
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
    ballTransforms: { ...state.ballTransforms },
    trayBallCount: state.trayBallCount,
    trayBirdCount: state.trayBirdCount,
    trayBlockCount: state.trayBlockCount,
    trayRampCount: state.trayRampCount,
    trayMattressCount: state.trayMattressCount,
    trayTeapotCount: state.trayTeapotCount,
  };
}

function cloneRunSnapshot(
  snapshot: Readonly<RunSnapshot> | undefined,
): RunSnapshot | undefined {
  return (
    snapshot && {
      rampTransforms: { ...snapshot.rampTransforms },
      blockTransforms: { ...snapshot.blockTransforms },
      ballTransforms: { ...snapshot.ballTransforms },
      trayBallCount: snapshot.trayBallCount,
      trayBirdCount: snapshot.trayBirdCount,
      trayBlockCount: snapshot.trayBlockCount,
      trayRampCount: snapshot.trayRampCount,
      trayMattressCount: snapshot.trayMattressCount,
      trayTeapotCount: snapshot.trayTeapotCount,
    }
  );
}

type TrayCountKey =
  | "trayBallCount"
  | "trayBirdCount"
  | "trayBlockCount"
  | "trayRampCount"
  | "trayMattressCount"
  | "trayTeapotCount";

const trayCountKeyByPart: Record<InventoryPartKey, TrayCountKey> = {
  ball: "trayBallCount",
  bird: "trayBirdCount",
  block: "trayBlockCount",
  ramp: "trayRampCount",
  mattress: "trayMattressCount",
  teapot: "trayTeapotCount",
};

function cloneHeldPlacement(placement: Readonly<HeldPlacement>): HeldPlacement {
  return {
    part: placement.part,
    id: placement.id,
    transform: {
      position: { ...placement.transform.position },
      rotation: placement.transform.rotation,
    },
  };
}

export function transitionGameState(
  state: Readonly<GameState>,
  action: GameAction,
): GameState {
  if (action === "reset") {
    return createInitialGameState(
      state.initialInventory,
      state.timeLimitSeconds,
      state.initialBallTransforms,
    );
  }
  if (action === "rerun" && state.mode !== "edit" && state.runSnapshot) {
    return {
      mode: "running",
      succeeded: false,
      ...resetTimerState(state),
      initialInventory: { ...state.initialInventory },
      initialBallTransforms: { ...state.initialBallTransforms },
      rampTransforms: { ...state.runSnapshot.rampTransforms },
      blockTransforms: { ...state.runSnapshot.blockTransforms },
      ballTransforms: { ...state.runSnapshot.ballTransforms },
      selectedComponentId: null,
      heldPlacement: null,
      trayBallCount: state.runSnapshot.trayBallCount,
      trayBirdCount: state.runSnapshot.trayBirdCount,
      trayBlockCount: state.runSnapshot.trayBlockCount,
      trayRampCount: state.runSnapshot.trayRampCount,
      trayMattressCount: state.runSnapshot.trayMattressCount,
      trayTeapotCount: state.runSnapshot.trayTeapotCount,
      runSnapshot: cloneRunSnapshot(state.runSnapshot),
    };
  }
  if (typeof action === "object" && action.type === "advance-time") {
    if (
      action.enforceTimer === false ||
      state.mode !== "running" ||
      state.timeRemainingMs === undefined
    ) {
      return {
        ...state,
        rampTransforms: { ...state.rampTransforms },
        blockTransforms: { ...state.blockTransforms },
      };
    }
    const timeRemainingMs = Math.max(
      0,
      state.timeRemainingMs - Math.max(0, action.deltaMs),
    );
    return {
      ...state,
      mode: timeRemainingMs === 0 ? "failed" : "running",
      timeRemainingMs,
      rampTransforms: { ...state.rampTransforms },
      blockTransforms: { ...state.blockTransforms },
    };
  }
  if (action === "success" && state.mode === "running") {
    return {
      mode: "paused",
      succeeded: true,
      ...cloneTimerState(state),
      initialInventory: { ...state.initialInventory },
      initialBallTransforms: { ...state.initialBallTransforms },
      rampTransforms: { ...state.rampTransforms },
      blockTransforms: { ...state.blockTransforms },
      ballTransforms: { ...state.ballTransforms },
      selectedComponentId: null,
      heldPlacement: null,
      trayBallCount: state.trayBallCount,
      trayBirdCount: state.trayBirdCount,
      trayBlockCount: state.trayBlockCount,
      trayRampCount: state.trayRampCount,
      trayMattressCount: state.trayMattressCount,
      trayTeapotCount: state.trayTeapotCount,
      runSnapshot: cloneRunSnapshot(state.runSnapshot),
    };
  }
  if (state.succeeded || state.mode === "failed") {
    return {
      ...state,
      rampTransforms: { ...state.rampTransforms },
      blockTransforms: { ...state.blockTransforms },
    };
  }
  if (typeof action === "object" && action.type === "begin-held-placement") {
    const trayCountKey = trayCountKeyByPart[action.placement.part];
    return state.mode === "edit" &&
      state.heldPlacement === null &&
      state[trayCountKey] > 0
      ? {
          ...state,
          heldPlacement: cloneHeldPlacement(action.placement),
        }
      : state;
  }
  if (typeof action === "object" && action.type === "update-held-placement") {
    return state.heldPlacement
      ? {
          ...state,
          heldPlacement: {
            ...state.heldPlacement,
            transform: {
              position: { ...action.transform.position },
              rotation: action.transform.rotation,
            },
          },
        }
      : state;
  }
  if (typeof action === "object" && action.type === "cancel-held-placement") {
    return state.heldPlacement ? { ...state, heldPlacement: null } : state;
  }
  if (typeof action === "object" && action.type === "commit-held-placement") {
    if (!state.heldPlacement) {
      return state;
    }
    const trayCountKey = trayCountKeyByPart[state.heldPlacement.part];
    if (state[trayCountKey] <= 0) {
      return state;
    }
    return {
      ...state,
      [trayCountKey]: state[trayCountKey] - 1,
      selectedComponentId: state.heldPlacement.id,
      heldPlacement: null,
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
  if (typeof action === "object" && action.type === "spawn-tray-ball") {
    return state.mode === "edit" && state.trayBallCount > 0
      ? {
          ...state,
          ballTransforms: {
            ...state.ballTransforms,
            [action.componentId]: {
              position: { ...action.transform.position },
            },
          },
          selectedComponentId: action.componentId,
          trayBallCount: state.trayBallCount - 1,
        }
      : { ...state };
  }
  if (typeof action === "object" && action.type === "spawn-tray-bird") {
    return state.mode === "edit" && state.trayBirdCount > 0
      ? {
          ...state,
          selectedComponentId: action.componentId,
          trayBirdCount: state.trayBirdCount - 1,
        }
      : { ...state };
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
  if (typeof action === "object" && action.type === "spawn-tray-mattress") {
    return state.mode === "edit" && state.trayMattressCount > 0
      ? {
          ...state,
          selectedComponentId: action.componentId,
          trayMattressCount: state.trayMattressCount - 1,
        }
      : { ...state };
  }
  if (typeof action === "object" && action.type === "spawn-tray-teapot") {
    return state.mode === "edit" && state.trayTeapotCount > 0
      ? {
          ...state,
          selectedComponentId: action.componentId,
          trayTeapotCount: state.trayTeapotCount - 1,
        }
      : { ...state };
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
    const ballTransforms = Object.fromEntries(
      Object.entries(state.ballTransforms).filter(
        ([componentId]) =>
          action.returnsTrayPart !== "ball" ||
          componentId !== action.componentId,
      ),
    );
    return {
      ...state,
      rampTransforms,
      blockTransforms,
      ballTransforms,
      selectedComponentId: null,
      trayBallCount:
        action.returnsTrayPart === "ball"
          ? state.trayBallCount + 1
          : state.trayBallCount,
      trayBirdCount:
        action.returnsTrayPart === "bird"
          ? state.trayBirdCount + 1
          : state.trayBirdCount,
      trayBlockCount:
        action.returnsTrayPart === "block"
          ? state.trayBlockCount + 1
          : state.trayBlockCount,
      trayRampCount:
        action.returnsTrayPart === "ramp"
          ? state.trayRampCount + 1
          : state.trayRampCount,
      trayMattressCount:
        action.returnsTrayPart === "mattress"
          ? state.trayMattressCount + 1
          : state.trayMattressCount,
      trayTeapotCount:
        action.returnsTrayPart === "teapot"
          ? state.trayTeapotCount + 1
          : state.trayTeapotCount,
    };
  }
  if (action === "deselect" && state.mode === "edit") {
    return { ...state, selectedComponentId: null };
  }
  if (action === "toggle-simulation" && state.mode === "edit") {
    return {
      mode: "running",
      succeeded: false,
      ...resetTimerState(state),
      initialInventory: { ...state.initialInventory },
      initialBallTransforms: { ...state.initialBallTransforms },
      ballTransforms: { ...state.ballTransforms },
      rampTransforms: { ...state.rampTransforms },
      blockTransforms: { ...state.blockTransforms },
      selectedComponentId: null,
      heldPlacement: null,
      trayBallCount: state.trayBallCount,
      trayBirdCount: state.trayBirdCount,
      trayBlockCount: state.trayBlockCount,
      trayRampCount: state.trayRampCount,
      trayMattressCount: state.trayMattressCount,
      trayTeapotCount: state.trayTeapotCount,
      runSnapshot: createRunSnapshot(state),
    };
  }
  if (action === "toggle-simulation" && state.mode === "paused") {
    return {
      mode: "running",
      succeeded: false,
      ...cloneTimerState(state),
      initialInventory: { ...state.initialInventory },
      initialBallTransforms: { ...state.initialBallTransforms },
      ballTransforms: { ...state.ballTransforms },
      rampTransforms: { ...state.rampTransforms },
      blockTransforms: { ...state.blockTransforms },
      selectedComponentId: null,
      heldPlacement: null,
      trayBallCount: state.trayBallCount,
      trayBirdCount: state.trayBirdCount,
      trayBlockCount: state.trayBlockCount,
      trayRampCount: state.trayRampCount,
      trayMattressCount: state.trayMattressCount,
      trayTeapotCount: state.trayTeapotCount,
      runSnapshot: cloneRunSnapshot(state.runSnapshot),
    };
  }
  if (action === "toggle-simulation" && state.mode === "running") {
    return {
      mode: "paused",
      succeeded: false,
      ...cloneTimerState(state),
      initialInventory: { ...state.initialInventory },
      initialBallTransforms: { ...state.initialBallTransforms },
      ballTransforms: { ...state.ballTransforms },
      rampTransforms: { ...state.rampTransforms },
      blockTransforms: { ...state.blockTransforms },
      selectedComponentId: null,
      heldPlacement: null,
      trayBallCount: state.trayBallCount,
      trayBirdCount: state.trayBirdCount,
      trayBlockCount: state.trayBlockCount,
      trayRampCount: state.trayRampCount,
      trayMattressCount: state.trayMattressCount,
      trayTeapotCount: state.trayTeapotCount,
      runSnapshot: cloneRunSnapshot(state.runSnapshot),
    };
  }
  if (action === "edit" && state.mode !== "edit") {
    return {
      mode: "edit",
      succeeded: false,
      ...cloneTimerState(state),
      initialInventory: { ...state.initialInventory },
      initialBallTransforms: { ...state.initialBallTransforms },
      ballTransforms: { ...state.ballTransforms },
      rampTransforms: { ...state.rampTransforms },
      blockTransforms: { ...state.blockTransforms },
      selectedComponentId: null,
      heldPlacement: null,
      trayBallCount: state.trayBallCount,
      trayBirdCount: state.trayBirdCount,
      trayBlockCount: state.trayBlockCount,
      trayRampCount: state.trayRampCount,
      trayMattressCount: state.trayMattressCount,
      trayTeapotCount: state.trayTeapotCount,
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

export function updateBallTransform(
  state: Readonly<GameState>,
  ballId: string,
  transform: Readonly<BallTransform>,
): GameState {
  if (
    state.mode !== "edit" ||
    state.succeeded ||
    state.selectedComponentId !== ballId ||
    state.ballTransforms[ballId] === undefined
  ) {
    return { ...state };
  }
  return {
    ...state,
    ballTransforms: {
      ...state.ballTransforms,
      [ballId]: { position: { ...transform.position } },
    },
  };
}

export function getEnabledControls(
  state: Readonly<GameState>,
): EnabledControls {
  if (state.succeeded || state.mode === "failed") {
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

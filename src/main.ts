import Phaser from "phaser";
import "./style.css";
import { PrototypeScene } from "./game/PrototypeScene";
import {
  builtInPuzzles,
  getBuiltInPuzzle,
  getBuiltInPuzzlePosition,
} from "./levels/puzzleCatalog";
import { PLAYABLE_HEIGHT, PLAYABLE_WIDTH } from "./game/rampPlacement";
import {
  canSelectPuzzle,
  completePuzzle,
  createPuzzleRuntime,
  getNextUnlockedPuzzle,
  getPuzzleProgress,
  loadProgression,
  saveProgression,
  setUnlockAll,
  switchPuzzle,
  type ProgressionState,
  type PuzzleRuntime,
  type StorageAdapter,
} from "./state/progression";
import {
  transitionGameState,
  type GameAction,
  type GameState,
  updateBallTransform,
  updateBlockTransform,
  updateRampTransform,
} from "./state/gameState";
import { Controls, type PlayScreenView } from "./ui/Controls";

function getLocalStorage(): StorageAdapter | undefined {
  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
}

const storage = getLocalStorage();
let progression: ProgressionState = loadProgression(storage, builtInPuzzles);
let activePuzzle = builtInPuzzles[0]!;
let runtime: PuzzleRuntime = createPuzzleRuntime(activePuzzle);
let state: GameState = runtime.gameState;
let game: Phaser.Game | undefined;
let scene: PrototypeScene | undefined;

declare global {
  interface Window {
    __contraptionLabTest?: {
      getPrototypeScene: () => PrototypeScene | undefined;
    };
  }
}

if (import.meta.env.DEV) {
  window.__contraptionLabTest = {
    getPrototypeScene: () => scene,
  };
}

const controls = new Controls(
  handleAction,
  selectPuzzle,
  updateUnlockAll,
  loadNextPuzzle,
);

function getPlayScreenView(): PlayScreenView {
  return {
    activePuzzle,
    levelNumber: getBuiltInPuzzlePosition(activePuzzle.id) ?? 1,
    nextPuzzle: getNextUnlockedPuzzle(
      activePuzzle.id,
      builtInPuzzles,
      progression,
    ),
    puzzleProgress: getPuzzleProgress(builtInPuzzles, progression),
    totalBuiltInPuzzles: builtInPuzzles.length,
    unlockAll: progression.unlockAll,
  };
}

function replaceGameState(nextState: GameState): void {
  state = nextState;
  runtime = { ...runtime, gameState: state };
}

function applyState(): void {
  controls.render(state, getPlayScreenView());
  scene?.setSimulationRunning(state.mode === "running" && !state.succeeded);
  scene?.setEditSelection(
    state.mode === "edit" && !state.succeeded,
    state.selectedComponentId,
  );
  scene?.setRampTransforms(state.rampTransforms);
  scene?.setBlockTransforms(state.blockTransforms);
}

function handleAction(action: GameAction): void {
  if (typeof action === "object" && action.type === "spawn-tray-block") {
    const componentId = scene?.spawnTrayBlock(state.trayBlockCount);
    if (!componentId) return;
    action = { ...action, componentId };
  }
  if (typeof action === "object" && action.type === "spawn-tray-ramp") {
    const componentId = scene?.spawnTrayRamp(state.trayRampCount);
    if (!componentId) return;
    action = { ...action, componentId };
  }
  if (typeof action === "object" && action.type === "spawn-tray-ball") {
    const ball = scene?.spawnTrayBall(state.trayBallCount);
    if (!ball) return;
    action = { ...action, componentId: ball.id, transform: ball.transform };
  }
  if (typeof action === "object" && action.type === "spawn-tray-bird") {
    const componentId = scene?.spawnTrayBird(state.trayBirdCount);
    if (!componentId) return;
    action = { ...action, componentId };
  }
  if (typeof action === "object" && action.type === "advance-time") {
    const previousMode = state.mode;
    replaceGameState(transitionGameState(state, action));
    if (state.mode !== previousMode) applyState();
    else controls.renderTimer(state);
    return;
  }
  if (action === "toggle-simulation" && state.mode === "edit") {
    scene?.captureRunLayout();
  }
  if (action === "rerun" && !scene?.rerunFromSnapshot()) {
    return;
  }
  const didSucceed = action === "success" && !state.succeeded;
  replaceGameState(transitionGameState(state, action));
  if (didSucceed && state.succeeded) {
    progression = completePuzzle(progression, activePuzzle.id, builtInPuzzles);
    saveProgression(storage, progression);
  }
  if (action === "reset") {
    scene?.resetLevel();
    controls.setEditFeedback("");
  }
  applyState();
}

function selectPuzzle(puzzleId: string): void {
  if (puzzleId === activePuzzle.id) return;
  if (!canSelectPuzzle(puzzleId, builtInPuzzles, progression)) return;
  const nextRuntime = switchPuzzle(
    runtime,
    puzzleId,
    builtInPuzzles,
    progression,
  );
  const nextPuzzle = getBuiltInPuzzle(nextRuntime.puzzleId);
  if (!nextPuzzle) return;
  activePuzzle = nextPuzzle;
  runtime = nextRuntime;
  state = runtime.gameState;
  controls.setEditFeedback("");
  controls.render(state, getPlayScreenView());
  game?.destroy(true);
  scene = undefined;
  createGame();
}

function updateUnlockAll(unlockAll: boolean): void {
  progression = setUnlockAll(progression, unlockAll);
  saveProgression(storage, progression);
  controls.render(state, getPlayScreenView());
}

function loadNextPuzzle(): void {
  const nextPuzzle = getNextUnlockedPuzzle(
    activePuzzle.id,
    builtInPuzzles,
    progression,
  );
  if (nextPuzzle) selectPuzzle(nextPuzzle.id);
}

function createGame(): void {
  scene = new PrototypeScene(
    activePuzzle,
    () => handleAction("success"),
    (deltaMs) => handleAction({ type: "advance-time", deltaMs }),
    (componentId) =>
      handleAction(
        componentId ? { type: "select-component", componentId } : "deselect",
      ),
    (rampId, transform) => {
      replaceGameState(updateRampTransform(state, rampId, transform));
      applyState();
    },
    (blockId, transform) => {
      replaceGameState(updateBlockTransform(state, blockId, transform));
      applyState();
    },
    (ballId, transform) => {
      replaceGameState(updateBallTransform(state, ballId, transform));
      applyState();
    },
    (componentId, returnsTrayPart) =>
      handleAction({
        type: "remove-component",
        componentId,
        returnsTrayPart,
      }),
    (message) => controls.setEditFeedback(message),
  );

  game = new Phaser.Game({
    type: Phaser.AUTO,
    parent: "game-container",
    width: PLAYABLE_WIDTH,
    height: PLAYABLE_HEIGHT,
    backgroundColor: "#f7f4ed",
    physics: {
      default: "matter",
      matter: {
        gravity: activePuzzle.gravity,
        debug: false,
      },
    },
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    scene,
    callbacks: {
      postBoot: applyState,
    },
  });
}

createGame();
controls.render(state, getPlayScreenView());

import Phaser from "phaser";
import "./style.css";
import rawLevel from "./levels/prototype.json";
import { PrototypeScene } from "./game/PrototypeScene";
import { PLAYABLE_HEIGHT, PLAYABLE_WIDTH } from "./game/rampPlacement";
import { loadLevel } from "./levels/loadLevel";
import {
  createInitialGameState,
  transitionGameState,
  type GameAction,
  type GameState,
  updateBlockTransform,
  updateRampTransform,
} from "./state/gameState";
import { Controls } from "./ui/Controls";

const level = loadLevel(rawLevel);
let state: GameState = createInitialGameState(
  level.inventory,
  level.timeLimitSeconds,
);

const controls = new Controls(handleAction);

function applyState(): void {
  controls.render(state);
  scene.setSimulationRunning(state.mode === "running" && !state.succeeded);
  scene.setEditSelection(
    state.mode === "edit" && !state.succeeded,
    state.selectedComponentId,
  );
  scene.setRampTransforms(state.rampTransforms);
  scene.setBlockTransforms(state.blockTransforms);
}

function handleAction(action: GameAction): void {
  if (typeof action === "object" && action.type === "spawn-tray-block") {
    const componentId = scene.spawnTrayBlock(state.trayBlockCount);
    if (!componentId) return;
    action = { ...action, componentId };
  }
  if (typeof action === "object" && action.type === "spawn-tray-ramp") {
    const componentId = scene.spawnTrayRamp(state.trayRampCount);
    if (!componentId) return;
    action = { ...action, componentId };
  }
  if (typeof action === "object" && action.type === "advance-time") {
    const previousMode = state.mode;
    state = transitionGameState(state, action);
    if (state.mode !== previousMode) applyState();
    else controls.render(state);
    return;
  }
  if (action === "toggle-simulation" && state.mode === "edit") {
    scene.captureRunLayout();
  }
  if (action === "rerun" && !scene.rerunFromSnapshot()) {
    return;
  }
  const nextState = transitionGameState(state, action);
  if (action === "reset") scene.resetLevel();
  state = nextState;
  applyState();
}

const scene = new PrototypeScene(
  level,
  () => handleAction("success"),
  (deltaMs) => handleAction({ type: "advance-time", deltaMs }),
  (componentId) =>
    handleAction(
      componentId ? { type: "select-component", componentId } : "deselect",
    ),
  (rampId, transform) => {
    state = updateRampTransform(state, rampId, transform);
    applyState();
  },
  (blockId, transform) => {
    state = updateBlockTransform(state, blockId, transform);
    applyState();
  },
  (componentId, returnsTrayPart) =>
    handleAction({
      type: "remove-component",
      componentId,
      returnsTrayPart,
    }),
);

new Phaser.Game({
  type: Phaser.AUTO,
  parent: "game-container",
  width: PLAYABLE_WIDTH,
  height: PLAYABLE_HEIGHT,
  backgroundColor: "#c7cec6",
  physics: {
    default: "matter",
    matter: {
      gravity: level.gravity,
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

controls.render(state);

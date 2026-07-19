import Phaser from "phaser";
import "./style.css";
import rawLevel from "./levels/prototype.json";
import { PrototypeScene } from "./game/PrototypeScene";
import { loadLevel } from "./levels/loadLevel";
import {
  INITIAL_GAME_STATE,
  transitionGameState,
  type GameAction,
  type GameState,
} from "./state/gameState";
import { Controls } from "./ui/Controls";

const level = loadLevel(rawLevel);
let state: GameState = { ...INITIAL_GAME_STATE };

const controls = new Controls(handleAction);

function applyState(): void {
  controls.render(state);
  scene.setSimulationRunning(state.mode === "running" && !state.succeeded);
}

function handleAction(action: GameAction): void {
  const nextState = transitionGameState(state, action);
  if (action === "reset") scene.resetLevel();
  state = nextState;
  applyState();
}

const scene = new PrototypeScene(level, () => handleAction("success"));

new Phaser.Game({
  type: Phaser.AUTO,
  parent: "game-container",
  width: 960,
  height: 540,
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

export type GameMode = "edit" | "running" | "paused";
export type SelectableComponent = "ramp";
export type GameAction =
  "edit" | "run" | "pause" | "reset" | "success" | "select-ramp" | "deselect";

export interface GameState {
  mode: GameMode;
  succeeded: boolean;
  selectedComponent: SelectableComponent | null;
}

export const INITIAL_GAME_STATE: Readonly<GameState> = Object.freeze({
  mode: "edit",
  succeeded: false,
  selectedComponent: null,
});

export interface EnabledControls {
  edit: boolean;
  run: boolean;
  pause: boolean;
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
    return { mode: "paused", succeeded: true, selectedComponent: null };
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
  if (action === "run" && state.mode !== "running") {
    return { mode: "running", succeeded: false, selectedComponent: null };
  }
  if (action === "pause" && state.mode === "running") {
    return { mode: "paused", succeeded: false, selectedComponent: null };
  }
  if (action === "edit" && state.mode !== "edit") {
    return { mode: "edit", succeeded: false, selectedComponent: null };
  }
  return { ...state };
}

export function getEnabledControls(
  state: Readonly<GameState>,
): EnabledControls {
  if (state.succeeded) {
    return { edit: false, run: false, pause: false, reset: true };
  }
  return {
    edit: state.mode !== "edit",
    run: state.mode !== "running",
    pause: state.mode === "running",
    reset: true,
  };
}

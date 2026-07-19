export type GameMode = "edit" | "running" | "paused";
export type GameAction = "edit" | "run" | "pause" | "reset" | "success";

export interface GameState {
  mode: GameMode;
  succeeded: boolean;
}

export const INITIAL_GAME_STATE: Readonly<GameState> = Object.freeze({
  mode: "edit",
  succeeded: false,
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
    return { mode: "paused", succeeded: true };
  }
  if (state.succeeded) {
    return { ...state };
  }
  if (action === "run" && state.mode !== "running") {
    return { mode: "running", succeeded: false };
  }
  if (action === "pause" && state.mode === "running") {
    return { mode: "paused", succeeded: false };
  }
  if (action === "edit" && state.mode !== "edit") {
    return { mode: "edit", succeeded: false };
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

import {
  transitionGameState,
  type GameAction,
  type GameState,
} from "./state/gameState";

export function routeHeldPlacementAction(
  state: Readonly<GameState>,
  action: GameAction,
  replaceGameState: (nextState: GameState) => void,
  applyState: () => void,
): boolean {
  if (typeof action !== "object" || action.type !== "begin-held-placement") {
    return false;
  }

  replaceGameState(transitionGameState(state, action));
  applyState();
  return true;
}

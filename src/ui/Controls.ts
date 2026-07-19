import type {
  EnabledControls,
  GameAction,
  GameState,
} from "../state/gameState";
import { getEnabledControls } from "../state/gameState";

const requireElement = <T extends HTMLElement>(id: string): T => {
  const element = document.querySelector<T>(`#${id}`);
  if (!element) throw new Error(`Missing required UI element: #${id}`);
  return element;
};

export class Controls {
  private readonly buttons: Record<keyof EnabledControls, HTMLButtonElement>;
  private readonly modeLabel =
    requireElement<HTMLParagraphElement>("mode-label");

  constructor(onAction: (action: GameAction) => void) {
    this.buttons = {
      edit: requireElement("edit-button"),
      run: requireElement("run-button"),
      pause: requireElement("pause-button"),
      reset: requireElement("reset-button"),
    };

    for (const [action, button] of Object.entries(this.buttons)) {
      button.addEventListener("click", () => onAction(action as GameAction));
    }
  }

  render(state: Readonly<GameState>): void {
    const enabled = getEnabledControls(state);
    for (const key of Object.keys(this.buttons) as (keyof EnabledControls)[]) {
      this.buttons[key].disabled = !enabled[key];
    }
    const label = state.succeeded
      ? "Success"
      : state.mode.charAt(0).toUpperCase() + state.mode.slice(1);
    this.modeLabel.textContent = `Mode: ${label}`;
  }
}

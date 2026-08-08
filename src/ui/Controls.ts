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
  private readonly trayBlockButton =
    requireElement<HTMLButtonElement>("tray-block-button");
  private readonly trayRampButton =
    requireElement<HTMLButtonElement>("tray-ramp-button");
  private readonly rerunButton =
    requireElement<HTMLButtonElement>("rerun-button");

  constructor(onAction: (action: GameAction) => void) {
    this.buttons = {
      edit: requireElement("edit-button"),
      simulation: requireElement("simulation-button"),
      reset: requireElement("reset-button"),
    };

    this.buttons.edit.addEventListener("click", () => onAction("edit"));
    this.buttons.simulation.addEventListener("click", () =>
      onAction("toggle-simulation"),
    );
    this.buttons.reset.addEventListener("click", () => onAction("reset"));
    this.rerunButton.addEventListener("click", () => onAction("rerun"));
    this.trayBlockButton.addEventListener("click", () =>
      onAction({ type: "spawn-tray-block", componentId: "" }),
    );
    this.trayRampButton.addEventListener("click", () =>
      onAction({ type: "spawn-tray-ramp", componentId: "" }),
    );
  }

  render(state: Readonly<GameState>): void {
    const enabled = getEnabledControls(state);
    for (const key of Object.keys(this.buttons) as (keyof EnabledControls)[]) {
      this.buttons[key].disabled = !enabled[key];
    }
    this.buttons.simulation.textContent =
      state.mode === "running" ? "Pause" : "Run";
    this.trayBlockButton.disabled =
      state.mode !== "edit" || state.succeeded || state.trayBlockCount === 0;
    this.trayBlockButton.textContent = `Block (${state.trayBlockCount})`;
    this.trayRampButton.disabled =
      state.mode !== "edit" || state.succeeded || state.trayRampCount === 0;
    this.trayRampButton.textContent = `Ramp (${state.trayRampCount})`;
    this.rerunButton.disabled = state.mode === "edit" || !state.runSnapshot;
    const label = state.succeeded
      ? "Success"
      : state.mode.charAt(0).toUpperCase() + state.mode.slice(1);
    this.modeLabel.textContent = `Mode: ${label}`;
  }
}

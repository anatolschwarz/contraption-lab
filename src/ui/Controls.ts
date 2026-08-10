import type { LevelDefinition, PuzzleDifficulty } from "../levels/levelTypes";
import type { PuzzleProgress } from "../state/progression";
import type {
  EnabledControls,
  GameAction,
  GameState,
} from "../state/gameState";
import { getEnabledControls } from "../state/gameState";

const difficultyGroups: PuzzleDifficulty[] = ["Basic", "Medium", "Hard"];

const requireElement = <T extends HTMLElement>(id: string): T => {
  const element = document.querySelector<T>(`#${id}`);
  if (!element) throw new Error(`Missing required UI element: #${id}`);
  return element;
};

export interface PlayScreenView {
  activePuzzle: LevelDefinition;
  levelNumber: number;
  nextPuzzle?: LevelDefinition;
  puzzleProgress: readonly PuzzleProgress[];
  totalBuiltInPuzzles: number;
  unlockAll: boolean;
}

export class Controls {
  private readonly buttons: Record<keyof EnabledControls, HTMLButtonElement>;
  private readonly modeLabel =
    requireElement<HTMLParagraphElement>("mode-label");
  private readonly levelProgressLabel = requireElement<HTMLParagraphElement>(
    "level-progress-label",
  );
  private readonly puzzleTitleLabel =
    requireElement<HTMLParagraphElement>("puzzle-title-label");
  private readonly timedIndicator =
    requireElement<HTMLSpanElement>("timed-indicator");
  private readonly nextPuzzleButton =
    requireElement<HTMLButtonElement>("next-puzzle-button");
  private readonly puzzleSelectorButton = requireElement<HTMLButtonElement>(
    "puzzle-selector-button",
  );
  private readonly puzzleSelectorList = requireElement<HTMLDivElement>(
    "puzzle-selector-list",
  );
  private readonly puzzleSelectorPanel = requireElement<HTMLDivElement>(
    "puzzle-selector-panel",
  );
  private readonly settingsButton =
    requireElement<HTMLButtonElement>("settings-button");
  private readonly settingsPanel =
    requireElement<HTMLDivElement>("settings-panel");
  private readonly timerLabel =
    requireElement<HTMLParagraphElement>("timer-label");
  private readonly editFeedback =
    requireElement<HTMLParagraphElement>("edit-feedback");
  private readonly trayBlockButton =
    requireElement<HTMLButtonElement>("tray-block-button");
  private readonly trayBallButton =
    requireElement<HTMLButtonElement>("tray-ball-button");
  private readonly trayRampButton =
    requireElement<HTMLButtonElement>("tray-ramp-button");
  private readonly partsPalette = requireElement<HTMLElement>("parts-palette");
  private readonly partsPaletteToggle = requireElement<HTMLButtonElement>(
    "parts-palette-toggle",
  );
  private readonly playArea = requireElement<HTMLElement>("play-area");
  private readonly rerunButton =
    requireElement<HTMLButtonElement>("rerun-button");
  private readonly unlockAllCheckbox = requireElement<HTMLInputElement>(
    "unlock-all-checkbox",
  );
  private puzzleViewKey?: string;

  constructor(
    onAction: (action: GameAction) => void,
    private readonly onPuzzleSelect: (puzzleId: string) => void,
    private readonly onSetUnlockAll: (unlockAll: boolean) => void,
    private readonly onNextPuzzle: () => void,
  ) {
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
    this.trayBallButton.addEventListener("click", () =>
      onAction({
        type: "spawn-tray-ball",
        componentId: "",
        transform: { position: { x: 0, y: 0 } },
      }),
    );
    this.trayRampButton.addEventListener("click", () =>
      onAction({ type: "spawn-tray-ramp", componentId: "" }),
    );
    this.partsPaletteToggle.addEventListener("click", () => {
      this.setPartsPaletteCollapsed(!this.partsPalette.hidden);
    });
    this.puzzleSelectorButton.addEventListener("click", () => {
      this.puzzleSelectorPanel.hidden = !this.puzzleSelectorPanel.hidden;
    });
    this.settingsButton.addEventListener("click", () => {
      this.settingsPanel.hidden = !this.settingsPanel.hidden;
    });
    this.unlockAllCheckbox.addEventListener("change", () =>
      this.onSetUnlockAll(this.unlockAllCheckbox.checked),
    );
    this.nextPuzzleButton.addEventListener("click", () => this.onNextPuzzle());
  }

  render(state: Readonly<GameState>, view: Readonly<PlayScreenView>): void {
    const enabled = getEnabledControls(state);
    for (const key of Object.keys(this.buttons) as (keyof EnabledControls)[]) {
      this.buttons[key].disabled = !enabled[key];
    }
    this.buttons.simulation.textContent =
      state.mode === "running" ? "Pause" : "Run";
    this.trayBlockButton.disabled =
      state.mode !== "edit" || state.succeeded || state.trayBlockCount === 0;
    this.trayBlockButton.textContent = `Block (${state.trayBlockCount})`;
    this.trayBallButton.disabled =
      state.mode !== "edit" || state.succeeded || state.trayBallCount === 0;
    this.trayBallButton.textContent = `Ball (${state.trayBallCount})`;
    this.trayRampButton.disabled =
      state.mode !== "edit" || state.succeeded || state.trayRampCount === 0;
    this.trayRampButton.textContent = `Ramp (${state.trayRampCount})`;
    this.partsPaletteToggle.disabled = state.mode !== "edit" || state.succeeded;
    this.rerunButton.disabled = state.mode === "edit" || !state.runSnapshot;
    this.renderTimer(state);
    const label = state.succeeded
      ? "Success"
      : state.mode === "failed"
        ? "Failed — Time expired"
        : state.mode.charAt(0).toUpperCase() + state.mode.slice(1);
    this.modeLabel.textContent = `Mode: ${label}`;
    this.levelProgressLabel.textContent = `Level ${view.levelNumber} of ${view.totalBuiltInPuzzles} — ${view.activePuzzle.difficulty}`;
    this.puzzleTitleLabel.textContent = view.activePuzzle.title;
    this.timedIndicator.hidden =
      view.activePuzzle.timeLimitSeconds === undefined;
    this.nextPuzzleButton.hidden = !state.succeeded;
    this.nextPuzzleButton.disabled = !state.succeeded || !view.nextPuzzle;
    this.nextPuzzleButton.textContent = view.nextPuzzle
      ? `Next Puzzle: ${view.nextPuzzle.title}`
      : "Last Puzzle Complete";
    this.puzzleSelectorButton.textContent = `Puzzle: ${view.activePuzzle.title}`;
    this.unlockAllCheckbox.checked = view.unlockAll;
    this.renderPuzzleSelector(view);
  }

  renderTimer(state: Readonly<GameState>): void {
    if (state.timeRemainingMs === undefined) {
      this.timerLabel.hidden = true;
      return;
    }
    this.timerLabel.hidden = false;
    const label = `Time: ${formatTimeRemaining(state.timeRemainingMs)}`;
    if (this.timerLabel.textContent !== label)
      this.timerLabel.textContent = label;
  }

  setEditFeedback(message: string): void {
    this.editFeedback.textContent = message;
    this.editFeedback.hidden = message.length === 0;
  }

  private setPartsPaletteCollapsed(collapsed: boolean): void {
    this.playArea.classList.toggle("play-area--palette-collapsed", collapsed);
    this.partsPalette.hidden = collapsed;
    this.partsPaletteToggle.setAttribute("aria-expanded", String(!collapsed));
    this.partsPaletteToggle.textContent = collapsed ? "Parts" : "Close";
  }

  private renderPuzzleSelector(view: Readonly<PlayScreenView>): void {
    const viewKey = JSON.stringify({
      activePuzzleId: view.activePuzzle.id,
      puzzleProgress: view.puzzleProgress.map(({ availability, puzzle }) => [
        puzzle.id,
        availability,
      ]),
      unlockAll: view.unlockAll,
    });
    if (viewKey === this.puzzleViewKey) return;
    this.puzzleViewKey = viewKey;
    const fragment = document.createDocumentFragment();
    for (const difficulty of difficultyGroups) {
      const puzzles = view.puzzleProgress.filter(
        ({ puzzle }) => puzzle.difficulty === difficulty,
      );
      if (puzzles.length === 0) continue;
      const group = document.createElement("section");
      group.className = "puzzle-selector-group";
      const heading = document.createElement("h2");
      heading.textContent = difficulty;
      group.append(heading);
      for (const { availability, puzzle } of puzzles) {
        const puzzleButton = document.createElement("button");
        puzzleButton.type = "button";
        puzzleButton.className = `puzzle-option puzzle-option--${availability}`;
        puzzleButton.disabled = availability === "locked";
        puzzleButton.dataset.puzzleId = puzzle.id;
        puzzleButton.dataset.puzzleState = availability;
        puzzleButton.dataset.timed = String(
          puzzle.timeLimitSeconds !== undefined,
        );
        puzzleButton.setAttribute(
          "aria-current",
          String(puzzle.id === view.activePuzzle.id),
        );
        const timed = puzzle.timeLimitSeconds ? "Timed" : "Untimed";
        puzzleButton.textContent = `${puzzle.title} — ${availability} · ${timed}`;
        puzzleButton.addEventListener("click", () => {
          this.puzzleSelectorPanel.hidden = true;
          this.onPuzzleSelect(puzzle.id);
        });
        group.append(puzzleButton);
      }
      fragment.append(group);
    }
    this.puzzleSelectorList.replaceChildren(fragment);
  }
}

function formatTimeRemaining(timeRemainingMs: number): string {
  const totalSeconds = Math.ceil(timeRemainingMs / 1_000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

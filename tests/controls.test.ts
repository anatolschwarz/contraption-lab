import { afterEach, describe, expect, it } from "vitest";
import {
  transitionGameState,
  createInitialGameState,
} from "../src/state/gameState";
import { Controls } from "../src/ui/Controls";

const controlIds = [
  "edit-button",
  "simulation-button",
  "reset-button",
  "mode-label",
  "level-progress-label",
  "puzzle-title-label",
  "puzzle-difficulty-label",
  "next-puzzle-button",
  "puzzle-selector-button",
  "puzzle-selector-list",
  "puzzle-selector-panel",
  "settings-button",
  "settings-panel",
  "timer-label",
  "edit-feedback",
  "tray-block-button",
  "tray-block-label",
  "tray-ball-button",
  "tray-ball-label",
  "tray-bird-button",
  "tray-bird-label",
  "tray-ramp-button",
  "tray-ramp-label",
  "tray-mattress-button",
  "tray-mattress-label",
  "tray-teapot-button",
  "tray-teapot-label",
  "parts-palette",
  "parts-palette-toggle",
  "play-area",
  "rerun-button",
  "unlock-all-checkbox",
  "puzzle-locking-checkbox",
  "timer-failure-checkbox",
] as const;

class FakeElement {
  private readonly listeners = new Map<string, () => void>();

  addEventListener(type: string, listener: () => void): void {
    this.listeners.set(type, listener);
  }

  click(): void {
    this.listeners.get("click")?.();
  }
}

const originalDocument = globalThis.document;

afterEach(() => {
  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: originalDocument,
  });
});

function createControls(): {
  actions: Parameters<ConstructorParameters<typeof Controls>[0]>[0][];
  elements: Map<string, FakeElement>;
} {
  const elements = new Map<string, FakeElement>(
    controlIds.map((id) => [id, new FakeElement()] as const),
  );
  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: {
      querySelector: <T extends HTMLElement>(selector: string): T | null =>
        (elements.get(selector.slice(1)) as T | undefined) ?? null,
    },
  });
  const actions: Parameters<ConstructorParameters<typeof Controls>[0]>[0][] =
    [];
  new Controls(
    (action) => actions.push(action),
    () => undefined,
    () => undefined,
    () => undefined,
    () => undefined,
  );
  return { actions, elements };
}

describe("Parts inventory controls", () => {
  it("dispatches begin-held-placement without invoking a normal spawn action", () => {
    const { actions, elements } = createControls();

    elements.get("tray-ramp-button")?.click();

    expect(actions).toEqual([
      {
        type: "begin-held-placement",
        placement: {
          part: "ramp",
          id: "held-ramp-1",
          transform: { position: { x: 0, y: 0 }, rotation: 0 },
        },
      },
    ]);
    expect(
      actions.some(
        (action) =>
          typeof action === "object" && action.type.startsWith("spawn-tray-"),
      ),
    ).toBe(false);
  });

  it("uses held placement for every placeable inventory part", () => {
    const { actions, elements } = createControls();

    for (const part of [
      "block",
      "ball",
      "bird",
      "ramp",
      "mattress",
      "teapot",
    ]) {
      elements.get(`tray-${part}-button`)?.click();
    }

    expect(actions).toEqual(
      ["block", "ball", "bird", "ramp", "mattress", "teapot"].map(
        (part, index) => ({
          type: "begin-held-placement",
          placement: {
            part,
            id: `held-${part}-${index + 1}`,
            transform: { position: { x: 0, y: 0 }, rotation: 0 },
          },
        }),
      ),
    );
  });

  it("preserves inventory when an inventory click starts held placement", () => {
    const { actions, elements } = createControls();
    const initial = createInitialGameState({ ramp: 1 });

    elements.get("tray-ramp-button")?.click();

    const next = transitionGameState(initial, actions[0]!);
    expect(next.trayRampCount).toBe(1);
    expect(next.heldPlacement?.part).toBe("ramp");
  });

  it("leaves unrelated gameplay controls on their existing actions", () => {
    const { actions, elements } = createControls();

    elements.get("simulation-button")?.click();

    expect(actions).toEqual(["toggle-simulation"]);
  });
});

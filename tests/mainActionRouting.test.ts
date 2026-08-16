import { describe, expect, it, vi } from "vitest";
import { routeHeldPlacementAction } from "../src/mainActionRouting";
import { createInitialGameState } from "../src/state/gameState";

describe("main held-placement routing", () => {
  it("transitions held placement and returns before the spawn-tray path", () => {
    const initial = createInitialGameState({ ramp: 1 });
    const replaceGameState = vi.fn();
    const applyState = vi.fn();
    const scene = {
      spawnTrayBall: vi.fn(),
      spawnTrayBird: vi.fn(),
      spawnTrayBlock: vi.fn(),
      spawnTrayRamp: vi.fn(),
      spawnTrayMattress: vi.fn(),
      spawnTrayTeapot: vi.fn(),
    };
    const handled = routeHeldPlacementAction(
      initial,
      {
        type: "begin-held-placement",
        placement: {
          part: "ramp",
          id: "held-ramp-1",
          transform: { position: { x: 0, y: 0 }, rotation: 0 },
        },
      },
      replaceGameState,
      applyState,
    );

    if (!handled) {
      scene.spawnTrayBall();
      scene.spawnTrayBird();
      scene.spawnTrayBlock();
      scene.spawnTrayRamp();
      scene.spawnTrayMattress();
      scene.spawnTrayTeapot();
    }

    expect(handled).toBe(true);
    expect(replaceGameState).toHaveBeenCalledOnce();
    expect(replaceGameState).toHaveBeenCalledWith({
      ...initial,
      heldPlacement: {
        part: "ramp",
        id: "held-ramp-1",
        transform: { position: { x: 0, y: 0 }, rotation: 0 },
      },
    });
    expect(replaceGameState.mock.calls[0]?.[0].trayRampCount).toBe(1);
    expect(applyState).toHaveBeenCalledOnce();
    expect(scene.spawnTrayBall).not.toHaveBeenCalled();
    expect(scene.spawnTrayBird).not.toHaveBeenCalled();
    expect(scene.spawnTrayBlock).not.toHaveBeenCalled();
    expect(scene.spawnTrayRamp).not.toHaveBeenCalled();
    expect(scene.spawnTrayMattress).not.toHaveBeenCalled();
    expect(scene.spawnTrayTeapot).not.toHaveBeenCalled();
  });
});

import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

const mainTest = vi.hoisted(() => ({
  controls: {
    render: vi.fn(),
    renderTimer: vi.fn(),
    setEditFeedback: vi.fn(),
  },
  onAction: undefined as ((action: unknown) => void) | undefined,
  scene: {
    captureRunLayout: vi.fn(),
    rerunFromSnapshot: vi.fn(),
    resetLevel: vi.fn(),
    setBlockTransforms: vi.fn(),
    setEditSelection: vi.fn(),
    setHeldPlacement: vi.fn(),
    setRampTransforms: vi.fn(),
    setSimulationRunning: vi.fn(),
    spawnTrayBall: vi.fn(),
    spawnTrayBird: vi.fn(),
    spawnTrayBlock: vi.fn(),
    spawnTrayMattress: vi.fn(),
    spawnTrayRamp: vi.fn(),
    spawnTrayTeapot: vi.fn(),
  },
}));

vi.mock("phaser", () => ({
  default: {
    AUTO: "AUTO",
    Game: class {},
    Scale: { CENTER_BOTH: "CENTER_BOTH", FIT: "FIT" },
  },
}));

vi.mock("../src/game/PrototypeScene", () => ({
  PrototypeScene: class {
    constructor() {
      return mainTest.scene;
    }
  },
}));

vi.mock("../src/ui/Controls", () => ({
  Controls: class {
    constructor(onAction: (action: unknown) => void) {
      mainTest.onAction = onAction;
    }

    render = mainTest.controls.render;
    renderTimer = mainTest.controls.renderTimer;
    setEditFeedback = mainTest.controls.setEditFeedback;
  },
}));

const originalWindow = globalThis.window;

beforeAll(async () => {
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: {
      get localStorage(): never {
        throw new Error("Local storage is unavailable in this test.");
      },
      location: { search: "" },
    },
  });
  await import("../src/main");
});

afterAll(() => {
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: originalWindow,
  });
});

describe("main.ts held-placement routing", () => {
  it("returns before every spawn-tray branch after one state transition", () => {
    for (const spy of Object.values(mainTest.scene)) {
      spy.mockClear();
    }
    mainTest.controls.render.mockClear();

    mainTest.onAction?.({
      type: "begin-held-placement",
      placement: {
        part: "ramp",
        id: "held-ramp-main-test",
        transform: { position: { x: 0, y: 0 }, rotation: 0 },
      },
    });

    const renderedState = mainTest.controls.render.mock.calls[0]?.[0];
    expect(mainTest.controls.render).toHaveBeenCalledOnce();
    expect(renderedState).toMatchObject({
      heldPlacement: {
        part: "ramp",
        id: "held-ramp-main-test",
      },
      trayRampCount: 4,
    });
    expect(mainTest.scene.setHeldPlacement).toHaveBeenCalledWith({
      part: "ramp",
      id: "held-ramp-main-test",
      transform: { position: { x: 0, y: 0 }, rotation: 0 },
    });
    expect(mainTest.scene.spawnTrayBall).not.toHaveBeenCalled();
    expect(mainTest.scene.spawnTrayBird).not.toHaveBeenCalled();
    expect(mainTest.scene.spawnTrayBlock).not.toHaveBeenCalled();
    expect(mainTest.scene.spawnTrayMattress).not.toHaveBeenCalled();
    expect(mainTest.scene.spawnTrayRamp).not.toHaveBeenCalled();
    expect(mainTest.scene.spawnTrayTeapot).not.toHaveBeenCalled();
  });
});

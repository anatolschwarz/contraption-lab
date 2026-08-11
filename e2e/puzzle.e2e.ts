import { expect, test, type Locator, type Page } from "@playwright/test";

const INITIAL_UPPER_RAMP = { x: 675, y: 280 };
const INITIAL_LOWER_RAMP = { x: 760, y: 380 };
const SOLUTION_UPPER_RAMP = { x: 265, y: 245, rotationSteps: 5 };
const SOLUTION_LOWER_RAMP = { x: 540, y: 395, rotationSteps: 5 };
const SOLUTION_ROTATION = (5 * Math.PI) / 36;
const POSITION_TOLERANCE = 1;
const ROTATION_TOLERANCE = 0.001;
const DOUBLE_CLICK_DELAY_MS = 20;

interface ActualRampTransform {
  id: string;
  rotation: number;
  x: number;
  y: number;
}

interface BoardState {
  actors: Array<{ id: string; x: number; y: number }>;
  ball?: { id: string; x: number; y: number };
  blocks: string[];
  ramps: ActualRampTransform[];
}

interface InteractionState {
  activeDragComponentId: string | null;
  dragMoved: boolean;
  pendingClickComponentId: string | null;
  pendingClickCompletedAt: number | null;
  selectedComponentId: string | null;
  upperRampPresent: boolean;
}

interface BallEditState {
  ball?: {
    fromTray: boolean;
    id: string;
    ownership: "fixed" | "player";
    x: number;
    y: number;
  };
  selectedComponentId: string | null;
  trayBallCount: number;
}

interface BallRemovalState extends BallEditState {
  ball?: BallEditState["ball"] & {
    bodyBounds?: { maxX: number; maxY: number; minX: number; minY: number };
    radius: number;
  };
  interaction: {
    activeDragComponentId: string | null;
    dragMoved: boolean;
    pendingClickComponentId: string | null;
    pointerIsDown: boolean;
    pointerWorldX: number;
    pointerWorldY: number;
  };
  removalHandlerCalls: Array<{ componentId: string; componentType: string }>;
}

interface BallRemovalTrace {
  afterFirstClick: BallRemovalState;
  afterSecondClick: BallRemovalState;
  beforeClicks: BallRemovalState;
  pointerClient: { x: number; y: number };
  pointerGame: { x: number; y: number };
}

interface App {
  canvas: Locator;
  errors: string[];
  mode: Locator;
  page: Page;
  simulation: Locator;
  timer: Locator;
}

async function gamePoint(canvas: Locator, point: { x: number; y: number }) {
  const box = await canvas.boundingBox();
  if (!box) throw new Error("Game canvas is not visible.");
  return {
    x: box.x + (point.x / 960) * box.width,
    y: box.y + (point.y / 540) * box.height,
  };
}

async function moveRamp(
  page: Page,
  canvas: Locator,
  startPoint: { x: number; y: number },
  endPoint: { x: number; y: number },
  steps = 12,
): Promise<void> {
  const start = await gamePoint(canvas, startPoint);
  const end = await gamePoint(canvas, endPoint);
  await page.mouse.move(start.x, start.y);
  await page.mouse.down();
  await page.mouse.move(end.x, end.y, { steps });
  await page.mouse.up();
}

async function clickCanvas(
  page: Page,
  canvas: Locator,
  point: { x: number; y: number },
): Promise<void> {
  const target = await gamePoint(canvas, point);
  await page.mouse.move(target.x, target.y);
  await page.mouse.down();
  await page.mouse.up();
}

async function doubleClickCanvas(
  page: Page,
  canvas: Locator,
  point: { x: number; y: number },
): Promise<void> {
  const target = await gamePoint(canvas, point);
  await page.mouse.move(target.x, target.y);
  await page.mouse.down();
  await page.mouse.up();
  await page.waitForTimeout(DOUBLE_CLICK_DELAY_MS);
  await page.mouse.down();
  await page.mouse.up();

  // Inspect only after the completed gesture; an intermediate poll can exceed
  // the application's 350 ms double-click window under browser load.
  await expect
    .poll(() => readInteractionState(page), {
      intervals: [10],
      timeout: 300,
    })
    .toEqual({
      activeDragComponentId: null,
      dragMoved: false,
      pendingClickComponentId: null,
      pendingClickCompletedAt: null,
      selectedComponentId: null,
      upperRampPresent: false,
    });
}

async function removeBall(
  page: Page,
  canvas: Locator,
  point: { x: number; y: number },
  ballId = "prototype-ball",
): Promise<BallRemovalTrace> {
  const pointerClient = await gamePoint(canvas, point);
  await page.evaluate(() => {
    const scene =
      window.__contraptionLabTest?.getPrototypeScene() as unknown as {
        removeComponent: (componentType: string, componentId: string) => void;
      };
    if (!scene) throw new Error("Prototype scene test hook is unavailable.");
    const traceWindow = window as typeof window & {
      __ballRemovalTrace?: {
        calls: Array<{ componentId: string; componentType: string }>;
        originalRemoveComponent: (
          componentType: string,
          componentId: string,
        ) => void;
      };
    };
    const originalRemoveComponent = scene.removeComponent;
    traceWindow.__ballRemovalTrace = {
      calls: [],
      originalRemoveComponent,
    };
    scene.removeComponent = (componentType, componentId) => {
      traceWindow.__ballRemovalTrace?.calls.push({
        componentId,
        componentType,
      });
      originalRemoveComponent.call(scene, componentType, componentId);
    };
  });
  const beforeClicks = await recordBallRemovalState(
    page,
    "before-remove-ball",
    ballId,
  );
  await page.mouse.move(pointerClient.x, pointerClient.y);
  await page.mouse.down();
  await page.mouse.up();
  const afterFirstClick = await recordBallRemovalState(
    page,
    "after-first-remove-click",
    ballId,
  );
  await page.waitForTimeout(DOUBLE_CLICK_DELAY_MS);
  await page.mouse.down();
  await page.mouse.up();
  const afterSecondClick = await recordBallRemovalState(
    page,
    "after-second-remove-click",
    ballId,
  );
  await page.evaluate(() => {
    const scene =
      window.__contraptionLabTest?.getPrototypeScene() as unknown as {
        removeComponent: (componentType: string, componentId: string) => void;
      };
    const traceWindow = window as typeof window & {
      __ballRemovalTrace?: {
        originalRemoveComponent: (
          componentType: string,
          componentId: string,
        ) => void;
      };
    };
    if (!scene || !traceWindow.__ballRemovalTrace) {
      throw new Error("Ball removal trace is unavailable.");
    }
    scene.removeComponent =
      traceWindow.__ballRemovalTrace.originalRemoveComponent;
    delete traceWindow.__ballRemovalTrace;
  });
  return {
    afterFirstClick,
    afterSecondClick,
    beforeClicks,
    pointerClient,
    pointerGame: { x: point.x, y: point.y },
  };
}

async function rotateSelectedRamp(page: Page, steps: number): Promise<void> {
  for (let step = 0; step < steps; step += 1) {
    await page.keyboard.press("E");
  }
}

async function placeSolutionRamps(page: Page, canvas: Locator): Promise<void> {
  await moveRamp(page, canvas, INITIAL_UPPER_RAMP, SOLUTION_UPPER_RAMP);
  await rotateSelectedRamp(page, SOLUTION_UPPER_RAMP.rotationSteps);
  await moveRamp(page, canvas, INITIAL_LOWER_RAMP, SOLUTION_LOWER_RAMP);
  await rotateSelectedRamp(page, SOLUTION_LOWER_RAMP.rotationSteps);
}

async function startApp(page: Page): Promise<App> {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  await page.goto("/");
  await page.bringToFront();

  const app = {
    page,
    errors,
    canvas: page.locator("#game-container canvas"),
    mode: page.locator("#mode-label"),
    simulation: page.locator("#simulation-button"),
    timer: page.locator("#timer-label"),
  };
  await expect(app.canvas).toBeVisible();
  await expect(app.mode).toHaveText("Mode: Edit");
  await waitForPrototypeScene(page);
  return app;
}

async function ensurePartsPaletteOpen(page: Page): Promise<void> {
  const palette = page.locator("#parts-palette");
  if (!(await palette.isVisible())) {
    await page.locator("#parts-palette-toggle").click();
  }
  await expect(palette).toBeVisible();
}

async function waitForPrototypeScene(page: Page): Promise<void> {
  await expect
    .poll(() =>
      page.evaluate(
        () => window.__contraptionLabTest?.getPrototypeScene() !== undefined,
      ),
    )
    .toBe(true);
}

async function readInteractionState(page: Page): Promise<InteractionState> {
  return page.evaluate(() => {
    const scene =
      window.__contraptionLabTest?.getPrototypeScene() as unknown as {
        drag?: { componentId: string };
        dragMoved: boolean;
        lastComponentClick?: { completedAt: number; componentId: string };
        ramps: Map<string, unknown>;
        selectedComponentId: string | null;
      };
    if (!scene) throw new Error("Prototype scene test hook is unavailable.");
    return {
      activeDragComponentId: scene.drag?.componentId ?? null,
      dragMoved: scene.dragMoved,
      pendingClickComponentId: scene.lastComponentClick?.componentId ?? null,
      pendingClickCompletedAt: scene.lastComponentClick?.completedAt ?? null,
      selectedComponentId: scene.selectedComponentId,
      upperRampPresent: scene.ramps.has("upper-ramp"),
    };
  });
}

async function recordBallEditState(
  page: Page,
  operation: string,
  ballId = "prototype-ball",
): Promise<BallEditState> {
  const state = await page.evaluate(
    ({ ballId }) => {
      const scene =
        window.__contraptionLabTest?.getPrototypeScene() as unknown as {
          balls: Map<
            string,
            {
              definition: { id: string; ownership: "fixed" | "player" };
              fromTray: boolean;
              shape: { x: number; y: number };
            }
          >;
          selectedComponentId: string | null;
        };
      const trayText = document.querySelector("#tray-ball-button")?.textContent;
      const trayBallCount = Number(/\((\d+)\)/.exec(trayText ?? "")?.[1]);
      if (!scene || !Number.isInteger(trayBallCount)) {
        throw new Error("Ball edit state is unavailable.");
      }
      const ball = scene.balls.get(ballId);
      return {
        ...(ball === undefined
          ? {}
          : {
              ball: {
                fromTray: ball.fromTray,
                id: ball.definition.id,
                ownership: ball.definition.ownership,
                x: ball.shape.x,
                y: ball.shape.y,
              },
            }),
        selectedComponentId: scene.selectedComponentId,
        trayBallCount,
      };
    },
    { ballId },
  );
  await test.info().attach(`ball-edit-${operation}`, {
    body: JSON.stringify({ operation, ...state }, null, 2),
    contentType: "application/json",
  });
  return state;
}

async function recordBallRemovalState(
  page: Page,
  operation: string,
  ballId = "prototype-ball",
): Promise<BallRemovalState> {
  const state = await page.evaluate(
    ({ ballId }) => {
      const scene =
        window.__contraptionLabTest?.getPrototypeScene() as unknown as {
          balls: Map<
            string,
            {
              definition: {
                id: string;
                ownership: "fixed" | "player";
                radius: number;
              };
              fromTray: boolean;
              shape: {
                body?: {
                  bounds?: {
                    max: { x: number; y: number };
                    min: { x: number; y: number };
                  };
                };
                x: number;
                y: number;
              };
            }
          >;
          drag?: { componentId: string };
          dragMoved: boolean;
          input: {
            activePointer: {
              isDown: boolean;
              worldX: number;
              worldY: number;
            };
          };
          lastComponentClick?: { componentId: string };
          selectedComponentId: string | null;
        };
      const traceWindow = window as typeof window & {
        __ballRemovalTrace?: {
          calls: Array<{ componentId: string; componentType: string }>;
        };
      };
      const trayText = document.querySelector("#tray-ball-button")?.textContent;
      const trayBallCount = Number(/\((\d+)\)/.exec(trayText ?? "")?.[1]);
      if (!scene || !Number.isInteger(trayBallCount)) {
        throw new Error("Ball removal state is unavailable.");
      }
      const ball = scene.balls.get(ballId);
      const bounds = ball?.shape.body?.bounds;
      return {
        ...(ball === undefined
          ? {}
          : {
              ball: {
                ...(bounds === undefined
                  ? {}
                  : {
                      bodyBounds: {
                        maxX: bounds.max.x,
                        maxY: bounds.max.y,
                        minX: bounds.min.x,
                        minY: bounds.min.y,
                      },
                    }),
                fromTray: ball.fromTray,
                id: ball.definition.id,
                ownership: ball.definition.ownership,
                radius: ball.definition.radius,
                x: ball.shape.x,
                y: ball.shape.y,
              },
            }),
        interaction: {
          activeDragComponentId: scene.drag?.componentId ?? null,
          dragMoved: scene.dragMoved,
          pendingClickComponentId:
            scene.lastComponentClick?.componentId ?? null,
          pointerIsDown: scene.input.activePointer.isDown,
          pointerWorldX: scene.input.activePointer.worldX,
          pointerWorldY: scene.input.activePointer.worldY,
        },
        removalHandlerCalls: [...(traceWindow.__ballRemovalTrace?.calls ?? [])],
        selectedComponentId: scene.selectedComponentId,
        trayBallCount,
      };
    },
    { ballId },
  );
  await test.info().attach(`ball-removal-${operation}`, {
    body: JSON.stringify({ operation, ...state }, null, 2),
    contentType: "application/json",
  });
  return state;
}

async function readBoard(page: Page): Promise<BoardState> {
  return page.evaluate(() => {
    const scene =
      window.__contraptionLabTest?.getPrototypeScene() as unknown as {
        actors: Map<string, { shape: { x: number; y: number } }>;
        balls: Map<
          string,
          { definition: { id: string }; shape: { x: number; y: number } }
        >;
        blocks: Map<string, unknown>;
        ramps: Map<
          string,
          { shape: { rotation: number; x: number; y: number } }
        >;
      };
    if (!scene) throw new Error("Prototype scene test hook is unavailable.");
    const ball = scene.balls.get("prototype-ball");
    return {
      actors: [...scene.actors.entries()].map(([id, actor]) => ({
        id,
        x: actor.shape.x,
        y: actor.shape.y,
      })),
      ...(ball === undefined
        ? {}
        : {
            ball: {
              id: ball.definition.id,
              x: ball.shape.x,
              y: ball.shape.y,
            },
          }),
      blocks: [...scene.blocks.keys()],
      ramps: [...scene.ramps.entries()].map(([id, ramp]) => ({
        id,
        x: ramp.shape.x,
        y: ramp.shape.y,
        rotation: ramp.shape.rotation,
      })),
    };
  });
}

async function advanceSimulation(page: Page, elapsedMs: number): Promise<void> {
  await page.evaluate((deltaMs) => {
    const scene =
      window.__contraptionLabTest?.getPrototypeScene() as unknown as {
        update: (time: number, elapsed: number) => void;
      };
    if (!scene) throw new Error("Prototype scene test hook is unavailable.");
    scene.update(0, deltaMs);
  }, elapsedMs);
}

async function selectPuzzle(page: Page, puzzleId: string): Promise<void> {
  await page.locator("#puzzle-selector-button").click();
  const option = page.locator(`[data-puzzle-id="${puzzleId}"]`);
  await expect(option).toBeEnabled();
  await option.click();
  await expect(page.locator("#game-container canvas")).toBeVisible();
}

async function enableUnlockAll(page: Page): Promise<void> {
  await page.getByRole("button", { name: "Settings" }).click();
  await page.getByLabel("Unlock all puzzles").check();
}

function getRamp(board: BoardState, id: string): ActualRampTransform {
  const ramp = board.ramps.find((candidate) => candidate.id === id);
  if (!ramp) throw new Error(`Missing ${id}.`);
  return ramp;
}

function expectRampPosition(
  ramp: ActualRampTransform,
  expected: { x: number; y: number },
): void {
  expect(Math.abs(ramp.x - expected.x)).toBeLessThanOrEqual(POSITION_TOLERANCE);
  expect(Math.abs(ramp.y - expected.y)).toBeLessThanOrEqual(POSITION_TOLERANCE);
}

function expectBallPosition(
  ball: BoardState["ball"],
  expected: { x: number; y: number },
): void {
  if (!ball) throw new Error("Missing Ball.");
  expect(Math.abs(ball.x - expected.x)).toBeLessThanOrEqual(POSITION_TOLERANCE);
  expect(Math.abs(ball.y - expected.y)).toBeLessThanOrEqual(POSITION_TOLERANCE);
}

function expectBallNotAtPosition(
  ball: BoardState["ball"],
  unexpected: { x: number; y: number },
): void {
  if (!ball) throw new Error("Missing Ball.");
  expect(
    Math.abs(ball.x - unexpected.x) > POSITION_TOLERANCE ||
      Math.abs(ball.y - unexpected.y) > POSITION_TOLERANCE,
  ).toBe(true);
}

function expectSolutionTransforms(board: BoardState): void {
  const upper = getRamp(board, "upper-ramp");
  const lower = getRamp(board, "lower-ramp");
  expectRampPosition(upper, SOLUTION_UPPER_RAMP);
  expect(Math.abs(upper.rotation - SOLUTION_ROTATION)).toBeLessThanOrEqual(
    ROTATION_TOLERANCE,
  );
  expectRampPosition(lower, SOLUTION_LOWER_RAMP);
  expect(Math.abs(lower.rotation - SOLUTION_ROTATION)).toBeLessThanOrEqual(
    ROTATION_TOLERANCE,
  );
}

async function solveFirstPuzzle(app: App): Promise<void> {
  await placeSolutionRamps(app.page, app.canvas);
  expectSolutionTransforms(await readBoard(app.page));
  await app.simulation.click();
  await expect(app.mode).toHaveText("Mode: Success", { timeout: 10_000 });
}

function expectNoConsoleErrors(app: App): void {
  expect(app.errors).toEqual([]);
}

test("solves the first puzzle and advances through Next Puzzle", async ({
  page,
}) => {
  test.setTimeout(60_000);
  const app = await startApp(page);
  await expect(page.locator("#level-progress-label")).toHaveText(
    "Level 1 of 5 — Basic",
  );
  await expect(page.locator("#puzzle-selector-button")).toHaveText(
    "Relay Ramps",
  );
  await expect(app.timer).toHaveText("Time: 0:45");

  await solveFirstPuzzle(app);
  await expect(app.simulation).toBeDisabled();
  const timeAtSuccess = await app.timer.textContent();
  await advanceSimulation(page, 1_000);
  await expect(app.timer).toHaveText(timeAtSuccess ?? "");

  await page.getByRole("button", { name: "Next Puzzle: Relay Shift" }).click();
  await expect(page.locator("#level-progress-label")).toHaveText(
    "Level 2 of 5 — Medium",
  );
  await expect(page.locator("#puzzle-selector-button")).toHaveText(
    "Relay Shift",
  );
  await expect(app.timer).toBeHidden();
  expectNoConsoleErrors(app);
});

test("opens the puzzle selector from the clickable puzzle name", async ({
  page,
}) => {
  const app = await startApp(page);
  const puzzleName = page.locator("#puzzle-selector-button");
  const selector = page.locator("#puzzle-selector-panel");

  await expect(puzzleName).toHaveText("Relay Ramps");
  await expect(puzzleName).toHaveAttribute(
    "aria-controls",
    "puzzle-selector-panel",
  );
  await expect(puzzleName).toHaveAttribute("aria-expanded", "false");
  await expect(page.locator("#puzzle-title-label")).toHaveCount(0);
  await puzzleName.click();
  await expect(selector).toBeVisible();
  await expect(puzzleName).toHaveAttribute("aria-expanded", "true");
  await puzzleName.press("Enter");
  await expect(selector).toBeHidden();
  await expect(puzzleName).toHaveAttribute("aria-expanded", "false");
  expectNoConsoleErrors(app);
});

test("returns removed player parts to inventory and places them again", async ({
  page,
}) => {
  const app = await startApp(page);
  await ensurePartsPaletteOpen(page);
  await expect(page.locator("#tray-ramp-button")).toHaveText("Ramp (4)");

  await doubleClickCanvas(page, app.canvas, INITIAL_UPPER_RAMP);
  await expect(page.locator("#tray-ramp-button")).toHaveText("Ramp (5)");
  expect((await readBoard(page)).ramps.map(({ id }) => id)).not.toContain(
    "upper-ramp",
  );

  await page.getByRole("button", { name: "Ramp (5)" }).click();
  await expect(page.locator("#tray-ramp-button")).toHaveText("Ramp (4)");
  expect(getRamp(await readBoard(page), "tray-ramp-1")).toBeDefined();
  expectNoConsoleErrors(app);
});

test("hides and restores the Parts Palette across responsive layouts", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1400, height: 900 });
  const app = await startApp(page);
  const palette = page.locator("#parts-palette");
  const paletteContent = page.locator("#parts-palette-content");
  const paletteTitle = page.locator(".parts-palette-title");
  const ballPreview = page.locator(".part-preview--ball");
  const blockPreview = page.locator(".part-preview--block");
  const rampPreview = page.locator(".part-preview--ramp");
  const toggle = page.locator("#parts-palette-toggle");

  await expect(toggle).toHaveText("Parts");
  await expect(palette).toBeHidden();
  await expect(paletteTitle).toBeHidden();
  await expect(paletteContent).toBeHidden();
  await toggle.click();
  await expect(toggle).toHaveText("Close");
  await expect(palette).toBeVisible();
  await expect(ballPreview).toBeVisible();
  await expect(blockPreview).toBeVisible();
  await expect(rampPreview).toBeVisible();
  await toggle.click();
  await expect(toggle).toHaveText("Parts");
  await expect(palette).toBeHidden();

  await page.setViewportSize({ width: 600, height: 900 });
  await expect(toggle).toHaveText("Parts");
  await expect(palette).toBeHidden();
  await expect(paletteTitle).toBeHidden();
  await expect(paletteContent).toBeHidden();
  await toggle.click();
  await expect(toggle).toHaveText("Close");
  await expect(palette).toBeVisible();
  await expect(ballPreview).toBeVisible();
  await expect(blockPreview).toBeVisible();
  await expect(rampPreview).toBeVisible();
  await toggle.click();
  await expect(toggle).toHaveText("Parts");
  await expect(palette).toBeHidden();
  expectNoConsoleErrors(app);
});

test("Rerun restores its run-start layout and Reset restores JSON defaults", async ({
  page,
}) => {
  const app = await startApp(page);
  const runStart = { x: 430, y: 240 };
  await moveRamp(page, app.canvas, INITIAL_UPPER_RAMP, runStart);
  expectRampPosition(getRamp(await readBoard(page), "upper-ramp"), runStart);

  await app.simulation.click();
  await expect(app.mode).toHaveText("Mode: Running");
  await page.getByRole("button", { name: "Rerun" }).click();
  await expect(app.mode).toHaveText("Mode: Running");
  expectRampPosition(getRamp(await readBoard(page), "upper-ramp"), runStart);

  await page.getByRole("button", { name: "Reset" }).click();
  await expect(app.mode).toHaveText("Mode: Edit");
  expectRampPosition(
    getRamp(await readBoard(page), "upper-ramp"),
    INITIAL_UPPER_RAMP,
  );
  await expect(page.locator("#tray-block-button")).toHaveText("Block (2)");
  await expect(page.locator("#tray-ramp-button")).toHaveText("Ramp (4)");
  expectNoConsoleErrors(app);
});

test("times a puzzle through Run, Pause, Resume, Rerun, and Timeout", async ({
  page,
}) => {
  const app = await startApp(page);
  await enableUnlockAll(page);
  await selectPuzzle(page, "timed-relay-003");
  await expect(page.locator("#puzzle-selector-button")).toHaveText(
    "Timed Relay",
  );
  await expect(app.timer).toHaveText("Time: 0:30");

  await app.simulation.click();
  await expect(app.mode).toHaveText("Mode: Running");
  await advanceSimulation(page, 1_100);
  const runningTime = await app.timer.textContent();
  expect(runningTime).not.toBe("Time: 0:30");

  await app.simulation.click();
  await expect(app.mode).toHaveText("Mode: Paused");
  await advanceSimulation(page, 2_000);
  await expect(app.timer).toHaveText(runningTime ?? "");

  await app.simulation.click();
  await advanceSimulation(page, 1_100);
  await expect(app.timer).not.toHaveText(runningTime ?? "");

  await page.getByRole("button", { name: "Rerun" }).click();
  await expect(app.mode).toHaveText("Mode: Running");
  await expect(app.timer).toHaveText("Time: 0:30");

  await advanceSimulation(page, 31_000);
  await expect(app.mode).toHaveText("Mode: Failed — Time expired");
  expectNoConsoleErrors(app);
});

test("loads the first real Basic puzzle pair with their defined timers and inventory", async ({
  page,
}) => {
  const app = await startApp(page);
  await enableUnlockAll(page);

  await selectPuzzle(page, "down-the-ramp-004");
  await expect(page.locator("#level-progress-label")).toHaveText(
    "Level 4 of 5 — Basic",
  );
  await expect(page.locator("#puzzle-selector-button")).toHaveText(
    "Down the Ramp",
  );
  await expect(app.timer).toHaveText("Time: 0:10");
  await ensurePartsPaletteOpen(page);
  await expect(page.locator("#tray-ball-button")).toHaveText("Ball (0)");
  await expect(page.locator("#tray-block-button")).toHaveText("Block (0)");
  await expect(page.locator("#tray-ramp-button")).toHaveText("Ramp (2)");

  await selectPuzzle(page, "bridge-the-gap-005");
  await expect(page.locator("#level-progress-label")).toHaveText(
    "Level 5 of 5 — Basic",
  );
  await expect(page.locator("#puzzle-selector-button")).toHaveText(
    "Bridge the Gap",
  );
  await expect(app.timer).toHaveText("Time: 0:12");
  await ensurePartsPaletteOpen(page);
  await expect(page.locator("#tray-ball-button")).toHaveText("Ball (0)");
  await expect(page.locator("#tray-block-button")).toHaveText("Block (0)");
  await expect(page.locator("#tray-ramp-button")).toHaveText("Ramp (2)");
  expectNoConsoleErrors(app);
});

test("enforces puzzle locks and isolates switched runtime state", async ({
  page,
}) => {
  const app = await startApp(page);
  await page.locator("#puzzle-selector-button").click();
  await expect(
    page.locator('[data-puzzle-id="relay-shift-002"]'),
  ).toBeDisabled();
  await page.locator("#puzzle-selector-button").click();

  await ensurePartsPaletteOpen(page);
  await page.getByRole("button", { name: "Ramp (4)" }).click();
  await expect(page.locator("#tray-ramp-button")).toHaveText("Ramp (3)");
  await enableUnlockAll(page);
  await selectPuzzle(page, "timed-relay-003");
  await expect(page.locator("#tray-ramp-button")).toHaveText("Ramp (2)");
  expect(getRamp(await readBoard(page), "upper-ramp")).toMatchObject(
    INITIAL_UPPER_RAMP,
  );
  expectNoConsoleErrors(app);
});

test("persists completed puzzle progression in localStorage after reload", async ({
  page,
}) => {
  const app = await startApp(page);
  await solveFirstPuzzle(app);
  await page.reload({ waitUntil: "domcontentloaded" });
  await waitForPrototypeScene(page);
  await expect(page.locator("#game-container canvas")).toBeVisible();
  await page.locator("#puzzle-selector-button").click();
  await expect(
    page.locator('[data-puzzle-id="relay-shift-002"]'),
  ).toHaveAttribute("data-puzzle-state", "available");
  expectNoConsoleErrors(app);
});

test("Unlock all exposes every built-in puzzle and preserves earned progress when disabled", async ({
  page,
}) => {
  const app = await startApp(page);
  await solveFirstPuzzle(app);
  await enableUnlockAll(page);
  await page.locator("#puzzle-selector-button").click();
  await expect(
    page.locator('[data-puzzle-id="relay-shift-002"]'),
  ).toBeEnabled();
  await expect(
    page.locator('[data-puzzle-id="timed-relay-003"]'),
  ).toBeEnabled();
  await expect(
    page.locator('[data-puzzle-id="down-the-ramp-004"]'),
  ).toBeEnabled();
  await expect(
    page.locator('[data-puzzle-id="bridge-the-gap-005"]'),
  ).toBeEnabled();

  await page.getByLabel("Unlock all puzzles").uncheck();
  await expect(
    page.locator('[data-puzzle-id="relay-shift-002"]'),
  ).toHaveAttribute("data-puzzle-state", "available");
  await expect(
    page.locator('[data-puzzle-id="timed-relay-003"]'),
  ).toBeDisabled();
  await expect(
    page.locator('[data-puzzle-id="down-the-ramp-004"]'),
  ).toBeDisabled();
  expectNoConsoleErrors(app);
});

test("keeps Bird patrol deterministic and executes configured Bird contacts", async ({
  page,
}) => {
  const app = await startApp(page);
  const result = await page.evaluate(() => {
    const scene =
      window.__contraptionLabTest?.getPrototypeScene() as unknown as {
        actors: Map<string, { shape: { x: number } }>;
        blocks: Map<string, unknown>;
        resetLevel: () => void;
        setSimulationRunning: (running: boolean) => void;
        update: (time: number, elapsed: number) => void;
      };
    if (!scene) throw new Error("Prototype scene test hook is unavailable.");
    const patrolPositionAfterOneSecond = () => {
      scene.resetLevel();
      scene.setSimulationRunning(true);
      scene.update(0, 1_000);
      return scene.actors.get("patrol-bird")?.shape.x;
    };
    const firstRun = patrolPositionAfterOneSecond();
    const secondRun = patrolPositionAfterOneSecond();
    scene.resetLevel();
    scene.setSimulationRunning(true);
    scene.update(0, 3_500);
    const birdDestroyedGuideBlock = !scene.blocks.has("guide-block");
    scene.setSimulationRunning(false);
    return { birdDestroyedGuideBlock, firstRun, secondRun };
  });
  expect(result.firstRun).toBe(result.secondRun);
  expect(result.firstRun).toBeGreaterThan(680);
  expect(result.birdDestroyedGuideBlock).toBe(true);

  await page.getByRole("button", { name: "Reset" }).click();
  await moveRamp(page, app.canvas, INITIAL_UPPER_RAMP, { x: 650, y: 150 });
  await app.simulation.click();
  await advanceSimulation(page, 20);
  expect((await readBoard(page)).ramps.map(({ id }) => id)).not.toContain(
    "upper-ramp",
  );
  expectNoConsoleErrors(app);
});

test("keeps fixed Balls non-editable", async ({ page }) => {
  const app = await startApp(page);
  const fixedStart = (await readBoard(page)).blocks;
  await clickCanvas(page, app.canvas, { x: 215, y: 135 });
  await expect(page.locator("#edit-feedback")).toHaveText(
    "Fixed parts cannot be moved or removed.",
  );
  await expect
    .poll(() => readInteractionState(page))
    .toMatchObject({
      selectedComponentId: null,
    });
  await moveRamp(page, app.canvas, { x: 215, y: 135 }, { x: 320, y: 135 });
  await expect(page.locator("#edit-feedback")).toHaveText(
    "Fixed parts cannot be moved or removed.",
  );
  expect((await readBoard(page)).ball).toMatchObject({ x: 215, y: 135 });
  await moveRamp(page, app.canvas, { x: 850, y: 150 }, { x: 760, y: 150 });
  await expect(page.locator("#edit-feedback")).toHaveText(
    "Fixed parts cannot be moved or removed.",
  );
  await clickCanvas(page, app.canvas, { x: 850, y: 150 });
  await clickCanvas(page, app.canvas, { x: 850, y: 150 });
  expect((await readBoard(page)).blocks).toEqual(fixedStart);

  expect((await readBoard(page)).ball).toMatchObject({ x: 215, y: 135 });
  expectNoConsoleErrors(app);
});

test("edits, removes, and replaces a player-owned preplaced Ball through Reset", async ({
  page,
}) => {
  const app = await startApp(page);
  const resetPlayerBall = await recordBallEditState(
    page,
    "initial-player-owned-ball",
    "player-ball",
  );
  expect(resetPlayerBall).toMatchObject({
    ball: {
      fromTray: false,
      id: "player-ball",
      ownership: "player",
      x: 100,
      y: 120,
    },
    selectedComponentId: null,
    trayBallCount: 0,
  });

  await clickCanvas(page, app.canvas, { x: 100, y: 120 });
  await expect
    .poll(() => readInteractionState(page))
    .toMatchObject({ selectedComponentId: "player-ball" });
  await expect
    .poll(() =>
      page.evaluate(() => {
        const scene =
          window.__contraptionLabTest?.getPrototypeScene() as unknown as {
            balls: Map<string, { selectionText: { visible: boolean } }>;
          };
        return scene?.balls.get("player-ball")?.selectionText.visible;
      }),
    )
    .toBe(true);

  await moveRamp(page, app.canvas, { x: 100, y: 120 }, { x: 100, y: 220 });
  const draggedBall = await recordBallEditState(
    page,
    "dragged-preplaced-ball",
    "player-ball",
  );
  expect(draggedBall).toMatchObject({
    ball: {
      fromTray: false,
      id: "player-ball",
      ownership: "player",
    },
    selectedComponentId: "player-ball",
    trayBallCount: 0,
  });
  expectBallPosition(draggedBall.ball, { x: 100, y: 220 });

  if (!draggedBall.ball) throw new Error("Dragged Ball is unavailable.");
  await moveRamp(page, app.canvas, draggedBall.ball, { x: 850, y: 150 });
  await expect(page.locator("#edit-feedback")).toHaveText(
    "Placement rejected: keep parts in bounds and clear of other parts.",
  );
  const overlapRejectedBall = await recordBallEditState(
    page,
    "dragged-toward-fixed-block",
    "player-ball",
  );
  expect(overlapRejectedBall).toMatchObject({
    ball: {
      fromTray: false,
      id: "player-ball",
      ownership: "player",
    },
    selectedComponentId: "player-ball",
    trayBallCount: 0,
  });
  if (!overlapRejectedBall.ball) throw new Error("Ball is unavailable.");
  expect(overlapRejectedBall.ball.x).toBeGreaterThan(draggedBall.ball.x);
  expect(overlapRejectedBall.ball.x).toBeLessThanOrEqual(776);

  await moveRamp(page, app.canvas, overlapRejectedBall.ball, {
    x: 215,
    y: 135,
  });
  const ballOverlapRejected = await recordBallEditState(
    page,
    "dragged-toward-fixed-ball",
    "player-ball",
  );
  if (!ballOverlapRejected.ball) throw new Error("Ball is unavailable.");
  expect(
    Math.hypot(
      ballOverlapRejected.ball.x - 215,
      ballOverlapRejected.ball.y - 135,
    ),
  ).toBeGreaterThanOrEqual(48);

  await moveRamp(page, app.canvas, ballOverlapRejected.ball, {
    x: 300,
    y: 250,
  });
  const reroutedBall = await recordBallEditState(
    page,
    "rerouted-around-fixed-ball",
    "player-ball",
  );
  if (!reroutedBall.ball) throw new Error("Ball is unavailable.");
  await moveRamp(page, app.canvas, reroutedBall.ball, { x: 1, y: 30 });
  const boundsClampedBall = await recordBallEditState(
    page,
    "dragged-to-bound",
    "player-ball",
  );
  expect(boundsClampedBall).toMatchObject({
    ball: {
      fromTray: false,
      id: "player-ball",
      ownership: "player",
    },
    selectedComponentId: "player-ball",
    trayBallCount: 0,
  });
  expectBallPosition(boundsClampedBall.ball, { x: 24, y: 30 });

  if (!boundsClampedBall.ball)
    throw new Error("Bounds-clamped Ball is unavailable.");
  const boundaryRemoval = await removeBall(
    page,
    app.canvas,
    boundsClampedBall.ball,
    "player-ball",
  );
  expect(boundaryRemoval.pointerGame).toEqual({
    x: boundsClampedBall.ball.x,
    y: boundsClampedBall.ball.y,
  });
  expect(boundaryRemoval.beforeClicks).toMatchObject({
    ball: {
      fromTray: false,
      id: "player-ball",
      ownership: "player",
      radius: 24,
    },
    selectedComponentId: "player-ball",
    trayBallCount: 0,
  });
  expect(boundaryRemoval.afterFirstClick).toMatchObject({
    ball: { id: "player-ball" },
    interaction: {
      activeDragComponentId: null,
      pendingClickComponentId: "player-ball",
      pointerIsDown: false,
    },
    removalHandlerCalls: [],
    selectedComponentId: "player-ball",
    trayBallCount: 0,
  });
  expect(boundaryRemoval.afterSecondClick).toMatchObject({
    interaction: {
      activeDragComponentId: null,
      pendingClickComponentId: null,
      pointerIsDown: false,
    },
    removalHandlerCalls: [
      { componentId: "player-ball", componentType: "ball" },
    ],
    selectedComponentId: null,
    trayBallCount: 1,
  });
  expect(boundaryRemoval.afterSecondClick.ball).toBeUndefined();
  await expect(page.locator("#tray-ball-button")).toHaveText("Ball (1)");
  const removedBall = await recordBallEditState(
    page,
    "removed-ball",
    "player-ball",
  );
  expect(removedBall).toEqual({
    selectedComponentId: null,
    trayBallCount: 1,
  });

  await ensurePartsPaletteOpen(page);
  await page.getByRole("button", { name: "Ball (1)" }).click();
  await expect(page.locator("#tray-ball-button")).toHaveText("Ball (0)");
  const trayBall = await recordBallEditState(
    page,
    "placed-ball-from-tray",
    "player-ball",
  );
  expect(trayBall).toMatchObject({
    ball: {
      fromTray: true,
      id: "player-ball",
      ownership: "player",
      x: 120,
      y: 135,
    },
    selectedComponentId: "player-ball",
    trayBallCount: 0,
  });
  if (!trayBall.ball) throw new Error("Tray Ball is unavailable.");
  const trayRemoval = await removeBall(
    page,
    app.canvas,
    trayBall.ball,
    "player-ball",
  );
  expect(trayRemoval.afterSecondClick).toMatchObject({
    removalHandlerCalls: [
      { componentId: "player-ball", componentType: "ball" },
    ],
    trayBallCount: 1,
  });
  expect(trayRemoval.afterSecondClick.ball).toBeUndefined();
  await expect(page.locator("#tray-ball-button")).toHaveText("Ball (1)");
  const removedTrayBall = await recordBallEditState(
    page,
    "removed-tray-ball",
    "player-ball",
  );
  expect(removedTrayBall).toEqual({
    selectedComponentId: null,
    trayBallCount: 1,
  });

  await page.getByRole("button", { name: "Reset" }).click();
  const resetBall = await recordBallEditState(
    page,
    "reset-restored-json-ball",
    "player-ball",
  );
  expect(resetBall).toMatchObject({
    ball: {
      fromTray: false,
      id: "player-ball",
      ownership: "player",
      x: 100,
      y: 120,
    },
    selectedComponentId: null,
    trayBallCount: 0,
  });
  expectNoConsoleErrors(app);
});

test("keeps the live Ball transform through Pause, Success, and Timeout", async ({
  page,
}) => {
  const app = await startApp(page);
  await app.simulation.click();
  await page.evaluate(() => {
    const scene =
      window.__contraptionLabTest?.getPrototypeScene() as unknown as {
        balls: Map<
          string,
          { shape: { setPosition: (x: number, y: number) => void } }
        >;
      };
    scene?.balls.get("prototype-ball")?.shape.setPosition(400, 120);
  });
  const pauseTransition = await page.evaluate(() => {
    const scene =
      window.__contraptionLabTest?.getPrototypeScene() as unknown as {
        balls: Map<string, { shape: { x: number; y: number } }>;
      };
    const button =
      document.querySelector<HTMLButtonElement>("#simulation-button");
    const ball = scene?.balls.get("prototype-ball");
    if (!ball || !button)
      throw new Error("Ball or simulation button is unavailable.");
    const before = { x: ball.shape.x, y: ball.shape.y };
    button.click();
    return { after: { x: ball.shape.x, y: ball.shape.y }, before };
  });
  await expect(app.mode).toHaveText("Mode: Paused");
  expectBallPosition(
    { id: "prototype-ball", ...pauseTransition.after },
    pauseTransition.before,
  );
  expectBallNotAtPosition(
    { id: "prototype-ball", ...pauseTransition.after },
    { x: 215, y: 135 },
  );
  await advanceSimulation(page, 1_000);
  expectBallPosition((await readBoard(page)).ball, pauseTransition.before);

  await app.simulation.click();
  const successTransition = await page.evaluate(() => {
    const scene =
      window.__contraptionLabTest?.getPrototypeScene() as unknown as {
        balls: Map<
          string,
          {
            shape: {
              body?: unknown;
              setPosition: (x: number, y: number) => void;
              x: number;
              y: number;
            };
          }
        >;
        contactObjects: Map<unknown, { tag: string }>;
        handleContact: (first: unknown, second: unknown) => void;
      };
    const ball = scene?.balls.get("player-ball");
    ball?.shape.setPosition(410, 130);
    if (!ball) throw new Error("Player Ball is unavailable.");
    const before = { x: ball.shape.x, y: ball.shape.y };
    const goalBody = [...scene.contactObjects.entries()].find(
      ([, object]) => object.tag === "goal",
    )?.[0];
    if (!ball.shape.body || !goalBody)
      throw new Error("Ball or goal contact object is unavailable.");
    scene.handleContact(ball.shape.body, goalBody);
    return { after: { x: ball.shape.x, y: ball.shape.y }, before };
  });
  await expect(app.mode).toHaveText("Mode: Success");
  expectBallPosition(
    { id: "player-ball", ...successTransition.after },
    successTransition.before,
  );
  expectBallNotAtPosition(
    { id: "player-ball", ...successTransition.after },
    { x: 100, y: 120 },
  );

  await enableUnlockAll(page);
  await selectPuzzle(page, "timed-relay-003");
  await app.simulation.click();
  const timeoutTransition = await page.evaluate(() => {
    const scene =
      window.__contraptionLabTest?.getPrototypeScene() as unknown as {
        balls: Map<
          string,
          {
            shape: {
              setPosition: (x: number, y: number) => void;
              x: number;
              y: number;
            };
          }
        >;
        onTimerTick: (deltaMs: number) => void;
      };
    const ball = scene?.balls.get("prototype-ball");
    ball?.shape.setPosition(420, 140);
    if (!ball) throw new Error("Ball is unavailable.");
    const before = { x: ball.shape.x, y: ball.shape.y };
    scene.onTimerTick(31_000);
    return { after: { x: ball.shape.x, y: ball.shape.y }, before };
  });
  await expect(app.mode).toHaveText("Mode: Failed — Time expired");
  expectBallPosition(
    { id: "prototype-ball", ...timeoutTransition.after },
    timeoutTransition.before,
  );
  expectBallNotAtPosition(
    { id: "prototype-ball", ...timeoutTransition.after },
    { x: 215, y: 135 },
  );
  expectNoConsoleErrors(app);
});

test("Rerun restores fresh Run-start Ball physics and Reset restores JSON", async ({
  page,
}) => {
  const app = await startApp(page);
  await app.simulation.click();
  await page.evaluate(() => {
    const scene =
      window.__contraptionLabTest?.getPrototypeScene() as unknown as {
        balls: Map<
          string,
          {
            shape: {
              setPosition: (x: number, y: number) => void;
              setVelocity: (x: number, y: number) => void;
            };
          }
        >;
      };
    scene?.balls.get("prototype-ball")?.shape.setPosition(400, 120);
    scene?.balls.get("prototype-ball")?.shape.setVelocity(8, 6);
    scene?.balls.get("player-ball")?.shape.setPosition(320, 200);
    scene?.balls.get("player-ball")?.shape.setVelocity(-5, 4);
  });
  const rerunTransition = await page.evaluate(() => {
    const scene =
      window.__contraptionLabTest?.getPrototypeScene() as unknown as {
        runSnapshot?: {
          balls: Array<{ definition: { id: string; x: number; y: number } }>;
        };
        balls: Map<
          string,
          {
            shape: {
              x: number;
              y: number;
              body?: { velocity: { x: number; y: number } };
            };
          }
        >;
      };
    const button = document.querySelector<HTMLButtonElement>("#rerun-button");
    if (!scene?.runSnapshot || scene.balls.size !== 2 || !button)
      throw new Error("Run snapshot, Balls, or Rerun button is unavailable.");
    const runStart = Object.fromEntries(
      scene.runSnapshot.balls.map((ball) => [
        ball.definition.id,
        ball.definition,
      ]),
    );
    button.click();
    const restored = Object.fromEntries(
      [...scene.balls.entries()].map(([id, ball]) => {
        const velocity = ball.shape.body?.velocity;
        if (!velocity) throw new Error("Restored Ball body is unavailable.");
        return [
          id,
          {
            velocity: { x: velocity.x, y: velocity.y },
            x: ball.shape.x,
            y: ball.shape.y,
          },
        ];
      }),
    );
    return {
      restored,
      runStart,
    };
  });
  expect(rerunTransition.runStart).toMatchObject({
    "player-ball": { x: 100, y: 120 },
    "prototype-ball": { x: 215, y: 135 },
  });
  for (const id of ["prototype-ball", "player-ball"]) {
    const restored = rerunTransition.restored[id];
    const runStart = rerunTransition.runStart[id];
    if (!restored || !runStart) throw new Error(`Missing restored ${id}.`);
    expectBallPosition({ id, ...restored }, runStart);
    expect(restored.velocity).toEqual({ x: 0, y: 0 });
  }
  await expect(app.mode).toHaveText("Mode: Running");

  await page.getByRole("button", { name: "Reset" }).click();
  await expect(app.mode).toHaveText("Mode: Edit");
  expect((await readBoard(page)).ball).toMatchObject({
    id: "prototype-ball",
    x: 215,
    y: 135,
  });
  expect(
    await recordBallEditState(page, "reset-player-ball", "player-ball"),
  ).toMatchObject({
    ball: {
      fromTray: false,
      id: "player-ball",
      ownership: "player",
      x: 100,
      y: 120,
    },
    trayBallCount: 0,
  });
  expectNoConsoleErrors(app);
});

test("rejects overlapping player-part edits", async ({ page }) => {
  const app = await startApp(page);

  await moveRamp(page, app.canvas, INITIAL_UPPER_RAMP, INITIAL_LOWER_RAMP, 1);
  await expect(page.locator("#edit-feedback")).toHaveText(
    "Placement rejected: keep parts in bounds and clear of other parts.",
  );
  expectRampPosition(
    getRamp(await readBoard(page), "upper-ramp"),
    INITIAL_UPPER_RAMP,
  );

  await moveRamp(page, app.canvas, INITIAL_UPPER_RAMP, { x: 430, y: 240 });
  expectRampPosition(getRamp(await readBoard(page), "upper-ramp"), {
    x: 430,
    y: 240,
  });

  expectNoConsoleErrors(app);
});

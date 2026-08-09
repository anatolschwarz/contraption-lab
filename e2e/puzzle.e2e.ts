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

async function readBoard(page: Page): Promise<BoardState> {
  return page.evaluate(() => {
    const scene =
      window.__contraptionLabTest?.getPrototypeScene() as unknown as {
        actors: Map<string, { shape: { x: number; y: number } }>;
        blocks: Map<string, unknown>;
        ramps: Map<
          string,
          { shape: { rotation: number; x: number; y: number } }
        >;
      };
    if (!scene) throw new Error("Prototype scene test hook is unavailable.");
    return {
      actors: [...scene.actors.entries()].map(([id, actor]) => ({
        id,
        x: actor.shape.x,
        y: actor.shape.y,
      })),
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
    "Level 1 of 3 — Basic",
  );
  await expect(page.locator("#puzzle-title-label")).toHaveText("Relay Ramps");
  await expect(app.timer).toHaveText("Time: 0:45");

  await solveFirstPuzzle(app);
  await expect(app.simulation).toBeDisabled();
  const timeAtSuccess = await app.timer.textContent();
  await advanceSimulation(page, 1_000);
  await expect(app.timer).toHaveText(timeAtSuccess ?? "");

  await page.getByRole("button", { name: "Next Puzzle: Relay Shift" }).click();
  await expect(page.locator("#level-progress-label")).toHaveText(
    "Level 2 of 3 — Medium",
  );
  await expect(page.locator("#puzzle-title-label")).toHaveText("Relay Shift");
  await expect(app.timer).toBeHidden();
  expectNoConsoleErrors(app);
});

test("returns removed player parts to inventory and places them again", async ({
  page,
}) => {
  const app = await startApp(page);
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
  await expect(page.locator("#puzzle-title-label")).toHaveText("Timed Relay");
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

test("enforces puzzle locks and isolates switched runtime state", async ({
  page,
}) => {
  const app = await startApp(page);
  await page.locator("#puzzle-selector-button").click();
  await expect(
    page.locator('[data-puzzle-id="relay-shift-002"]'),
  ).toBeDisabled();
  await page.locator("#puzzle-selector-button").click();

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

  await page.getByLabel("Unlock all puzzles").uncheck();
  await expect(
    page.locator('[data-puzzle-id="relay-shift-002"]'),
  ).toHaveAttribute("data-puzzle-state", "available");
  await expect(
    page.locator('[data-puzzle-id="timed-relay-003"]'),
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

test("rejects fixed-part edits while player-owned parts remain editable", async ({
  page,
}) => {
  const app = await startApp(page);
  const fixedStart = (await readBoard(page)).blocks;
  await moveRamp(page, app.canvas, { x: 850, y: 150 }, { x: 760, y: 150 });
  await expect(page.locator("#edit-feedback")).toHaveText(
    "Fixed parts cannot be moved or removed.",
  );
  await clickCanvas(page, app.canvas, { x: 850, y: 150 });
  await clickCanvas(page, app.canvas, { x: 850, y: 150 });
  expect((await readBoard(page)).blocks).toEqual(fixedStart);

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

import { expect, test, type Locator, type Page } from "@playwright/test";

const INITIAL_UPPER_RAMP = { x: 675, y: 280 };
const INITIAL_LOWER_RAMP = { x: 760, y: 380 };
const SOLUTION_UPPER_RAMP = { x: 265, y: 245, rotationSteps: 5 };
const SOLUTION_LOWER_RAMP = { x: 540, y: 395, rotationSteps: 5 };
const SOLUTION_ROTATION = (5 * Math.PI) / 36;
const POSITION_TOLERANCE = 1;
const ROTATION_TOLERANCE = 0.001;

interface ActualRampTransform {
  id: string;
  x: number;
  y: number;
  rotation: number;
}

test.setTimeout(60_000);

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
): Promise<void> {
  const start = await gamePoint(canvas, startPoint);
  const end = await gamePoint(canvas, endPoint);
  await page.mouse.move(start.x, start.y);
  await page.mouse.down();
  await page.mouse.move(end.x, end.y, { steps: 12 });
  await page.mouse.up();
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

async function readRampTransforms(page: Page): Promise<ActualRampTransform[]> {
  return page.evaluate(() => {
    const game = Reflect.get(window, "__contraptionGame") as {
      scene: { getScene: (key: string) => unknown };
    };
    const scene = game.scene.getScene("prototype") as {
      ramps: Map<
        string,
        { shape: { rotation: number; x: number; y: number } }
      >;
    };

    return ["upper-ramp", "lower-ramp"].map((id) => {
      const ramp = scene.ramps.get(id);
      if (!ramp) throw new Error(`Missing ${id}.`);
      return {
        id,
        x: ramp.shape.x,
        y: ramp.shape.y,
        rotation: ramp.shape.rotation,
      };
    });
  });
}

function expectSolutionTransforms(transforms: ActualRampTransform[]): void {
  expect(transforms).toHaveLength(2);
  expect(transforms[0]?.id).toBe("upper-ramp");
  expect(
    Math.abs((transforms[0]?.x ?? 0) - SOLUTION_UPPER_RAMP.x),
  ).toBeLessThanOrEqual(POSITION_TOLERANCE);
  expect(
    Math.abs((transforms[0]?.y ?? 0) - SOLUTION_UPPER_RAMP.y),
  ).toBeLessThanOrEqual(POSITION_TOLERANCE);
  expect(
    Math.abs((transforms[0]?.rotation ?? 0) - SOLUTION_ROTATION),
  ).toBeLessThanOrEqual(ROTATION_TOLERANCE);
  expect(transforms[1]?.id).toBe("lower-ramp");
  expect(
    Math.abs((transforms[1]?.x ?? 0) - SOLUTION_LOWER_RAMP.x),
  ).toBeLessThanOrEqual(POSITION_TOLERANCE);
  expect(
    Math.abs((transforms[1]?.y ?? 0) - SOLUTION_LOWER_RAMP.y),
  ).toBeLessThanOrEqual(POSITION_TOLERANCE);
  expect(
    Math.abs((transforms[1]?.rotation ?? 0) - SOLUTION_ROTATION),
  ).toBeLessThanOrEqual(ROTATION_TOLERANCE);
}

test("solves the first puzzle through the browser UI", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));

  await page.addInitScript(() => {
    let phaser: unknown;
    Object.defineProperty(window, "Phaser", {
      configurable: true,
      get: () => phaser,
      set: (value) => {
        phaser = value;
        const namespace = value as Record<string, unknown>;
        const Game = namespace.Game as new (...args: unknown[]) => unknown;
        namespace.Game = function (...args: unknown[]): object {
          const game = Reflect.construct(Game, args);
          Reflect.set(window, "__contraptionGame", game);
          return game;
        };
      },
    });
  });

  await page.goto("/");
  await page.bringToFront();
  const canvas = page.locator("#game-container canvas");
  const mode = page.locator("#mode-label");
  const simulation = page.locator("#simulation-button");

  await expect(canvas).toBeVisible();
  await expect(mode).toHaveText("Mode: Edit");
  await expect(simulation).toHaveText("Run");

  await placeSolutionRamps(page, canvas);
  expectSolutionTransforms(await readRampTransforms(page));
  await simulation.click();
  await expect(mode).toHaveText("Mode: Running");
  await expect(simulation).toHaveText("Pause");

  await simulation.click();
  await expect(mode).toHaveText("Mode: Paused");
  await expect(simulation).toHaveText("Run");

  await simulation.click();
  await expect(mode).toHaveText("Mode: Running");
  await page.getByRole("button", { name: "Reset" }).click();
  await expect(mode).toHaveText("Mode: Edit");
  await expect(simulation).toHaveText("Run");

  await placeSolutionRamps(page, canvas);
  const finalTransforms = await readRampTransforms(page);
  console.log("Final ramp transforms before Run:", finalTransforms);
  expectSolutionTransforms(finalTransforms);
  await page.screenshot({ path: "test-results/puzzle-before-run.png" });
  await simulation.click();
  try {
    await expect(mode).toHaveText("Mode: Success", { timeout: 10_000 });
  } catch (error) {
    await page.screenshot({ path: "test-results/puzzle-after-10s.png" });
    throw error;
  }
  await expect(simulation).toBeDisabled();
  expect(errors).toEqual([]);
});

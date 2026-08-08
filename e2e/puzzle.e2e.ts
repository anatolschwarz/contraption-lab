import { expect, test, type Locator, type Page } from "@playwright/test";

const INITIAL_RAMP = { x: 675, y: 280 };
const SOLUTION_RAMP = { x: 360, y: 280 };

async function gamePoint(canvas: Locator, point: { x: number; y: number }) {
  const box = await canvas.boundingBox();
  if (!box) throw new Error("Game canvas is not visible.");
  return {
    x: box.x + (point.x / 960) * box.width,
    y: box.y + (point.y / 540) * box.height,
  };
}

async function placeSolutionRamp(page: Page, canvas: Locator): Promise<void> {
  const start = await gamePoint(canvas, INITIAL_RAMP);
  const end = await gamePoint(canvas, SOLUTION_RAMP);
  await page.mouse.move(start.x, start.y);
  await page.mouse.down();
  await page.mouse.move(end.x, end.y, { steps: 12 });
  await page.mouse.up();
  await page.keyboard.press("E");
  await page.keyboard.press("E");
}

test("solves the first puzzle through the browser UI", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));

  await page.goto("/");
  const canvas = page.locator("#game-container canvas");
  const mode = page.locator("#mode-label");
  const simulation = page.locator("#simulation-button");

  await expect(canvas).toBeVisible();
  await expect(mode).toHaveText("Mode: Edit");
  await expect(simulation).toHaveText("Run");

  await placeSolutionRamp(page, canvas);
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

  await placeSolutionRamp(page, canvas);
  await simulation.click();
  await expect(mode).toHaveText("Mode: Success", { timeout: 10_000 });
  await expect(simulation).toBeDisabled();
  expect(errors).toEqual([]);
});

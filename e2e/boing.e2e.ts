import { expect, test, type Locator, type Page } from "@playwright/test";

async function gamePoint(canvas: Locator, point: { x: number; y: number }) {
  const box = await canvas.boundingBox();
  if (!box) throw new Error("Game canvas is not visible.");
  return {
    x: box.x + (point.x / 960) * box.width,
    y: box.y + (point.y / 540) * box.height,
  };
}

async function moveMattress(page: Page, canvas: Locator) {
  const start = await gamePoint(canvas, { x: 470, y: 110 });
  const end = await gamePoint(canvas, { x: 385, y: 430 });
  await page.mouse.move(start.x, start.y);
  await page.mouse.down();
  await page.mouse.move(end.x, end.y, { steps: 12 });
  await page.mouse.up();
}

test("opens and solves Boing with the Storybook Spring mattress", async ({
  page,
}) => {
  test.setTimeout(60_000);
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  await page.goto("/");
  const canvas = page.locator("#game-container canvas");
  await expect(canvas).toBeVisible();
  await page.getByRole("button", { name: "Settings" }).click();
  await page.getByLabel("Puzzle locking").check();
  await page.getByLabel("Unlock all puzzles").check();
  await page.locator("#puzzle-selector-button").click();
  await page.locator('[data-puzzle-id="boing-007"]').click();
  await expect(page.locator("#puzzle-title-label")).toHaveText("Boing");
  await expect
    .poll(() =>
      page.evaluate(() => {
        const scene =
          window.__contraptionLabTest?.getPrototypeScene() as unknown as {
            storybookEnvironment?: { texture: { key: string } };
            balls: Map<string, { sprite?: { texture: { key: string } } }>;
          };
        return {
          environment: scene?.storybookEnvironment?.texture.key,
          ball: scene?.balls.get("boing-marble")?.sprite?.texture.key,
        };
      }),
    )
    .toEqual({ environment: "storybook-corner-l2", ball: "storybook-marble" });
  if (!(await page.locator("#parts-palette").isVisible()))
    await page.locator("#parts-palette-toggle").click();
  await page.locator("#tray-mattress-button").click();
  await moveMattress(page, canvas);
  await expect
    .poll(() =>
      page.evaluate(() => {
        const scene =
          window.__contraptionLabTest?.getPrototypeScene() as unknown as {
            mattresses: Map<
              string,
              {
                shape: { x: number; y: number };
                sprite?: { texture: { key: string } };
              }
            >;
          };
        const mattress = scene?.mattresses.get("tray-mattress-1");
        return (
          mattress && {
            x: mattress.shape.x,
            y: mattress.shape.y,
            texture: mattress.sprite?.texture.key,
          }
        );
      }),
    )
    .toEqual({ x: 385, y: 430, texture: "storybook-mattress-idle" });
  await page.locator("#simulation-button").click();
  await expect(page.locator("#rerun-button")).toBeEnabled();
  await page.locator("#rerun-button").click();
  await expect
    .poll(() =>
      page.evaluate(() => {
        const scene =
          window.__contraptionLabTest?.getPrototypeScene() as unknown as {
            mattresses: Map<string, { shape: { x: number; y: number } }>;
          };
        const mattress = scene?.mattresses.get("tray-mattress-1");
        return mattress && { x: mattress.shape.x, y: mattress.shape.y };
      }),
    )
    .toEqual({ x: 385, y: 430 });
  await expect(page.locator("#mode-label")).toHaveText("Mode: Success", {
    timeout: 12_000,
  });
  await expect
    .poll(() =>
      page.evaluate(() => {
        const scene =
          window.__contraptionLabTest?.getPrototypeScene() as unknown as {
            storybookGoal?: { texture: { key: string } };
            storybookSparkle?: { texture: { key: string } };
          };
        return {
          goal: scene?.storybookGoal?.texture.key,
          sparkle: scene?.storybookSparkle?.texture.key,
        };
      }),
    )
    .toEqual({ goal: "storybook-teacup-goal", sparkle: "storybook-sparkle" });
  await page.getByRole("button", { name: "Reset" }).click();
  await expect(page.locator("#mode-label")).toHaveText("Mode: Edit");
  expect(errors).toEqual([]);
});

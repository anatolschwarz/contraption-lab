import { expect, test, type Locator, type Page } from "@playwright/test";

async function gamePoint(
  canvas: Locator,
  point: { x: number; y: number },
): Promise<{ x: number; y: number }> {
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
  from: { x: number; y: number },
  to: { x: number; y: number },
): Promise<void> {
  const start = await gamePoint(canvas, from);
  const end = await gamePoint(canvas, to);
  await page.mouse.move(start.x, start.y);
  await page.mouse.down();
  await page.mouse.move(end.x, end.y, { steps: 12 });
  await page.mouse.up();
}

test("opens and solves Good Morning, Marble with its Storybook Plank", async ({
  page,
}) => {
  test.setTimeout(60_000);
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  await page.goto("/");
  await page.bringToFront();
  const canvas = page.locator("#game-container canvas");
  await expect(canvas).toBeVisible();

  await page.getByRole("button", { name: "Settings" }).click();
  await page.getByLabel("Puzzle locking").check();
  await page.getByLabel("Unlock all puzzles").check();
  await page.locator("#puzzle-selector-button").click();
  await page.locator('[data-puzzle-id="good-morning-marble-006"]').click();
  await expect(page.locator("#puzzle-title-label")).toHaveText(
    "Good Morning, Marble",
  );

  await expect
    .poll(() =>
      page.evaluate(() => {
        const scene =
          window.__contraptionLabTest?.getPrototypeScene() as unknown as {
            balls: Map<string, { sprite?: { texture: { key: string } } }>;
            storybookEnvironment?: { texture: { key: string } };
            storybookGoal?: { texture: { key: string } };
          };
        return {
          ball: scene?.balls.get("morning-marble")?.sprite?.texture.key,
          environment: scene?.storybookEnvironment?.texture.key,
          goal: scene?.storybookGoal?.texture.key,
        };
      }),
    )
    .toEqual({
      ball: "storybook-marble",
      environment: "storybook-corner-l1",
      goal: "storybook-teacup-empty",
    });
  await expect
    .poll(() =>
      page.evaluate(() => {
        const scene =
          window.__contraptionLabTest?.getPrototypeScene() as unknown as {
            textures: {
              get: (key: string) => {
                getSourceImage: () => HTMLImageElement;
              };
            };
          };
        const alphaAtCorners = (textureKey: string): number[] => {
          const image = scene.textures.get(textureKey).getSourceImage();
          const canvas = document.createElement("canvas");
          canvas.width = image.width;
          canvas.height = image.height;
          const context = canvas.getContext("2d");
          if (!context) throw new Error("Canvas context is unavailable.");
          context.drawImage(image, 0, 0);
          const pixelAlpha = (x: number, y: number): number => {
            const alpha = context.getImageData(x, y, 1, 1).data[3];
            if (alpha === undefined) throw new Error("Alpha is unavailable.");
            return alpha;
          };
          return [
            pixelAlpha(0, 0),
            pixelAlpha(image.width - 1, 0),
            pixelAlpha(0, image.height - 1),
            pixelAlpha(image.width - 1, image.height - 1),
          ];
        };
        return [
          "storybook-marble",
          "storybook-plank",
          "storybook-teacup-empty",
          "storybook-teacup-goal",
          "storybook-sparkle",
        ].map((textureKey) => alphaAtCorners(textureKey));
      }),
    )
    .toEqual([
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]);
  if (!(await page.locator("#parts-palette").isVisible())) {
    await page.locator("#parts-palette-toggle").click();
  }
  await page.locator("#tray-ramp-button").click();
  await moveRamp(page, canvas, { x: 480, y: 110 }, { x: 475, y: 390 });
  await expect
    .poll(() =>
      page.evaluate(() => {
        const scene =
          window.__contraptionLabTest?.getPrototypeScene() as unknown as {
            ramps: Map<
              string,
              {
                shape: { rotation: number; x: number; y: number };
                sprite?: {
                  displayHeight: number;
                  displayWidth: number;
                  texture: { key: string };
                };
              }
            >;
          };
        const ramp = scene?.ramps.get("tray-ramp-1");
        return (
          ramp && {
            body: {
              rotation: ramp.shape.rotation,
              x: ramp.shape.x,
              y: ramp.shape.y,
            },
            sprite: {
              height: Math.round(ramp.sprite?.displayHeight ?? 0),
              texture: ramp.sprite?.texture.key,
              width: Math.round(ramp.sprite?.displayWidth ?? 0),
            },
          }
        );
      }),
    )
    .toEqual({
      body: { rotation: 0.26, x: 500, y: 353 },
      sprite: { height: 64, texture: "storybook-plank", width: 430 },
    });
  await page.locator("#simulation-button").click();
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
  await expect
    .poll(() =>
      page.evaluate(() => {
        const scene =
          window.__contraptionLabTest?.getPrototypeScene() as unknown as {
            ramps: Map<string, unknown>;
            storybookGoal?: { texture: { key: string } };
            storybookSparkle?: unknown;
          };
        return {
          goal: scene?.storybookGoal?.texture.key,
          rampCount: scene?.ramps.size,
          sparkle: Boolean(scene?.storybookSparkle),
        };
      }),
    )
    .toEqual({ goal: "storybook-teacup-empty", rampCount: 0, sparkle: false });
  expect(errors).toEqual([]);
});

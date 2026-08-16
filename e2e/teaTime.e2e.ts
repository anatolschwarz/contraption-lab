import { expect, test, type Page } from "@playwright/test";

async function openTeaTime(page: Page) {
  await page.goto("/");
  await expect(page.locator("#game-container canvas")).toBeVisible();
  await page.getByRole("button", { name: "Settings" }).click();
  await page.getByLabel("Puzzle locking").check();
  await page.getByLabel("Unlock all puzzles").check();
  await page.locator("#puzzle-selector-button").click();
  await page.locator('[data-puzzle-id="tea-time-008"]').click();
  await expect(page.locator("#puzzle-title-label")).toHaveText("Tea Time");
}

interface BrowserTeaTimeResult {
  contacts: string[][];
  goalReached: boolean;
  teapotVelocity?: { x: number; y: number };
}

async function runBrowserMatterTicks(
  page: Page,
  ticks: number,
): Promise<BrowserTeaTimeResult> {
  return page.evaluate((tickCount) => {
    const scene =
      window.__contraptionLabTest?.getPrototypeScene() as unknown as {
        matter: {
          world: {
            on: (
              event: string,
              callback: (event: {
                pairs: Array<{
                  bodyA: { label: string; velocity: { x: number; y: number } };
                  bodyB: { label: string; velocity: { x: number; y: number } };
                }>;
              }) => void,
            ) => void;
          };
        };
        setSimulationRunning: (running: boolean) => void;
        update: (time: number, delta: number) => void;
      };
    if (!scene) throw new Error("Prototype scene is unavailable.");

    const contacts: string[][] = [];
    let teapotVelocity: { x: number; y: number } | undefined;
    scene.matter.world.on("collisionstart", (event) => {
      for (const pair of event.pairs) {
        const labels = [pair.bodyA.label, pair.bodyB.label];
        contacts.push(labels);
        if (
          labels.includes("ball:tea-marble") &&
          labels.includes("teapot:tray-teapot-1")
        ) {
          const ball =
            pair.bodyA.label === "ball:tea-marble" ? pair.bodyA : pair.bodyB;
          teapotVelocity = { ...ball.velocity };
        }
      }
    });
    scene.setSimulationRunning(true);
    for (let tick = 0; tick < tickCount; tick += 1) {
      scene.update(0, 1000 / 60);
    }
    scene.setSimulationRunning(false);
    return {
      contacts,
      goalReached:
        document.querySelector("#mode-label")?.textContent === "Mode: Success",
      teapotVelocity,
    };
  }, ticks);
}

test("opens Parts below the controls and starts held Teapot placement", async ({
  page,
}) => {
  const canvas = page.locator("#game-container canvas");
  await openTeaTime(page);
  const controls = page.locator(".simulation-toolbar");
  const parts = page.locator("#parts-palette");
  if (await parts.isVisible())
    await page.locator("#parts-palette-toggle").click();
  const closedCanvasBox = await canvas.boundingBox();
  await page.locator("#parts-palette-toggle").click();
  await expect(parts).toBeVisible();
  const openCanvasBox = await canvas.boundingBox();
  const controlsBox = await controls.boundingBox();
  const partsBox = await parts.boundingBox();
  expect(openCanvasBox).toEqual(closedCanvasBox);
  expect(partsBox!.y).toBeGreaterThanOrEqual(
    controlsBox!.y + controlsBox!.height,
  );

  await page.locator("#tray-teapot-button").click();
  await expect
    .poll(() =>
      page.evaluate(() => {
        const state = window.__contraptionLabTest?.getGameState();
        const scene =
          window.__contraptionLabTest?.getPrototypeScene() as unknown as {
            teapots: Map<string, unknown>;
          };
        return {
          heldPlacement: state?.heldPlacement,
          trayRampCount: state?.trayRampCount,
          trayTeapotCount: state?.trayTeapotCount,
          runtimeTeapotCount: scene?.teapots.size,
        };
      }),
    )
    .toEqual({
      heldPlacement: {
        part: "teapot",
        id: "held-teapot-1",
        transform: { position: { x: 0, y: 0 }, rotation: 0 },
      },
      trayRampCount: 1,
      trayTeapotCount: 1,
      runtimeTeapotCount: 0,
    });
});

test("renders and moves a held Ramp preview without runtime registration", async ({
  page,
}) => {
  test.setTimeout(45_000);
  await openTeaTime(page);
  const parts = page.locator("#parts-palette");
  if (!(await parts.isVisible()))
    await page.locator("#parts-palette-toggle").click();
  const canvas = page.locator("#game-container canvas");
  const canvasBox = await canvas.boundingBox();
  if (!canvasBox) throw new Error("Tea Time canvas has no bounds.");

  const before = await page.evaluate(() => {
    const scene =
      window.__contraptionLabTest?.getPrototypeScene() as unknown as {
        contactObjects: Map<unknown, unknown>;
        matter: { world: { engine: { world: { bodies: unknown[] } } } };
      };
    return {
      contactCount: scene.contactObjects.size,
      matterBodyCount: scene.matter.world.engine.world.bodies.length,
    };
  });

  await page.locator("#tray-ramp-button").click();
  await expect
    .poll(() =>
      page.evaluate(() => {
        const state = window.__contraptionLabTest?.getGameState();
        const scene =
          window.__contraptionLabTest?.getPrototypeScene() as unknown as {
            contactObjects: Map<unknown, unknown>;
            heldPlacementVisual?: { x: number; y: number };
            matter: { world: { engine: { world: { bodies: unknown[] } } } };
            ramps: Map<string, unknown>;
            children: { list: Array<{ name: string }> };
          };
        return {
          contactCount: scene.contactObjects.size,
          heldPlacement: state?.heldPlacement,
          matterBodyCount: scene.matter.world.engine.world.bodies.length,
          previewCount: scene.children.list.filter((child) =>
            child.name.startsWith("held-placement:"),
          ).length,
          previewPosition: scene.heldPlacementVisual
            ? { x: scene.heldPlacementVisual.x, y: scene.heldPlacementVisual.y }
            : null,
          runtimeRampCount: scene.ramps.size,
          trayRampCount: state?.trayRampCount,
        };
      }),
    )
    .toMatchObject({
      contactCount: before.contactCount,
      heldPlacement: { part: "ramp" },
      matterBodyCount: before.matterBodyCount,
      previewCount: 1,
      runtimeRampCount: 0,
      trayRampCount: 1,
    });

  const target = { x: 540, y: 300 };
  const canvasCoordinateTolerance = 1;
  await canvas.hover({
    position: {
      x: (target.x / 960) * canvasBox.width,
      y: (target.y / 540) * canvasBox.height,
    },
  });
  await expect
    .poll(() =>
      page.evaluate((tolerance) => {
        const state = window.__contraptionLabTest?.getGameState();
        const heldPosition = state?.heldPlacement?.transform.position;
        const scene =
          window.__contraptionLabTest?.getPrototypeScene() as unknown as {
            heldPlacementVisual?: { x: number; y: number };
            children: { list: Array<{ name: string }> };
          };
        return {
          heldMatchesPreview:
            heldPosition !== undefined &&
            scene.heldPlacementVisual !== undefined &&
            Math.abs(heldPosition.x - scene.heldPlacementVisual.x) <= 0.01 &&
            Math.abs(heldPosition.y - scene.heldPlacementVisual.y) <= 0.01,
          heldWithinTargetTolerance:
            heldPosition !== undefined &&
            Math.abs(heldPosition.x - 540) <= tolerance &&
            Math.abs(heldPosition.y - 300) <= tolerance,
          previewCount: scene.children.list.filter((child) =>
            child.name.startsWith("held-placement:"),
          ).length,
          previewWithinTargetTolerance:
            scene.heldPlacementVisual !== undefined &&
            Math.abs(scene.heldPlacementVisual.x - 540) <= tolerance &&
            Math.abs(scene.heldPlacementVisual.y - 300) <= tolerance,
          trayRampCount: state?.trayRampCount,
        };
      }, canvasCoordinateTolerance),
    )
    .toEqual({
      heldMatchesPreview: true,
      heldWithinTargetTolerance: true,
      previewCount: 1,
      previewWithinTargetTolerance: true,
      trayRampCount: 1,
    });

  await page.evaluate(() =>
    window.__contraptionLabTest?.dispatchAction({
      type: "cancel-held-placement",
    }),
  );
  await expect
    .poll(() =>
      page.evaluate(() => {
        const state = window.__contraptionLabTest?.getGameState();
        const scene =
          window.__contraptionLabTest?.getPrototypeScene() as unknown as {
            children: { list: Array<{ name: string }> };
            ramps: Map<string, unknown>;
          };
        return {
          heldPlacement: state?.heldPlacement,
          previewCount: scene.children.list.filter((child) =>
            child.name.startsWith("held-placement:"),
          ).length,
          runtimeRampCount: scene.ramps.size,
          trayRampCount: state?.trayRampCount,
        };
      }),
    )
    .toEqual({
      heldPlacement: null,
      previewCount: 0,
      runtimeRampCount: 0,
      trayRampCount: 1,
    });
});

test("does not send the marble to the cup without a Teapot contact", async ({
  page,
}) => {
  await openTeaTime(page);

  await page.locator("#simulation-button").click();
  const result = await runBrowserMatterTicks(page, 600);

  expect(result.goalReached).toBe(false);
  expect(
    result.contacts.flat().some((label) => label.startsWith("teapot:")),
  ).toBe(false);
});

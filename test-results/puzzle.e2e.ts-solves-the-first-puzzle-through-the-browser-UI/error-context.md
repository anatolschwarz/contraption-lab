# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: puzzle.e2e.ts >> solves the first puzzle through the browser UI
- Location: e2e/puzzle.e2e.ts:26:1

# Error details

```
Error: expect(locator).toHaveText(expected) failed

Locator:  locator('#mode-label')
Expected: "Mode: Success"
Received: "Mode: Running"
Timeout:  10000ms

Call log:
  - Expect "toHaveText" with timeout 10000ms
  - waiting for locator('#mode-label')
    22 × locator resolved to <p id="mode-label" class="mode-label" aria-live="polite">Mode: Running</p>
       - unexpected value "Mode: Running"

```

```yaml
- paragraph: "Mode: Running"
```

# Test source

```ts
  1  | import { expect, test, type Locator, type Page } from "@playwright/test";
  2  | 
  3  | const INITIAL_RAMP = { x: 675, y: 280 };
  4  | const SOLUTION_RAMP = { x: 360, y: 280 };
  5  | 
  6  | async function gamePoint(canvas: Locator, point: { x: number; y: number }) {
  7  |   const box = await canvas.boundingBox();
  8  |   if (!box) throw new Error("Game canvas is not visible.");
  9  |   return {
  10 |     x: box.x + (point.x / 960) * box.width,
  11 |     y: box.y + (point.y / 540) * box.height,
  12 |   };
  13 | }
  14 | 
  15 | async function placeSolutionRamp(page: Page, canvas: Locator): Promise<void> {
  16 |   const start = await gamePoint(canvas, INITIAL_RAMP);
  17 |   const end = await gamePoint(canvas, SOLUTION_RAMP);
  18 |   await page.mouse.move(start.x, start.y);
  19 |   await page.mouse.down();
  20 |   await page.mouse.move(end.x, end.y, { steps: 12 });
  21 |   await page.mouse.up();
  22 |   await page.keyboard.press("E");
  23 |   await page.keyboard.press("E");
  24 | }
  25 | 
  26 | test("solves the first puzzle through the browser UI", async ({ page }) => {
  27 |   const errors: string[] = [];
  28 |   page.on("pageerror", (error) => errors.push(error.message));
  29 | 
  30 |   await page.goto("/");
  31 |   const canvas = page.locator("#game-container canvas");
  32 |   const mode = page.locator("#mode-label");
  33 |   const simulation = page.locator("#simulation-button");
  34 | 
  35 |   await expect(canvas).toBeVisible();
  36 |   await expect(mode).toHaveText("Mode: Edit");
  37 |   await expect(simulation).toHaveText("Run");
  38 | 
  39 |   await placeSolutionRamp(page, canvas);
  40 |   await simulation.click();
  41 |   await expect(mode).toHaveText("Mode: Running");
  42 |   await expect(simulation).toHaveText("Pause");
  43 | 
  44 |   await simulation.click();
  45 |   await expect(mode).toHaveText("Mode: Paused");
  46 |   await expect(simulation).toHaveText("Run");
  47 | 
  48 |   await simulation.click();
  49 |   await expect(mode).toHaveText("Mode: Running");
  50 |   await page.getByRole("button", { name: "Reset" }).click();
  51 |   await expect(mode).toHaveText("Mode: Edit");
  52 |   await expect(simulation).toHaveText("Run");
  53 | 
  54 |   await placeSolutionRamp(page, canvas);
  55 |   await simulation.click();
> 56 |   await expect(mode).toHaveText("Mode: Success", { timeout: 10_000 });
     |                      ^ Error: expect(locator).toHaveText(expected) failed
  57 |   await expect(simulation).toBeDisabled();
  58 |   expect(errors).toEqual([]);
  59 | });
  60 | 
```
import { expect, test } from "@playwright/test";

test("renders the mattress and teapot Storybook proof with independent bodies", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  await page.goto("/?storybookAssetProof=1");
  await expect(page.locator("#game-container canvas")).toBeVisible();

  await expect
    .poll(() =>
      page.evaluate(() => {
        const scene =
          window.__contraptionLabTest?.getPrototypeScene() as unknown as {
            storybookObjects?: Map<
              string,
              {
                body: {
                  body?: {
                    bounds?: {
                      max: { x: number; y: number };
                      min: { x: number; y: number };
                    };
                  };
                };
                definition: {
                  body: { height: number; width: number };
                  id: string;
                  part: string;
                  render: { height: number; width: number };
                };
                sprite: {
                  displayHeight: number;
                  displayWidth: number;
                  texture: { key: string };
                };
              }
            >;
          };
        if (!scene?.storybookObjects) return undefined;
        return [...scene.storybookObjects.values()].map((object) => ({
          bodyHeight: object.body.body?.bounds
            ? object.body.body.bounds.max.y - object.body.body.bounds.min.y
            : undefined,
          bodyWidth: object.body.body?.bounds
            ? object.body.body.bounds.max.x - object.body.body.bounds.min.x
            : undefined,
          id: object.definition.id,
          part: object.definition.part,
          renderHeight: Math.round(object.sprite.displayHeight),
          renderWidth: Math.round(object.sprite.displayWidth),
          textureKey: object.sprite.texture.key,
        }));
      }),
    )
    .toEqual([
      {
        bodyHeight: 48,
        bodyWidth: 144,
        id: "storybook-proof-mattress",
        part: "mattress",
        renderHeight: 94,
        renderWidth: 180,
        textureKey: "storybook-mattress-idle",
      },
      {
        bodyHeight: 72,
        bodyWidth: 112,
        id: "storybook-proof-teapot",
        part: "teapot",
        renderHeight: 142,
        renderWidth: 164,
        textureKey: "storybook-teapot-idle",
      },
    ]);

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
          alphaAtCorners("storybook-mattress-idle"),
          alphaAtCorners("storybook-teapot-idle"),
        ];
      }),
    )
    .toEqual([
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]);

  expect(errors).toEqual([]);
});

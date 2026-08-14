import { describe, expect, it } from "vitest";
import {
  getStorybookAsset,
  getStorybookAssetById,
} from "../src/game/storybookAssets";
import { STORYBOOK_ASSET_PROOF } from "../src/game/storybookObjectProof";
import {
  PART_REGISTRY,
  isContactTag,
  isInventoryPartKey,
  isStorybookPartKey,
} from "../src/levels/partRegistry";
import rawLevel from "../src/levels/prototype.json";
import { validateLevel } from "../src/levels/validateLevel";

describe("Storybook asset registry", () => {
  it("registers Storybook parts and the approved L1 presentation assets", () => {
    expect(isStorybookPartKey("mattress")).toBe(true);
    expect(isStorybookPartKey("teapot")).toBe(true);
    expect(isStorybookPartKey("cat")).toBe(false);
    expect(PART_REGISTRY.mattress.storybookAssetId).toBe("mattress_idle");
    expect(PART_REGISTRY.teapot.storybookAssetId).toBe("teapot_idle");
    expect(PART_REGISTRY.ball.storybookAssetId).toBe("marble");
    expect(PART_REGISTRY.ramp.storybookAssetId).toBe("plank");
    expect(getStorybookAssetById("corner_l1").source).toMatch(
      /environment\/corner_L1_v1\.png/,
    );
  });

  it("keeps rendering dimensions independent from explicit body geometry", () => {
    expect(STORYBOOK_ASSET_PROOF.map((object) => object.part)).toEqual([
      "mattress",
      "teapot",
    ]);
    for (const object of STORYBOOK_ASSET_PROOF) {
      expect(object.render).not.toEqual(object.body);
      expect(getStorybookAsset(object.part).source).toMatch(
        /docs\/design\/phase2\/reference-art\/part\//,
      );
    }
  });

  it("validates registered tags and rejects unknown keys", () => {
    expect(isInventoryPartKey("mattress")).toBe(true);
    expect(isContactTag("teapot")).toBe(true);
    expect(isInventoryPartKey("unknown")).toBe(false);
    expect(isContactTag("unknown")).toBe(false);
    expect(() =>
      validateLevel({
        ...rawLevel,
        inventory: { ...rawLevel.inventory, unknown: 0 },
      }),
    ).toThrow(/inventory/i);
  });
});

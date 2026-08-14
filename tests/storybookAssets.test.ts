import { describe, expect, it } from "vitest";
import { getStorybookAsset } from "../src/game/storybookAssets";
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
  it("registers only mattress and teapot as the first Storybook parts", () => {
    expect(isStorybookPartKey("mattress")).toBe(true);
    expect(isStorybookPartKey("teapot")).toBe(true);
    expect(isStorybookPartKey("cat")).toBe(false);
    expect(PART_REGISTRY.mattress.storybookAssetId).toBe("mattress_idle");
    expect(PART_REGISTRY.teapot.storybookAssetId).toBe("teapot_idle");
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

import type Phaser from "phaser";
import cornerL1Url from "../assets/storybook/corner_L1_v1.png";
import cornerL2Url from "../assets/storybook/corner_L2_v1.png";
import marbleUrl from "../assets/storybook/marble_v1.png";
import mattressIdleUrl from "../assets/storybook/mattress_idle_v1.png";
import plankUrl from "../assets/storybook/plank_v1.png";
import sparkleUrl from "../assets/storybook/sparkle_v1.png";
import teacupEmptyUrl from "../assets/storybook/teacup_empty_v1.png";
import teacupGoalUrl from "../assets/storybook/teacup_goal_v1.png";
import teapotIdleUrl from "../assets/storybook/teapot_idle_v1.png";
import {
  getStorybookAssetId,
  STORYBOOK_ASSET_IDS,
  type StorybookAssetId,
  type StorybookPartKey,
} from "../levels/partRegistry";

export interface StorybookAsset {
  readonly source: string;
  readonly textureKey: string;
  readonly url: string;
}

/** Runtime assets retain approved-art provenance; part/fx copies may be matte-processed. */
export const STORYBOOK_ASSETS: Record<StorybookAssetId, StorybookAsset> = {
  mattress_idle: {
    source: "docs/design/phase2/reference-art/part/mattress_idle_v1.png",
    textureKey: "storybook-mattress-idle",
    url: mattressIdleUrl,
  },
  teapot_idle: {
    source: "docs/design/phase2/reference-art/part/teapot_idle_v1.png",
    textureKey: "storybook-teapot-idle",
    url: teapotIdleUrl,
  },
  corner_l1: {
    source: "docs/design/phase2/reference-art/environment/corner_L1_v1.png",
    textureKey: "storybook-corner-l1",
    url: cornerL1Url,
  },
  corner_l2: {
    source: "docs/design/phase2/reference-art/environment/corner_L2_v1.png",
    textureKey: "storybook-corner-l2",
    url: cornerL2Url,
  },
  marble: {
    source: "docs/design/phase2/reference-art/part/marble_v1.png",
    textureKey: "storybook-marble",
    url: marbleUrl,
  },
  plank: {
    source: "docs/design/phase2/reference-art/part/plank_v1.png",
    textureKey: "storybook-plank",
    url: plankUrl,
  },
  teacup_empty: {
    source: "docs/design/phase2/reference-art/part/teacup_empty_v1.png",
    textureKey: "storybook-teacup-empty",
    url: teacupEmptyUrl,
  },
  teacup_goal: {
    source: "docs/design/phase2/reference-art/part/teacup_goal_v1.png",
    textureKey: "storybook-teacup-goal",
    url: teacupGoalUrl,
  },
  sparkle: {
    source: "docs/design/phase2/reference-art/fx/sparkle_v1.png",
    textureKey: "storybook-sparkle",
    url: sparkleUrl,
  },
};

export function preloadStorybookAssets(
  loader: Phaser.Loader.LoaderPlugin,
  assetIds: readonly StorybookAssetId[] = STORYBOOK_ASSET_IDS,
): void {
  for (const assetId of assetIds) {
    const asset = STORYBOOK_ASSETS[assetId];
    loader.image(asset.textureKey, asset.url);
  }
}

export function getStorybookAsset(partKey: StorybookPartKey): StorybookAsset {
  return STORYBOOK_ASSETS[getStorybookAssetId(partKey)];
}

export function getStorybookAssetById(
  assetId: StorybookAssetId,
): StorybookAsset {
  return STORYBOOK_ASSETS[assetId];
}

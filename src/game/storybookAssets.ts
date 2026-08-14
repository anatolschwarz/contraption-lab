import type Phaser from "phaser";
import mattressIdleUrl from "../assets/storybook/mattress_idle_v1.png";
import teapotIdleUrl from "../assets/storybook/teapot_idle_v1.png";
import {
  getStorybookAssetId,
  type StorybookAssetId,
  type StorybookPartKey,
} from "../levels/partRegistry";

export interface StorybookAsset {
  readonly source: string;
  readonly textureKey: string;
  readonly url: string;
}

/** Runtime copies retain the filenames and hashes of the approved reference art. */
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
};

export function preloadStorybookAssets(
  loader: Phaser.Loader.LoaderPlugin,
): void {
  for (const asset of Object.values(STORYBOOK_ASSETS)) {
    loader.image(asset.textureKey, asset.url);
  }
}

export function getStorybookAsset(partKey: StorybookPartKey): StorybookAsset {
  return STORYBOOK_ASSETS[getStorybookAssetId(partKey)];
}

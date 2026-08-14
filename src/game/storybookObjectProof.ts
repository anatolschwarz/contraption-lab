import type { RectangleDefinition } from "../levels/levelTypes";
import type { StorybookPartKey } from "../levels/partRegistry";

/**
 * A render-only proof fixture for the two next Chapter-1 parts. `render` and
 * `body` deliberately differ: artwork bounds never create Matter geometry.
 */
export interface StorybookObjectDefinition {
  readonly body: RectangleDefinition;
  readonly id: string;
  readonly part: StorybookPartKey;
  readonly render: RectangleDefinition;
}

export const STORYBOOK_ASSET_PROOF: readonly StorybookObjectDefinition[] = [
  {
    id: "storybook-proof-mattress",
    part: "mattress",
    render: { x: 230, y: 120, width: 180, height: 94 },
    body: { x: 230, y: 120, width: 144, height: 48 },
  },
  {
    id: "storybook-proof-teapot",
    part: "teapot",
    render: { x: 670, y: 120, width: 164, height: 142 },
    body: { x: 670, y: 120, width: 112, height: 72 },
  },
];

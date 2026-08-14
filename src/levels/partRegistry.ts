/**
 * The small, authoritative vocabulary for level-part identity.
 *
 * Adding a future Chapter-1 part belongs here instead of widening a closed
 * inventory shape or accepting unchecked strings from level JSON.
 */
export const STORYBOOK_ASSET_IDS = [
  "mattress_idle",
  "teapot_idle",
  "corner_l1",
  "corner_l2",
  "marble",
  "plank",
  "teacup_empty",
  "teacup_goal",
  "sparkle",
] as const;
export type StorybookAssetId = (typeof STORYBOOK_ASSET_IDS)[number];

interface PartRegistryEntry {
  readonly contactTag: string;
  readonly storybookAssetId: StorybookAssetId | undefined;
}

export const PART_REGISTRY = {
  ball: { contactTag: "ball", storybookAssetId: "marble" },
  bird: { contactTag: "bird", storybookAssetId: undefined },
  block: { contactTag: "block", storybookAssetId: undefined },
  ramp: { contactTag: "ramp", storybookAssetId: "plank" },
  mattress: { contactTag: "mattress", storybookAssetId: "mattress_idle" },
  teapot: { contactTag: "teapot", storybookAssetId: "teapot_idle" },
} as const satisfies Record<string, PartRegistryEntry>;

export type InventoryPartKey = keyof typeof PART_REGISTRY;
export type ContactTag =
  (typeof PART_REGISTRY)[InventoryPartKey]["contactTag"] | "floor" | "goal";
export type StorybookPartKey = {
  [
    Key in InventoryPartKey
  ]: (typeof PART_REGISTRY)[Key]["storybookAssetId"] extends StorybookAssetId
    ? Key
    : never;
}[InventoryPartKey];

/** Sparse level JSON inventory; omitted registered parts mean zero. */
export type InventoryDefinition = Partial<Record<InventoryPartKey, number>>;
/** Complete runtime inventory after missing level keys are normalized to zero. */
export type CompleteInventoryDefinition = Record<InventoryPartKey, number>;

export const INVENTORY_PART_KEYS = Object.keys(
  PART_REGISTRY,
) as InventoryPartKey[];
export const CONTACT_TAGS = [
  ...Object.values(PART_REGISTRY).map((part) => part.contactTag),
  "floor",
  "goal",
] as ContactTag[];

export function isInventoryPartKey(value: unknown): value is InventoryPartKey {
  return typeof value === "string" && value in PART_REGISTRY;
}

export function isContactTag(value: unknown): value is ContactTag {
  return (
    typeof value === "string" && CONTACT_TAGS.includes(value as ContactTag)
  );
}

export function isStorybookAssetId(value: unknown): value is StorybookAssetId {
  return (
    typeof value === "string" &&
    STORYBOOK_ASSET_IDS.includes(value as StorybookAssetId)
  );
}

export function isStorybookPartKey(value: unknown): value is StorybookPartKey {
  return (
    isInventoryPartKey(value) &&
    PART_REGISTRY[value].storybookAssetId !== undefined
  );
}

export function getStorybookAssetId(
  partKey: StorybookPartKey,
): StorybookAssetId {
  const assetId = PART_REGISTRY[partKey].storybookAssetId;
  if (!assetId) {
    throw new Error(`Part "${partKey}" has no Storybook asset.`);
  }
  return assetId;
}

export function createEmptyInventory(
  overrides: Readonly<InventoryDefinition> = {},
): CompleteInventoryDefinition {
  return INVENTORY_PART_KEYS.reduce<CompleteInventoryDefinition>(
    (inventory, key) => ({ ...inventory, [key]: overrides[key] ?? 0 }),
    {} as CompleteInventoryDefinition,
  );
}

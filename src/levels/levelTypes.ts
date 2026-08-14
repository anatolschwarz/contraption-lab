import type {
  ContactTag,
  InventoryDefinition as RegistryInventoryDefinition,
} from "./partRegistry";

export { CONTACT_TAGS } from "./partRegistry";
export type { CompleteInventoryDefinition, ContactTag } from "./partRegistry";

export interface Point {
  x: number;
  y: number;
}

export interface RectangleDefinition extends Point {
  width: number;
  height: number;
}

export type PartOwnership = "fixed" | "player";

export interface LevelPartDefinition extends RectangleDefinition {
  id: string;
  ownership: PartOwnership;
}

export interface RampDefinition extends LevelPartDefinition {
  rotation: number;
}

export interface BlockDefinition extends LevelPartDefinition {
  /**
   * When true, the Block participates as a Matter dynamic rigid body that can
   * rotate/topple and transfer motion. Omitted or false keeps the historical
   * static Block behavior, so existing levels are unchanged.
   */
  dynamic?: boolean;
  /**
   * Initial rotation in radians (same convention as {@link RampDefinition}).
   * Omitted means an upright, axis-aligned Block (0). This is explicit
   * gameplay geometry and is independent of any artwork silhouette.
   */
  rotation?: number;
}

export interface BallDefinition extends Point {
  id: string;
  initiallyPlaced?: boolean;
  radius: number;
  ownership: PartOwnership;
}

export type InventoryDefinition = RegistryInventoryDefinition;

export const PUZZLE_DIFFICULTIES = ["Basic", "Medium", "Hard"] as const;
export type PuzzleDifficulty = (typeof PUZZLE_DIFFICULTIES)[number];

export interface ContactParticipantByRole {
  type: "contact";
  index: 0 | 1;
}

export interface ContactParticipantById {
  type: "id";
  id: string;
}

export type ContactParticipantSelector =
  ContactParticipantByRole | ContactParticipantById;

/** A legacy tag target is retained for existing destroy-rule JSON. */
export type ContactActionTarget = ContactTag | ContactParticipantSelector;

export interface DestroyContactAction {
  type: "destroy";
  target: ContactActionTarget;
}

export interface ImpulseContactAction {
  type: "impulse";
  target: ContactParticipantSelector;
  impulse: Point;
}

export interface RedirectContactAction {
  type: "redirect";
  target: ContactParticipantSelector;
  direction: Point;
}

export type ContactAction =
  DestroyContactAction | ImpulseContactAction | RedirectContactAction;

export interface ParticipantIdContactCondition {
  type: "participant-id";
  target: ContactParticipantSelector;
  equals: string;
}

export type ContactCondition = ParticipantIdContactCondition;

export interface ContactRule {
  contacts: [ContactTag, ContactTag];
  conditions?: ContactCondition[];
  action: ContactAction;
}

export type ActorTag = "bird";
export type PatrolAxis = "horizontal" | "vertical";

export interface PatrolMovementDefinition {
  type: "patrol";
  axis: PatrolAxis;
  speed: number;
  min: number;
  max: number;
  direction: -1 | 1;
}

export interface ActorDefinition extends RectangleDefinition {
  id: string;
  initiallyPlaced?: boolean;
  ownership: PartOwnership;
  tag: ActorTag;
  movement: PatrolMovementDefinition;
}

export function isPlayerPart(
  definition: Readonly<Pick<LevelPartDefinition, "ownership">>,
): boolean {
  return definition.ownership === "player";
}

export function isEditablePart(
  definition: Readonly<Pick<LevelPartDefinition, "ownership">>,
  fromTray: boolean,
): boolean {
  return fromTray || isPlayerPart(definition);
}

export interface LevelDefinition {
  id: string;
  levelName: string;
  title: string;
  difficulty: PuzzleDifficulty;
  order: number;
  timeLimitSeconds?: number;
  inventory: InventoryDefinition;
  contactRules: ContactRule[];
  actors: ActorDefinition[];
  balls: BallDefinition[];
  ramps: RampDefinition[];
  blocks: BlockDefinition[];
  floor: RectangleDefinition;
  goal: RectangleDefinition;
  gravity: Point;
}

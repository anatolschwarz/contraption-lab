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

export type BlockDefinition = LevelPartDefinition;

export interface BallDefinition extends Point {
  id: string;
  initiallyPlaced?: boolean;
  radius: number;
  ownership: PartOwnership;
}

export interface InventoryDefinition {
  ball: number;
  bird: number;
  block: number;
  ramp: number;
}

export const PUZZLE_DIFFICULTIES = ["Basic", "Medium", "Hard"] as const;
export type PuzzleDifficulty = (typeof PUZZLE_DIFFICULTIES)[number];

export const CONTACT_TAGS = [
  "ball",
  "goal",
  "floor",
  "ramp",
  "block",
  "bird",
] as const;

export type ContactTag = (typeof CONTACT_TAGS)[number];

export interface DestroyContactAction {
  type: "destroy";
  target: ContactTag;
}

export interface ContactRule {
  contacts: [ContactTag, ContactTag];
  action: DestroyContactAction;
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

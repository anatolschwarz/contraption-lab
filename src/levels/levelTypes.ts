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

export function isPlayerPart(
  definition: Readonly<LevelPartDefinition>,
): boolean {
  return definition.ownership === "player";
}

export function isEditablePart(
  definition: Readonly<LevelPartDefinition>,
  fromTray: boolean,
): boolean {
  return fromTray || isPlayerPart(definition);
}

export interface LevelDefinition {
  id: string;
  title: string;
  ball: Point & { radius: number };
  ramps: RampDefinition[];
  blocks: BlockDefinition[];
  floor: RectangleDefinition;
  goal: RectangleDefinition;
  gravity: Point;
}

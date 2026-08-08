export interface Point {
  x: number;
  y: number;
}

export interface RectangleDefinition extends Point {
  width: number;
  height: number;
}

export interface RampDefinition extends RectangleDefinition {
  id: string;
  rotation: number;
}

export interface BlockDefinition extends RectangleDefinition {
  id: string;
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

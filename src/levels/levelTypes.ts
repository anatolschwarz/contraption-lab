export interface Point {
  x: number;
  y: number;
}

export interface RectangleDefinition extends Point {
  width: number;
  height: number;
}

export interface LevelDefinition {
  id: string;
  title: string;
  ball: Point & { radius: number };
  ramp: RectangleDefinition & { rotation: number };
  floor: RectangleDefinition;
  goal: RectangleDefinition;
  gravity: Point;
}

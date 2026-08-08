import type {
  BlockDefinition,
  LevelDefinition,
  Point,
  RampDefinition,
  RectangleDefinition,
} from "./levelTypes";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

function isPoint(value: unknown): value is Point {
  return isRecord(value) && isFiniteNumber(value.x) && isFiniteNumber(value.y);
}

function isRectangle(value: unknown): value is RectangleDefinition {
  if (!isRecord(value) || !isPoint(value)) return false;
  return (
    isFiniteNumber(value.width) &&
    value.width > 0 &&
    isFiniteNumber(value.height) &&
    value.height > 0
  );
}

const isBall = (value: unknown): value is LevelDefinition["ball"] =>
  isRecord(value) &&
  isPoint(value) &&
  isFiniteNumber(value.radius) &&
  value.radius > 0;

const isRamp = (value: unknown): value is RampDefinition =>
  isRecord(value) &&
  isRectangle(value) &&
  typeof value.id === "string" &&
  value.id.trim() !== "" &&
  (value.ownership === "fixed" || value.ownership === "player") &&
  isFiniteNumber(value.rotation);

const isBlock = (value: unknown): value is BlockDefinition =>
  isRecord(value) &&
  isRectangle(value) &&
  typeof value.id === "string" &&
  value.id.trim() !== "" &&
  (value.ownership === "fixed" || value.ownership === "player");

export function validateLevel(value: unknown): LevelDefinition {
  if (!isRecord(value)) {
    throw new Error("Level data must be an object.");
  }

  const { id, title, ball, ramps, blocks, floor, goal, gravity } = value;
  if (typeof id !== "string" || id.trim() === "") {
    throw new Error("Level id must be a non-empty string.");
  }
  if (typeof title !== "string" || title.trim() === "") {
    throw new Error("Level title must be a non-empty string.");
  }
  if (!isBall(ball)) {
    throw new Error("Level ball must have finite x/y and a positive radius.");
  }
  if (!Array.isArray(ramps) || ramps.length < 2 || !ramps.every(isRamp)) {
    throw new Error(
      "Level ramps must contain at least two valid ramps with ids.",
    );
  }
  if (new Set(ramps.map((ramp) => ramp.id)).size !== ramps.length) {
    throw new Error("Level ramp ids must be unique.");
  }
  if (!Array.isArray(blocks) || blocks.length < 1 || !blocks.every(isBlock)) {
    throw new Error(
      "Level blocks must contain at least one valid block with an id.",
    );
  }
  if (new Set(blocks.map((block) => block.id)).size !== blocks.length) {
    throw new Error("Level block ids must be unique.");
  }
  if (
    new Set([...ramps, ...blocks].map((component) => component.id)).size !==
    ramps.length + blocks.length
  ) {
    throw new Error("Level editable component ids must be unique.");
  }
  if (!isRectangle(floor)) {
    throw new Error("Level floor must be a valid rectangle.");
  }
  if (!isRectangle(goal)) {
    throw new Error("Level goal must be a valid rectangle.");
  }
  if (!isPoint(gravity)) {
    throw new Error("Level gravity must have finite x/y values.");
  }

  return { id, title, ball, ramps, blocks, floor, goal, gravity };
}

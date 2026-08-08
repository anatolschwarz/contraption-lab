import type {
  BlockDefinition,
  ContactRule,
  ContactTag,
  InventoryDefinition,
  LevelDefinition,
  Point,
  RampDefinition,
  RectangleDefinition,
} from "./levelTypes";
import { CONTACT_TAGS } from "./levelTypes";

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

const isInventory = (value: unknown): value is InventoryDefinition =>
  isRecord(value) &&
  isFiniteNumber(value.block) &&
  Number.isInteger(value.block) &&
  value.block >= 0 &&
  isFiniteNumber(value.ramp) &&
  Number.isInteger(value.ramp) &&
  value.ramp >= 0;

const isContactTag = (value: unknown): value is ContactTag =>
  typeof value === "string" && CONTACT_TAGS.includes(value as ContactTag);

function validateContactRules(value: unknown): ContactRule[] {
  if (!Array.isArray(value)) {
    throw new Error("Level contactRules must be an array.");
  }
  return value.map((rule, index) => {
    if (!isRecord(rule) || !Array.isArray(rule.contacts)) {
      throw new Error(`Level contact rule ${index} must define contacts.`);
    }
    const [firstTag, secondTag] = rule.contacts;
    if (
      rule.contacts.length !== 2 ||
      !isContactTag(firstTag) ||
      !isContactTag(secondTag) ||
      firstTag === secondTag
    ) {
      throw new Error(
        `Level contact rule ${index} must name two different known contact tags.`,
      );
    }
    if (!isRecord(rule.action) || rule.action.type !== "destroy") {
      throw new Error(
        `Level contact rule ${index} has an unknown or invalid action.`,
      );
    }
    if (!isContactTag(rule.action.target)) {
      throw new Error(
        `Level contact rule ${index} has an unknown destroy target tag.`,
      );
    }
    if (rule.action.target !== firstTag && rule.action.target !== secondTag) {
      throw new Error(
        `Level contact rule ${index} must destroy one of its contact tags.`,
      );
    }
    return {
      contacts: [firstTag, secondTag],
      action: { type: "destroy", target: rule.action.target },
    };
  });
}

export function validateLevel(value: unknown): LevelDefinition {
  if (!isRecord(value)) {
    throw new Error("Level data must be an object.");
  }

  const {
    id,
    title,
    inventory,
    contactRules,
    ball,
    ramps,
    blocks,
    floor,
    goal,
    gravity,
  } = value;
  if (typeof id !== "string" || id.trim() === "") {
    throw new Error("Level id must be a non-empty string.");
  }
  if (typeof title !== "string" || title.trim() === "") {
    throw new Error("Level title must be a non-empty string.");
  }
  if (!isInventory(inventory)) {
    throw new Error(
      "Level inventory must define non-negative integer block and ramp counts.",
    );
  }
  const validatedContactRules = validateContactRules(contactRules);
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

  return {
    id,
    title,
    inventory,
    contactRules: validatedContactRules,
    ball,
    ramps,
    blocks,
    floor,
    goal,
    gravity,
  };
}

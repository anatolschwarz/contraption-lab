import type {
  ActorDefinition,
  BallDefinition,
  BlockDefinition,
  ContactRule,
  ContactTag,
  InventoryDefinition,
  LevelDefinition,
  Point,
  PuzzleDifficulty,
  RampDefinition,
  RectangleDefinition,
} from "./levelTypes";
import { CONTACT_TAGS, PUZZLE_DIFFICULTIES } from "./levelTypes";

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

const isBall = (value: unknown): value is BallDefinition =>
  isRecord(value) &&
  isPoint(value) &&
  typeof value.id === "string" &&
  value.id.trim() !== "" &&
  (value.initiallyPlaced === undefined ||
    typeof value.initiallyPlaced === "boolean") &&
  (value.ownership === "fixed" || value.ownership === "player") &&
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
  isFiniteNumber(value.ball) &&
  Number.isInteger(value.ball) &&
  value.ball >= 0 &&
  isFiniteNumber(value.block) &&
  Number.isInteger(value.block) &&
  value.block >= 0 &&
  isFiniteNumber(value.ramp) &&
  Number.isInteger(value.ramp) &&
  value.ramp >= 0;

const isTimeLimitSeconds = (value: unknown): value is number =>
  isFiniteNumber(value) && value > 0;

function validateActors(value: unknown): ActorDefinition[] {
  if (!Array.isArray(value)) {
    throw new Error("Level actors must be an array.");
  }
  const actors = value.map((actor, index) => {
    if (
      !isRecord(actor) ||
      !isRectangle(actor) ||
      typeof actor.id !== "string" ||
      actor.id.trim() === "" ||
      actor.tag !== "bird" ||
      !isRecord(actor.movement)
    ) {
      throw new Error(`Level actor ${index} must be a valid bird definition.`);
    }
    const { movement } = actor;
    if (
      movement.type !== "patrol" ||
      (movement.axis !== "horizontal" && movement.axis !== "vertical") ||
      !isFiniteNumber(movement.speed) ||
      movement.speed <= 0 ||
      !isFiniteNumber(movement.min) ||
      !isFiniteNumber(movement.max) ||
      movement.min >= movement.max ||
      (movement.direction !== -1 && movement.direction !== 1)
    ) {
      throw new Error(`Level actor ${index} has an invalid patrol movement.`);
    }
    const patrolPosition = movement.axis === "horizontal" ? actor.x : actor.y;
    const halfExtent =
      movement.axis === "horizontal" ? actor.width / 2 : actor.height / 2;
    const playfieldLimit = movement.axis === "horizontal" ? 960 : 540;
    if (
      patrolPosition < movement.min ||
      patrolPosition > movement.max ||
      movement.min < halfExtent ||
      movement.max > playfieldLimit - halfExtent
    ) {
      throw new Error(
        `Level actor ${index} patrol bounds must contain the actor inside the playfield.`,
      );
    }
    const tag: ActorDefinition["tag"] = actor.tag;
    const axis: ActorDefinition["movement"]["axis"] = movement.axis;
    const direction: ActorDefinition["movement"]["direction"] =
      movement.direction;
    return {
      id: actor.id,
      tag,
      x: actor.x,
      y: actor.y,
      width: actor.width,
      height: actor.height,
      movement: {
        type: "patrol" as const,
        axis,
        speed: movement.speed,
        min: movement.min,
        max: movement.max,
        direction,
      },
    };
  });
  if (new Set(actors.map((actor) => actor.id)).size !== actors.length) {
    throw new Error("Level actor ids must be unique.");
  }
  return actors;
}

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
    difficulty,
    order,
    timeLimitSeconds,
    inventory,
    contactRules,
    actors,
    balls,
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
  if (!PUZZLE_DIFFICULTIES.includes(difficulty as PuzzleDifficulty)) {
    throw new Error("Level difficulty must be Basic, Medium, or Hard.");
  }
  if (!isFiniteNumber(order) || !Number.isInteger(order) || order < 1) {
    throw new Error("Level order must be a positive integer.");
  }
  if (timeLimitSeconds !== undefined && !isTimeLimitSeconds(timeLimitSeconds)) {
    throw new Error("Level timeLimitSeconds must be a positive finite number.");
  }
  if (!isInventory(inventory)) {
    throw new Error(
      "Level inventory must define non-negative integer ball, block, and ramp counts.",
    );
  }
  const validatedContactRules = validateContactRules(contactRules);
  const validatedActors = validateActors(actors);
  if (!Array.isArray(balls) || balls.length < 1 || !balls.every(isBall)) {
    throw new Error(
      "Level balls must contain valid definitions with ids, ownership, finite x/y, and positive radii.",
    );
  }
  if (new Set(balls.map((ball) => ball.id)).size !== balls.length) {
    throw new Error("Level Ball ids must be unique.");
  }
  for (const ball of balls) {
    if (ball.ownership === "fixed" && ball.initiallyPlaced === false) {
      throw new Error("A fixed Ball must be initially placed.");
    }
  }
  const unplacedPlayerBalls = balls.filter(
    (ball) => ball.ownership === "player" && ball.initiallyPlaced === false,
  );
  if (inventory.ball !== unplacedPlayerBalls.length) {
    throw new Error(
      "Ball inventory must equal the number of initially unplaced player-owned Balls.",
    );
  }
  if (!Array.isArray(ramps) || !ramps.every(isRamp)) {
    throw new Error("Level ramps must be an array of valid ramps with ids.");
  }
  if (new Set(ramps.map((ramp) => ramp.id)).size !== ramps.length) {
    throw new Error("Level ramp ids must be unique.");
  }
  if (!Array.isArray(blocks) || !blocks.every(isBlock)) {
    throw new Error("Level blocks must be an array of valid blocks with ids.");
  }
  if (new Set(blocks.map((block) => block.id)).size !== blocks.length) {
    throw new Error("Level block ids must be unique.");
  }
  if (
    new Set([
      ...balls.map((ball) => ball.id),
      ...ramps.map((ramp) => ramp.id),
      ...blocks.map((block) => block.id),
    ]).size !==
    ramps.length + blocks.length + balls.length
  ) {
    throw new Error("Level component ids must be unique.");
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
    difficulty: difficulty as PuzzleDifficulty,
    order,
    ...(timeLimitSeconds === undefined ? {} : { timeLimitSeconds }),
    inventory,
    contactRules: validatedContactRules,
    actors: validatedActors,
    balls,
    ramps,
    blocks,
    floor,
    goal,
    gravity,
  };
}

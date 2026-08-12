import type {
  ActorDefinition,
  BallDefinition,
  BlockDefinition,
  ContactAction,
  ContactActionTarget,
  ContactCondition,
  ContactParticipantSelector,
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
  isFiniteNumber(value.bird) &&
  Number.isInteger(value.bird) &&
  value.bird >= 0 &&
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
      (actor.ownership !== "fixed" && actor.ownership !== "player") ||
      (actor.initiallyPlaced !== undefined &&
        typeof actor.initiallyPlaced !== "boolean") ||
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
    const ownership: ActorDefinition["ownership"] = actor.ownership;
    const axis: ActorDefinition["movement"]["axis"] = movement.axis;
    const direction: ActorDefinition["movement"]["direction"] =
      movement.direction;
    return {
      id: actor.id,
      ...(actor.initiallyPlaced === undefined
        ? {}
        : { initiallyPlaced: actor.initiallyPlaced }),
      ownership,
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

function validateContactParticipantSelector(
  value: unknown,
): ContactParticipantSelector | undefined {
  if (!isRecord(value)) return undefined;
  if (value.type === "contact" && (value.index === 0 || value.index === 1)) {
    return { type: "contact", index: value.index };
  }
  if (
    value.type === "id" &&
    typeof value.id === "string" &&
    value.id.trim() !== ""
  ) {
    return { type: "id", id: value.id };
  }
  return undefined;
}

function validateContactActionTarget(
  value: unknown,
  contacts: readonly [ContactTag, ContactTag],
): ContactActionTarget | undefined {
  if (isContactTag(value)) {
    return contacts[0] !== contacts[1] && contacts.includes(value)
      ? value
      : undefined;
  }
  return validateContactParticipantSelector(value);
}

function validateContactConditions(
  value: unknown,
): ContactCondition[] | undefined {
  if (value === undefined) return [];
  if (!Array.isArray(value)) return undefined;
  const conditions: ContactCondition[] = [];
  for (const condition of value) {
    if (!isRecord(condition) || condition.type !== "participant-id") {
      return undefined;
    }
    const target = validateContactParticipantSelector(condition.target);
    if (
      !target ||
      typeof condition.equals !== "string" ||
      condition.equals.trim() === ""
    ) {
      return undefined;
    }
    conditions.push({
      type: "participant-id",
      target,
      equals: condition.equals,
    });
  }
  return conditions;
}

function validateContactAction(
  value: unknown,
  contacts: readonly [ContactTag, ContactTag],
): ContactAction | undefined {
  if (!isRecord(value)) return undefined;
  const target = validateContactActionTarget(value.target, contacts);
  if (!target) return undefined;
  if (value.type === "destroy") {
    return { type: "destroy", target };
  }
  const selector = validateContactParticipantSelector(value.target);
  if (!selector) return undefined;
  if (value.type === "impulse" && isPoint(value.impulse)) {
    return { type: "impulse", target: selector, impulse: value.impulse };
  }
  if (
    value.type === "redirect" &&
    isPoint(value.direction) &&
    (value.direction.x !== 0 || value.direction.y !== 0)
  ) {
    return { type: "redirect", target: selector, direction: value.direction };
  }
  return undefined;
}

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
      !isContactTag(secondTag)
    ) {
      throw new Error(
        `Level contact rule ${index} must name two known contact tags.`,
      );
    }
    const contacts: [ContactTag, ContactTag] = [firstTag, secondTag];
    if (
      isRecord(rule.action) &&
      rule.action.type === "destroy" &&
      isContactTag(rule.action.target) &&
      !contacts.includes(rule.action.target)
    ) {
      throw new Error(
        `Level contact rule ${index} must destroy one of its contact tags.`,
      );
    }
    const action = validateContactAction(rule.action, contacts);
    if (!action) {
      throw new Error(
        `Level contact rule ${index} has an unknown or invalid action.`,
      );
    }
    if (
      action.type === "destroy" &&
      typeof action.target === "string" &&
      !contacts.includes(action.target)
    ) {
      throw new Error(
        `Level contact rule ${index} must destroy one of its contact tags.`,
      );
    }
    const conditions = validateContactConditions(rule.conditions);
    if (!conditions) {
      throw new Error(
        `Level contact rule ${index} has an unknown or invalid condition.`,
      );
    }
    return {
      contacts,
      ...(conditions.length === 0 ? {} : { conditions }),
      action,
    };
  });
}

export function validateLevel(value: unknown): LevelDefinition {
  if (!isRecord(value)) {
    throw new Error("Level data must be an object.");
  }

  const {
    id,
    levelName,
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
  if (typeof levelName !== "string" || levelName.trim() === "") {
    throw new Error("Level levelName must be a non-empty string.");
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
      "Level inventory must define non-negative integer ball, bird, block, and ramp counts.",
    );
  }
  const validatedContactRules = validateContactRules(contactRules);
  const validatedActors = validateActors(actors);
  for (const actor of validatedActors) {
    if (actor.ownership === "fixed" && actor.initiallyPlaced === false) {
      throw new Error("A fixed Bird must be initially placed.");
    }
  }
  const unplacedPlayerBirds = validatedActors.filter(
    (actor) => actor.ownership === "player" && actor.initiallyPlaced === false,
  );
  if (inventory.bird !== unplacedPlayerBirds.length) {
    throw new Error(
      "Bird inventory must equal the number of initially unplaced player-owned Birds.",
    );
  }
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
      ...validatedActors.map((actor) => actor.id),
      ...ramps.map((ramp) => ramp.id),
      ...blocks.map((block) => block.id),
    ]).size !==
    ramps.length + blocks.length + balls.length + validatedActors.length
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
    levelName,
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

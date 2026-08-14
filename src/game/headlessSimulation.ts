import bundledMatter from "phaser/src/physics/matter-js/CustomMain.js";
import {
  COLLISION_ACTOR_BODY_OPTIONS,
  getPatrolVelocity,
  resolvePatrolDirection,
  type PatrolState,
} from "./autonomousActors";
import {
  addContactVectors,
  executeContactRules,
  redirectVelocity,
  type ContactParticipant,
} from "./contactRules";
import { SIMULATION_STEP_MS } from "./simulationClock";
import type {
  ActorDefinition,
  ContactTag,
  LevelDefinition,
  RampDefinition,
} from "../levels/levelTypes";

interface MatterVector {
  x: number;
  y: number;
}

interface MatterBody {
  readonly position: MatterVector;
  readonly velocity: MatterVector;
  readonly angle: number;
  ignoreGravity: boolean;
}

interface MatterCollisionPair {
  bodyA: MatterBody;
  bodyB: MatterBody;
}

interface MatterCollisionEvent {
  pairs: readonly MatterCollisionPair[];
}

interface MatterEngine {
  gravity: MatterVector & { scale: number };
  world: object;
}

interface MatterApi {
  Bodies: {
    circle(
      x: number,
      y: number,
      radius: number,
      options: Readonly<Record<string, unknown>>,
    ): MatterBody;
    rectangle(
      x: number,
      y: number,
      width: number,
      height: number,
      options: Readonly<Record<string, unknown>>,
    ): MatterBody;
  };
  Body: {
    setAngle(body: MatterBody, angle: number): void;
    setVelocity(body: MatterBody, velocity: MatterVector): void;
  };
  Engine: {
    create(): MatterEngine;
    update(engine: MatterEngine, delta: number): MatterEngine;
  };
  Events: {
    on(
      object: MatterEngine,
      eventName: "collisionStart",
      callback: (event: MatterCollisionEvent) => void,
    ): void;
  };
  World: {
    add(world: object, bodies: MatterBody | readonly MatterBody[]): void;
    remove(world: object, body: MatterBody): void;
  };
}

const Matter = bundledMatter as MatterApi;

export const DEFAULT_HEADLESS_MAX_TICKS = 60 * 30;

export interface SimulationRampPlacement {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
}

export interface SimulationPlacements {
  ramps?: readonly SimulationRampPlacement[];
}

export interface SimulationOptions {
  maxTicks?: number;
}

export type SimulationEvent =
  | {
      type: "contact";
      tick: number;
      participants: readonly [string, string];
    }
  | { type: "destroy"; tick: number; participant: string }
  | {
      type: "impulse";
      tick: number;
      participant: string;
      impulse: MatterVector;
    }
  | {
      type: "redirect";
      tick: number;
      participant: string;
      direction: MatterVector;
    }
  | { type: "goal"; tick: number; ballId: string }
  | { type: "max-ticks"; tick: number };

export interface SimulationBodyState {
  id: string;
  tag: ContactTag;
  x: number;
  y: number;
  angle: number;
}

export interface SimulationResult {
  solved: boolean;
  ticks: number;
  events: readonly SimulationEvent[];
  /**
   * Terminal transform of every body still present at the end of the run, in
   * registration order. Lets headless verification assert dynamic outcomes such
   * as a Block's toppling angle or motion transferred to a neighbour, and makes
   * deterministic replay checkable via a single structural comparison.
   */
  bodies: readonly SimulationBodyState[];
}

interface RegisteredBody extends ContactParticipant {
  body: MatterBody;
  id: string;
  tag: ContactTag;
}

interface SimulatedActor {
  body: MatterBody;
  definition: ActorDefinition;
  patrol: PatrolState;
}

type RampBodyDefinition = Pick<
  RampDefinition,
  "height" | "id" | "rotation" | "width" | "x" | "y"
>;

function createRampBody(definition: Readonly<RampBodyDefinition>): MatterBody {
  const body = Matter.Bodies.rectangle(
    definition.x,
    definition.y,
    definition.width,
    definition.height,
    { isStatic: true, label: `ramp:${definition.id}` },
  );
  Matter.Body.setAngle(body, definition.rotation);
  return body;
}

function getEffectiveRamps(
  level: Readonly<LevelDefinition>,
  placements: Readonly<SimulationPlacements>,
): SimulationRampPlacement[] {
  const placedById = new Map(
    placements.ramps?.map((placement) => [placement.id, placement]) ?? [],
  );
  const ramps = level.ramps.map((ramp) => placedById.get(ramp.id) ?? ramp);
  for (const placement of placements.ramps ?? []) {
    if (!level.ramps.some((ramp) => ramp.id === placement.id)) {
      ramps.push(placement);
    }
  }
  return ramps;
}

function participantLabel(participant: Readonly<RegisteredBody>): string {
  return `${participant.tag}:${participant.id}`;
}

function orderedParticipants(
  first: Readonly<RegisteredBody>,
  second: Readonly<RegisteredBody>,
): readonly [string, string] {
  const labels = [participantLabel(first), participantLabel(second)].sort();
  return [labels[0]!, labels[1]!];
}

/**
 * Runs the bundled Phaser Matter engine at the same fixed 60 Hz step used by
 * PrototypeScene, without creating Phaser game objects, a canvas, or a DOM.
 */
export function simulate(
  level: Readonly<LevelDefinition>,
  placements: Readonly<SimulationPlacements> = {},
  options: Readonly<SimulationOptions> = {},
): SimulationResult {
  const maxTicks = options.maxTicks ?? DEFAULT_HEADLESS_MAX_TICKS;
  if (!Number.isInteger(maxTicks) || maxTicks < 0) {
    throw new Error("Simulation maxTicks must be a non-negative integer.");
  }

  const engine = Matter.Engine.create();
  engine.gravity.x = level.gravity.x;
  engine.gravity.y = level.gravity.y;
  const bodies = new Map<MatterBody, RegisteredBody>();
  const actors: SimulatedActor[] = [];
  const events: SimulationEvent[] = [];
  let solved = false;
  let tick = 0;

  const register = (
    body: MatterBody,
    tag: ContactTag,
    id: string,
  ): RegisteredBody => {
    const participant: RegisteredBody = {
      body,
      id,
      tag,
      destroy: () => {
        if (!bodies.delete(body)) return;
        Matter.World.remove(engine.world, body);
        events.push({
          type: "destroy",
          tick,
          participant: `${tag}:${id}`,
        });
      },
      applyImpulse: (impulse) => {
        Matter.Body.setVelocity(
          body,
          addContactVectors(body.velocity, impulse),
        );
        events.push({
          type: "impulse",
          tick,
          participant: `${tag}:${id}`,
          impulse: { x: impulse.x, y: impulse.y },
        });
      },
      redirect: (direction) => {
        const velocity = redirectVelocity(body.velocity, direction);
        if (!velocity) return;
        Matter.Body.setVelocity(body, velocity);
        events.push({
          type: "redirect",
          tick,
          participant: `${tag}:${id}`,
          direction: { x: direction.x, y: direction.y },
        });
      },
    };
    bodies.set(body, participant);
    return participant;
  };

  const add = (body: MatterBody): void => Matter.World.add(engine.world, body);

  const floor = Matter.Bodies.rectangle(
    level.floor.x,
    level.floor.y,
    level.floor.width,
    level.floor.height,
    { isStatic: true, label: "floor" },
  );
  add(floor);
  register(floor, "floor", "floor");

  const goal = Matter.Bodies.rectangle(
    level.goal.x,
    level.goal.y,
    level.goal.width,
    level.goal.height,
    { isSensor: true, isStatic: true, label: "prototype-goal" },
  );
  add(goal);
  register(goal, "goal", "goal");

  for (const block of level.blocks) {
    const body = Matter.Bodies.rectangle(
      block.x,
      block.y,
      block.width,
      block.height,
      { isStatic: block.dynamic !== true, label: `block:${block.id}` },
    );
    if (block.rotation !== undefined) {
      Matter.Body.setAngle(body, block.rotation);
    }
    add(body);
    register(body, "block", block.id);
  }

  for (const ramp of getEffectiveRamps(level, placements)) {
    const body = createRampBody(ramp);
    add(body);
    register(body, "ramp", ramp.id);
  }

  for (const ball of level.balls) {
    if (ball.initiallyPlaced === false) continue;
    const body = Matter.Bodies.circle(ball.x, ball.y, ball.radius, {
      friction: 0.02,
      label: `ball:${ball.id}`,
      restitution: 0.15,
    });
    add(body);
    register(body, "ball", ball.id);
  }

  for (const actor of level.actors) {
    if (actor.initiallyPlaced === false) continue;
    const body = Matter.Bodies.rectangle(
      actor.x,
      actor.y,
      actor.width,
      actor.height,
      { ...COLLISION_ACTOR_BODY_OPTIONS, label: `actor:${actor.id}` },
    );
    body.ignoreGravity = true;
    add(body);
    register(body, actor.tag, actor.id);
    actors.push({
      body,
      definition: actor,
      patrol: {
        direction: actor.movement.direction,
        position: actor.movement.axis === "horizontal" ? actor.x : actor.y,
      },
    });
  }

  Matter.Events.on(engine, "collisionStart", ({ pairs }) => {
    for (const pair of pairs) {
      const first = bodies.get(pair.bodyA);
      const second = bodies.get(pair.bodyB);
      if (!first || !second) continue;
      events.push({
        type: "contact",
        tick,
        participants: orderedParticipants(first, second),
      });
      executeContactRules(level.contactRules, first, second);
      const ball =
        first.tag === "ball"
          ? first
          : second.tag === "ball"
            ? second
            : undefined;
      const goalContact = first.tag === "goal" || second.tag === "goal";
      if (ball && goalContact) {
        solved = true;
        events.push({ type: "goal", tick, ballId: ball.id });
      }
    }
  });

  while (!solved && tick < maxTicks) {
    tick += 1;
    for (const actor of actors) {
      const position =
        actor.definition.movement.axis === "horizontal"
          ? actor.body.position.x
          : actor.body.position.y;
      const direction = resolvePatrolDirection(
        actor.definition.movement,
        position,
        actor.patrol.direction,
      );
      actor.patrol = { direction, position };
      Matter.Body.setVelocity(
        actor.body,
        getPatrolVelocity(actor.definition.movement, direction),
      );
    }
    Matter.Engine.update(engine, SIMULATION_STEP_MS);
  }

  if (!solved) events.push({ type: "max-ticks", tick });

  const bodyStates: SimulationBodyState[] = [];
  for (const registered of bodies.values()) {
    bodyStates.push({
      id: registered.id,
      tag: registered.tag,
      x: registered.body.position.x,
      y: registered.body.position.y,
      angle: registered.body.angle,
    });
  }

  return { solved, ticks: tick, events, bodies: bodyStates };
}

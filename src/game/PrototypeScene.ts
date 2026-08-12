import Phaser from "phaser";
import {
  COLLISION_ACTOR_BODY_OPTIONS,
  getActorPosition,
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
import {
  isClickMovementWithinTolerance,
  recordCompletedClick,
  type CompletedClick,
} from "./doubleClick";
import {
  isEditablePart,
  type ActorDefinition,
  type BallDefinition,
  type BlockDefinition,
  type ContactTag,
  type LevelDefinition,
  type RampDefinition,
} from "../levels/levelTypes";
import { TRAY_BLOCK_ID_PREFIX, TRAY_RAMP_ID_PREFIX } from "../state/gameState";
import type {
  BallTransform,
  BlockTransform,
  RampTransform,
} from "../state/gameState";
import {
  clampRampPosition,
  clampCirclePosition,
  isCirclePlacementValid,
  isRectanglePlacementValid,
  PLAYABLE_HEIGHT,
  PLAYABLE_WIDTH,
  type RectanglePlacement,
  rotateRampByStep,
} from "./rampPlacement";
import { consumeSimulationSteps, SIMULATION_STEP_MS } from "./simulationClock";

const GOAL_LABEL = "prototype-goal";
const RAMP_FILL_COLOR = 0xc9944e;
const RAMP_STROKE_COLOR = 0x4a3020;
const SELECTED_RAMP_STROKE_COLOR = 0xffd166;
const BLOCK_FILL_COLOR = 0xb97d45;
const BLOCK_STROKE_COLOR = 0x56381f;
const FIXED_BLOCK_FILL_COLOR = 0x56595b;
const FIXED_BLOCK_STROKE_COLOR = 0x252729;
const BALL_FILL_COLOR = 0xd94135;
const BALL_STROKE_COLOR = 0x6b211d;
const BALL_SHADOW_COLOR = 0x8d2421;
const BALL_HIGHLIGHT_COLOR = 0xffd7cb;
const WOOD_HIGHLIGHT_COLOR = 0xf2ca78;
const WOOD_SHADOW_COLOR = 0x75411f;
const FIXED_HIGHLIGHT_COLOR = 0x969b9d;
const FIXED_SHADOW_COLOR = 0x2a2c2e;
const BIRD_BODY_COLOR = 0x6573c9;
const BIRD_DARK_COLOR = 0x394174;
const BIRD_HIGHLIGHT_COLOR = 0xb9c7ff;
const BIRD_BEAK_COLOR = 0xf2c65c;
const TRAY_BLOCK_DEFINITION: Omit<BlockDefinition, "id" | "x" | "y"> = {
  width: 80,
  height: 60,
  ownership: "player",
};
const TRAY_BLOCK_CANDIDATES = [
  { x: 875, y: 320 },
  { x: 380, y: 410 },
  { x: 490, y: 410 },
];
const TRAY_RAMP_DEFINITION: Omit<RampDefinition, "id" | "x" | "y"> = {
  width: 200,
  height: 24,
  rotation: 0,
  ownership: "player",
};
const TRAY_RAMP_CANDIDATES = [
  { x: 380, y: 340 },
  { x: 380, y: 410 },
  { x: 440, y: 230 },
];
const TRAY_BALL_CANDIDATES = [
  { x: 215, y: 135 },
  { x: 120, y: 135 },
  { x: 215, y: 220 },
];
const TRAY_BIRD_CANDIDATES = [
  { x: 140, y: 300 },
  { x: 240, y: 300 },
  { x: 140, y: 380 },
];
interface EditableBall {
  definition: BallDefinition;
  editable: boolean;
  fromTray: boolean;
  highlight: Phaser.GameObjects.Arc;
  shadow: Phaser.GameObjects.Arc;
  shape: Phaser.GameObjects.Arc;
  selectionText: Phaser.GameObjects.Text;
}
interface EditableRamp {
  definition: RampDefinition;
  editable: boolean;
  fromTray: boolean;
  highlight: Phaser.GameObjects.Rectangle;
  shadow: Phaser.GameObjects.Rectangle;
  shape: Phaser.GameObjects.Rectangle;
  selectionText: Phaser.GameObjects.Text;
}

interface EditableBlock {
  definition: BlockDefinition;
  editable: boolean;
  fromTray: boolean;
  highlight: Phaser.GameObjects.Rectangle;
  shadow: Phaser.GameObjects.Rectangle;
  shape: Phaser.GameObjects.Rectangle;
  selectionText: Phaser.GameObjects.Text;
}

interface EditableComponent {
  editable: boolean;
  shape: Phaser.GameObjects.Rectangle;
  selectionText: Phaser.GameObjects.Text;
}

interface ContactObject {
  id: string;
  tag: ContactTag;
  destroyVisual: () => void;
}

type MatterRectangle = Phaser.GameObjects.Rectangle &
  Phaser.Physics.Matter.Components.Gravity &
  Phaser.Physics.Matter.Components.Transform &
  Phaser.Physics.Matter.Components.Velocity;

interface AutonomousActor {
  definition: ActorDefinition;
  editable: boolean;
  flapTween: Phaser.Tweens.Tween;
  fromTray: boolean;
  patrol: PatrolState;
  shape: MatterRectangle;
  selectionText: Phaser.GameObjects.Text;
  visual: Phaser.GameObjects.Container;
}

type MatterGameObject = Phaser.GameObjects.GameObject & {
  body?: unknown;
};

interface RampPartSnapshot {
  componentType: "ramp";
  definition: RampDefinition;
  fromTray: boolean;
}

interface BlockPartSnapshot {
  componentType: "block";
  definition: BlockDefinition;
  fromTray: boolean;
}

type PlayerPartSnapshot = RampPartSnapshot | BlockPartSnapshot;

interface BallPartSnapshot {
  definition: BallDefinition;
  fromTray: boolean;
}

interface ActorSnapshot {
  definition: ActorDefinition;
  fromTray: boolean;
  patrol: PatrolState;
}

interface SceneRunSnapshot {
  actors: ActorSnapshot[];
  parts: PlayerPartSnapshot[];
  balls: BallPartSnapshot[];
}

export class PrototypeScene extends Phaser.Scene {
  private readonly balls = new Map<string, EditableBall>();
  private drag?: {
    componentId: string;
    componentType: "ball" | "bird" | "ramp" | "block";
    offset: Phaser.Math.Vector2;
    pointerStart: Phaser.Math.Vector2;
  };
  private dragMoved = false;
  private editInteractionEnabled = false;
  private lastComponentClick?: CompletedClick;
  private readonly blocks = new Map<string, EditableBlock>();
  private readonly actors = new Map<string, AutonomousActor>();
  private readonly contactObjects = new Map<MatterJS.BodyType, ContactObject>();
  private readonly editableComponents = new Map<
    string,
    EditableComponent | EditableBall | AutonomousActor
  >();
  private readonly ramps = new Map<string, EditableRamp>();
  private runSnapshot?: SceneRunSnapshot;
  private simulationAccumulatorMs = 0;
  private simulationRunning = false;
  private selectedComponentId: string | null = null;
  private successText?: Phaser.GameObjects.Text;

  constructor(
    private readonly level: LevelDefinition,
    private readonly onSuccess: () => void,
    private readonly onTimerTick: (deltaMs: number) => void,
    private readonly onSelectionChange: (componentId: string | null) => void,
    private readonly onRampTransformChange: (
      rampId: string,
      transform: RampTransform,
    ) => void,
    private readonly onBlockTransformChange: (
      blockId: string,
      transform: BlockTransform,
    ) => void,
    private readonly onBallTransformChange: (
      ballId: string,
      transform: BallTransform,
    ) => void,
    private readonly onComponentRemove: (
      componentId: string,
      returnsTrayPart: "ball" | "bird" | "block" | "ramp" | null,
    ) => void,
    private readonly onEditFeedback: (message: string) => void,
  ) {
    super("prototype");
  }

  create(): void {
    this.drawWorkshop();
    this.createLevelObjects();
    this.matter.world.autoUpdate = false;
    this.matter.world.on(
      "collisionstart",
      (
        _event: Phaser.Physics.Matter.Events.CollisionStartEvent,
        bodyA: MatterJS.BodyType,
        bodyB: MatterJS.BodyType,
      ) => this.handleContact(bodyA, bodyB),
    );
    this.input.on(Phaser.Input.Events.POINTER_DOWN, () => {
      if (!this.editInteractionEnabled) return;
      this.onSelectionChange(null);
    });
    this.input.on(
      Phaser.Input.Events.POINTER_MOVE,
      (pointer: Phaser.Input.Pointer) => {
        if (!this.editInteractionEnabled || !this.drag || !pointer.isDown) {
          return;
        }
        if (
          !this.dragMoved &&
          isClickMovementWithinTolerance(this.drag.pointerStart, {
            x: pointer.worldX,
            y: pointer.worldY,
          })
        ) {
          return;
        }
        this.dragMoved = true;
        this.lastComponentClick = undefined;
        const x = pointer.worldX - this.drag.offset.x;
        const y = pointer.worldY - this.drag.offset.y;
        if (this.drag.componentType === "ramp") {
          const ramp = this.ramps.get(this.drag.componentId);
          if (!ramp) return;
          this.updateRampTransform(
            this.drag.componentId,
            x,
            y,
            ramp.shape.rotation,
            true,
          );
        } else if (this.drag.componentType === "block") {
          this.updateBlockPosition(this.drag.componentId, x, y, true);
        } else if (this.drag.componentType === "bird") {
          this.updateActorPosition(this.drag.componentId, x, y, true);
        } else {
          this.updateBallPosition(this.drag.componentId, x, y, true);
        }
      },
    );
    this.input.on(
      Phaser.Input.Events.POINTER_UP,
      (pointer: Phaser.Input.Pointer) => {
        this.completePointerInteraction(pointer);
      },
    );
    this.input.on(Phaser.Input.Events.POINTER_UP_OUTSIDE, () => {
      this.lastComponentClick = undefined;
      this.drag = undefined;
      this.dragMoved = false;
    });
    this.input.keyboard?.on("keydown-Q", () => {
      this.rotateSelectedRamp(-1);
    });
    this.input.keyboard?.on("keydown-E", () => {
      this.rotateSelectedRamp(1);
    });
    this.matter.world.pause();
  }

  setSimulationRunning(running: boolean): void {
    if (this.simulationRunning !== running) this.simulationAccumulatorMs = 0;
    this.simulationRunning = running;
    if (running) this.matter.world.resume();
    else this.matter.world.pause();
  }

  update(_time: number, deltaMs: number): void {
    if (!this.simulationRunning) return;

    const clock = consumeSimulationSteps(this.simulationAccumulatorMs, deltaMs);
    this.simulationAccumulatorMs = clock.remainingMs;
    for (let step = 0; step < clock.stepCount; step += 1) {
      this.updateActorVelocities();
      this.matter.world.step(SIMULATION_STEP_MS);
      this.updateActorVisuals();
      this.updateBallHighlights();

      if (!this.simulationRunning) return;
      if (this.level.timeLimitSeconds !== undefined) {
        this.onTimerTick(SIMULATION_STEP_MS);
        if (!this.simulationRunning) return;
      }
    }
  }

  private updateActorVelocities(): void {
    for (const actor of this.actors.values()) {
      const position =
        actor.definition.movement.axis === "horizontal"
          ? actor.shape.x
          : actor.shape.y;
      const direction = resolvePatrolDirection(
        actor.definition.movement,
        position,
        actor.patrol.direction,
      );
      const velocity = getPatrolVelocity(actor.definition.movement, direction);
      actor.patrol = { direction, position };
      actor.shape.setVelocity(velocity.x, velocity.y);
    }
  }

  private updateActorVisuals(): void {
    for (const actor of this.actors.values()) {
      const visualPosition = { x: actor.shape.x, y: actor.shape.y };
      actor.visual.setPosition(visualPosition.x, visualPosition.y);
      actor.selectionText.setPosition(
        visualPosition.x,
        visualPosition.y - actor.definition.height / 2 - 18,
      );
    }
  }

  setEditSelection(enabled: boolean, selectedComponentId: string | null): void {
    this.editInteractionEnabled = enabled;
    this.selectedComponentId = selectedComponentId;
    if (!enabled) this.lastComponentClick = undefined;
    this.updateSelectionDisplay();
  }

  setRampTransforms(transforms: Readonly<Record<string, RampTransform>>): void {
    for (const ramp of this.ramps.values()) {
      if (!ramp.editable) continue;
      const transform = transforms[ramp.definition.id] ?? {
        position: ramp.definition,
        rotation: ramp.definition.rotation,
      };
      this.updateRampTransform(
        ramp.definition.id,
        transform.position.x,
        transform.position.y,
        transform.rotation,
        false,
      );
    }
  }

  setBlockTransforms(
    transforms: Readonly<Record<string, BlockTransform>>,
  ): void {
    for (const block of this.blocks.values()) {
      if (!block.editable) continue;
      const position =
        transforms[block.definition.id]?.position ?? block.definition;
      this.updateBlockPosition(
        block.definition.id,
        position.x,
        position.y,
        false,
      );
    }
  }

  spawnTrayBall(
    availableCount: number,
  ): { id: string; transform: BallTransform } | null {
    if (!this.editInteractionEnabled || availableCount <= 0) return null;
    const levelBall = this.level.balls.find(
      (ball) => ball.ownership === "player" && !this.balls.has(ball.id),
    );
    if (!levelBall) return null;
    const id = levelBall.id;
    for (const position of TRAY_BALL_CANDIDATES) {
      const definition: BallDefinition = {
        ...levelBall,
        ...position,
        id,
        initiallyPlaced: true,
        ownership: "player",
      };
      if (
        isCirclePlacementValid(
          { ...position, radius: definition.radius },
          this.getOtherPlacements(id),
          this.getOtherBallPlacements(id),
        )
      ) {
        this.createBall(definition, true);
        this.onEditFeedback("");
        return { id, transform: { position } };
      }
    }
    this.onEditFeedback("Placement rejected: no clear space is available.");
    return null;
  }

  spawnTrayBird(availableCount: number): string | null {
    if (!this.editInteractionEnabled || availableCount <= 0) return null;
    const levelBird = this.level.actors.find(
      (actor) => actor.ownership === "player" && !this.actors.has(actor.id),
    );
    if (!levelBird) return null;
    for (const position of TRAY_BIRD_CANDIDATES) {
      const definition: ActorDefinition = {
        ...levelBird,
        ...position,
        initiallyPlaced: true,
        ownership: "player",
      };
      if (this.isValidActorPlacement(definition.id, definition, position)) {
        this.createActor(definition, undefined, true);
        this.onEditFeedback("");
        return definition.id;
      }
    }
    this.onEditFeedback("Placement rejected: no clear space is available.");
    return null;
  }

  spawnTrayBlock(availableCount: number): string | null {
    if (!this.editInteractionEnabled || availableCount <= 0) return null;
    const id = this.getNextTrayBlockId();
    for (const position of TRAY_BLOCK_CANDIDATES) {
      const definition: BlockDefinition = {
        ...TRAY_BLOCK_DEFINITION,
        ...position,
        id,
      };
      if (
        this.getCurrentBalls().every((ball) =>
          isRectanglePlacementValid(
            { ...definition, rotation: 0 },
            ball,
            this.getOtherPlacements(id),
          ),
        )
      ) {
        this.createBlock(definition, true);
        this.onEditFeedback("");
        return id;
      }
    }
    this.onEditFeedback("Placement rejected: no clear space is available.");
    return null;
  }

  spawnTrayRamp(availableCount: number): string | null {
    if (!this.editInteractionEnabled || availableCount <= 0) return null;
    const id = this.getNextTrayRampId();
    for (const position of TRAY_RAMP_CANDIDATES) {
      const definition: RampDefinition = {
        ...TRAY_RAMP_DEFINITION,
        ...position,
        id,
      };
      if (
        this.getCurrentBalls().every((ball) =>
          isRectanglePlacementValid(
            definition,
            ball,
            this.getOtherPlacements(id),
          ),
        )
      ) {
        this.createRamp(definition, true);
        this.onEditFeedback("");
        return id;
      }
    }
    this.onEditFeedback("Placement rejected: no clear space is available.");
    return null;
  }

  captureRunLayout(): void {
    this.runSnapshot = {
      parts: [
        ...[...this.ramps.values()].map((ramp): RampPartSnapshot => ({
          componentType: "ramp",
          definition: {
            ...ramp.definition,
            x: ramp.shape.x,
            y: ramp.shape.y,
            rotation: ramp.shape.rotation,
          },
          fromTray: ramp.fromTray,
        })),
        ...[...this.blocks.values()].map((block): BlockPartSnapshot => ({
          componentType: "block",
          definition: {
            ...block.definition,
            x: block.shape.x,
            y: block.shape.y,
          },
          fromTray: block.fromTray,
        })),
      ],
      actors: [...this.actors.values()].map((actor): ActorSnapshot => ({
        definition: {
          ...actor.definition,
          x: actor.shape.x,
          y: actor.shape.y,
        },
        fromTray: actor.fromTray,
        patrol: { ...actor.patrol },
      })),
      balls: [...this.balls.values()].map((ball) => ({
        definition: {
          ...ball.definition,
          x: ball.shape.x,
          y: ball.shape.y,
        },
        fromTray: ball.fromTray,
      })),
    };
  }

  rerunFromSnapshot(): boolean {
    if (!this.runSnapshot) return false;
    this.simulationAccumulatorMs = 0;
    this.matter.world.pause();
    this.restoreParts(this.runSnapshot.parts);
    this.restoreActors(this.runSnapshot.actors);
    this.restoreBalls(this.runSnapshot.balls);
    this.clearSuccess();
    return true;
  }

  resetLevel(): void {
    this.simulationAccumulatorMs = 0;
    this.matter.world.pause();
    this.restoreLevelParts();
    this.restoreActors();
    this.runSnapshot = undefined;
    this.restoreBalls(
      this.level.balls
        .filter((ball) => ball.initiallyPlaced !== false)
        .map((definition) => ({ definition, fromTray: false })),
    );
    this.clearSuccess();
  }

  private clearSuccess(): void {
    this.successText?.destroy();
    this.successText = undefined;
  }

  private createBall(definition: BallDefinition, fromTray = false): void {
    const shadow = this.add
      .circle(
        definition.x + definition.radius * 0.14,
        definition.y + definition.radius * 0.18,
        definition.radius,
        BALL_SHADOW_COLOR,
        0.75,
      )
      .setDepth(1);
    const shape = this.add
      .circle(definition.x, definition.y, definition.radius, BALL_FILL_COLOR, 1)
      .setStrokeStyle(4, BALL_STROKE_COLOR)
      .setDepth(2);
    const highlight = this.add
      .circle(
        definition.x - definition.radius * 0.32,
        definition.y - definition.radius * 0.34,
        Math.max(3, definition.radius * 0.22),
        BALL_HIGHLIGHT_COLOR,
        0.9,
      )
      .setDepth(3);
    this.matter.add.gameObject(shape, {
      shape: { type: "circle", radius: definition.radius },
      restitution: 0.15,
      friction: 0.02,
      label: `ball:${definition.id}`,
    });
    const selectionText = this.add
      .text(
        definition.x,
        definition.y - definition.radius - 18,
        "BALL SELECTED",
        {
          color: "#6b211d",
          fontFamily: "Arial, sans-serif",
          fontSize: "14px",
          fontStyle: "bold",
        },
      )
      .setOrigin(0.5)
      .setDepth(2)
      .setVisible(false);
    shape.on(
      Phaser.Input.Events.POINTER_DOWN,
      (
        pointer: Phaser.Input.Pointer,
        _x: number,
        _y: number,
        event: Phaser.Types.Input.EventData,
      ) => {
        this.handleComponentPointerDown(
          "ball",
          definition.id,
          shape,
          pointer,
          event,
        );
      },
    );
    this.prepareComponentInput(
      shape,
      new Phaser.Geom.Circle(
        definition.radius,
        definition.radius,
        definition.radius,
      ),
      Phaser.Geom.Circle.Contains,
    );
    const ball: EditableBall = {
      definition,
      editable: isEditablePart(definition, fromTray),
      fromTray,
      highlight,
      shadow,
      shape,
      selectionText,
    };
    this.balls.set(definition.id, ball);
    this.editableComponents.set(definition.id, ball);
    this.registerContactObject(shape, "ball", definition.id, () =>
      this.destroyBall(definition.id),
    );
  }

  private createLevelObjects(): void {
    const { floor, goal, gravity } = this.level;
    this.matter.world.setGravity(gravity.x, gravity.y);

    const floorShape = this.add
      .rectangle(
        floor.x,
        floor.y,
        floor.width,
        floor.height,
        FIXED_BLOCK_FILL_COLOR,
      )
      .setStrokeStyle(4, FIXED_BLOCK_STROKE_COLOR)
      .setDepth(1);
    this.add
      .rectangle(
        floor.x,
        floor.y - floor.height * 0.28,
        floor.width - 12,
        Math.max(3, floor.height * 0.16),
        FIXED_HIGHLIGHT_COLOR,
        0.62,
      )
      .setDepth(2);
    this.add
      .rectangle(
        floor.x,
        floor.y + floor.height * 0.34,
        floor.width - 10,
        Math.max(3, floor.height * 0.14),
        FIXED_SHADOW_COLOR,
        0.72,
      )
      .setDepth(2);
    this.matter.add.gameObject(floorShape, { isStatic: true, label: "floor" });
    this.registerContactObject(floorShape, "floor", "floor", () =>
      floorShape.destroy(),
    );

    const goalShape = this.add
      .rectangle(goal.x, goal.y, goal.width, goal.height, 0x5dbb35, 0)
      .setDepth(1);
    this.matter.add.gameObject(goalShape, {
      isStatic: true,
      isSensor: true,
      label: GOAL_LABEL,
    });
    this.registerContactObject(goalShape, "goal", "goal", () =>
      goalShape.destroy(),
    );
    this.drawGoalCup(goal);
    this.add
      .text(goal.x, goal.y + 8, "GOAL", {
        color: "#1e4b24",
        fontFamily: "Arial, sans-serif",
        fontSize: "18px",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setDepth(4);

    this.resetLevel();
    this.updateSelectionDisplay();
  }

  private createRamp(definition: RampDefinition, fromTray = false): void {
    const shadow = this.add
      .rectangle(
        definition.x + 3,
        definition.y + 4,
        definition.width,
        definition.height,
        WOOD_SHADOW_COLOR,
        0.4,
      )
      .setRotation(definition.rotation)
      .setDepth(1);
    const shape = this.add
      .rectangle(
        definition.x,
        definition.y,
        definition.width,
        definition.height,
        RAMP_FILL_COLOR,
      )
      .setStrokeStyle(4, RAMP_STROKE_COLOR)
      .setRotation(definition.rotation)
      .setDepth(1);
    const highlight = this.add
      .rectangle(
        definition.x,
        definition.y - definition.height * 0.22,
        definition.width - 16,
        3,
        WOOD_HIGHLIGHT_COLOR,
        0.8,
      )
      .setRotation(definition.rotation)
      .setDepth(2);
    this.matter.add.gameObject(shape, {
      isStatic: true,
      label: `ramp:${definition.id}`,
    });

    const selectionText = this.add
      .text(definition.x, definition.y - 34, "RAMP SELECTED", {
        color: "#513a25",
        fontFamily: "Arial, sans-serif",
        fontSize: "14px",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setDepth(2)
      .setVisible(false);

    shape.on(
      Phaser.Input.Events.POINTER_DOWN,
      (
        pointer: Phaser.Input.Pointer,
        _localX: number,
        _localY: number,
        event: Phaser.Types.Input.EventData,
      ) => {
        this.handleComponentPointerDown(
          "ramp",
          definition.id,
          shape,
          pointer,
          event,
        );
      },
    );
    this.prepareComponentInput(
      shape,
      new Phaser.Geom.Rectangle(0, 0, definition.width, definition.height),
      Phaser.Geom.Rectangle.Contains,
    );

    const ramp: EditableRamp = {
      definition,
      editable: isEditablePart(definition, fromTray),
      fromTray,
      highlight,
      shadow,
      shape,
      selectionText,
    };
    this.updateRampSurface(ramp, definition, definition.rotation);
    this.ramps.set(definition.id, ramp);
    this.editableComponents.set(definition.id, ramp);
    this.registerContactObject(shape, "ramp", definition.id, () =>
      this.destroyRampFromContact(definition.id),
    );
  }

  private createBlock(definition: BlockDefinition, fromTray = false): void {
    const editable = isEditablePart(definition, fromTray);
    const highlightColor = editable
      ? WOOD_HIGHLIGHT_COLOR
      : FIXED_HIGHLIGHT_COLOR;
    const shadowColor = editable ? WOOD_SHADOW_COLOR : FIXED_SHADOW_COLOR;
    const shadow = this.add
      .rectangle(
        definition.x + 3,
        definition.y + 4,
        definition.width,
        definition.height,
        shadowColor,
        0.42,
      )
      .setDepth(1);
    const shape = this.add
      .rectangle(
        definition.x,
        definition.y,
        definition.width,
        definition.height,
        editable ? BLOCK_FILL_COLOR : FIXED_BLOCK_FILL_COLOR,
      )
      .setStrokeStyle(
        4,
        editable ? BLOCK_STROKE_COLOR : FIXED_BLOCK_STROKE_COLOR,
      )
      .setDepth(1);
    const highlight = this.add
      .rectangle(
        definition.x,
        definition.y - definition.height * 0.32,
        definition.width - 14,
        Math.max(3, definition.height * 0.12),
        highlightColor,
        0.75,
      )
      .setDepth(2);
    this.matter.add.gameObject(shape, {
      isStatic: true,
      label: `block:${definition.id}`,
    });

    const selectionText = this.add
      .text(definition.x, definition.y - 34, "BLOCK SELECTED", {
        color: "#344e41",
        fontFamily: "Arial, sans-serif",
        fontSize: "14px",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setDepth(2)
      .setVisible(false);
    shape.on(
      Phaser.Input.Events.POINTER_DOWN,
      (
        pointer: Phaser.Input.Pointer,
        _localX: number,
        _localY: number,
        event: Phaser.Types.Input.EventData,
      ) => {
        this.handleComponentPointerDown(
          "block",
          definition.id,
          shape,
          pointer,
          event,
        );
      },
    );
    this.prepareComponentInput(
      shape,
      new Phaser.Geom.Rectangle(0, 0, definition.width, definition.height),
      Phaser.Geom.Rectangle.Contains,
    );

    const block: EditableBlock = {
      definition,
      editable,
      fromTray,
      highlight,
      shadow,
      shape,
      selectionText,
    };
    this.updateBlockSurface(block, definition);
    this.blocks.set(definition.id, block);
    this.editableComponents.set(definition.id, block);
    this.registerContactObject(shape, "block", definition.id, () =>
      this.destroyBlockFromContact(definition.id),
    );
  }

  private handleComponentPointerDown(
    componentType: "ball" | "bird" | "ramp" | "block",
    componentId: string,
    shape: Phaser.GameObjects.Shape,
    pointer: Phaser.Input.Pointer,
    event: Phaser.Types.Input.EventData,
  ): void {
    event.stopPropagation();
    if (!this.editInteractionEnabled) return;
    const component = this.editableComponents.get(componentId);
    if (!component) {
      this.onEditFeedback("Part is no longer available.");
      return;
    }
    if (!component.editable) {
      this.onEditFeedback("Fixed parts cannot be moved or removed.");
      return;
    }
    this.onEditFeedback("");
    this.onSelectionChange(componentId);
    this.drag = {
      componentId,
      componentType,
      offset: new Phaser.Math.Vector2(
        pointer.worldX - shape.x,
        pointer.worldY - shape.y,
      ),
      pointerStart: new Phaser.Math.Vector2(pointer.worldX, pointer.worldY),
    };
    this.dragMoved = false;
  }

  private completePointerInteraction(pointer: Phaser.Input.Pointer): void {
    const drag = this.drag;
    this.drag = undefined;
    if (!drag || this.dragMoved) {
      if (this.dragMoved) this.lastComponentClick = undefined;
      this.dragMoved = false;
      return;
    }
    this.dragMoved = false;
    if (!this.editInteractionEnabled) return;
    const click = recordCompletedClick(this.lastComponentClick, {
      componentId: drag.componentId,
      completedAt: pointer.upTime,
    });
    this.lastComponentClick = click.nextClick;
    if (click.isDoubleClick) {
      this.removeComponent(drag.componentType, drag.componentId);
    }
  }

  private removeComponent(
    componentType: "ball" | "bird" | "ramp" | "block",
    componentId: string,
  ): void {
    if (componentType === "ball") {
      const ball = this.balls.get(componentId);
      if (!ball || !ball.editable) return;
      this.destroyBall(componentId);
      this.onComponentRemove(componentId, "ball");
      this.onEditFeedback("");
      return;
    }
    if (componentType === "bird") {
      const actor = this.actors.get(componentId);
      if (!actor || !actor.editable) return;
      this.destroyActor(componentId);
      this.onComponentRemove(componentId, "bird");
      this.onEditFeedback("");
      return;
    }
    if (componentType === "ramp") {
      const ramp = this.ramps.get(componentId);
      if (!ramp || !ramp.editable) return;
      this.unregisterContactObject(ramp.shape);
      ramp.shape.destroy();
      ramp.highlight.destroy();
      ramp.shadow.destroy();
      ramp.selectionText.destroy();
      this.ramps.delete(componentId);
      this.editableComponents.delete(componentId);
      this.onComponentRemove(
        componentId,
        isEditablePart(ramp.definition, ramp.fromTray) ? "ramp" : null,
      );
      this.onEditFeedback("");
      return;
    }
    const block = this.blocks.get(componentId);
    if (!block || !block.editable) return;
    this.unregisterContactObject(block.shape);
    block.shape.destroy();
    block.highlight.destroy();
    block.shadow.destroy();
    block.selectionText.destroy();
    this.blocks.delete(componentId);
    this.editableComponents.delete(componentId);
    this.onComponentRemove(
      componentId,
      isEditablePart(block.definition, block.fromTray) ? "block" : null,
    );
    this.onEditFeedback("");
  }

  private restoreLevelParts(): void {
    this.destroyParts();
    for (const ramp of this.level.ramps) {
      this.createRamp(ramp);
    }
    for (const block of this.level.blocks) {
      this.createBlock(block);
    }
  }

  private restoreBalls(snapshot: readonly BallPartSnapshot[]): void {
    this.destroyBalls();
    for (const ball of snapshot) {
      this.createBall(ball.definition, ball.fromTray);
    }
  }

  private restoreActors(snapshot?: readonly ActorSnapshot[]): void {
    this.destroyActors();
    if (snapshot) {
      for (const actorSnapshot of snapshot) {
        this.createActor(
          actorSnapshot.definition,
          actorSnapshot.patrol,
          actorSnapshot.fromTray,
        );
      }
      return;
    }
    for (const actor of this.level.actors) {
      if (actor.initiallyPlaced === false) continue;
      this.createActor(actor);
    }
  }

  private createActor(
    definition: ActorDefinition,
    patrol: PatrolState = {
      position:
        definition.movement.axis === "horizontal" ? definition.x : definition.y,
      direction: definition.movement.direction,
    },
    fromTray = false,
  ): void {
    const position = getActorPosition(
      definition.movement.axis,
      patrol.position,
      definition.movement.axis === "horizontal" ? definition.y : definition.x,
    );
    const shape = this.matter.add.gameObject(
      this.add
        .rectangle(
          position.x,
          position.y,
          definition.width,
          definition.height,
          0x000000,
          0,
        )
        .setDepth(2),
      {
        ...COLLISION_ACTOR_BODY_OPTIONS,
        label: `actor:${definition.id}`,
      },
    ) as MatterRectangle;
    shape.setIgnoreGravity(true).setFixedRotation();
    const wing = this.add
      .triangle(-4, 0, -15, 2, 10, -11, 8, 13, BIRD_DARK_COLOR)
      .setOrigin(0.5);
    const bird = this.add.container(position.x, position.y, [
      this.add.ellipse(0, 10, 30, 7, 0x232741, 0.24),
      this.add.ellipse(-3, 1, 30, 18, BIRD_BODY_COLOR),
      wing,
      this.add.ellipse(-7, -2, 13, 8, BIRD_HIGHLIGHT_COLOR, 0.82),
      this.add.circle(11, -7, 9, BIRD_BODY_COLOR),
      this.add.circle(13, -9, 2.5, 0xf7f4ed),
      this.add.circle(13.5, -9, 1.2, BIRD_DARK_COLOR),
      this.add.triangle(22, -6, -4, -5, 7, 0, -4, 5, BIRD_BEAK_COLOR),
    ]);
    bird.setDepth(3);
    const flapTween = this.tweens.add({
      targets: wing,
      angle: -18,
      duration: 180,
      ease: "Sine.easeInOut",
      repeat: -1,
      yoyo: true,
    });
    const selectionText = this.add
      .text(
        position.x,
        position.y - definition.height / 2 - 18,
        "BIRD SELECTED",
        {
          color: "#394174",
          fontFamily: "Arial, sans-serif",
          fontSize: "14px",
          fontStyle: "bold",
        },
      )
      .setOrigin(0.5)
      .setDepth(4)
      .setVisible(false);
    shape.on(
      Phaser.Input.Events.POINTER_DOWN,
      (
        pointer: Phaser.Input.Pointer,
        _localX: number,
        _localY: number,
        event: Phaser.Types.Input.EventData,
      ) => {
        this.handleComponentPointerDown(
          "bird",
          definition.id,
          shape,
          pointer,
          event,
        );
      },
    );
    this.prepareComponentInput(
      shape,
      new Phaser.Geom.Rectangle(0, 0, definition.width, definition.height),
      Phaser.Geom.Rectangle.Contains,
    );
    const actor: AutonomousActor = {
      definition,
      editable: isEditablePart(definition, fromTray),
      flapTween,
      fromTray,
      patrol: { ...patrol },
      shape,
      selectionText,
      visual: bird,
    };
    this.actors.set(definition.id, actor);
    this.editableComponents.set(definition.id, actor);
    this.registerContactObject(shape, definition.tag, definition.id, () =>
      this.destroyActorFromContact(definition.id),
    );
  }

  private restoreParts(snapshot: readonly PlayerPartSnapshot[]): void {
    this.destroyParts();
    for (const part of snapshot) {
      if (part.componentType === "ramp") {
        this.createRamp(part.definition, part.fromTray);
      } else {
        this.createBlock(part.definition, part.fromTray);
      }
    }
  }

  private destroyParts(): void {
    for (const ramp of this.ramps.values()) {
      this.unregisterContactObject(ramp.shape);
      ramp.shape.destroy();
      ramp.highlight.destroy();
      ramp.shadow.destroy();
      ramp.selectionText.destroy();
    }
    for (const block of this.blocks.values()) {
      this.unregisterContactObject(block.shape);
      block.shape.destroy();
      block.highlight.destroy();
      block.shadow.destroy();
      block.selectionText.destroy();
    }
    this.ramps.clear();
    this.blocks.clear();
    this.editableComponents.clear();
  }

  private destroyActors(): void {
    for (const actor of [...this.actors.values()]) {
      this.destroyActor(actor.definition.id);
    }
  }

  private handleContact(
    bodyA: MatterJS.BodyType,
    bodyB: MatterJS.BodyType,
  ): void {
    const first = this.contactObjects.get(bodyA);
    const second = this.contactObjects.get(bodyB);
    if (!first || !second) return;

    executeContactRules(
      this.level.contactRules,
      this.toContactParticipant(first, bodyA),
      this.toContactParticipant(second, bodyB),
    );
    if (
      (first.tag === "ball" && second.tag === "goal") ||
      (first.tag === "goal" && second.tag === "ball")
    ) {
      this.showSuccess();
      this.onSuccess();
    }
  }

  private destroyContactObject(body: MatterJS.BodyType): void {
    const contactObject = this.contactObjects.get(body);
    if (!contactObject) return;
    this.contactObjects.delete(body);
    contactObject.destroyVisual();
  }

  private toContactParticipant(
    contactObject: Readonly<ContactObject>,
    body: MatterJS.BodyType,
  ): ContactParticipant {
    return {
      id: contactObject.id,
      tag: contactObject.tag,
      destroy: () => this.destroyContactObject(body),
      applyImpulse: (impulse) => {
        const velocity = addContactVectors(body.velocity, impulse);
        this.matter.body.setVelocity(body, velocity);
      },
      redirect: (direction) => {
        const velocity = redirectVelocity(body.velocity, direction);
        if (velocity) this.matter.body.setVelocity(body, velocity);
      },
    };
  }

  private registerContactObject(
    gameObject: MatterGameObject,
    tag: ContactTag,
    id: string,
    destroyVisual: () => void,
  ): void {
    if (gameObject.body) {
      this.contactObjects.set(gameObject.body as MatterJS.BodyType, {
        id,
        tag,
        destroyVisual,
      });
    }
  }

  private unregisterContactObject(gameObject: MatterGameObject): void {
    if (gameObject.body) {
      this.contactObjects.delete(gameObject.body as MatterJS.BodyType);
    }
  }

  private destroyBall(componentId: string): void {
    const ball = this.balls.get(componentId);
    if (!ball) return;
    this.unregisterContactObject(ball.shape);
    ball.shape.destroy();
    ball.highlight.destroy();
    ball.shadow.destroy();
    ball.selectionText.destroy();
    this.editableComponents.delete(componentId);
    this.balls.delete(componentId);
  }

  private destroyBalls(): void {
    for (const ball of [...this.balls.values()]) {
      this.destroyBall(ball.definition.id);
    }
  }

  private destroyRampFromContact(componentId: string): void {
    const ramp = this.ramps.get(componentId);
    if (!ramp) return;
    this.unregisterContactObject(ramp.shape);
    ramp.shape.destroy();
    ramp.highlight.destroy();
    ramp.shadow.destroy();
    ramp.selectionText.destroy();
    this.ramps.delete(componentId);
    this.editableComponents.delete(componentId);
  }

  private destroyBlockFromContact(componentId: string): void {
    const block = this.blocks.get(componentId);
    if (!block) return;
    this.unregisterContactObject(block.shape);
    block.shape.destroy();
    block.highlight.destroy();
    block.shadow.destroy();
    block.selectionText.destroy();
    this.blocks.delete(componentId);
    this.editableComponents.delete(componentId);
  }

  private destroyActorFromContact(actorId: string): void {
    this.destroyActor(actorId);
  }

  private destroyActor(actorId: string): void {
    const actor = this.actors.get(actorId);
    if (!actor) return;
    this.unregisterContactObject(actor.shape);
    actor.flapTween.stop();
    actor.shape.destroy();
    actor.selectionText.destroy();
    actor.visual.destroy(true);
    this.actors.delete(actorId);
    this.editableComponents.delete(actorId);
  }

  private getNextTrayRampId(): string {
    let index = 1;
    while (this.ramps.has(`${TRAY_RAMP_ID_PREFIX}${index}`)) index += 1;
    return `${TRAY_RAMP_ID_PREFIX}${index}`;
  }

  private getNextTrayBlockId(): string {
    let index = 1;
    while (this.blocks.has(`${TRAY_BLOCK_ID_PREFIX}${index}`)) index += 1;
    return `${TRAY_BLOCK_ID_PREFIX}${index}`;
  }

  private updateRampTransform(
    rampId: string,
    x: number,
    y: number,
    rotation: number,
    notify: boolean,
  ): void {
    const ramp = this.ramps.get(rampId);
    if (!ramp) return;
    if (notify && !ramp.editable) return;
    const position = clampRampPosition(
      { x, y },
      { ...ramp.definition, rotation },
    );
    if (notify && !this.isValidRampEditPlacement(rampId, position, rotation)) {
      this.onEditFeedback(
        "Placement rejected: keep parts in bounds and clear of other parts.",
      );
      return;
    }
    ramp.shape.setPosition(position.x, position.y).setRotation(rotation);
    this.updateRampSurface(ramp, position, rotation);
    ramp.selectionText.setPosition(position.x, position.y - 34);
    if (notify) {
      this.onEditFeedback("");
      this.onRampTransformChange(rampId, { position, rotation });
    }
  }

  private updateBlockPosition(
    blockId: string,
    x: number,
    y: number,
    notify: boolean,
  ): void {
    const block = this.blocks.get(blockId);
    if (!block) return;
    if (notify && !block.editable) return;
    const position = clampRampPosition(
      { x, y },
      { ...block.definition, rotation: 0 },
    );
    if (notify && !this.isValidBlockEditPlacement(blockId, position)) {
      this.onEditFeedback(
        "Placement rejected: keep parts in bounds and clear of other parts.",
      );
      return;
    }
    block.shape.setPosition(position.x, position.y);
    this.updateBlockSurface(block, position);
    block.selectionText.setPosition(position.x, position.y - 34);
    if (notify) {
      this.onEditFeedback("");
      this.onBlockTransformChange(blockId, { position });
    }
  }

  private updateBallPosition(
    ballId: string,
    x: number,
    y: number,
    notify: boolean,
  ): void {
    const ball = this.balls.get(ballId);
    if (!ball || (notify && !ball.editable)) return;
    const position = clampCirclePosition({ x, y }, ball.definition.radius);
    if (
      notify &&
      !isCirclePlacementValid(
        { ...position, radius: ball.definition.radius },
        this.getOtherPlacements(ballId),
        this.getOtherBallPlacements(ballId),
      )
    ) {
      this.onEditFeedback(
        "Placement rejected: keep parts in bounds and clear of other parts.",
      );
      return;
    }
    ball.shape.setPosition(position.x, position.y);
    this.updateBallHighlight(ball);
    ball.selectionText.setPosition(
      position.x,
      position.y - ball.definition.radius - 18,
    );
    if (notify) {
      this.onEditFeedback("");
      this.onBallTransformChange(ballId, { position });
    }
  }

  private updateActorPosition(
    actorId: string,
    x: number,
    y: number,
    notify: boolean,
  ): void {
    const actor = this.actors.get(actorId);
    if (!actor || (notify && !actor.editable)) return;
    const clamped = clampRampPosition(
      { x, y },
      { ...actor.definition, rotation: 0 },
    );
    const patrolPosition = Phaser.Math.Clamp(
      actor.definition.movement.axis === "horizontal" ? clamped.x : clamped.y,
      actor.definition.movement.min,
      actor.definition.movement.max,
    );
    const position =
      actor.definition.movement.axis === "horizontal"
        ? { x: patrolPosition, y: clamped.y }
        : { x: clamped.x, y: patrolPosition };
    if (
      notify &&
      !this.isValidActorPlacement(actorId, actor.definition, position)
    ) {
      this.onEditFeedback(
        "Placement rejected: keep parts in bounds and clear of other parts.",
      );
      return;
    }
    actor.shape.setPosition(position.x, position.y);
    actor.visual.setPosition(position.x, position.y);
    actor.selectionText.setPosition(
      position.x,
      position.y - actor.definition.height / 2 - 18,
    );
    actor.patrol = { ...actor.patrol, position: patrolPosition };
    if (notify) this.onEditFeedback("");
  }

  private isValidRampEditPlacement(
    rampId: string,
    position: { x: number; y: number },
    rotation: number,
  ): boolean {
    const ramp = this.ramps.get(rampId);
    if (!ramp) return false;
    return this.getCurrentBalls().every((ball) =>
      isRectanglePlacementValid(
        { ...ramp.definition, ...position, rotation },
        ball,
        this.getOtherPlacements(rampId),
      ),
    );
  }

  private isValidBlockEditPlacement(
    blockId: string,
    position: { x: number; y: number },
  ): boolean {
    const block = this.blocks.get(blockId);
    if (!block) return false;
    return this.getCurrentBalls().every((ball) =>
      isRectanglePlacementValid(
        { ...block.definition, ...position, rotation: 0 },
        ball,
        this.getOtherPlacements(blockId),
      ),
    );
  }

  private isValidActorPlacement(
    actorId: string,
    definition: ActorDefinition,
    position: { x: number; y: number },
  ): boolean {
    const actorPlacement = { ...definition, ...position, rotation: 0 };
    const otherPlacements = [
      ...this.getOtherPlacements(actorId),
      ...[...this.actors.entries()]
        .filter(([otherActorId]) => otherActorId !== actorId)
        .map(([, actor]) => ({
          ...actor.definition,
          x: actor.shape.x,
          y: actor.shape.y,
          rotation: 0,
        })),
    ];
    return this.getCurrentBalls().every((ball) =>
      isRectanglePlacementValid(actorPlacement, ball, otherPlacements),
    );
  }

  private getCurrentBalls(): Array<{ x: number; y: number; radius: number }> {
    return [...this.balls.values()].map((ball) => ({
      x: ball.shape.x,
      y: ball.shape.y,
      radius: ball.definition.radius,
    }));
  }

  private getOtherBallPlacements(
    componentId: string,
  ): Array<{ x: number; y: number; radius: number }> {
    return [...this.balls.entries()]
      .filter(([ballId]) => ballId !== componentId)
      .map(([, ball]) => ({
        x: ball.shape.x,
        y: ball.shape.y,
        radius: ball.definition.radius,
      }));
  }

  private getOtherPlacements(componentId: string): RectanglePlacement[] {
    return [
      ...[...this.ramps.entries()]
        .filter(([rampId]) => rampId !== componentId)
        .map(([, ramp]) => this.getRampPlacement(ramp)),
      ...[...this.blocks.entries()]
        .filter(([blockId]) => blockId !== componentId)
        .map(([, block]) => this.getBlockPlacement(block)),
    ];
  }

  private getRampPlacement(ramp: EditableRamp): RectanglePlacement {
    return {
      ...ramp.definition,
      x: ramp.shape.x,
      y: ramp.shape.y,
      rotation: ramp.shape.rotation,
    };
  }

  private getBlockPlacement(block: EditableBlock): RectanglePlacement {
    return {
      ...block.definition,
      x: block.shape.x,
      y: block.shape.y,
      rotation: 0,
    };
  }

  private rotateSelectedRamp(direction: -1 | 1): void {
    if (!this.editInteractionEnabled || !this.selectedComponentId) return;
    const ramp = this.ramps.get(this.selectedComponentId);
    if (!ramp || !ramp.editable) return;
    this.updateRampTransform(
      ramp.definition.id,
      ramp.shape.x,
      ramp.shape.y,
      rotateRampByStep(ramp.shape.rotation, direction),
      true,
    );
  }

  private updateSelectionDisplay(): void {
    if (!this.editInteractionEnabled) this.drag = undefined;
    for (const [rampId, ramp] of this.ramps) {
      this.updateComponentSelection(rampId, ramp, RAMP_STROKE_COLOR);
    }
    for (const [blockId, block] of this.blocks) {
      this.updateComponentSelection(
        blockId,
        block,
        block.editable ? BLOCK_STROKE_COLOR : FIXED_BLOCK_STROKE_COLOR,
      );
    }
    for (const ball of this.balls.values()) {
      this.updateComponentSelection(
        ball.definition.id,
        ball,
        BALL_STROKE_COLOR,
      );
    }
    for (const actor of this.actors.values()) {
      this.updateComponentSelection(
        actor.definition.id,
        actor,
        BIRD_DARK_COLOR,
      );
    }
  }

  private updateComponentSelection(
    componentId: string,
    component: EditableComponent | EditableBall | AutonomousActor,
    strokeColor: number,
  ): void {
    const selected =
      this.editInteractionEnabled && this.selectedComponentId === componentId;
    component.selectionText.setVisible(selected);
    component.shape.setStrokeStyle(
      selected ? 5 : 4,
      selected ? SELECTED_RAMP_STROKE_COLOR : strokeColor,
    );
    if (this.editInteractionEnabled) {
      component.shape.setInteractive({ useHandCursor: component.editable });
    } else {
      component.shape.disableInteractive();
    }
  }

  private prepareComponentInput(
    shape: Phaser.GameObjects.Shape,
    hitArea: Phaser.Geom.Circle | Phaser.Geom.Rectangle,
    hitAreaCallback: Phaser.Types.Input.HitAreaCallback,
  ): void {
    shape.setInteractive({ hitArea, hitAreaCallback });
    shape.disableInteractive();
  }

  private drawWorkshop(): void {
    this.cameras.main.setBackgroundColor(0xf7f4ed);
    const graphics = this.add.graphics();
    graphics.lineStyle(1, 0xd8d8d2, 0.9);
    for (let x = 0; x <= PLAYABLE_WIDTH; x += 48) {
      graphics.lineBetween(x, 0, x, PLAYABLE_HEIGHT);
    }
    for (let y = 0; y <= PLAYABLE_HEIGHT; y += 48) {
      graphics.lineBetween(0, y, PLAYABLE_WIDTH, y);
    }
    this.add
      .text(24, 22, this.level.title.toUpperCase(), {
        color: "#34383a",
        fontFamily: "Arial, sans-serif",
        fontSize: "16px",
        fontStyle: "bold",
      })
      .setDepth(5);
  }

  private updateBallHighlights(): void {
    for (const ball of this.balls.values()) this.updateBallHighlight(ball);
  }

  private updateBallHighlight(ball: EditableBall): void {
    ball.shadow.setPosition(
      ball.shape.x + ball.definition.radius * 0.14,
      ball.shape.y + ball.definition.radius * 0.18,
    );
    ball.highlight.setPosition(
      ball.shape.x - ball.definition.radius * 0.32,
      ball.shape.y - ball.definition.radius * 0.34,
    );
  }

  private updateRampSurface(
    ramp: EditableRamp,
    position: { x: number; y: number },
    rotation: number,
  ): void {
    const sine = Math.sin(rotation);
    const cosine = Math.cos(rotation);
    ramp.shadow
      .setPosition(position.x - sine * 4, position.y + cosine * 4)
      .setRotation(rotation);
    ramp.highlight
      .setPosition(
        position.x + sine * (ramp.definition.height * 0.22),
        position.y - cosine * (ramp.definition.height * 0.22),
      )
      .setRotation(rotation);
  }

  private updateBlockSurface(
    block: EditableBlock,
    position: { x: number; y: number },
  ): void {
    block.shadow.setPosition(position.x + 3, position.y + 4);
    block.highlight.setPosition(
      position.x,
      position.y - block.definition.height * 0.32,
    );
  }

  private drawGoalCup(goal: LevelDefinition["goal"]): void {
    const graphics = this.add.graphics().setDepth(3);
    const rimY = goal.y - goal.height / 2 + 10;
    const bottomY = goal.y + goal.height / 2 - 6;
    const topWidth = goal.width * 0.82;
    const bottomWidth = goal.width * 0.56;
    const drawCupBody = (offsetX: number, offsetY: number): void => {
      graphics.beginPath();
      graphics.moveTo(goal.x - topWidth / 2 + offsetX, rimY + offsetY);
      graphics.lineTo(goal.x + topWidth / 2 + offsetX, rimY + offsetY);
      graphics.lineTo(goal.x + bottomWidth / 2 + offsetX, bottomY + offsetY);
      graphics.lineTo(goal.x - bottomWidth / 2 + offsetX, bottomY + offsetY);
      graphics.closePath();
    };

    graphics.fillStyle(0x173d1b, 0.42);
    drawCupBody(3, 5);
    graphics.fillPath();
    graphics.fillStyle(0x4fad31, 1);
    drawCupBody(0, 0);
    graphics.fillPath();
    graphics.lineStyle(4, 0x1b4820, 1);
    graphics.strokePath();
    graphics.fillStyle(0x245f28, 1);
    graphics.fillEllipse(goal.x, rimY, topWidth + 8, 16);
    graphics.fillStyle(0x8de75a, 1);
    graphics.fillRect(goal.x - topWidth / 2 - 4, rimY - 8, topWidth + 8, 9);
    graphics.lineStyle(3, 0x1b4820, 1);
    graphics.strokeRect(goal.x - topWidth / 2 - 4, rimY - 8, topWidth + 8, 12);
    graphics.fillStyle(0xc8f29a, 0.72);
    graphics.beginPath();
    graphics.moveTo(goal.x - topWidth * 0.3, rimY + 10);
    graphics.lineTo(goal.x - topWidth * 0.12, rimY + 12);
    graphics.lineTo(goal.x - bottomWidth * 0.18, bottomY - 9);
    graphics.lineTo(goal.x - bottomWidth * 0.36, bottomY - 10);
    graphics.closePath();
    graphics.fillPath();
    graphics.fillStyle(0x2a6628, 1);
    graphics.fillRect(
      goal.x - bottomWidth * 0.32,
      bottomY - 2,
      bottomWidth * 0.64,
      8,
    );
    graphics.lineStyle(3, 0x1b4820, 1);
    graphics.strokeRect(
      goal.x - bottomWidth * 0.32,
      bottomY - 2,
      bottomWidth * 0.64,
      8,
    );
  }

  private showSuccess(): void {
    if (this.successText) return;
    this.successText = this.add
      .text(480, 105, "CONTRAPTION COMPLETE!", {
        backgroundColor: "#f3e2b8",
        color: "#315341",
        fontFamily: "Arial, sans-serif",
        fontSize: "34px",
        fontStyle: "bold",
        padding: { x: 24, y: 14 },
        stroke: "#513a25",
        strokeThickness: 2,
      })
      .setOrigin(0.5)
      .setDepth(10);
  }
}

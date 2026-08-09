import Phaser from "phaser";
import {
  COLLISION_ACTOR_BODY_OPTIONS,
  getActorPosition,
  getPatrolVelocity,
  resolvePatrolDirection,
  type PatrolState,
} from "./autonomousActors";
import { executeContactRules } from "./contactRules";
import {
  isClickMovementWithinTolerance,
  recordCompletedClick,
  type CompletedClick,
} from "./doubleClick";
import {
  isEditablePart,
  type ActorDefinition,
  type BlockDefinition,
  type ContactTag,
  type LevelDefinition,
  type RampDefinition,
} from "../levels/levelTypes";
import { TRAY_BLOCK_ID_PREFIX, TRAY_RAMP_ID_PREFIX } from "../state/gameState";
import type { BlockTransform, RampTransform } from "../state/gameState";
import {
  clampRampPosition,
  isRectanglePlacementValid,
  PLAYABLE_HEIGHT,
  PLAYABLE_WIDTH,
  type RectanglePlacement,
  rotateRampByStep,
} from "./rampPlacement";

const BALL_LABEL = "prototype-ball";
const GOAL_LABEL = "prototype-goal";
const RAMP_STROKE_COLOR = 0x4c3526;
const SELECTED_RAMP_STROKE_COLOR = 0xffd166;
const BLOCK_FILL_COLOR = 0x6f7d78;
const BLOCK_STROKE_COLOR = 0x344e41;
const FIXED_BLOCK_FILL_COLOR = 0x465053;
const FIXED_BLOCK_STROKE_COLOR = 0x252b2d;
const ACTOR_FILL_COLOR = 0x5b7cfa;
const ACTOR_STROKE_COLOR = 0x2d3a8c;
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
interface EditableRamp {
  definition: RampDefinition;
  editable: boolean;
  fromTray: boolean;
  shape: Phaser.GameObjects.Rectangle;
  selectionText: Phaser.GameObjects.Text;
}

interface EditableBlock {
  definition: BlockDefinition;
  editable: boolean;
  fixedLabel?: Phaser.GameObjects.Text;
  fromTray: boolean;
  shape: Phaser.GameObjects.Rectangle;
  selectionText: Phaser.GameObjects.Text;
}

interface EditableComponent {
  editable: boolean;
  shape: Phaser.GameObjects.Rectangle;
  selectionText: Phaser.GameObjects.Text;
}

interface ContactObject {
  tag: ContactTag;
  destroy: () => void;
}

type MatterRectangle = Phaser.GameObjects.Rectangle &
  Phaser.Physics.Matter.Components.Gravity &
  Phaser.Physics.Matter.Components.Transform &
  Phaser.Physics.Matter.Components.Velocity;

interface AutonomousActor {
  definition: ActorDefinition;
  patrol: PatrolState;
  shape: MatterRectangle;
  label: Phaser.GameObjects.Text;
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

interface ActorSnapshot {
  id: string;
  patrol: PatrolState;
}

interface SceneRunSnapshot {
  actors: ActorSnapshot[];
  parts: PlayerPartSnapshot[];
}

export class PrototypeScene extends Phaser.Scene {
  private ball?: Phaser.GameObjects.Arc;
  private drag?: {
    componentId: string;
    componentType: "ramp" | "block";
    offset: Phaser.Math.Vector2;
    pointerStart: Phaser.Math.Vector2;
  };
  private dragMoved = false;
  private editInteractionEnabled = false;
  private lastComponentClick?: CompletedClick;
  private readonly blocks = new Map<string, EditableBlock>();
  private readonly actors = new Map<string, AutonomousActor>();
  private readonly contactObjects = new Map<MatterJS.BodyType, ContactObject>();
  private readonly ramps = new Map<string, EditableRamp>();
  private runSnapshot?: SceneRunSnapshot;
  private simulationRunning = false;
  private selectedComponentId: string | null = null;
  private successText?: Phaser.GameObjects.Text;

  constructor(
    private readonly level: LevelDefinition,
    private readonly onSuccess: () => void,
    private readonly onSelectionChange: (componentId: string | null) => void,
    private readonly onRampTransformChange: (
      rampId: string,
      transform: RampTransform,
    ) => void,
    private readonly onBlockTransformChange: (
      blockId: string,
      transform: BlockTransform,
    ) => void,
    private readonly onComponentRemove: (
      componentId: string,
      returnsTrayPart: "block" | "ramp" | null,
    ) => void,
  ) {
    super("prototype");
  }

  create(): void {
    this.drawWorkshop();
    this.createLevelObjects();
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
        } else {
          this.updateBlockPosition(this.drag.componentId, x, y, true);
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
    this.simulationRunning = running;
    if (running) this.matter.world.resume();
    else this.matter.world.pause();
  }

  update(): void {
    if (!this.simulationRunning) return;
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
      const labelPosition = getActorPosition(
        actor.definition.movement.axis,
        position,
        actor.definition.movement.axis === "horizontal"
          ? actor.definition.y
          : actor.definition.x,
      );
      actor.label.setPosition(labelPosition.x, labelPosition.y);
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
        isRectanglePlacementValid(
          { ...definition, rotation: 0 },
          this.getCurrentBall(),
          this.getOtherPlacements(id),
        )
      ) {
        this.createBlock(definition, true);
        return id;
      }
    }
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
        isRectanglePlacementValid(
          definition,
          this.getCurrentBall(),
          this.getOtherPlacements(id),
        )
      ) {
        this.createRamp(definition, true);
        return id;
      }
    }
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
      actors: [...this.actors.values()].map((actor) => ({
        id: actor.definition.id,
        patrol: { ...actor.patrol },
      })),
    };
  }

  rerunFromSnapshot(): boolean {
    if (!this.runSnapshot) return false;
    this.matter.world.pause();
    this.restoreParts(this.runSnapshot.parts);
    this.restoreActors(this.runSnapshot.actors);
    this.resetBallAndSuccess();
    return true;
  }

  resetLevel(): void {
    this.matter.world.pause();
    this.restoreLevelParts();
    this.restoreActors();
    this.runSnapshot = undefined;
    this.resetBallAndSuccess();
  }

  private resetBallAndSuccess(): void {
    this.destroyBall();
    this.successText?.destroy();
    this.successText = undefined;

    const { x, y, radius } = this.level.ball;
    this.ball = this.add
      .circle(x, y, radius, 0xc68b45, 1)
      .setStrokeStyle(4, 0x513a25);
    this.matter.add.gameObject(this.ball, {
      shape: { type: "circle", radius },
      restitution: 0.15,
      friction: 0.02,
      label: BALL_LABEL,
    });
    this.ball.setData("initial", { x, y, radius });
    this.registerContactObject(this.ball, "ball", () => this.destroyBall());
  }

  private createLevelObjects(): void {
    const { floor, goal, gravity } = this.level;
    this.matter.world.setGravity(gravity.x, gravity.y);

    const floorShape = this.add
      .rectangle(floor.x, floor.y, floor.width, floor.height, 0x465053)
      .setStrokeStyle(3, 0x252b2d);
    this.matter.add.gameObject(floorShape, { isStatic: true, label: "floor" });
    this.registerContactObject(floorShape, "floor", () => floorShape.destroy());

    const goalShape = this.add
      .rectangle(goal.x, goal.y, goal.width, goal.height, 0x759c82, 0.28)
      .setStrokeStyle(5, 0x315341);
    this.matter.add.gameObject(goalShape, {
      isStatic: true,
      isSensor: true,
      label: GOAL_LABEL,
    });
    this.registerContactObject(goalShape, "goal", () => goalShape.destroy());
    this.add
      .text(goal.x, goal.y, "GOAL", {
        color: "#294939",
        fontFamily: "Arial, sans-serif",
        fontSize: "18px",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    this.resetLevel();
    this.updateSelectionDisplay();
  }

  private createRamp(definition: RampDefinition, fromTray = false): void {
    const shape = this.add
      .rectangle(
        definition.x,
        definition.y,
        definition.width,
        definition.height,
        0x9d6b45,
      )
      .setStrokeStyle(4, RAMP_STROKE_COLOR)
      .setRotation(definition.rotation);
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

    this.ramps.set(definition.id, {
      definition,
      editable: isEditablePart(definition, fromTray),
      fromTray,
      shape,
      selectionText,
    });
    this.registerContactObject(shape, "ramp", () =>
      this.destroyRampFromContact(definition.id),
    );
  }

  private createBlock(definition: BlockDefinition, fromTray = false): void {
    const editable = isEditablePart(definition, fromTray);
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
      );
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
    const fixedLabel = editable
      ? undefined
      : this.add
          .text(definition.x, definition.y, "FIXED", {
            color: "#f7f3ea",
            fontFamily: "Arial, sans-serif",
            fontSize: "13px",
            fontStyle: "bold",
          })
          .setOrigin(0.5)
          .setDepth(2);

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

    this.blocks.set(definition.id, {
      definition,
      editable,
      fixedLabel,
      fromTray,
      shape,
      selectionText,
    });
    this.registerContactObject(shape, "block", () =>
      this.destroyBlockFromContact(definition.id),
    );
  }

  private handleComponentPointerDown(
    componentType: "ramp" | "block",
    componentId: string,
    shape: Phaser.GameObjects.Rectangle,
    pointer: Phaser.Input.Pointer,
    event: Phaser.Types.Input.EventData,
  ): void {
    event.stopPropagation();
    if (!this.editInteractionEnabled) return;
    const component =
      componentType === "ramp"
        ? this.ramps.get(componentId)
        : this.blocks.get(componentId);
    if (!component?.editable) return;
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
    componentType: "ramp" | "block",
    componentId: string,
  ): void {
    if (componentType === "ramp") {
      const ramp = this.ramps.get(componentId);
      if (!ramp || !ramp.editable) return;
      this.unregisterContactObject(ramp.shape);
      ramp.shape.destroy();
      ramp.selectionText.destroy();
      this.ramps.delete(componentId);
      this.onComponentRemove(
        componentId,
        isEditablePart(ramp.definition, ramp.fromTray) ? "ramp" : null,
      );
      return;
    }
    const block = this.blocks.get(componentId);
    if (!block || !block.editable) return;
    this.unregisterContactObject(block.shape);
    block.shape.destroy();
    block.selectionText.destroy();
    block.fixedLabel?.destroy();
    this.blocks.delete(componentId);
    this.onComponentRemove(
      componentId,
      isEditablePart(block.definition, block.fromTray) ? "block" : null,
    );
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

  private restoreActors(snapshot: readonly ActorSnapshot[] = []): void {
    this.destroyActors();
    const snapshotsById = new Map(
      snapshot.map((actorSnapshot) => [actorSnapshot.id, actorSnapshot]),
    );
    for (const actor of this.level.actors) {
      this.createActor(actor, snapshotsById.get(actor.id)?.patrol);
    }
  }

  private createActor(
    definition: ActorDefinition,
    patrol: PatrolState = {
      position:
        definition.movement.axis === "horizontal" ? definition.x : definition.y,
      direction: definition.movement.direction,
    },
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
          ACTOR_FILL_COLOR,
        )
        .setStrokeStyle(3, ACTOR_STROKE_COLOR)
        .setDepth(2),
      {
        ...COLLISION_ACTOR_BODY_OPTIONS,
        label: `actor:${definition.id}`,
      },
    ) as MatterRectangle;
    shape.setIgnoreGravity(true).setFixedRotation();
    const label = this.add
      .text(position.x, position.y, definition.tag.toUpperCase(), {
        color: "#f7f3ea",
        fontFamily: "Arial, sans-serif",
        fontSize: "11px",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setDepth(3);
    this.actors.set(definition.id, {
      definition,
      patrol: { ...patrol },
      shape,
      label,
    });
    this.registerContactObject(shape, definition.tag, () =>
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
      ramp.selectionText.destroy();
    }
    for (const block of this.blocks.values()) {
      this.unregisterContactObject(block.shape);
      block.shape.destroy();
      block.selectionText.destroy();
      block.fixedLabel?.destroy();
    }
    this.ramps.clear();
    this.blocks.clear();
  }

  private destroyActors(): void {
    for (const actor of this.actors.values()) {
      this.unregisterContactObject(actor.shape);
      actor.shape.destroy();
      actor.label.destroy();
    }
    this.actors.clear();
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
      { ...first, destroy: () => this.destroyContactObject(bodyA) },
      { ...second, destroy: () => this.destroyContactObject(bodyB) },
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
    contactObject.destroy();
  }

  private registerContactObject(
    gameObject: MatterGameObject,
    tag: ContactTag,
    destroy: () => void,
  ): void {
    if (gameObject.body) {
      this.contactObjects.set(gameObject.body as MatterJS.BodyType, {
        tag,
        destroy,
      });
    }
  }

  private unregisterContactObject(gameObject: MatterGameObject): void {
    if (gameObject.body) {
      this.contactObjects.delete(gameObject.body as MatterJS.BodyType);
    }
  }

  private destroyBall(): void {
    if (!this.ball) return;
    this.unregisterContactObject(this.ball);
    this.ball.destroy();
    this.ball = undefined;
  }

  private destroyRampFromContact(componentId: string): void {
    const ramp = this.ramps.get(componentId);
    if (!ramp) return;
    this.unregisterContactObject(ramp.shape);
    ramp.shape.destroy();
    ramp.selectionText.destroy();
    this.ramps.delete(componentId);
  }

  private destroyBlockFromContact(componentId: string): void {
    const block = this.blocks.get(componentId);
    if (!block) return;
    this.unregisterContactObject(block.shape);
    block.shape.destroy();
    block.selectionText.destroy();
    block.fixedLabel?.destroy();
    this.blocks.delete(componentId);
  }

  private destroyActorFromContact(actorId: string): void {
    const actor = this.actors.get(actorId);
    if (!actor) return;
    this.unregisterContactObject(actor.shape);
    actor.shape.destroy();
    actor.label.destroy();
    this.actors.delete(actorId);
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
      return;
    }
    ramp.shape.setPosition(position.x, position.y).setRotation(rotation);
    ramp.selectionText.setPosition(position.x, position.y - 34);
    if (notify) this.onRampTransformChange(rampId, { position, rotation });
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
    if (notify && !this.isValidBlockEditPlacement(blockId, position)) return;
    block.shape.setPosition(position.x, position.y);
    block.selectionText.setPosition(position.x, position.y - 34);
    if (notify) this.onBlockTransformChange(blockId, { position });
  }

  private isValidRampEditPlacement(
    rampId: string,
    position: { x: number; y: number },
    rotation: number,
  ): boolean {
    const ramp = this.ramps.get(rampId);
    if (!ramp) return false;
    return isRectanglePlacementValid(
      { ...ramp.definition, ...position, rotation },
      this.getCurrentBall(),
      this.getOtherPlacements(rampId),
    );
  }

  private isValidBlockEditPlacement(
    blockId: string,
    position: { x: number; y: number },
  ): boolean {
    const block = this.blocks.get(blockId);
    if (!block) return false;
    return isRectanglePlacementValid(
      { ...block.definition, ...position, rotation: 0 },
      this.getCurrentBall(),
      this.getOtherPlacements(blockId),
    );
  }

  private getCurrentBall(): { x: number; y: number; radius: number } {
    return this.ball
      ? { x: this.ball.x, y: this.ball.y, radius: this.level.ball.radius }
      : this.level.ball;
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
  }

  private updateComponentSelection(
    componentId: string,
    component: EditableComponent,
    strokeColor: number,
  ): void {
    const selected =
      this.editInteractionEnabled && this.selectedComponentId === componentId;
    component.selectionText.setVisible(selected);
    component.shape.setStrokeStyle(
      selected ? 5 : 4,
      selected ? SELECTED_RAMP_STROKE_COLOR : strokeColor,
    );
    if (this.editInteractionEnabled && component.editable) {
      component.shape.setInteractive({ useHandCursor: true });
    } else {
      component.shape.disableInteractive();
    }
  }

  private drawWorkshop(): void {
    this.cameras.main.setBackgroundColor(0xc7cec6);
    const graphics = this.add.graphics();
    graphics.lineStyle(1, 0xabb5ad, 0.55);
    for (let x = 0; x <= PLAYABLE_WIDTH; x += 48) {
      graphics.lineBetween(x, 0, x, PLAYABLE_HEIGHT);
    }
    for (let y = 0; y <= PLAYABLE_HEIGHT; y += 48) {
      graphics.lineBetween(0, y, PLAYABLE_WIDTH, y);
    }
    graphics.fillStyle(0x6f7d78, 0.45);
    graphics.fillRect(40, 42, 880, 12);
    this.add.text(52, 68, this.level.title.toUpperCase(), {
      color: "#4b5753",
      fontFamily: "Arial, sans-serif",
      fontSize: "17px",
      fontStyle: "bold",
    });
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

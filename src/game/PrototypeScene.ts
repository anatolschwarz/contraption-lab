import Phaser from "phaser";
import type { LevelDefinition, RampDefinition } from "../levels/levelTypes";
import type { RampTransform } from "../state/gameState";
import {
  clampRampPosition,
  isRampPlacementValid,
  PLAYABLE_HEIGHT,
  PLAYABLE_WIDTH,
  type RampPlacement,
  rotateRampByStep,
} from "./rampPlacement";

const BALL_LABEL = "prototype-ball";
const GOAL_LABEL = "prototype-goal";
const RAMP_STROKE_COLOR = 0x4c3526;
const SELECTED_RAMP_STROKE_COLOR = 0xffd166;

interface EditableRamp {
  definition: RampDefinition;
  shape: Phaser.GameObjects.Rectangle;
  selectionText: Phaser.GameObjects.Text;
}

export class PrototypeScene extends Phaser.Scene {
  private ball?: Phaser.GameObjects.Arc;
  private drag?: { rampId: string; offset: Phaser.Math.Vector2 };
  private editInteractionEnabled = false;
  private readonly ramps = new Map<string, EditableRamp>();
  private selectedRampId: string | null = null;
  private successText?: Phaser.GameObjects.Text;

  constructor(
    private readonly level: LevelDefinition,
    private readonly onSuccess: () => void,
    private readonly onSelectionChange: (rampId: string | null) => void,
    private readonly onRampTransformChange: (
      rampId: string,
      transform: RampTransform,
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
      ) => {
        const labels = [bodyA.label, bodyB.label];
        if (labels.includes(BALL_LABEL) && labels.includes(GOAL_LABEL)) {
          this.showSuccess();
          this.onSuccess();
        }
      },
    );
    this.input.on(Phaser.Input.Events.POINTER_DOWN, () => {
      if (this.editInteractionEnabled) this.onSelectionChange(null);
    });
    this.input.on(
      Phaser.Input.Events.POINTER_MOVE,
      (pointer: Phaser.Input.Pointer) => {
        if (!this.editInteractionEnabled || !this.drag || !pointer.isDown) {
          return;
        }
        const ramp = this.ramps.get(this.drag.rampId);
        if (!ramp) return;
        this.updateRampTransform(
          this.drag.rampId,
          pointer.worldX - this.drag.offset.x,
          pointer.worldY - this.drag.offset.y,
          ramp.shape.rotation,
          true,
        );
      },
    );
    this.input.on(Phaser.Input.Events.POINTER_UP, () => {
      this.drag = undefined;
    });
    this.input.on(Phaser.Input.Events.POINTER_UP_OUTSIDE, () => {
      this.drag = undefined;
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
    if (running) this.matter.world.resume();
    else this.matter.world.pause();
  }

  setEditSelection(enabled: boolean, selectedRampId: string | null): void {
    this.editInteractionEnabled = enabled;
    this.selectedRampId = selectedRampId;
    this.updateSelectionDisplay();
  }

  setRampTransforms(transforms: Readonly<Record<string, RampTransform>>): void {
    for (const ramp of this.ramps.values()) {
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

  resetLevel(): void {
    this.matter.world.pause();
    this.setRampTransforms({});
    this.ball?.destroy();
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
  }

  private createLevelObjects(): void {
    const { floor, goal, gravity } = this.level;
    this.matter.world.setGravity(gravity.x, gravity.y);

    const floorShape = this.add
      .rectangle(floor.x, floor.y, floor.width, floor.height, 0x465053)
      .setStrokeStyle(3, 0x252b2d);
    this.matter.add.gameObject(floorShape, { isStatic: true, label: "floor" });

    for (const ramp of this.level.ramps) {
      this.createRamp(ramp);
    }

    const goalShape = this.add
      .rectangle(goal.x, goal.y, goal.width, goal.height, 0x759c82, 0.28)
      .setStrokeStyle(5, 0x315341);
    this.matter.add.gameObject(goalShape, {
      isStatic: true,
      isSensor: true,
      label: GOAL_LABEL,
    });
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

  private createRamp(definition: RampDefinition): void {
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
        event.stopPropagation();
        if (!this.editInteractionEnabled) return;
        this.onSelectionChange(definition.id);
        this.drag = {
          rampId: definition.id,
          offset: new Phaser.Math.Vector2(
            pointer.worldX - shape.x,
            pointer.worldY - shape.y,
          ),
        };
      },
    );

    this.ramps.set(definition.id, { definition, shape, selectionText });
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
    const position = clampRampPosition(
      { x, y },
      { ...ramp.definition, rotation },
    );
    if (notify && !this.isValidEditPlacement(rampId, position, rotation)) {
      return;
    }
    ramp.shape.setPosition(position.x, position.y).setRotation(rotation);
    ramp.selectionText.setPosition(position.x, position.y - 34);
    if (notify) this.onRampTransformChange(rampId, { position, rotation });
  }

  private isValidEditPlacement(
    rampId: string,
    position: { x: number; y: number },
    rotation: number,
  ): boolean {
    const ramp = this.ramps.get(rampId);
    if (!ramp) return false;
    const ball = this.ball
      ? { x: this.ball.x, y: this.ball.y, radius: this.level.ball.radius }
      : this.level.ball;
    const otherRamps = [...this.ramps.entries()]
      .filter(([otherRampId]) => otherRampId !== rampId)
      .map(([, otherRamp]) => this.getRampPlacement(otherRamp));

    return isRampPlacementValid(
      { ...ramp.definition, ...position, rotation },
      ball,
      otherRamps,
    );
  }

  private getRampPlacement(ramp: EditableRamp): RampPlacement {
    return {
      ...ramp.definition,
      x: ramp.shape.x,
      y: ramp.shape.y,
      rotation: ramp.shape.rotation,
    };
  }

  private rotateSelectedRamp(direction: -1 | 1): void {
    if (!this.editInteractionEnabled || !this.selectedRampId) return;
    const ramp = this.ramps.get(this.selectedRampId);
    if (!ramp) return;
    this.updateRampTransform(
      ramp.definition.id,
      ramp.shape.x,
      ramp.shape.y,
      rotateRampByStep(ramp.shape.rotation, direction),
      true,
    );
  }

  private updateSelectionDisplay(): void {
    for (const [rampId, ramp] of this.ramps) {
      const selected =
        this.editInteractionEnabled && this.selectedRampId === rampId;
      ramp.selectionText.setVisible(selected);
      ramp.shape.setStrokeStyle(
        selected ? 5 : 4,
        selected ? SELECTED_RAMP_STROKE_COLOR : RAMP_STROKE_COLOR,
      );
      if (this.editInteractionEnabled) {
        ramp.shape.setInteractive({ useHandCursor: true });
      } else {
        this.drag = undefined;
        ramp.shape.disableInteractive();
      }
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

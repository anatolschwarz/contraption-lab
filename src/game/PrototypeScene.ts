import Phaser from "phaser";
import type { LevelDefinition } from "../levels/levelTypes";
import type { SelectableComponent } from "../state/gameState";

const BALL_LABEL = "prototype-ball";
const GOAL_LABEL = "prototype-goal";
const RAMP_STROKE_COLOR = 0x4c3526;
const SELECTED_RAMP_STROKE_COLOR = 0xffd166;

export class PrototypeScene extends Phaser.Scene {
  private ball?: Phaser.GameObjects.Arc;
  private editInteractionEnabled = false;
  private rampShape?: Phaser.GameObjects.Rectangle;
  private selectedComponent: SelectableComponent | null = null;
  private selectionText?: Phaser.GameObjects.Text;
  private successText?: Phaser.GameObjects.Text;

  constructor(
    private readonly level: LevelDefinition,
    private readonly onSuccess: () => void,
    private readonly onSelectionChange: (
      component: SelectableComponent | null,
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
    this.matter.world.pause();
  }

  setSimulationRunning(running: boolean): void {
    if (running) this.matter.world.resume();
    else this.matter.world.pause();
  }

  setEditSelection(
    enabled: boolean,
    selectedComponent: SelectableComponent | null,
  ): void {
    this.editInteractionEnabled = enabled;
    this.selectedComponent = selectedComponent;
    this.updateSelectionDisplay();
  }

  resetLevel(): void {
    this.matter.world.pause();
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
    const { floor, ramp, goal, gravity } = this.level;
    this.matter.world.setGravity(gravity.x, gravity.y);

    const floorShape = this.add
      .rectangle(floor.x, floor.y, floor.width, floor.height, 0x465053)
      .setStrokeStyle(3, 0x252b2d);
    this.matter.add.gameObject(floorShape, { isStatic: true, label: "floor" });

    this.rampShape = this.add
      .rectangle(ramp.x, ramp.y, ramp.width, ramp.height, 0x9d6b45)
      .setStrokeStyle(4, RAMP_STROKE_COLOR)
      .setRotation(ramp.rotation);
    this.matter.add.gameObject(this.rampShape, {
      isStatic: true,
      label: "ramp",
    });
    this.rampShape.on(
      Phaser.Input.Events.POINTER_DOWN,
      (
        _pointer: Phaser.Input.Pointer,
        _localX: number,
        _localY: number,
        event: Phaser.Types.Input.EventData,
      ) => {
        event.stopPropagation();
        if (this.editInteractionEnabled) this.onSelectionChange("ramp");
      },
    );

    this.selectionText = this.add
      .text(ramp.x, ramp.y - 34, "RAMP SELECTED", {
        color: "#513a25",
        fontFamily: "Arial, sans-serif",
        fontSize: "14px",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setDepth(2)
      .setVisible(false);

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

  private updateSelectionDisplay(): void {
    const isRampSelected =
      this.editInteractionEnabled && this.selectedComponent === "ramp";
    this.selectionText?.setVisible(isRampSelected);
    this.rampShape?.setStrokeStyle(
      isRampSelected ? 5 : 4,
      isRampSelected ? SELECTED_RAMP_STROKE_COLOR : RAMP_STROKE_COLOR,
    );

    if (this.editInteractionEnabled) {
      this.rampShape?.setInteractive({ useHandCursor: true });
    } else {
      this.rampShape?.disableInteractive();
    }
  }

  private drawWorkshop(): void {
    this.cameras.main.setBackgroundColor(0xc7cec6);
    const graphics = this.add.graphics();
    graphics.lineStyle(1, 0xabb5ad, 0.55);
    for (let x = 0; x <= 960; x += 48) graphics.lineBetween(x, 0, x, 540);
    for (let y = 0; y <= 540; y += 48) graphics.lineBetween(0, y, 960, y);
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

import { describe, expect, it } from "vitest";
import {
  addContactVectors,
  executeContactRules,
  redirectVelocity,
} from "../src/game/contactRules";
import type { ContactParticipant } from "../src/game/contactRules";
import type { ContactRule } from "../src/levels/levelTypes";

function participant(
  id: string,
  tag: ContactParticipant["tag"],
  velocity = { x: 0, y: 0 },
): ContactParticipant & {
  destroyCount: () => number;
  effects: () => readonly string[];
  velocity: () => { x: number; y: number };
} {
  let destroyCount = 0;
  let currentVelocity = velocity;
  const effectLog: string[] = [];
  return {
    id,
    tag,
    destroy: () => {
      destroyCount += 1;
      effectLog.push("destroy");
    },
    applyImpulse: (impulse) => {
      currentVelocity = addContactVectors(currentVelocity, impulse);
      effectLog.push(`impulse:${impulse.x},${impulse.y}`);
    },
    redirect: (direction) => {
      currentVelocity =
        redirectVelocity(currentVelocity, direction) ?? currentVelocity;
      effectLog.push(`redirect:${direction.x},${direction.y}`);
    },
    destroyCount: () => destroyCount,
    effects: () => effectLog,
    velocity: () => currentVelocity,
  };
}

describe("contact rules", () => {
  const destroyBlock: ContactRule = {
    contacts: ["ball", "block"],
    action: { type: "destroy", target: "block" },
  };

  it("preserves destroy behavior regardless of collision order", () => {
    const ball = participant("ball-1", "ball");
    const block = participant("block-1", "block");
    executeContactRules([destroyBlock], ball, block);
    expect(ball.destroyCount()).toBe(0);
    expect(block.destroyCount()).toBe(1);

    const reversedBall = participant("ball-1", "ball");
    const reversedBlock = participant("block-1", "block");
    executeContactRules([destroyBlock], reversedBlock, reversedBall);
    expect(reversedBall.destroyCount()).toBe(0);
    expect(reversedBlock.destroyCount()).toBe(1);
  });

  it("does nothing for unrelated contacts and destroys a target only once", () => {
    const ball = participant("ball-1", "ball");
    const ramp = participant("ramp-1", "ramp");
    executeContactRules([destroyBlock], ball, ramp);
    expect(ball.destroyCount()).toBe(0);
    expect(ramp.destroyCount()).toBe(0);

    const block = participant("block-1", "block");
    executeContactRules([destroyBlock, destroyBlock], ball, block);
    expect(block.destroyCount()).toBe(1);
  });

  it("does not execute later actions for an already-destroyed participant", () => {
    const ball = participant("ball-1", "ball", { x: 1, y: 0 });
    const block = participant("block-1", "block");
    const rules: ContactRule[] = [
      {
        contacts: ["ball", "block"],
        action: { type: "destroy", target: { type: "contact", index: 0 } },
      },
      {
        contacts: ["ball", "block"],
        action: {
          type: "impulse",
          target: { type: "contact", index: 0 },
          impulse: { x: 5, y: 0 },
        },
      },
    ];

    executeContactRules(rules, ball, block);
    expect(ball.destroyCount()).toBe(1);
    expect(ball.effects()).toEqual(["destroy"]);
    expect(ball.velocity()).toEqual({ x: 1, y: 0 });
  });

  it("applies a declared impulse to the selected contact role", () => {
    const ball = participant("ball-1", "ball", { x: 2, y: -1 });
    const block = participant("block-1", "block");
    const rule: ContactRule = {
      contacts: ["ball", "block"],
      action: {
        type: "impulse",
        target: { type: "contact", index: 0 },
        impulse: { x: 3, y: 4 },
      },
    };

    executeContactRules([rule], block, ball);
    expect(ball.velocity()).toEqual({ x: 5, y: 3 });
  });

  it("redirects while preserving speed, including a reversed contact order", () => {
    const ball = participant("ball-1", "ball", { x: 3, y: 4 });
    const block = participant("block-1", "block");
    const rule: ContactRule = {
      contacts: ["ball", "block"],
      action: {
        type: "redirect",
        target: { type: "contact", index: 0 },
        direction: { x: -1, y: 0 },
      },
    };

    executeContactRules([rule], block, ball);
    expect(ball.velocity()).toEqual({ x: -5, y: 0 });
  });

  it("evaluates generic participant-id conditions deterministically", () => {
    const rule: ContactRule = {
      contacts: ["ball", "block"],
      conditions: [
        {
          type: "participant-id",
          target: { type: "contact", index: 0 },
          equals: "chosen-ball",
        },
      ],
      action: {
        type: "impulse",
        target: { type: "contact", index: 0 },
        impulse: { x: 1, y: 0 },
      },
    };
    const chosen = participant("chosen-ball", "ball");
    const rejected = participant("other-ball", "ball");
    const block = participant("block-1", "block");

    executeContactRules([rule], chosen, block);
    executeContactRules([rule], rejected, block);

    expect(chosen.velocity()).toEqual({ x: 1, y: 0 });
    expect(rejected.velocity()).toEqual({ x: 0, y: 0 });
  });

  it("uses participant ids to target same-tag contacts unambiguously", () => {
    const firstBall = participant("left", "ball", { x: 1, y: 0 });
    const secondBall = participant("right", "ball", { x: 1, y: 0 });
    const rule: ContactRule = {
      contacts: ["ball", "ball"],
      action: {
        type: "redirect",
        target: { type: "id", id: "right" },
        direction: { x: 0, y: 1 },
      },
    };

    executeContactRules([rule], secondBall, firstBall);
    expect(firstBall.velocity()).toEqual({ x: 1, y: 0 });
    expect(secondBall.velocity()).toEqual({ x: 0, y: 1 });
  });

  it("executes matching rules in source order and repeats deterministically", () => {
    const rules: ContactRule[] = [
      {
        contacts: ["ball", "block"],
        action: {
          type: "impulse",
          target: { type: "contact", index: 0 },
          impulse: { x: 2, y: 0 },
        },
      },
      {
        contacts: ["ball", "block"],
        action: {
          type: "redirect",
          target: { type: "contact", index: 0 },
          direction: { x: 0, y: 1 },
        },
      },
    ];
    const run = () => {
      const ball = participant("ball-1", "ball", { x: 1, y: 0 });
      executeContactRules(rules, ball, participant("block-1", "block"));
      return { effects: ball.effects(), velocity: ball.velocity() };
    };

    expect(run()).toEqual({
      effects: ["impulse:2,0", "redirect:0,1"],
      velocity: { x: 0, y: 3 },
    });
    expect(run()).toEqual(run());
  });

  it("dispatches only registered capabilities, not concrete object types", () => {
    const experimental = participant("experimental-1", "unlisted-widget", {
      x: 1,
      y: 0,
    });
    const surface = participant("surface-1", "surface");
    const rule = {
      contacts: ["unlisted-widget", "surface"],
      action: {
        type: "impulse",
        target: { type: "contact", index: 0 },
        impulse: { x: 4, y: 0 },
      },
    } as unknown as ContactRule;

    executeContactRules([rule], surface, experimental);
    expect(experimental.velocity()).toEqual({ x: 5, y: 0 });
  });
});

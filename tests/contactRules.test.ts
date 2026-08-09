import { describe, expect, it } from "vitest";
import { executeContactRules } from "../src/game/contactRules";
import type { ContactParticipant } from "../src/game/contactRules";
import type { ContactRule } from "../src/levels/levelTypes";

function participant(tag: ContactParticipant["tag"]): ContactParticipant & {
  wasDestroyed: () => boolean;
  destroyCount: () => number;
} {
  let count = 0;
  return {
    tag,
    destroy: () => {
      count += 1;
    },
    wasDestroyed: () => count > 0,
    destroyCount: () => count,
  };
}

describe("contact rules", () => {
  const destroyBlock: ContactRule = {
    contacts: ["ball", "block"],
    action: { type: "destroy", target: "block" },
  };

  it("destroys the configured target regardless of collision order", () => {
    const ball = participant("ball");
    const block = participant("block");
    executeContactRules([destroyBlock], ball, block);
    expect(ball.wasDestroyed()).toBe(false);
    expect(block.wasDestroyed()).toBe(true);

    const reversedBall = participant("ball");
    const reversedBlock = participant("block");
    executeContactRules([destroyBlock], reversedBlock, reversedBall);
    expect(reversedBall.wasDestroyed()).toBe(false);
    expect(reversedBlock.wasDestroyed()).toBe(true);
  });

  it("does not act on unrelated contacts or destroy the same target twice", () => {
    const ball = participant("ball");
    const ramp = participant("ramp");
    executeContactRules([destroyBlock], ball, ramp);
    expect(ball.wasDestroyed()).toBe(false);
    expect(ramp.wasDestroyed()).toBe(false);

    const target = participant("block");
    executeContactRules([destroyBlock, destroyBlock], ball, target);
    expect(target.wasDestroyed()).toBe(true);
    expect(target.destroyCount()).toBe(1);
  });

  it("executes the bird-to-block destroy rule after their physical contact", () => {
    const bird = participant("bird");
    const block = participant("block");
    const destroyBirdBlock: ContactRule = {
      contacts: ["bird", "block"],
      action: { type: "destroy", target: "block" },
    };

    executeContactRules([destroyBirdBlock], bird, block);

    expect(bird.wasDestroyed()).toBe(false);
    expect(block.destroyCount()).toBe(1);
  });

  it("executes a declarative bird-to-ramp destroy rule without actor-specific logic", () => {
    const bird = participant("bird");
    const ramp = participant("ramp");
    const destroyBirdRamp: ContactRule = {
      contacts: ["bird", "ramp"],
      action: { type: "destroy", target: "ramp" },
    };

    executeContactRules([destroyBirdRamp], ramp, bird);

    expect(bird.wasDestroyed()).toBe(false);
    expect(ramp.destroyCount()).toBe(1);
  });
});

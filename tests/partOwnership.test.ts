import { describe, expect, it } from "vitest";
import {
  isEditablePart,
  isPlayerPart,
  type BlockDefinition,
} from "../src/levels/levelTypes";

const fixedBlock: BlockDefinition = {
  id: "fixed-block",
  x: 100,
  y: 100,
  width: 80,
  height: 60,
  ownership: "fixed",
};

const preplacedPlayerBlock: BlockDefinition = {
  ...fixedBlock,
  id: "player-block",
  ownership: "player",
};

describe("level-part ownership", () => {
  it("keeps fixed level objects non-editable", () => {
    expect(isPlayerPart(fixedBlock)).toBe(false);
    expect(isEditablePart(fixedBlock, false)).toBe(false);
  });

  it("makes preplaced player parts and tray-spawned parts editable", () => {
    expect(isPlayerPart(preplacedPlayerBlock)).toBe(true);
    expect(isEditablePart(preplacedPlayerBlock, false)).toBe(true);
    expect(isEditablePart(fixedBlock, true)).toBe(true);
  });
});

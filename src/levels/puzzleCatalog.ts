import rawHardLevel from "./hard.json";
import rawMediumLevel from "./medium.json";
import rawBasicLevel from "./prototype.json";
import type { LevelDefinition } from "./levelTypes";
import { loadLevel } from "./loadLevel";

const levels = [
  loadLevel(rawBasicLevel),
  loadLevel(rawMediumLevel),
  loadLevel(rawHardLevel),
].sort((first, second) => first.order - second.order);

if (new Set(levels.map((level) => level.id)).size !== levels.length) {
  throw new Error("Built-in puzzle ids must be unique.");
}
if (new Set(levels.map((level) => level.order)).size !== levels.length) {
  throw new Error("Built-in puzzle orders must be unique.");
}

export const builtInPuzzles: readonly LevelDefinition[] = levels;

export function getBuiltInPuzzle(
  puzzleId: string,
): LevelDefinition | undefined {
  return builtInPuzzles.find((puzzle) => puzzle.id === puzzleId);
}

export function getBuiltInPuzzlePosition(puzzleId: string): number | undefined {
  const index = builtInPuzzles.findIndex((puzzle) => puzzle.id === puzzleId);
  return index < 0 ? undefined : index + 1;
}

export function getNextBuiltInPuzzle(
  puzzleId: string,
): LevelDefinition | undefined {
  const currentIndex = builtInPuzzles.findIndex(
    (puzzle) => puzzle.id === puzzleId,
  );
  return currentIndex < 0 ? undefined : builtInPuzzles[currentIndex + 1];
}

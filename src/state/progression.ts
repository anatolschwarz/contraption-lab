import type { LevelDefinition } from "../levels/levelTypes";
import { createInitialGameState, type GameState } from "./gameState";

export const PROGRESSION_STORAGE_KEY = "contraption-lab.progression.v1";

export interface StorageAdapter {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export interface ProgressionState {
  completedPuzzleIds: string[];
  unlockAll: boolean;
}

export type PuzzleAvailability = "locked" | "available" | "completed";

export interface PuzzleProgress {
  availability: PuzzleAvailability;
  puzzle: LevelDefinition;
}

export interface PuzzleRuntime {
  gameState: GameState;
  puzzleId: string;
}

function puzzleIds(puzzles: readonly LevelDefinition[]): string[] {
  return puzzles.map((puzzle) => puzzle.id);
}

function normalizeProgression(
  value: unknown,
  puzzles: readonly LevelDefinition[],
): ProgressionState {
  if (!isStoredProgression(value)) return createInitialProgression();
  const knownPuzzleIds = new Set(puzzleIds(puzzles));
  return {
    completedPuzzleIds: value.completedPuzzleIds.filter((puzzleId) =>
      knownPuzzleIds.has(puzzleId),
    ),
    unlockAll: value.unlockAll,
  };
}

function isStoredProgression(
  value: unknown,
): value is Readonly<ProgressionState> {
  return (
    typeof value === "object" &&
    value !== null &&
    "completedPuzzleIds" in value &&
    Array.isArray(value.completedPuzzleIds) &&
    value.completedPuzzleIds.every(
      (puzzleId) => typeof puzzleId === "string",
    ) &&
    "unlockAll" in value &&
    typeof value.unlockAll === "boolean"
  );
}

export function createInitialProgression(): ProgressionState {
  return { completedPuzzleIds: [], unlockAll: false };
}

export function loadProgression(
  storage: Pick<StorageAdapter, "getItem"> | undefined,
  puzzles: readonly LevelDefinition[],
): ProgressionState {
  if (!storage) return createInitialProgression();
  try {
    const serialized = storage.getItem(PROGRESSION_STORAGE_KEY);
    return serialized
      ? normalizeProgression(JSON.parse(serialized), puzzles)
      : createInitialProgression();
  } catch {
    return createInitialProgression();
  }
}

export function saveProgression(
  storage: Pick<StorageAdapter, "setItem"> | undefined,
  progression: Readonly<ProgressionState>,
): void {
  if (!storage) return;
  try {
    storage.setItem(PROGRESSION_STORAGE_KEY, JSON.stringify(progression));
  } catch {
    // Local progress is optional when browser storage is unavailable.
  }
}

export function getPuzzleProgress(
  puzzles: readonly LevelDefinition[],
  progression: Readonly<ProgressionState>,
): PuzzleProgress[] {
  const completed = new Set(progression.completedPuzzleIds);
  return puzzles.map((puzzle, index) => {
    if (completed.has(puzzle.id)) {
      return { puzzle, availability: "completed" };
    }
    const previousPuzzle = puzzles[index - 1];
    const isAvailable =
      progression.unlockAll ||
      index === 0 ||
      (previousPuzzle !== undefined && completed.has(previousPuzzle.id));
    return { puzzle, availability: isAvailable ? "available" : "locked" };
  });
}

export function completePuzzle(
  progression: Readonly<ProgressionState>,
  puzzleId: string,
  puzzles: readonly LevelDefinition[],
): ProgressionState {
  if (!puzzleIds(puzzles).includes(puzzleId)) return { ...progression };
  return progression.completedPuzzleIds.includes(puzzleId)
    ? {
        completedPuzzleIds: [...progression.completedPuzzleIds],
        unlockAll: progression.unlockAll,
      }
    : {
        completedPuzzleIds: [...progression.completedPuzzleIds, puzzleId],
        unlockAll: progression.unlockAll,
      };
}

export function setUnlockAll(
  progression: Readonly<ProgressionState>,
  unlockAll: boolean,
): ProgressionState {
  return {
    completedPuzzleIds: [...progression.completedPuzzleIds],
    unlockAll,
  };
}

export function canSelectPuzzle(
  puzzleId: string,
  puzzles: readonly LevelDefinition[],
  progression: Readonly<ProgressionState>,
): boolean {
  return getPuzzleProgress(puzzles, progression).some(
    ({ availability, puzzle }) =>
      puzzle.id === puzzleId && availability !== "locked",
  );
}

export function createPuzzleRuntime(
  puzzle: Readonly<LevelDefinition>,
): PuzzleRuntime {
  return {
    puzzleId: puzzle.id,
    gameState: createInitialGameState(
      puzzle.inventory,
      puzzle.timeLimitSeconds,
      Object.fromEntries(
        puzzle.balls
          .filter((ball) => ball.initiallyPlaced !== false)
          .map((ball) => [ball.id, { position: { x: ball.x, y: ball.y } }]),
      ),
    ),
  };
}

export function switchPuzzle(
  current: Readonly<PuzzleRuntime>,
  puzzleId: string,
  puzzles: readonly LevelDefinition[],
  progression: Readonly<ProgressionState>,
): PuzzleRuntime {
  const target = puzzles.find((puzzle) => puzzle.id === puzzleId);
  if (!target || !canSelectPuzzle(target.id, puzzles, progression)) {
    return {
      puzzleId: current.puzzleId,
      gameState: { ...current.gameState },
    };
  }
  return createPuzzleRuntime(target);
}

export function getNextUnlockedPuzzle(
  puzzleId: string,
  puzzles: readonly LevelDefinition[],
  progression: Readonly<ProgressionState>,
): LevelDefinition | undefined {
  const currentIndex = puzzles.findIndex((puzzle) => puzzle.id === puzzleId);
  if (currentIndex < 0) return undefined;
  const nextPuzzle = puzzles[currentIndex + 1];
  return nextPuzzle && canSelectPuzzle(nextPuzzle.id, puzzles, progression)
    ? nextPuzzle
    : undefined;
}

import type { LevelDefinition } from "./levelTypes";
import { validateLevel } from "./validateLevel";

export function loadLevel(rawLevel: unknown): LevelDefinition {
  return validateLevel(rawLevel);
}

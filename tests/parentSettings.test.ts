import { describe, expect, it } from "vitest";
import {
  PARENT_SETTINGS_STORAGE_KEY,
  createInitialParentSettings,
  loadParentSettings,
  saveParentSettings,
  setParentSetting,
} from "../src/state/parentSettings";
import type { StorageAdapter } from "../src/state/progression";

class MemoryStorage implements StorageAdapter {
  private readonly values = new Map<string, string>();

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }
}

describe("parent settings", () => {
  it("defaults timer/failure and puzzle locking to off", () => {
    expect(createInitialParentSettings()).toEqual({
      puzzleLocking: false,
      timerFailureMode: false,
    });
  });

  it("persists both parent options locally", () => {
    const storage = new MemoryStorage();
    const enabled = setParentSetting(
      setParentSetting(createInitialParentSettings(), "timerFailureMode", true),
      "puzzleLocking",
      true,
    );

    saveParentSettings(storage, enabled);

    expect(storage.getItem(PARENT_SETTINGS_STORAGE_KEY)).toBeTruthy();
    expect(loadParentSettings(storage)).toEqual(enabled);
  });
});

import type { StorageAdapter } from "./progression";

export const PARENT_SETTINGS_STORAGE_KEY = "contraption-lab.parent-settings.v1";

export interface ParentSettings {
  puzzleLocking: boolean;
  timerFailureMode: boolean;
}

export function createInitialParentSettings(): ParentSettings {
  return { puzzleLocking: false, timerFailureMode: false };
}

function isStoredParentSettings(value: unknown): value is ParentSettings {
  return (
    typeof value === "object" &&
    value !== null &&
    "puzzleLocking" in value &&
    typeof value.puzzleLocking === "boolean" &&
    "timerFailureMode" in value &&
    typeof value.timerFailureMode === "boolean"
  );
}

export function loadParentSettings(
  storage: Pick<StorageAdapter, "getItem"> | undefined,
): ParentSettings {
  if (!storage) return createInitialParentSettings();
  try {
    const serialized = storage.getItem(PARENT_SETTINGS_STORAGE_KEY);
    const parsed = serialized ? JSON.parse(serialized) : undefined;
    return isStoredParentSettings(parsed)
      ? { ...parsed }
      : createInitialParentSettings();
  } catch {
    return createInitialParentSettings();
  }
}

export function saveParentSettings(
  storage: Pick<StorageAdapter, "setItem"> | undefined,
  settings: Readonly<ParentSettings>,
): void {
  if (!storage) return;
  try {
    storage.setItem(PARENT_SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // Parent options remain optional when browser storage is unavailable.
  }
}

export function setParentSetting(
  settings: Readonly<ParentSettings>,
  key: keyof ParentSettings,
  value: boolean,
): ParentSettings {
  return { ...settings, [key]: value };
}

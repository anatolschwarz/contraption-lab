export const DOUBLE_CLICK_WINDOW_MS = 350;
export const CLICK_MOVEMENT_TOLERANCE_PX = 8;

export interface CompletedClick {
  componentId: string;
  completedAt: number;
}

export interface PointerPosition {
  x: number;
  y: number;
}

export function isClickMovementWithinTolerance(
  start: Readonly<PointerPosition>,
  current: Readonly<PointerPosition>,
): boolean {
  const horizontalDistance = current.x - start.x;
  const verticalDistance = current.y - start.y;
  return (
    horizontalDistance ** 2 + verticalDistance ** 2 <=
    CLICK_MOVEMENT_TOLERANCE_PX ** 2
  );
}

export function recordCompletedClick(
  previous: Readonly<CompletedClick> | undefined,
  current: Readonly<CompletedClick>,
): { isDoubleClick: boolean; nextClick?: CompletedClick } {
  const isDoubleClick =
    previous?.componentId === current.componentId &&
    current.completedAt >= previous.completedAt &&
    current.completedAt - previous.completedAt <= DOUBLE_CLICK_WINDOW_MS;
  return isDoubleClick
    ? { isDoubleClick: true }
    : { isDoubleClick: false, nextClick: { ...current } };
}

export const SIMULATION_STEP_MS = 1_000 / 60;

const STEP_EPSILON = 1e-9;

export interface SimulationStepResult {
  remainingMs: number;
  stepCount: number;
}

/**
 * Converts elapsed render time into a whole number of fixed physics steps.
 * Keeping the fractional remainder makes the result independent of how the
 * browser partitions the same elapsed time into animation frames.
 */
export function consumeSimulationSteps(
  accumulatedMs: number,
  elapsedMs: number,
): SimulationStepResult {
  const totalMs = Math.max(0, accumulatedMs) + Math.max(0, elapsedMs);
  const stepCount = Math.floor((totalMs + STEP_EPSILON) / SIMULATION_STEP_MS);
  const remainingMs = totalMs - stepCount * SIMULATION_STEP_MS;

  return {
    stepCount,
    remainingMs: remainingMs <= STEP_EPSILON ? 0 : remainingMs,
  };
}

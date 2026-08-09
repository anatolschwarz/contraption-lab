# Roadmap

This roadmap is planning guidance, not a commitment to implement every item
without a separate scoped milestone request.

## #14 — Multi-puzzle architecture

- Support a validated catalog of puzzle JSON files and a minimal selector.
- Keep puzzle state, inventory, Reset, and Rerun isolated to the active puzzle.
- Avoid duplicated scene/gameplay logic across puzzles.

## #15 — Contact/reaction event system

- Completed: validated level-defined contact rules, central Matter contact
  dispatch, and the `destroy` action.

## #16 — Autonomous actors / moving objects

- Completed: added JSON-defined Bird actors with deterministic collision-enabled
  patrol movement, contact tags, Pause/Resume behavior, and Rerun/Reset
  restoration.
- Future actor movement modes should remain declarative and avoid actor-specific
  gameplay code.

## #17 — Timed puzzle constraints

- Add scoped time-based puzzle constraints and clear player feedback.
- Define deterministic Pause, Rerun, Reset, and success behavior for timers.

## #18 — Progression + editor UX

- Define lightweight progression across puzzles.
- Improve selection, placement feedback, tray affordances, and input
  discoverability without expanding into a general-purpose editor.

## #19 — Polish + broader e2e

- Expand browser coverage to current and future puzzle interactions.
- Review responsiveness, performance, accessibility, and MVP readiness.

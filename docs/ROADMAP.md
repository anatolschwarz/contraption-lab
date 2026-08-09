# Roadmap

This roadmap is planning guidance, not a commitment to implement every item
without a separate scoped milestone request.

## #14 — Multi-puzzle architecture

- Make Play the default/root screen; do not add a separate Home screen.
- Add a compact Play-screen puzzle selector that opens a Basic/Medium/Hard
  grouped panel or modal with locked, available, completed, and timed states.
- Keep one global sequential progression order; difficulty is grouping metadata
  rather than a separate progression path.
- Persist progress with `localStorage`, add Settings support for Unlock all
  puzzles, and offer Next Puzzle prominently after Success.
- Keep puzzle state, parts tray, Reset, and Rerun isolated to the active puzzle.

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

- Completed: added optional positive JSON time limits, countdown feedback, and
  deterministic Pause, Rerun, Reset, Success, and Timeout behavior.

## #18 — Progression + editor UX

- Add the future Puzzle Editor and Settings screens accessible from Play.
- Define a global object library of supported types while keeping available
  tray parts and counts in each puzzle JSON.
- Store user-created puzzles separately from bundled puzzles; never overwrite
  bundled JSON.
- Improve rotation UX, selection, placement feedback, tray affordances, and
  input discoverability without broadening the editor beyond approved scope.

## #19 — Polish + broader e2e

- Expand browser coverage to current and future puzzle interactions.
- Review responsiveness, performance, accessibility, and MVP readiness.

## Discussion backlog

- Music.
- Rotation UX.
- Puzzle editor plus object coloring.
- Themed, original object libraries.

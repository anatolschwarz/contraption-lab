# Roadmap

This roadmap is planning guidance, not a commitment to implement every item
without a separate scoped milestone request.

## #14 — Multi-puzzle architecture

- Completed by #18: Play is the root screen with a Basic/Medium/Hard selector,
  ordered built-in JSON catalog, local progress, Unlock all, Next Puzzle, and
  isolated active-puzzle runtime state.

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

- Completed progression scope: three lightweight ordered built-ins, grouping,
  unlock/completion persistence, Settings Unlock all, and Next Puzzle.
- Next: Puzzle Editor, a global object library, and separately stored
  user-created puzzles that never overwrite bundled JSON.
- Improve rotation UX, selection, placement feedback, tray affordances, and
  input discoverability without broadening the editor beyond approved scope.

## #19 — Polish + broader e2e

- Completed: refined Play-screen spacing, hierarchy, selector states, tray and
  control layout, plus visible rejected-edit feedback.
- Completed: browser coverage now exercises the current MVP's solve/Next,
  inventory, Rerun/Reset, timed, progression/settings, actor/contact, and
  ownership flows. Serial repeat runs remain the recommended external
  determinism check.
- Future accessibility and performance work should remain separately scoped.

## Discussion backlog

- Music.
- Rotation UX.
- Puzzle editor plus object coloring.
- Themed, original object libraries.

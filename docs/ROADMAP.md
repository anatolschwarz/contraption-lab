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

## #18 — Progression and puzzle switching

- Completed progression scope: three lightweight ordered built-ins, grouping,
  unlock/completion persistence, Settings Unlock all, and Next Puzzle.

## #19 — Polish + broader e2e

- Completed: refined Play-screen spacing, hierarchy, selector states, tray and
  control layout, plus visible rejected-edit feedback.
- Completed: browser coverage now exercises the current MVP's solve/Next,
  inventory, Rerun/Reset, timed, progression/settings, actor/contact, and
  ownership flows in nine scenarios. The fixed 60 Hz simulation remains the
  basis for serial repeat determinism checks.
- Future accessibility and performance work should remain separately scoped.
- The known Vite production bundle-size warning remains acceptable while Phaser
  is bundled in the main chunk.

## #20 — Ball as a normal component/part

- Completed: Ball uses a minimal level-driven multi-Ball ownership/inventory
  model: unique JSON ids, fixed and player-owned coexistence, and stock equal
  to omitted player-owned Balls.
- Completed: player-owned Ball selection, placement, removal, Reset, and Rerun
  share the existing interaction rules while fixed Balls retain fixed-part
  feedback. Pause, Success, and Timeout retain the live dynamic Matter
  transform; no gameplay physics or built-in puzzle layout changed.

## #21 — Compact Play toolbar

- Replace oversized Play controls with a compact toolbar.
- Preserve Run/Pause, Rerun, Reset, and Next Puzzle behavior.
- Keep the gameplay canvas as the primary visual focus.

## #22 — Dockable/collapsible Parts Palette

- Replace the current small Parts tray.
- Open the palette beside the Play canvas so the puzzle remains visible.
- Keep contents and counts per-puzzle.
- The global object library defines supported types; individual puzzles define
  allowed types and quantities.
- Design so categories, icons, and scrolling can be added later.

## Backlog / To Discuss

- Music
- Rotation UX
  - mouse rotation
  - arrow keys vs Q/E
  - left/right vs up/down mapping
- Puzzle Editor
  - object coloring
- Themed/original object libraries
  - unicorn/fantasy
  - other original themed packs
  - avoid copyrighted/branded characters/assets

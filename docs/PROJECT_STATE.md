# Project State

## Status

Contraption Lab is a browser-only physics-puzzle prototype with three
lightweight built-in puzzles in a global sequence: Basic, Medium, and Hard.
The initial level, **Relay Ramps**, is playable in a fixed 960×540 simulation
area. It has a ball, goal, floor, two preplaced player ramps, one fixed guide
block, and level-defined tray inventory (currently Block 2 and Ramp 4).

The untouched layout fails. The known working solution is:

| Part         |   X |   Y | Angle |
| ------------ | --: | --: | ----: |
| `upper-ramp` | 265 | 245 |   25° |
| `lower-ramp` | 540 | 395 |   25° |

The Playwright flow checks these positions with ±1 px tolerance and uses the
same 25° rotation (five 5° Q/E steps).

## Play and progression

- **Play screen:** the default/root screen; it contains the gameplay canvas,
  per-puzzle parts tray, controls, timer/status, puzzle selector, and Settings.
  There is no separate Home screen.
- **Puzzle selector:** a compact Play-screen selector opens a grouped panel for
  Basic, Medium, and Hard. It shows locked, available, and completed states
  plus a timed-puzzle indicator. Locked puzzles cannot be selected. Success
  offers Next Puzzle when another unlocked puzzle exists.
- **Progression:** one global sequential order, such as Basic → Medium → Hard.
  Difficulty is metadata/grouping only, not a separate progression system.
  Progress persists locally through `localStorage`; Settings can enable manual
  Unlock all puzzles. Disabling it keeps earned completion and restores normal
  selection rules.
- **Inventory and object library:** the global library defines supported object
  types. Each puzzle JSON defines its available parts and counts, which supply
  the Play-screen tray.
- **User-created puzzles:** stored separately from bundled puzzles and never
  overwrite bundled JSON.
- **Future screen:** Puzzle Editor. Settings currently contains Unlock all
  puzzles.

## Completed milestones

- **#1–#6 — Prototype foundation:** Vite/TypeScript/Phaser setup, JSON level
  loading and validation, fixed simulation coordinates, Matter controls, and
  ball/goal success detection.
- **#7 — Two-ramp puzzle:** uniquely identified editable ramps, keyboard
  rotation, deterministic reset, and the two-ramp Playwright solution flow.
- **#8 — Block component:** added static rectangular blocks with placement,
  rendering, and reset support.
- **#9 — Parts tray:** added tray spawning, count display, selection of spawned
  parts, and inventory return on removal.
- **#10 — Ownership and safe editing:** introduced fixed versus player-owned
  JSON parts, Edit-mode placement rejection for ball/part penetration, and
  reliable double-click removal semantics.
- **#11 — Player inventory:** added Ramp tray support, level-defined inventory,
  generic tray counts, and reset of original parts plus original stock.
- **#12 — Rerun:** captures the Run-start editable layout and inventory; Rerun
  restores that snapshot, resets physics/success, and starts simulation.
- **#13 — State and documentation consolidation:** refreshed project
  documentation, limitations, validation status, and roadmap.
- **#15 — Contact/reaction rules:** added validated JSON contact rules, central
  Matter contact dispatch, and the initial `destroy` action.
- **#16 — Autonomous actors:** added JSON-defined fixed actors, deterministic
  collision-enabled patrol movement, actor contact tags, and run-snapshot/reset
  behavior.
- **#17 — Timed puzzle constraints:** added optional positive JSON time limits,
  a level-driven countdown, and deterministic timeout, Pause, Rerun, Reset,
  and Success behavior.
- **#18 — Lightweight progression and switching:** added three ordered built-in
  JSON puzzles, selector grouping, local completion/unlock persistence, Unlock
  all, Next Puzzle, and fully isolated puzzle runtime replacement.

## Current behavior

### Modes

- **Edit:** physics is paused. Player-owned ramps and blocks can be selected
  and moved; ramps also rotate with Q/E. The tray is enabled when stock exists.
- **Run / Pause:** Run starts or resumes Matter physics; Pause freezes it.
  Editing and tray controls are disabled.
- **Success:** goal contact pauses the simulation and locks Edit/Run. Rerun and
  Reset remain available.
- **Timed puzzles:** an optional positive `timeLimitSeconds` starts counting
  down with Run, freezes in Pause, and resumes with Run. Success freezes the
  remaining time. Reaching zero first enters `Failed — Time expired`; Rerun and
  Reset remain available. Rerun restores the full time limit and Reset returns
  to Edit with the original limit. Untimed levels have no countdown.
- **Rerun:** restores the specific layout, part set, transforms, and inventory
  captured when Run was last started from Edit, then runs immediately.
- **Reset:** restores the original level JSON and initial JSON inventory.
- **Puzzle switching:** the selector groups Basic, Medium, and Hard built-ins.
  Completion unlocks the next global puzzle; completed/available/locked and
  timed states are visible. Switching destroys and recreates the Phaser runtime
  from the selected built-in JSON, so no transforms, inventory, timers, or
  snapshots carry over.

### Part ownership, placement, and inventory

- Fixed level parts are static during Edit and Run and are never selectable,
  movable, rotatable, removable, or inventoried.
- Player parts can be preplaced in level JSON or tray-spawned. Removing either
  kind returns one matching inventory item.
- A new ramp/block must remain within the playfield and cannot penetrate the
  ball, another ramp, or another block. Goal overlap is allowed deliberately.
- Single clicks select. A double-click is two completed clicks on the same
  editable part within 350 ms, each below the 8 px movement threshold. Drags,
  slow clicks, and clicks across different parts do not remove a part.
- Levels may declare contact rules over the supported `ball`, `goal`, `floor`,
  `ramp`, `block`, and `bird` tags. The initial action, `destroy`, removes its
  configured contacted target. The prototype demo destroys a block contacted by
  the ball.
- Actors are fixed/non-editable JSON objects. The current Bird actor is a
  gravity-free dynamic Matter body on a horizontal patrol, so solid blocks stop
  it and collision events still run the `bird`/`block` destroy rule. It pauses
  with physics, resumes without resetting, and Rerun restores its run-start
  position and direction.

## Architecture

| Area                           | Responsibility                                                                                              |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------- |
| `src/levels/`                  | Built-in puzzle catalog, level JSON metadata, ownership/inventory types, validation, and loading.           |
| `src/state/`                   | Pure game-state and progression persistence, puzzle selection, timer, transforms, inventory, and snapshots. |
| `src/game/PrototypeScene.ts`   | Phaser rendering, Matter bodies, player interactions, collision success, and full scene-layout snapshots.   |
| `src/game/rampPlacement.ts`    | Bounds and penetration checks for editable rectangles.                                                      |
| `src/game/doubleClick.ts`      | Pure completed-click and movement-tolerance logic.                                                          |
| `src/game/contactRules.ts`     | Pure order-independent contact-rule matching and action execution.                                          |
| `src/game/autonomousActors.ts` | Pure patrol state/velocity helpers and collision-enabled actor-body options.                                |
| `src/ui/Controls.ts`           | DOM buttons, tray counts, and enabled states.                                                               |
| `src/main.ts`                  | Connects state, scene snapshots, controls, and Phaser setup.                                                |
| `tests/`                       | Vitest unit coverage for state, placement, validation, ownership, puzzle data, and gestures.                |
| `e2e/puzzle.e2e.ts`            | Playwright flow for the known two-ramp solution.                                                            |

## Automated validation

Required local validation:

```bash
npm run typecheck
npm run lint
npm test
npm run format:check
npm run build
```

`npm run test:e2e` is available separately and exercises the original
two-ramp browser flow, including the 10-second Success assertion. It does not
currently cover tray, removal, Rerun, or timed behavior in a browser.

## Known limitations and issues

- Only three lightweight built-in puzzles exist; broader puzzle content is
  intentionally deferred.
- Puzzle Editor, user-created puzzle storage, and the global object library are
  not implemented. User-created puzzles are not part of built-in progression.
- The tray uses predefined valid spawn candidates instead of a placement preview
  or user-chosen initial spawn position.
- Unit coverage is strong for pure interaction/state rules, but browser e2e
  coverage has not yet expanded to the newer tray, removal, ownership, and
  Rerun flows.
- Contact rules currently support only type/tag matching and the `destroy`
  action; they have no conditions, effects, or per-instance targeting.
- Autonomous actors currently support only deterministic horizontal/vertical
  patrol movement. Random and path-based movement remain future work.
- Timed behavior has unit coverage but no browser e2e coverage yet.
- Physics results can vary slightly between browser or engine versions.
- Vite reports a production chunk-size warning because Phaser is bundled in the
  main chunk; the build still succeeds.
- Touch, accessibility-specific input behavior, audio, networking, and a
  general-purpose editor remain out of scope.

## Discussion backlog

- Music.
- Rotation UX.
- Puzzle editor plus object coloring.
- Themed, original object libraries.

See [`ROADMAP.md`](ROADMAP.md) for the next planned milestones.

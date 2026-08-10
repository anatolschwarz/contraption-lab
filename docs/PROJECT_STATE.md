# Project State

## Status

Contraption Lab is a browser-only physics-puzzle prototype with three
lightweight built-in puzzles in a global sequence: Basic, Medium, and Hard.
The initial level, **Relay Ramps**, is playable in a fixed 960×540 simulation
area. It has a fixed Ball, a preplaced player-owned Ball, goal, floor, two
preplaced player ramps, one fixed guide block, and level-defined tray inventory
(currently Ball 0, Block 2, and Ramp 4).

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
- **Polish feedback:** the persistent level/title/difficulty summary stays
  visible in every mode. Selector state is visually and textually distinct, the
  tray and controls wrap cleanly, and invalid placement or fixed-part edit
  attempts show a concise live message without changing the board.
- **Puzzle selector:** a compact Play-screen selector opens a grouped panel for
  Basic, Medium, and Hard. It shows locked, available, and completed states
  plus a timed-puzzle indicator. Locked puzzles cannot be selected. Success
  offers Next Puzzle when another unlocked puzzle exists.
- **Progression:** one global sequential order, such as Basic → Medium → Hard.
  Difficulty is metadata/grouping only, not a separate progression system.
  Progress persists locally through `localStorage`; Settings can enable manual
  Unlock all puzzles. Disabling it keeps earned completion and restores normal
  selection rules.
- **Inventory:** each puzzle JSON defines its available parts and counts, which
  supply the Play-screen tray. A global object library is planned for #22.
- **User-created puzzles:** future work; they will be stored separately from
  bundled puzzles and never overwrite bundled JSON.
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
- **#19 — MVP polish and e2e coverage:** refined Play-screen hierarchy and
  controls, added visible rejected-edit feedback, and expanded browser coverage
  to nine scenarios across solve/Next Puzzle, inventory, Rerun/Reset, timed
  controls/timeout, progression, Settings, actor/contact, and ownership flows.
- **#20 — Ball as a normal component/part:** Balls are JSON-defined with ids,
  ownership, optional initial placement, and per-puzzle inventory count. Fixed
  Balls are non-editable; player-owned Balls support Edit selection,
  movement/removal, tray placement, Reset, and Run-start Rerun snapshots while
  remaining dynamic Matter bodies during simulation. The prototype supports
  the minimal multi-Ball case: fixed and player-owned Balls coexist, retain
  independent runtime/run-start transforms, and every Ball carries the `ball`
  contact tag. Ball inventory equals the number of initially unplaced
  player-owned Balls.

## Current behavior

### Modes

- **Edit:** physics is paused. Player-owned ramps, blocks, and Balls can be
  selected and moved; ramps also rotate with Q/E. The tray is enabled when
  stock exists.
- **Run / Pause:** Run starts or resumes Matter physics; Pause freezes it.
  Editing and tray controls are disabled. Pause, Success, and Timeout preserve
  the live Ball physics transform rather than restoring its Edit layout.
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

- Fixed level parts are static during Edit and are never selectable, movable,
  rotatable, removable, or inventoried. Fixed Balls remain dynamic Matter bodies
  during Run.
- Player parts can be preplaced in level JSON or tray-spawned. Removing either
  kind returns one matching inventory item.
- Balls follow the same ownership/inventory rules. Ball ids are unique;
  inventory counts unplaced player-owned Balls only. Tray replacement restores
  the matching absent JSON Ball id and geometry.
- An editable Ball, ramp, or block must remain within the playfield and cannot
  penetrate another Ball, ramp, or block. Goal overlap is allowed deliberately.
- Single clicks select. A double-click is two completed clicks on the same
  editable part within 350 ms, each below the 8 px movement threshold. Drags,
  slow clicks, and clicks across different parts do not remove a part.
- Levels may declare contact rules over the supported `ball`, `goal`, `floor`,
  `ramp`, `block`, and `bird` tags. The initial action, `destroy`, removes its
  configured contacted target. The prototype demo destroys a block contacted by
  the ball.
- Actors are fixed/non-editable JSON objects. The current Bird actor is a
  gravity-free dynamic Matter body on a horizontal patrol, so solid blocks stop
  it and collision events still run the declarative `bird`/`block` and
  `bird`/`ramp` destroy rules. It pauses with physics, resumes without
  resetting, and Rerun restores its run-start position and direction.
- Simulation uses scene-owned fixed 60 Hz Matter steps from an elapsed-time
  accumulator. Patrol velocity and timer progression advance with those same
  steps, avoiding render-frame-dependent contact ordering.

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
| `src/game/simulationClock.ts`  | Fixed 60 Hz elapsed-time accumulator used by the scene-owned Matter loop.                                   |
| `src/ui/Controls.ts`           | DOM buttons, tray counts, and enabled states.                                                               |
| `src/main.ts`                  | Connects state, scene snapshots, controls, and Phaser setup.                                                |
| `tests/`                       | Vitest unit coverage for state, placement, validation, ownership, puzzle data, and gestures.                |
| `e2e/puzzle.e2e.ts`            | Playwright MVP coverage for solve, progression, inventory, timer, ownership, actors, and contacts.          |

## Automated validation

Required local validation:

```bash
npm run typecheck
npm run lint
npm test
npm run format:check
npm run build
```

`npm run test:e2e -- --workers=1` is available separately and covers the
two-ramp solution/Next Puzzle flow, inventory removal/replacement, Rerun and
Reset, timed Run/Pause/Resume/Rerun/Timeout, progression persistence, Unlock
all, Bird patrol/contact rules, fixed/player-owned Ball behavior, and live Ball
transform preservation. Run
`npx playwright test --repeat-each=5 --workers=1` externally to stress the
deterministic browser path.

## Agreed Play-screen architecture

- Play is the default/root screen; there is no separate Home screen.
- The selector lives on Play and opens a grouped Basic / Medium / Hard panel.
- The current level, puzzle title, and difficulty remain visible during play.
- Puzzle Editor and Settings are separate screens when implemented.
- Progress persists locally. Sequential unlocking is the default; Settings can
  enable Unlock all without deleting earned progress.
- The next numbered milestones are #21 Compact Play toolbar and #22
  Dockable/collapsible Parts Palette. The Palette
  remains per-puzzle for both contents and quantities.

## Known limitations and issues

- Only three lightweight built-in puzzles exist; broader puzzle content is
  intentionally deferred.
- Puzzle Editor, user-created puzzle storage, and the global object library are
  not implemented. User-created puzzles are not part of built-in progression.
- The tray uses predefined valid spawn candidates instead of a placement preview
  or user-chosen initial spawn position.
- Contact rules currently support only type/tag matching and the `destroy`
  action; they have no conditions, effects, or per-instance targeting.
- Autonomous actors currently support only deterministic horizontal/vertical
  patrol movement. Random and path-based movement remain future work.
- Fixed 60 Hz stepping is deterministic for the same scene inputs and elapsed
  time; cross-version engine changes still require browser verification.
- Vite reports a production chunk-size warning because Phaser is bundled in the
  main chunk; the build still succeeds.
- Touch, accessibility-specific input behavior, audio, networking, and a
  general-purpose editor remain out of scope.

See [`ROADMAP.md`](ROADMAP.md) for the next planned milestones.

# Contraption Lab

Contraption Lab is an original browser-based 2D physics-puzzle prototype built
with TypeScript, Vite, Phaser 3, and Phaser's bundled Matter integration. The
current prototype has three lightweight built-in puzzles, starting with
**Relay Ramps**: arrange player-owned parts so the ball reaches the goal.

The game uses generated shapes and text only. It has no external artwork,
audio, backend, or copied game content. Built-in puzzle progression is stored
locally in the browser.

## Requirements

- Node.js 24 (see `.nvmrc`)
- npm 11 or newer
- A modern browser with WebGL or Canvas support

## Install and develop

```bash
npm install
npm run dev
```

Open the local address printed by Vite.

## Gameplay and controls

The prototype starts in **Edit** mode with Matter physics paused. The untouched
level does not solve itself.

- **Edit** — select a player-owned ramp, block, or Ball with one click. Drag it
  to move it; press Q/E to rotate a selected ramp in 5° steps. Blocks and
  Balls do not rotate. Double-click the same editable part to remove it. A completed
  double-click allows small pointer jitter, but dragging, slow clicks, and
  clicks on different parts do not remove anything.
- **Run** — captures the current edit layout and inventory, then starts the
  simulation.
- **Pause** — freezes a running simulation at its live physics state. Run
  resumes it.
- **Rerun** — while Running, Paused, or Success, restores the layout and tray
  inventory captured when that run started, resets every Ball and success state,
  and immediately runs again.
- **Reset** — restores the original JSON level layout and JSON-defined initial
  inventory. It is different from Rerun.

Levels can optionally declare a positive `timeLimitSeconds`. The configured
countdown starts with Run, freezes during Pause, and resumes with Run. Rerun
restores the Run-start layout and the full time limit; Reset returns to Edit
with that original limit. Goal success stops the countdown. If it reaches zero
first, the UI shows `Failed — Time expired`; Rerun or Reset can start over.
Untimed levels omit the field and otherwise behave as before. Relay Ramps is
the timed demo and declares a 45-second limit in its JSON.

The dockable Parts Palette is available only in Edit. Its counts come from the
current puzzle JSON; the current prototype starts with Ball (0), Block (2), and
Ramp (4). It can collapse to a small reopen control without changing its
contents. Choosing an available palette part places a valid new part and
selects it. Placing consumes one item; removing any player-owned part returns
one item of that type. A Ball uses the same fixed/player-owned ownership model: fixed Balls are
not editable, while player-owned Balls can be moved, removed, and returned to
the Ball inventory. Levels may define multiple Balls by unique JSON id. Ball
stock represents exactly the player-owned Balls initially omitted from the
board; fixed Balls are never stock. The prototype puzzle has one fixed Ball
and one preplaced player-owned Ball, so its initial Ball stock is zero.

Level parts have explicit ownership:

- **Fixed** parts are defined in JSON and cannot be selected, moved, rotated,
  or removed. Fixed ramps and blocks remain static; fixed Balls remain dynamic
  Matter bodies during Run. The `FIXED` guide block is visible in the prototype
  level.
- **Player-owned** parts may be preplaced in JSON or spawned from the tray.
  They are editable according to their component capabilities.

The prototype also includes a fixed Bird actor defined entirely in level JSON.
During Run it follows a deterministic horizontal patrol, reversing at its
configured bounds. Pause freezes its patrol, Run resumes it, Rerun restores its
run-start patrol state, and Reset restores its JSON state. Actors are regular
gravity-free dynamic Matter bodies, so they physically collide with solid parts
while still producing contact-rule events. Actors are not editable by the
player.

Matter advances through a scene-owned 60 Hz fixed-step accumulator. Ball
physics, patrol velocity, contacts, and timed countdowns advance on those same
steps, keeping
the simulation independent of browser render-frame partitioning.

During Edit, an editable part must stay inside the 960×540 playfield and may
not penetrate another Ball, ramp, or block. A transform that would violate
those rules is rejected and the last valid transform remains in use. Goal
overlap is intentionally allowed.

## Contact rules

Levels can declare reactions to Matter contacts. A rule names two supported
tags (`ball`, `goal`, `floor`, `ramp`, `block`, or `bird`) and an action. The first
supported action is `destroy`:

```json
{
  "contacts": ["ball", "block"],
  "action": { "type": "destroy", "target": "block" }
}
```

Contact order does not matter. The prototype includes this as a simple demo:
if the ball contacts a block while running, that block is destroyed. The known
two-ramp solution avoids the fixed guide block, so the original puzzle outcome
is unchanged. Contact destruction is a simulation event; Rerun and Reset
restore their respective saved layouts.

The prototype also declares `bird`/`block` → destroy block, demonstrating that
the same contact system applies to autonomous actors without bird-specific
reaction logic. Its `bird`/`ramp` → destroy ramp rule uses that same generic
path.

## Puzzle selection and progression

**Play** is the default/root screen; there is no separate Home screen. It
contains the gameplay canvas, active puzzle's dockable Parts Palette, compact
simulation toolbar,
timer/status, a puzzle selector, and Settings.

The compact selector opens a grouped panel for **Basic**, **Medium**, and
**Hard** puzzles. It shows locked, available, and completed states plus timed
indicators. Locked puzzles cannot be selected. Switching recreates the active
puzzle from its JSON definition, isolating its simulation, inventory, timer,
and run snapshot.

Progression follows one global sequential order: completing a puzzle unlocks
the next one. Difficulty is grouping metadata, not a separate progression
path. Completion and the Settings **Unlock all puzzles** flag persist in
`localStorage`. Turning that flag off restores normal unlock rules while
keeping earned completion. Success offers **Next Puzzle** when another unlocked
puzzle exists; the final puzzle displays a disabled completion action.

Each puzzle JSON supplies its own Parts Palette inventory. The global object
library and user-created puzzle storage remain future work; user-created
puzzles will stay separate from built-ins and never overwrite bundled JSON.

## Build and validation

```bash
npm run typecheck
npm run lint
npm test
npm run format:check
npm run build
```

The optional Playwright browser flow is run separately:

```bash
npm run test:e2e
```

It requires Playwright Chromium and a usable local Vite server.
The production build succeeds with the known Vite bundle-size warning for the
Phaser main chunk.
Milestones #19, #20, #21, and #22 are complete.

## GitHub Pages deployment

Pushing to `main` runs the GitHub Pages workflow, which builds the static Vite
site and deploys `dist/`. The published site is available at
[`https://anatolschwarz.github.io/contraption-lab/`](https://anatolschwarz.github.io/contraption-lab/).

The browser suite has thirteen scenarios, including fixed and player-owned
Ball coexistence, Ball placement/removal, runtime transform preservation
through Pause/Success/Timeout, and two-Ball Rerun/Reset restoration.

## Planned roadmap

Later work remains TBD in the roadmap backlog. See
[`docs/ROADMAP.md`](docs/ROADMAP.md) for scoped definitions.

## Architecture

- `src/levels/` — built-in puzzle catalog, level JSON, schema/types, loading,
  and validation.
- `src/state/` — browser-independent modes, progression persistence, timer,
  transforms, inventory, and run-start snapshot transitions.
- `src/game/` — Phaser scene, generated visuals, Matter bodies, placement
  validation, autonomous patrols, contact-rule execution, double-click gesture logic, and
  scene-layout snapshots.
- `src/ui/` — plain DOM toolbar, controls, and Parts Palette rendering.
- `src/main.ts` — composition of the level, state, controls, and Phaser game.
- `tests/` — browser-independent unit tests.
- `e2e/` — Playwright coverage for Play, progression, inventory, timed,
  ownership, contact, and deterministic-patrol MVP flows.

For the detailed current state, known solution, and roadmap, see
[`docs/PROJECT_STATE.md`](docs/PROJECT_STATE.md) and
[`docs/ROADMAP.md`](docs/ROADMAP.md).

## Current limitations

- Three lightweight built-in puzzles exercise the progression UI; broader
  puzzle content is intentionally deferred.
- Puzzle Editor, user-created puzzle storage, and the global object library are
  not implemented yet.
- Tray spawn locations are a small predefined set of valid candidates, not a
  free placement preview.
- Browser e2e is designed to run serially for deterministic simulation checks.
  It requires Playwright Chromium and a usable local Vite server.
- The numbered roadmap defines planned ball and Play-screen UI work; later
  editor, audio, library, and puzzle-content work remains TBD.
- Touch-specific interaction, persistence, audio, networking, and a general
  purpose level editor are out of scope.

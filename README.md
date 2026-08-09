# Contraption Lab

Contraption Lab is an original browser-based 2D physics-puzzle prototype built
with TypeScript, Vite, Phaser 3, and Phaser's bundled Matter integration. The
current prototype has one level, **Relay Ramps**: arrange player-owned parts so
the ball reaches the goal.

The game uses generated shapes and text only. It has no external artwork,
audio, backend, persistence, or copied game content.

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

- **Edit** — select a player-owned ramp or block with one click. Drag it to
  move it; press Q/E to rotate a selected ramp in 5° steps. Blocks do not
  rotate. Double-click the same editable part to remove it. A completed
  double-click allows small pointer jitter, but dragging, slow clicks, and
  clicks on different parts do not remove anything.
- **Run** — captures the current edit layout and inventory, then starts the
  simulation.
- **Pause** — freezes a running simulation. Run resumes it.
- **Rerun** — while Running, Paused, or Success, restores the layout and tray
  inventory captured when that run started, resets the ball and success state,
  and immediately runs again.
- **Reset** — restores the original JSON level layout and JSON-defined initial
  inventory. It is different from Rerun.

The Parts tray is also available only in Edit. Its counts come from the level
JSON; the current prototype starts with Block (2) and Ramp (4). Choosing an
available tray part places a valid new part and selects it. Placing consumes
one item; removing any player-owned part returns one item of that type.

Level parts have explicit ownership:

- **Fixed** parts are defined in JSON, remain static, and cannot be selected,
  moved, rotated, or removed. The `FIXED` guide block is visible in the
  prototype level.
- **Player-owned** parts may be preplaced in JSON or spawned from the tray.
  They are editable according to their component capabilities.

The prototype also includes a fixed Bird actor defined entirely in level JSON.
During Run it follows a deterministic horizontal patrol, reversing at its
configured bounds. Pause freezes its patrol, Run resumes it, Rerun restores its
run-start patrol state, and Reset restores its JSON state. Actors are regular
gravity-free dynamic Matter bodies, so they physically collide with solid parts
while still producing contact-rule events. Actors are not editable by the
player.

During Edit, an editable ramp or block must stay inside the 960×540 playfield
and may not penetrate the ball or any other ramp/block. A transform that would
violate those rules is rejected and the last valid transform remains in use.
Goal overlap is intentionally allowed.

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
reaction logic.

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

## Architecture

- `src/levels/` — level JSON, schema/types, loading, and validation.
- `src/state/` — browser-independent modes, transforms, inventory, and
  run-start snapshot transitions.
- `src/game/` — Phaser scene, generated visuals, Matter bodies, placement
  validation, autonomous patrols, contact-rule execution, double-click gesture logic, and
  scene-layout snapshots.
- `src/ui/` — plain DOM controls and tray rendering.
- `src/main.ts` — composition of the level, state, controls, and Phaser game.
- `tests/` — browser-independent unit tests.
- `e2e/` — Playwright coverage for the original two-ramp puzzle flow.

For the detailed current state, known solution, and roadmap, see
[`docs/PROJECT_STATE.md`](docs/PROJECT_STATE.md) and
[`docs/ROADMAP.md`](docs/ROADMAP.md).

## Current limitations

- One level only; there is no level selection or progression.
- Tray spawn locations are a small predefined set of valid candidates, not a
  free placement preview.
- Browser e2e coverage currently focuses on the original two-ramp solution;
  tray, removal, and Rerun flows are covered by unit tests rather than browser
  automation.
- Touch-specific interaction, persistence, audio, networking, and a general
  purpose level editor are out of scope.

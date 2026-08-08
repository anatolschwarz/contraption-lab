# Project State

## Current functionality

Contraption Lab is a browser-only first playable physics puzzle. It loads a
single level from JSON and renders generated Phaser shapes in a responsive 16:9
simulation area. The level contains a ball, two editable ramps, floor, and
sensor-based goal.

The prototype currently supports:

- Edit mode with the Matter simulation frozen.
- A first relay puzzle whose initial two-ramp placement does not reach the goal.
- Exclusive ramp selection in Edit mode, plus pointer dragging and Q/E rotation
  in 5-degree steps for the selected ramp only; both ramps' complete rotated
  bounds remain inside the simulation area.
- A Run/Pause toggle for starting, freezing, and resuming physics.
- Reset to reconstruct the ball and both ramps from their exact JSON-defined
  transforms.
- Goal collision detection, a completion message, and locked simulation controls
  after success until Reset is selected.
- Runtime validation of level JSON before it reaches the Phaser scene.
- Browser-independent tests for exclusive selection, two-ramp transform
  persistence, deterministic reset, and level validation.
- A Playwright Chromium smoke test covering page load, two-ramp editing,
  simulation toggle behavior, reset, and relay-puzzle completion.

## Active handover — Milestone #7 (in progress)

Milestone #7 adds a second editable ramp. The implementation is partially
complete and must not be committed or pushed yet.

Completed changes:

- Replaced the single `ramp` level property with two uniquely identified entries
  in `ramps` (`upper-ramp` and `lower-ramp`).
- Updated runtime validation to require at least two valid ramps and unique ids.
- Replaced the single ramp transform in `GameState` with ID-keyed transforms and
  an exclusive `selectedRampId`.
- Updated `PrototypeScene` to render, select, drag, rotate, clamp, persist, and
  reset each ramp independently.
- Updated the relay-puzzle layout, unit tests, e2e flow, README, and UI hint.
- Added the repository-local `.codex/config.toml` requested by the user:
  `approval_policy = "never"` and `sandbox_mode = "workspace-write"`.

Validation already run:

- `npm run typecheck` — passed.
- `npm test` — passed (4 files, 16 tests).
- `npm run lint` — passed.

Remaining work:

1. Format `src/game/PrototypeScene.ts`; Prettier requires one line wrap in the
   selection-display loop. The current session could not write with Prettier
   because its filesystem sandbox was already active before the new local Codex
   config was added.
2. Resolve the `test-results/` formatting noise before rerunning
   `npm run format:check`; those Playwright result artifacts are not shown by
   `git status` but are scanned by Prettier.
3. Run `npm run format:check`, `npm run build`, and `npm run test:e2e`.
4. Verify the browser puzzle's proposed solution coordinates in
   `e2e/puzzle.e2e.ts` physically requires both ramps and reaches the goal.
5. Review the final diff and confirm no unrelated files changed. Do not commit
   or push.

## Architecture and important files

- `src/main.ts` composes the validated level, pure state transitions, DOM
  controls, Phaser configuration, and scene lifecycle.
- `src/game/PrototypeScene.ts` owns Phaser rendering, Matter bodies, two-ramp
  input and transforms, simulation pause/resume/reset behavior, and goal
  collision handling.
- `src/game/rampPlacement.ts` calculates rotated ramp bounds and fixed rotation
  steps for the 960×540 simulation area.
- `src/levels/prototype.json` is the source of truth for the initial two-ramp
  level and reset transforms.
- `src/levels/levelTypes.ts`, `src/levels/loadLevel.ts`, and
  `src/levels/validateLevel.ts` keep level types and runtime parsing separate from
  rendering.
- `src/state/gameState.ts` contains pure mode transitions, exclusive selected
  ramp state, editable ramp transforms, and control-enabled state.
- `src/ui/Controls.ts` binds and renders the plain DOM controls.
- `tests/gameState.test.ts`, `tests/rampPlacement.test.ts`, and
  `tests/levelValidation.test.ts` cover the pure, browser-independent behavior.
- `e2e/puzzle.e2e.ts` exercises the browser-level puzzle flow through Playwright.
- `index.html` and `src/style.css` provide the page structure and responsive
  presentation.
- `vite.config.ts`, `tsconfig.json`, and `eslint.config.js` configure the build
  and static checks.

## Installed dependencies

Runtime dependency:

- `phaser@3.90.0` (including Phaser's bundled Matter physics integration)

Development dependencies:

- `@eslint/js@10.0.1`
- `@playwright/test@1.62.1`
- `eslint@10.7.0`
- `globals@17.7.0`
- `prettier@3.9.5`
- `typescript@6.0.3`
- `typescript-eslint@8.64.0`
- `vite@8.1.5`
- `vitest@4.1.10`

Exact resolved transitive versions are recorded in `package-lock.json`.

## Run, test, and build commands

Install project-local dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Run the full validation sequence:

```bash
npm run typecheck
npm run lint
npm test
npm run format:check
npm run build
```

The individual commands are:

- `npm run typecheck` — run strict TypeScript checking without emitting files.
- `npm run lint` — run ESLint across the project.
- `npm test` — run the Vitest unit suite once.
- `npm run format:check` — verify Prettier formatting.
- `npm run build` — type-check and create the production bundle in `dist/`.
- `npm run test:e2e` — start Vite and run the Chromium smoke test.

## Known limitations

- There is one fixed puzzle and two editable ramps.
- Edit mode supports only the predefined ramps; it has no general-purpose object
  manipulation or level editor.
- The Chromium smoke test covers the main browser flow, but cross-browser and
  touch-specific behavior remain untested.
- Reset determinism covers the defined initial state. Small physics differences
  can still occur between browser or engine versions.
- The production bundle includes Phaser in a large JavaScript chunk; Vite reports
  a chunk-size warning, but the prototype builds successfully.
- Touch-specific interactions, audio, persistence, networking, multiplayer, and a
  general-purpose level editor are outside the current scope.

## Recommended next milestone

Add cross-browser or touch-specific smoke coverage only when those platforms
enter scope.

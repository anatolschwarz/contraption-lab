# Contraption Lab

Contraption Lab is an original browser-based 2D physics puzzle prototype. This first playable slice demonstrates a deterministic ball-and-ramp level, simulation controls, and goal detection using Phaser's bundled Matter physics integration.

The project deliberately uses geometric shapes and text generated at runtime. It contains no external artwork, audio, backend, persistence, or protected game-specific content.

## Requirements

- Node.js 24 (see `.nvmrc`)
- npm 11 or newer
- A modern browser with WebGL or Canvas support

## Install

```bash
npm install
```

## Develop

```bash
npm run dev
```

Open the local address printed by Vite. The prototype starts in Edit mode with physics frozen. Use Run to simulate, Pause to freeze the current state, Edit to return to the non-simulating mode, and Reset to restore the exact initial level.

## Build

```bash
npm run build
```

## Test and validate

```bash
npm run typecheck
npm run lint
npm test
npm run format:check
npm run build
```

## Architecture

- `src/levels/` contains the JSON level, TypeScript level types, loading, and runtime validation.
- `src/state/` contains the browser-independent simulation mode state machine.
- `src/game/` contains the Phaser scene, generated visuals, Matter bodies, and goal collision handling.
- `src/ui/` owns the DOM control bindings and enabled states.
- `src/main.ts` composes the level, state, controls, scene, and Phaser configuration.
- `tests/` exercises validation, transitions, success, and deterministic reset logic without a browser canvas.

## Current limitations

- One fixed demonstration level with a single ball, ramp, floor, and goal.
- Edit mode freezes the simulation but does not provide object manipulation or a general-purpose level editor.
- Reset determinism covers the defined initial state; physics behavior can still vary slightly across browser/engine versions.
- Keyboard controls, touch-specific interactions, audio, persistence, and additional components are intentionally out of scope.

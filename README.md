# Contraption Lab

Contraption Lab is an original browser-based 2D physics puzzle prototype. Its first puzzle requires placing and angling a ramp to guide a ball into the goal, using Phaser's bundled Matter physics integration.

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

Open the local address printed by Vite. The puzzle starts in Edit mode with physics frozen, and its initial layout does not reach the goal. Click the ramp to select it, drag it to reposition it, and use Q/E to rotate it in 5-degree steps. The simulation toggle reads Run when stopped and Pause when running; Edit returns to the non-simulating mode, and Reset restores the exact JSON-defined ball and ramp transforms.

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
- `src/state/` contains the browser-independent simulation mode and editable ramp transform state.
- `src/game/` contains the Phaser scene, generated visuals, Matter bodies, ramp placement bounds, and goal collision handling.
- `src/ui/` owns the DOM control bindings and enabled states.
- `src/main.ts` composes the level, state, controls, scene, and Phaser configuration.
- `tests/` exercises validation, transitions, success, and deterministic reset logic without a browser canvas.

## Current limitations

- One fixed puzzle with a single ball, editable ramp, floor, and goal.
- Edit mode supports selection, dragging, and 5-degree rotation of the predefined ramp, but not a general-purpose level editor.
- Reset determinism covers the defined initial state; physics behavior can still vary slightly across browser/engine versions.
- Keyboard controls, touch-specific interactions, audio, persistence, and additional components are intentionally out of scope.

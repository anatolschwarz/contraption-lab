# AGENTS.md

## Project purpose

Contraption Lab is an original browser-only 2D physics contraption puzzle game. The current scope is a small playable technical prototype that proves deterministic level reset, simulation controls, and goal detection.

## Technology decisions

- TypeScript in strict mode
- Vite for development and production builds
- Phaser 3 with its bundled Matter physics integration
- npm with project-local dependencies only
- Vitest for browser-independent unit tests
- ESLint and Prettier for static quality checks
- Plain DOM controls; no UI framework or backend
- Phaser-generated shapes and text; no external artwork

Do not add a separate `matter-js` dependency unless a demonstrated technical requirement cannot be met through Phaser.

## Directory structure

```text
src/
  game/       Phaser scenes and rendering
  levels/     Level JSON, types, loading, and validation
  state/      Pure game-state transitions
  ui/         DOM controls
tests/        Browser-independent unit tests
```

## Coding conventions

- Keep strict TypeScript types and avoid `any`.
- Keep level parsing/validation separate from Phaser rendering.
- Prefer pure functions for state transitions and other testable logic.
- Use JSON as the source of truth for initial level state.
- Keep rendering responsive within the fixed 16:9 simulation coordinate space.
- Use Prettier formatting and the configured ESLint rules.
- Keep changes focused; do not over-engineer this prototype.

## Required validation commands

Run all commands before handing off a change:

```bash
npm run typecheck
npm run lint
npm test
npm run format:check
npm run build
```

## Scope restrictions

Do not add accounts, networking, cloud services, persistence, multiplayer, community sharing, audio, mobile packaging, a general-purpose level editor, complex graphics, extra game components, or a UI framework unless the project scope explicitly changes.

All game content must remain original. Do not copy protected names, branding, artwork, sounds, characters, written text, component designs, or puzzle layouts from The Incredible Machine or any other game.

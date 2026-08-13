# Phase 2 Reconciliation

This is the approved planning delta for Phase 2, not a description of current
implemented behavior. It reconciles the existing Contraption Lab substrate with
the approved Sunny Attic direction; it does not restart the project.

Sources: [repo review](design/phase2/contraption-lab-review-for-sol.md),
[design direction](design/phase2/sunny-attic-design-v0.1.md),
[art bible](design/phase2/sunny-attic-art-bible-v0.4.md) (v0.1 superseded, kept as provenance), [project
contract](../AGENTS.md), [implemented state](PROJECT_STATE.md), and
[roadmap](ROADMAP.md).

## A. Fixed product decisions

- Contraption Lab is a private family game for children aged 6 and 4.
- Child-facing play is gentle and wordless; it must not require reading.
- There is no mandatory failure state. Timers, failure, and locking may
  survive only as parent-gated options and are off by default.
- This supersedes the former standalone “Ignore timer” planning concept.
- Sunny Attic Storybook-flat is the approved art direction.
- Phase 2 evolves and reconciles the current architecture; it does not restart
  the project.

## B. Architecture decisions

- Preserve the deterministic fixed-step, JSON-defined, validated, and
  verifiable substrate.
- Add a headless simulation runner before significant new level production.
- Contact Actions v2 adds declarative impulse, redirect, and conditions.
- Painted Blocks also require deterministic dynamic/toppling behavior; Contact
  Actions v2 alone is insufficient.

## C. Phase-2 milestones

### #24 — Project contract / AGENTS amendment

- Target: record the approved product, scope, and architecture contract.
- Acceptance: AGENTS.md, the source-doc archive, this reconciliation, and the
  roadmap agree; no runtime behavior is claimed or changed.

### #25 — Headless simulation runner

- Target: provide deterministic headless verification of a level and a
  reference solution.
- Acceptance: it reports solved state, ticks, and relevant events without a
  rendered Phaser scene; fixtures prove deterministic results.

### #26 — Contact Actions v2

- Target: support declarative impulse, redirect, and conditional contacts.
- Acceptance: schema validation, deterministic matching, and tests cover the
  actions and conditions without character-specific gameplay branches.

### #27 — Gentle default + parent gate + wordless Play shell

- Target: make the child-facing Play experience gentle and readable without
  text.
- Acceptance: fresh child-facing play has no timer, failure, or locking;
  parent-gated options are off by default and visual play controls/goals do not
  require reading.

### #28 — Dynamic/toppling Block capability

- Target: give Block-derived Painted Blocks deterministic dynamic/toppling
  semantics.
- Acceptance: their ownership, inventory, Reset, Rerun, and headless behavior
  are specified and verified deterministically.

### #29 — Storybook asset pipeline

- Target: use original Sunny Attic Storybook-flat assets for parts,
  environments, and visual effects.
- Acceptance: rendering and physics-body responsibilities remain separated;
  generated Phaser primitives remain usable development/debug fallbacks.

### #30 — Chapter 1 L1 — Good Morning, Ball

- Target: introduce Ball and Ramp through the wordless first placement lesson.
- Acceptance: the level follows its approved card and has a
  headless-verifiable reference solution.

### #31 — Chapter 1 L2 — Boing

- Target: introduce the spring-mattress bounce intuition lesson.
- Acceptance: the level follows its approved card and has a
  headless-verifiable reference solution.

### #32 — Chapter 1 L3 — Tea Time

- Target: introduce teapot redirection.
- Acceptance: the level follows its approved card, has a headless-verifiable
  reference solution, and records a distinct reference solution for the
  materially different no-Ramp star route.

### #33 — Chapter 1 L4 — Tell the Blocks

- Target: introduce the Painted Blocks sequence and timing lesson.
- Acceptance: the level follows its approved card; deterministic toppling and
  its headless-verifiable reference solution are demonstrated.

### #34 — Chapter 1 L5 — The Cat Is Not Moving

- Target: introduce the Cat's deterministic approach-side rule.
- Acceptance: the level follows its approved card and records distinct
  headless-verifiable reference solutions for the main and back-pat star
  routes.

### #35 — Chapter 1 L6 — Wind Under the Window

- Target: introduce mattress-and-fan airborne coordination.
- Acceptance: the level follows its approved card and has a
  headless-verifiable reference solution.

### #36 — Chapter 1 acceptance pass

- Target: accept the six-level chapter as a coherent gentle family experience.
- Acceptance: every level is wordless and failure-free by default, deterministic,
  headless-verified, visually consistent with the approved art direction, and
  evaluated against its family-test criteria.

## D. Chapter-1 repo vocabulary translation

| Sunny Attic vocabulary | Repository vocabulary / direction                  |
| ---------------------- | -------------------------------------------------- |
| marble                 | Ball                                               |
| plank                  | Ramp                                               |
| teacup                 | Goal presentation                                  |
| Painted Blocks         | Block-derived dynamic/toppling component semantics |

Required future schema/runtime gains are `referenceSolutions`, future star
goals, `impulse`, `redirect`, conditions, approach-side, airborne condition,
and deterministic dynamic/toppling behavior. These are planned gains, not
current schema features.

## E. Adopt / adapt / defer / drop

- **Adopt:** the private-family audience, gentle wordless play, no-failure
  default, Sunny Attic Storybook-flat direction, Chapter-1 cards, original art,
  animation, environments, visual effects, and approved audio/SFX scope.
- **Adapt:** Sunny Attic terms to the existing Ball/Ramp/Block/Goal model;
  reuse deterministic simulation, JSON validation, declarative rules,
  ownership/inventory, and Reset/Rerun rather than replacing them.
- **Defer:** future star goals and profiles, wobble mode, later cast and
  chapters, chapter-end vignettes, the parent-gate interaction choice, and the
  Chapter-1 SFX delivery decision.
- **Drop:** greenfield assumptions, text-dependent child-facing play, mandatory
  failure, and any implication that generated shapes are the permanent art
  direction.

## F. Owner-only unresolved decisions

- Disposition of the existing five prototype puzzles in child-facing UI.
- Parent-gate interaction.
- Provisional L4/L5 ordering pending family test.
- Whether SFX is required for Chapter-1-playable or follows immediately after.

These decisions remain owner-only; this document does not reopen the settled
product decisions above.

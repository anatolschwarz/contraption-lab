# Contraption Lab — Codex Prompt Archive

This archive collects the Codex prompts used for the `contraption-lab` / TIM-style game project.

Legend:

- **VERBATIM** — exact prompt text is available in the current conversation record.
- **RECONSTRUCTED** — earlier prompt text is no longer available verbatim in the loaded conversation context; wording is reconstructed from preserved conversation/project summaries and is labeled rather than presented as exact.
- **SUPERSEDED** — prompt was later corrected/replaced.

---

## Early setup

### Step 6 — Inspect repo/environment

**RECONSTRUCTED**

```text
Read the repository and inspect the current environment.

Do not modify files.
Do not install packages.
Do not commit or push.

Report:
- repository structure
- existing files
- detected Node/npm/tooling versions
- missing pieces required for the planned browser game
- any blockers or risks

Keep this inspection read-only.
```

### Step 7 — First playable technical prototype

**RECONSTRUCTED**

```text
Create the first playable technical prototype for a spiritual successor to The Incredible Machine.

Before changing files:
- inspect the existing repo
- briefly state the implementation plan
- list any packages you need to add

Technical direction:
- TypeScript
- Vite
- Phaser 3
- Matter physics
- browser-only
- original content only; do not copy copyrighted TIM assets/content

Prototype scope:
- playfield
- floor
- one ramp
- one ball
- one goal
- Edit / Run / Pause / Reset controls
- level data loaded from JSON
- goal/success detection
- simple architecture that can later support editable components and multiple puzzles

Keep the implementation minimal.
Do not add unrelated features.

Update README/AGENTS.md if needed.
Add focused tests/checks where practical.
Run the project validation commands.

Do not commit or push.

At completion report:
- files changed
- how to run
- implemented behavior
- tests/checks and results
- known limitations
```

---

# Milestones

## #1 — Ramp selection in Edit mode

**RECONSTRUCTED**

```text
Read AGENTS.md, README.md, and docs/PROJECT_STATE.md.

Implement only the first Edit-mode interaction milestone: ramp selection.

Requirements:
- In Edit mode, clicking the ramp selects it.
- Show a clear yellow selection outline on the actual ramp geometry.
- Clicking empty playfield deselects it.
- Selection is disabled/cleared in Run/Pause.
- Do not add dragging or rotation yet.
- Preserve existing prototype behavior.
- Add focused tests.

Run typecheck, lint, tests, format check, and build.

Do not commit or push.

Report:
- files changed
- behavior implemented
- validation results
```

### #1 follow-up — Fix selection visual

**RECONSTRUCTED**

```text
Fix only the ramp-selection visual bug.

Current issue:
- selecting the ramp creates a separate translucent/rotated-looking overlay
- the actual ramp remains unchanged

Required behavior:
- do not create a separate selection rectangle
- selection highlight must follow the actual ramp geometry
- use the ramp's own stroke/outline for selection
- selection must not rotate or otherwise change the ramp

Do not add rotation functionality.
Preserve existing selection/deselection behavior.
Run the relevant tests/checks.
Do not commit or push.
```

---

## #2 — Drag selected ramp

**RECONSTRUCTED**

```text
Implement milestone #2: drag the selected ramp in Edit mode.

Requirements:
- Dragging works only in Edit mode.
- Only the ramp is draggable.
- Keep the ramp fully inside the 960x540 playfield.
- Update both the visible object and its static Matter body.
- The edited position persists through Run/Pause.
- Reset restores the original JSON position.
- Do not add rotation yet.
- Preserve selection behavior.
- Add focused tests.

Run typecheck, lint, tests, format check, and build.
Do not commit or push.
```

---

## #3 — Rotate selected ramp

**RECONSTRUCTED**

```text
Implement milestone #3: rotate the selected ramp in Edit mode.

Requirements:
- Q/E rotates only the currently selected ramp.
- Rotation works only in Edit mode.
- Use fixed 5-degree increments.
- Keep the rotated ramp inside the playfield.
- Update the visible ramp and Matter body consistently.
- Rotation persists through Run/Pause.
- Reset restores the original JSON rotation.
- Preserve selection and dragging.
- Add focused tests.

Run typecheck, lint, tests, format check, and build.
Do not commit or push.
```

---

## #4 — First real solvable puzzle

**RECONSTRUCTED**

```text
Implement milestone #4: turn the prototype into the first real solvable puzzle.

Requirements:
- Preserve the existing editor controls.
- Configure the puzzle so the untouched level fails.
- The player must reposition and/or rotate the ramp to solve it.
- A correct setup must allow the ball to reach the goal.
- Reset restores the exact JSON-defined starting state.
- Keep the puzzle small and deterministic.
- Do not add new component types.
- Add/update focused tests.

Run typecheck, lint, tests, format check, and build.
Do not commit or push.
```

---

## #5 — Combine Run/Pause

**RECONSTRUCTED**

```text
Implement milestone #5: combine Run and Pause into a single toggle control.

Requirements:
- One button handles Run/Pause.
- In Edit mode it starts the simulation.
- While Running it pauses.
- While Paused it resumes.
- Preserve Reset and existing puzzle/editor behavior.
- Keep labels/state clear.
- Update tests as needed.

Run typecheck, lint, tests, format check, and build.
Do not commit or push.
```

---

## #6 — Automated browser smoke test

**RECONSTRUCTED**

```text
Implement milestone #6: add a minimal automated browser smoke test.

Use Playwright.

The test should:
- launch the app
- interact with the real browser UI
- edit the ramp into the known working solution
- press Run
- verify the puzzle reaches Success

Keep this as a focused smoke/e2e test, not a broad suite.
Add an npm script for the e2e test.
Do not change puzzle behavior merely to satisfy the test.

Run existing validation plus the browser test where the environment permits.
Do not commit or push.
```

---

## #7 — Two independently editable ramps

**RECONSTRUCTED**

```text
Implement milestone #7: add a second independently editable ramp.

Requirements:
- Level JSON defines two ramps.
- Either ramp can be selected independently in Edit mode.
- Selection, drag, and Q/E rotation operate only on the selected ramp.
- Each ramp keeps its own transform.
- Both ramps stay within playfield bounds.
- Edited transforms persist through Run/Pause.
- Reset restores both ramps to their JSON transforms.
- Update the puzzle so solving requires/uses both ramps.
- Update unit and browser smoke tests.
- Preserve existing controls and architecture.
- Do not commit or push.

Run typecheck, lint, tests, format check, build, and e2e where possible.
```

### #7 follow-up — e2e deterministic diagnostics

**RECONSTRUCTED**

```text
Continue milestone #7.

Do not redesign the puzzle or physics.

The two-ramp puzzle works manually, but the Playwright test remains Running.

Make the e2e diagnostic and deterministic:
1. Before the final Run, read/log the actual Phaser/app transforms for both ramps.
2. Assert them against the intended solution:
   - upper-ramp: x=265, y=245, angle=25 degrees
   - lower-ramp: x=540, y=395, angle=25 degrees
3. If the transforms differ, fix the browser automation.
4. If the transforms are correct but the puzzle still does not reach Success, stop and report that result rather than changing physics/layout.
5. Capture a screenshot before Run and after failure.
6. Limit diagnostic experimentation to at most 3 attempts.

Do not commit or push.
```

### #7 follow-up — Position tolerance

**RECONSTRUCTED**

```text
Continue milestone #7.

The diagnostic differences are subpixel browser-to-canvas mapping differences.

Use:
- position tolerance: +/-0.5 px
- rotation tolerance: +/-0.001 rad

Do not change:
- intended ramp transforms
- puzzle/physics/layout
- Success timeout

Do not commit or push.
```

### #7 follow-up — Increase position tolerance

**VERBATIM**

```text
Continue milestone #7.

The diagnostic now fails only because lower-ramp Y differs by 0.8577 px.

Change POSITION_TOLERANCE from ±0.5 px to ±1.0 px.
Do not change:
- intended ramp transforms
- rotation tolerance
- puzzle/physics/layout
- 10-second Success assertion

Do not make any other changes.
Do not commit or push.
```

### #7 follow-up — Initial overlap investigation

**VERBATIM, later superseded by a more precise bug description**

```text
Continue milestone #7.

Fix only the initial puzzle layout.

Current problem:
- In Edit mode, ramps/ball/goal visibly overlap.
- In particular, a ramp intersects the ball.
- When Run starts, Matter resolves the penetration and pushes the ball above the ramp.

Requirements:
- Adjust only the initial JSON-defined transforms/positions needed to remove unintended overlaps.
- Ball must not intersect either ramp at startup.
- Ramps must not overlap each other.
- Avoid ramp/goal overlap unless intentionally required.
- Preserve the existing two-ramp puzzle and known working solution as much as possible.
- Untouched puzzle must still fail.
- The puzzle must remain solvable using both ramps.
- Reset must restore the new clean initial layout.
- Update tests/e2e only where the changed initial transforms require it.
- Run the full validation suite including test:e2e.
- Do not commit or push.

Report:
- old/new initial transforms
- confirmation that startup objects no longer overlap
- whether the known solution changed
- all validation results
```

### #7 follow-up — Correct overlap bug

**VERBATIM**

```text
Continue milestone #7.

The previous check misunderstood the issue. Initial JSON positions are fine.

Actual bug:
- While editing, I can drag/rotate a ramp so it overlaps the ball, goal, or another ramp.
- When Run starts, Matter resolves the overlap and objects jump/move unexpectedly.

Fix Edit-mode placement validation:

- A ramp may not penetrate:
  - the ball
  - the other ramp
  - the goal
- Preserve playfield-boundary checks.
- If a drag/rotation would create an overlap, reject that transform and keep the last valid transform.
- Do not change initial JSON layout or puzzle physics.
- Preserve the known working solution.
- Add focused pure tests for invalid/valid placement.
- Fix the existing TypeScript/Prettier errors in e2e/puzzle.e2e.ts.
- Run typecheck, lint, unit tests, format check, build.
- Do not commit or push.
```

### #7 follow-up — Allow intentional ramp/goal overlap

**VERBATIM**

```text
Preserve the known solution.

Allow ramp/goal overlap intentionally.

Enforce Edit-mode collision rejection only for:
- ramp vs ball
- ramp vs other ramp
- playfield bounds

Do not reject ramp/goal overlap.

The bug we need to eliminate is the ball being penetrated by a ramp and then popping when Run starts.

Keep the existing validator/tests/e2e fixes.
Run the full validation suite.
Do not commit or push.
```

### #7 discarded alternative — Disallow goal overlap

**VERBATIM, SUPERSEDED/DISCARDED**

```text
Continue milestone #7.

Change the rule: ramps must NOT overlap the goal either.

Requirements:
- Reject ramp placement/rotation that penetrates:
  - ball
  - another ramp
  - goal
- Keep playfield bounds enforcement.
- Remove the previous ramp/goal exception.
- Adjust the puzzle/goal position and/or known solution minimally so the puzzle remains solvable with two ramps.
- Do not change physics behavior.
- Keep untouched puzzle failing.
- Reset must restore a clean, non-overlapping initial state.
- Update unit/e2e tests to the new valid solution.
- Run typecheck, lint, tests, format check, build.
- Do not commit or push.

Report the new working ramp transforms and any goal-position change.
```

---

## #8 — Second editable component: Block

**VERBATIM**

```text
Start milestone #8: add a second editable component type.

Add a rectangular block/wall component.

Requirements:
- Defined in level JSON.
- Selectable in Edit mode.
- Draggable like ramps.
- No rotation yet.
- Must stay inside playfield.
- Must not overlap ball, ramps, or other blocks.
- Static Matter body during Run.
- Reset restores JSON transform.
- Existing ramp behavior and puzzle must remain unchanged.
- Add focused unit tests.
- Run typecheck, lint, tests, format check, build.
- Do not commit or push.
```

---

## Original #9 — Parts tray

**VERBATIM; later renumbered conceptually after removal was inserted first**

```text
Start milestone #9: add a minimal parts tray.

Requirements:
- Add a simple Edit-mode tray with one available block.
- User can click the tray item to create/place that block in the playfield.
- New block becomes selected immediately.
- Placement obeys existing bounds/overlap validation.
- Tray shows remaining count: 1 → 0.
- Run disables the tray.
- Reset removes spawned parts and restores inventory.
- Existing JSON-defined ramps/block and puzzle behavior remain unchanged.
- Add focused tests.
- Run typecheck, lint, tests, format check, build.
- Do not commit or push.
```

---

## #9 — Remove selected parts

### Keyboard version

**VERBATIM, SUPERSEDED**

```text
Implement milestone #9: remove selected editable parts.

Requirements:
- In Edit mode, allow deleting the currently selected ramp or block.
- Use Delete/Backspace.
- Removed part disappears visually and its Matter body is removed.
- Selection clears after deletion.
- Delete/Backspace does nothing in Run/Pause.
- Reset restores all JSON-defined parts.
- Do not allow deleting the ball or goal.
- Preserve existing drag/rotate/placement behavior.
- Add focused tests.
- Run typecheck, lint, tests, format check, build.
- Do not commit or push.
```

### Double-click version

**VERBATIM, accepted**

```text
Implement milestone #9: remove editable parts by double-click.

Requirements:
- In Edit mode, double-clicking a ramp or block removes it.
- Single click still only selects.
- Drag behavior must remain unchanged.
- Removed part disappears visually and its Matter body is removed.
- Selection clears after removal.
- Double-click does nothing in Run/Pause.
- Ball and goal cannot be removed.
- Reset restores JSON-defined parts.
- If a tray-spawned part is removed, return it to the tray inventory.
- Add focused tests.
- Run typecheck, lint, tests, format check, build.
- Do not commit or push.
```

---

## #10 — Part ownership / fixed vs player-owned

**VERBATIM**

```text
Refine milestone #10 before starting #11.

Introduce explicit level-part ownership/editability semantics.

Required model:

1. Fixed scene objects
- Defined in level JSON.
- Not selectable, draggable, rotatable, or removable.
- Remain fixed during Edit and Run.

2. Preplaced player parts
- Defined in level JSON but editable.
- Can be selected/moved/rotated according to component capabilities.
- Removing one returns one corresponding item to tray inventory.
- Reset restores its original placement and original inventory state.

3. Tray-spawned player parts
- Existing behavior: placing consumes inventory; removing returns inventory.

Update the prototype level so it contains at least one clearly fixed/static object for manual verification.

Do not add Ramp to the tray yet (#11 comes afterward).
Preserve the existing solvable puzzle as much as possible.

Add focused tests for fixed vs preplaced vs tray-spawned ownership and inventory behavior.

Run typecheck, lint, tests, format check, build.
Do not commit or push.
```

### #10 follow-up — Unified ramp inventory

**VERBATIM**

```text
Continue milestone #10.

Current bug:
- The two original editable ramps can be removed.
- But Ramp does not appear in the Parts tray.
- Removing an original ramp does not return it to inventory.

Fix the inventory model.

Required behavior:

Player-owned editable parts include BOTH:
1. parts initially placed in the level
2. parts currently sitting in the tray

For the current two original ramps:
- Start: both ramps placed, Ramp stock = 0.
- Remove one original ramp -> tray shows Ramp (1).
- Remove both -> Ramp (2).
- Place one from tray -> Ramp (1).
- Place both -> Ramp (0).
- Newly placed ramps have normal select/drag/rotate/remove behavior.
- Removing any player-owned ramp returns it to Ramp inventory regardless of whether it was originally preplaced or tray-spawned.
- Reset restores both original ramps to their JSON positions and Ramp stock = 0.

Apply the same ownership/inventory semantics generically to editable player parts where appropriate.

Fixed/static level objects:
- cannot be moved or removed
- never enter inventory

Do not redesign the puzzle or physics.
Add focused tests for the full remove -> inventory -> replace -> remove -> reset cycle.

Run typecheck, lint, tests, format check, build.
Do not commit or push.
```

---

## #11 — Level-defined inventory

**VERBATIM**

```text
Start milestone #11: make player inventory level-defined.

Requirements:
- Add inventory configuration to level JSON, e.g. Ramp and Block counts.
- Initial tray contents must come entirely from level data.
- No hardcoded Block (1) / Ramp (0) in UI or state.
- Preplaced player-owned parts still return to corresponding inventory when removed.
- Placing consumes inventory.
- Reset restores:
  - original preplaced parts
  - original inventory counts
- Fixed objects never affect inventory.
- Validate inventory schema and reject invalid/negative counts.
- Preserve current puzzle behavior exactly.
- Add focused tests.
- Run typecheck, lint, tests, format check, build.
- Do not commit or push.
```

### #11 follow-up — Reliable double-click removal

**VERBATIM**

```text
Continue milestone #11.

Bug: double-click removal is unreliable. Most double-clicks do nothing; occasionally removal works.

Fix ONLY the removal interaction first.

Requirements:
- Double-click the same editable part -> reliably remove it.
- Single click -> select only.
- Drag -> drag only; must never accidentally count as a double-click.
- Small normal mouse jitter during a double-click must not cancel detection.
- Two clicks on different parts must not remove anything.
- Keep removal disabled in Run/Pause.
- Preserve inventory semantics:
  - removed player-owned part returns +1 to its corresponding inventory.
- Do not change puzzle physics/layout.

Use a deterministic double-click definition, e.g.:
- same part
- two completed clicks within ~350 ms
- pointer movement below a small threshold
- no actual drag occurred

Add focused tests for:
- successful double-click removal
- small pointer jitter
- slow two-click sequence
- two different parts
- drag followed by click
- inventory increment exactly once

Run typecheck, lint, tests, format check, build.
Do not commit or push.
```

---

## #12 — Rerun current edited layout

**VERBATIM**

```text
Implement milestone #12: Rerun the current edited layout.

Behavior:
- When Run starts, capture a snapshot of the complete current Edit-state:
  - player-part positions/rotations
  - added/removed parts
  - inventory state
- Add a Rerun control available while Running, Paused, or Success.
- Rerun:
  - restores that Run-start snapshot
  - resets ball/physics/success state
  - immediately starts simulation again
- It must NOT restore the original JSON layout.
- Reset keeps its existing meaning: restore original level JSON + original inventory.
- Returning to Edit and changing the layout, then pressing Run, creates a new rerun snapshot.

Preserve existing puzzle behavior.
Add focused state tests.
Run typecheck, lint, tests, format check, build.
Do not commit or push.
```

---

## #13 — Consolidate project state/docs

**VERBATIM**

```text
Start milestone #13: consolidate project state and documentation.

Do not add gameplay features.

1. Audit the current implementation and tests.
2. Update README.md so it accurately describes:
   - current gameplay
   - Edit / Run / Pause / Rerun / Reset
   - ramp/block editing
   - double-click removal
   - fixed vs player-owned parts
   - parts tray and inventory
   - overlap/placement rules
3. Update docs/PROJECT_STATE.md with:
   - completed milestones through #12
   - current architecture
   - current known puzzle solution
   - current automated validation
   - known limitations/issues
4. Add docs/ROADMAP.md with milestones #14–#18:
   #14 multi-level architecture / selection
   #15 third physics component
   #16 puzzle progression
   #17 editor UX improvements
   #18 e2e/polish/MVP review
5. Remove stale documentation that contradicts current behavior.
6. Do not change gameplay/code unless required to correct an obvious documentation-discovered inconsistency.
7. Run typecheck, lint, tests, format check, build.
8. Do not commit or push.

Report exactly which docs changed and any inconsistencies discovered.
```

---

## #14 — Multi-puzzle architecture

**VERBATIM**

```text
Start milestone #14: support multiple puzzle scenes cleanly.

Terminology:
- Puzzle/scene = one concrete JSON-defined challenge.
- Level = progression/order concept; do NOT build difficulty/progression yet.

Requirements:
- Preserve the current puzzle unchanged as `prototype` / Puzzle 1.
- Add a second simple sample puzzle using ONLY existing mechanics:
  - ball
  - goal
  - ramps
  - blocks
  - fixed vs player-owned parts
  - inventory
- No new physics/object types in this milestone.
- Add a minimal puzzle selector outside gameplay.
- Switching puzzle must fully reset runtime state:
  - selection
  - spawned/removed parts
  - inventory
  - success state
  - rerun snapshot
  - Matter bodies
- Reset restores the currently selected puzzle.
- Rerun remains scoped to the currently selected puzzle/run snapshot.
- Avoid duplicated game logic per puzzle.
- Keep puzzle data entirely level/scene-driven.
- Add focused tests for:
  - loading multiple puzzles
  - switching isolation
  - reset isolation
  - rerun snapshot isolation
  - inventory isolation
- Update README.md and docs/PROJECT_STATE.md if architecture changes.
- Run:
  - npm run typecheck
  - npm run lint
  - npm test
  - npm run format:check
  - npm run build
- Do not commit or push.

Report:
- files changed
- how puzzles are registered/loaded
- Puzzle 2 summary
- validation results
```

---

# Current roadmap after feature discussion

- **#14** Multi-puzzle architecture
- **#15** Contact/reaction event system
- **#16** Autonomous actors / moving objects
- **#17** Timed puzzle constraints
- **#18** Progression + editor UX
- **#19** Polish + broader e2e

Feature ideas recorded:

- time-limited puzzles
- autonomous/randomly moving objects such as birds
- declarative object-to-object contact behavior, e.g. bird touches balloon -> balloon pops

Potential future declarative interaction shape discussed:

```json
{
  "onContact": {
    "with": "bird",
    "action": "destroy"
  }
}
```

---

# Notes

1. Early prompts (#1–#7 and setup) are marked **RECONSTRUCTED** where the exact original assistant message is not available in the currently loaded conversation context.
2. Prompts from the later conversation are preserved **VERBATIM**.
3. Superseded prompts are retained intentionally so the archive reflects the actual development path rather than only the final decisions.
4. No repository files were modified by generating this archive.

---

## #15 — Generic contact/reaction event system

**VERBATIM**

```text
Start milestone #15: add a generic contact/reaction event system.

Goal:
Allow puzzle JSON to declare what happens when two object types contact each other.

Implement a minimal generic system, not bird/balloon-specific logic.

Example concept:
- object A contacts object B
- configured action executes

Initial supported action:
- destroy one contacted object

Requirements:
- Add declarative contact rules to puzzle JSON.
- Detect Matter collision/contact events centrally.
- Rules identify object type/tag and action.
- Implement `destroy` as the first action.
- Add one simple test/demo interaction using existing or minimal test objects.
- Do not add birds/random movement yet.
- Preserve existing puzzle behavior.
- Invalid/unknown rules must fail validation clearly.
- Add focused unit tests.
- Update README.md, docs/PROJECT_STATE.md, docs/ROADMAP.md as needed.
- Append THIS FULL PROMPT verbatim to docs/CODEX_PROMPTS.md under milestone #15.
- Run typecheck, lint, tests, format check, build.
- Do not commit or push.

Report architecture, JSON format, demo behavior, files changed, and validation results.
```

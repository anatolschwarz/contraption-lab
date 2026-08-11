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

---

## #16 follow-up — Bird contact behavior and speed

**VERBATIM**

```text
Continue milestone #16.

Two gameplay adjustments:

1. Bird contact behavior
- Currently bird destroys blocks but not ramps.
- Add level contact rules so Bird destroys BOTH blocks and ramps on contact.
- Keep this declarative in puzzle JSON; no bird-specific reaction code.
- Preserve the generic #15 contact/reaction architecture.

2. Bird speed
- Current patrol speed 90 is too fast.
- Change the prototype Bird patrol speed to 40.
- Do not change the generic movement implementation.

Preserve Pause/Resume, Rerun, Reset and deterministic patrol behavior.
Update focused tests as necessary.
Append THIS FULL PROMPT verbatim to docs/CODEX_PROMPTS.md.

Run typecheck, lint, tests, format check, build.
Do not commit or push.
```

---

## #20 follow-up — Player-owned Ball selection

**VERBATIM**

```text
Continue milestone #20.

Bug:
The player-owned Ball is not selectable in Edit mode.

Fix selection first.

Requirements:
- Clicking a player-owned Ball in Edit mode selects it.
- Show the normal selected-part visual feedback.
- Clicking empty space deselects it.
- Fixed Ball must remain non-selectable.
- Run/Pause must disable Ball selection.
- Integrate Ball into the same generic editable-component pointer/selection flow used by Ramp/Block.
- Do not add Ball-specific parallel interaction logic unless unavoidable.
- Preserve existing Ball physics, inventory, Reset/Rerun and contact behavior.

After selection works, ensure existing generic dragging works for Ball too.

Add focused tests.
Append THIS FULL PROMPT verbatim to docs/CODEX_PROMPTS.md.
Run typecheck, lint, tests, format check, build.
Do not commit or push.
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

---

## #19 follow-up — External serial e2e failures

**VERBATIM**

```text
Continue milestone #19.

External serial result:
40 runs = 20 passed / 20 failed.
Exactly 4 scenarios fail repeatedly.

Diagnose/fix each independently:

1. Inventory removal
- Expected Ramp (5), remains Ramp (4).
- Verify whether double-click removal actually occurs.
- Determine whether this is a broken test helper/coordinates or real gameplay regression.

2. Progression persistence
- Test has a 30s overall timeout and performs solve + reload.
- Diagnose where time is spent.
- Do not blindly increase timeout.
- Prefer reducing unnecessary work / deterministic state setup if appropriate.

3. Unlock All
- Definite test locator bug:
  getByRole("button", {name:/Puzzle:/}) matches both:
  - Puzzle selector
  - Next Puzzle button
- Use a unique stable locator, preferably #puzzle-selector-button.

4. Fixed-part feedback
- Expected feedback never appears.
- Verify whether fixed-part interaction is actually triggered.
- Check canvas coordinates/helper semantics after #19 layout changes.
- Fix test if gameplay is correct; fix gameplay only if manual behavior is broken.

Do not weaken assertions or add retries.
Preserve fixed-step simulation.

Append THIS FULL PROMPT verbatim to docs/CODEX_PROMPTS.md.

Run normal validation.
Do not commit/push.

Report root cause + fix separately for all 4 failures.
```

---

## #19 follow-up — Inventory removal e2e diagnosis

**VERBATIM**

```text
Continue milestone #19.

Only remaining external e2e failure:

"returns removed player parts to inventory and places them again"

Observed:
- Expected Ramp (5)
- Actual Ramp (4)
- upper-ramp is not being removed.

Previous fix (wait for first click selection before second click) was insufficient.

Diagnose the actual input sequence. Do not guess.

Instrument/test:
- pointerdown/up events received by upper-ramp
- selection state after first click
- double-click timing/state after second click
- whether drag detection cancels removal
- whether board state removes upper-ramp
- whether inventory increment executes

Determine whether the bug is:
1. Playwright helper semantics, or
2. real double-click interaction unreliability.

Prefer making the real UI interaction deterministic rather than special-casing the test.

Do not weaken the inventory assertion.
Do not add retries.

Append THIS FULL PROMPT verbatim to docs/CODEX_PROMPTS.md.
Run normal validation.
Do not commit or push.

Report exact root cause and fix.
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

## Roadmap correction

**VERBATIM**

```text
Update docs/ROADMAP.md to the currently agreed roadmap:

#14 Multi-puzzle architecture
#15 Contact/reaction event system
#16 Autonomous actors / moving objects
#17 Timed puzzle constraints
#18 Progression + editor UX
#19 Polish + broader e2e

Remove/supersede the old "#16 — Third physics component and puzzle progression" entry.

Also append this prompt verbatim to docs/CODEX_PROMPTS.md.

Do not change gameplay code.
Do not commit or push.
```

---

## #16 — Autonomous moving actors

**VERBATIM**

```text
Start milestone #16: add autonomous moving actors.

Implement a generic autonomous-actor system, with Bird as the first actor.

Requirements:
- Bird defined entirely in puzzle JSON.
- Bird is fixed/non-editable by player.
- During Run it moves autonomously.
- Support deterministic movement first:
  - horizontal/vertical patrol
  - speed
  - movement bounds / reversal
- Pause freezes it; resume continues.
- Rerun reproduces the same movement from the run-start state.
- Reset restores JSON state.
- Bird participates in the #15 contact-rule system using tag `bird`.
- Add a demo rule: bird contacts block -> destroy block.
- Architecture must allow future random/path movement without bird-specific game logic.
- Validate malformed movement definitions.
- Preserve existing puzzles/solution.
- Add focused tests.
- Update README, PROJECT_STATE, ROADMAP.
- Append THIS FULL PROMPT verbatim to docs/CODEX_PROMPTS.md.
- Run typecheck, lint, tests, format check, build.
- Do not commit or push.

Report architecture, JSON format, demo behavior, files changed, and validation results.
```

---

## #16 follow-up — Solid actor collision

**VERBATIM**

```text
Continue milestone #16.

Bug:
The Bird currently passes through solid Block objects because autonomous actors are implemented as Matter sensors.

Required behavior:
- Autonomous actors must participate in normal physical collision with solid objects.
- Bird must NOT pass through a solid block.
- Contact rules must still fire on collision.
- For the existing bird + block -> destroy block rule:
  - contact occurs
  - rule destroys the block
  - bird may then continue its patrol after the block is removed
- Do not make all actors sensors by default.
- Keep the actor movement system generic; no bird-specific collision logic.
- Preserve deterministic patrol, Pause/Resume, Rerun, Reset, and existing puzzle behavior.
- Add focused tests for physical actor/block collision plus contact-rule execution.
- Update docs if actor collision semantics changed.
- Append THIS FULL PROMPT verbatim to docs/CODEX_PROMPTS.md.
- Run typecheck, lint, tests, format check, build.
- Do not commit or push.

Report the Matter-body strategy used for moving collision-enabled actors.
```

---

## #17 — Timed puzzle constraints

**VERBATIM**

```text
Start milestone #17: add optional time-limited puzzles.

Requirements:
- Add optional `timeLimitSeconds` to puzzle JSON.
- If absent, puzzle behaves exactly as today.
- Countdown starts when Run starts.
- Pause freezes the timer.
- Resume continues it.
- Rerun restores the run-start layout and restarts the full timer.
- Reset restores Edit mode and the original timer.
- Reaching Success stops the timer.
- Reaching 0 before Success sets a clear Failed/Timeout state.
- Timer must be puzzle-driven, not hardcoded.
- Add one demo timed puzzle/configuration without breaking the existing solution.
- Validate invalid/negative/zero limits clearly.
- Add focused tests for Run/Pause/Rerun/Reset/Success/Timeout.
- Update README, PROJECT_STATE, ROADMAP.
- Append THIS FULL PROMPT verbatim to docs/CODEX_PROMPTS.md.
- Run typecheck, lint, tests, format check, build.
- Do not commit or push.
```

---

## UI and progression architecture

**VERBATIM**

```text
Update project documentation only. Do not change gameplay code.

Record the agreed UI/progression architecture:

Play screen
- Default/root screen.
- Contains gameplay canvas, per-puzzle parts tray, controls, timer/status.
- Buttons to Puzzle Editor and Settings.
- No separate Home screen.

Puzzle switching
- Compact selector in Play screen.
- Clicking opens grouped panel/modal:
  - Basic
  - Medium
  - Hard
- Show locked / available / completed states.
- Show timed-puzzle indicator.
- Success offers prominent Next Puzzle action.

Progression
- Global sequential puzzle order.
- Difficulty is metadata/grouping, not separate progression.
- Example progression: Basic -> Medium -> Hard.
- Progress persists locally using localStorage.
- Settings can enable manual "Unlock all puzzles".

Inventory
- Parts tray is defined per puzzle.
- Global object library contains supported object types.
- Puzzle JSON defines which parts/counts are available.

User-created puzzles
- Stored separately from bundled/built-in puzzles.
- Never overwrite bundled puzzle JSON.

Future screens
- Puzzle Editor
- Settings

Update:
- README.md where relevant
- docs/PROJECT_STATE.md
- docs/ROADMAP.md

Also record the current discussion backlog:
- music
- rotation UX
- puzzle editor + object coloring
- themed/original object libraries

Append THIS FULL PROMPT verbatim to docs/CODEX_PROMPTS.md.

Do not commit or push.
Report exactly which documentation sections changed.
```

---

## #18 — Lightweight progression and puzzle switching

**VERBATIM**

```text
Start milestone #18: implement lightweight puzzle progression and puzzle switching.

Use the currently documented architecture.

Progression:
- Puzzles have a global sequential order.
- Difficulty is metadata/grouping: Basic / Medium / Hard.
- Initially only the first puzzle is unlocked.
- Completing puzzle N unlocks puzzle N+1.
- Completion/unlock state persists in localStorage.
- Built-in puzzle JSON must never be modified by progression state.
- Add a Settings flag: "Unlock all puzzles".
- When enabled, all built-in puzzles are selectable.
- Disabling it returns to normal progression rules without deleting earned progress.

Play-screen UI:
- Play remains the default/root screen.
- Add a compact current-puzzle selector in the Play screen.
- Opening it shows a panel/modal grouped by:
  - Basic
  - Medium
  - Hard
- Each puzzle shows:
  - locked
  - available
  - completed
  - timed indicator where applicable
- Locked puzzles cannot be selected.
- Switching puzzles fully resets runtime state using the existing multi-puzzle architecture.
- On Success show a prominent "Next Puzzle" action.
- Next Puzzle loads the next unlocked puzzle.
- Last puzzle should handle Next gracefully.

Data:
- Add/order enough lightweight puzzle metadata to exercise grouping/progression.
- Do NOT build 10 finished puzzles yet.
- Keep inventory per puzzle.
- User-created puzzles remain separate from built-ins and are not part of progression yet.

Do NOT implement the Puzzle Editor in this milestone.

Tests:
- initial unlock state
- success unlocks next puzzle
- completion persistence
- localStorage reload
- Unlock All setting
- disabling Unlock All preserves earned progression
- locked selection rejection
- puzzle switching state isolation
- Next Puzzle behavior

Update README.md, docs/PROJECT_STATE.md and docs/ROADMAP.md.
Append THIS FULL PROMPT verbatim to docs/CODEX_PROMPTS.md.

Run:
- npm run typecheck
- npm run lint
- npm test
- npm run format:check
- npm run build

Do not commit or push.

Report architecture, storage schema, UI behavior, files changed and validation results.
```

---

## #18 follow-up — Persistent current-level information

**VERBATIM**

```text
Continue milestone #18.

Add persistent current-level information to the Play screen.

Display:
- Level N of total built-in progression puzzles
- puzzle title/name
- difficulty: Basic / Medium / Hard
- timed indicator if applicable

Example:
Level 2 of 3 — Medium
Relay Ramps

Requirements:
- Update immediately when switching puzzles or using Next Puzzle.
- Keep it visible during Edit, Run, Pause, Success and Timeout.
- Do not confuse progression level number with difficulty.
- Use catalog order as the level number.
- Append THIS FULL PROMPT verbatim to docs/CODEX_PROMPTS.md.
- Run typecheck, lint, tests, format check, build.
- Do not commit or push.
```

---

## #18 follow-up — Playwright solve regression

**VERBATIM**

```text
Continue milestone #18.

Regression:
The existing Playwright puzzle solve test now fails.

Observed:
- Both ramps reach the known solution transforms:
  upper: x=265.1754, y=245.1157, rotation=25°
  lower: x=540.1170, y=394.1423, rotation=25°
- After Run, mode remains "Running" for 10 seconds instead of reaching "Success".
- This same e2e solution previously passed.

Do NOT:
- increase the Success timeout
- change the known ramp solution
- redesign puzzle physics
- weaken the assertion

Diagnose the regression first.

Inspect:
1. test-results error-context.md and failure screenshot
2. which puzzle ID is actually active during e2e
3. ball and goal starting/runtime positions
4. autonomous Bird behavior during the run
5. contact rules, especially Bird -> Ramp destruction
6. whether any ramp/block is destroyed before the ball reaches the goal
7. whether #18 progression/UI changes altered runtime initialization

Add temporary deterministic logging/test hooks if needed to identify the first divergence from the previously passing flow.

Report the exact cause before making gameplay changes.

If the bug is test setup/state isolation, fix the test.
If it is a real gameplay regression, make the smallest fix that preserves intended #15/#16/#18 behavior.

Append THIS FULL PROMPT verbatim to docs/CODEX_PROMPTS.md.

Run:
- npm run typecheck
- npm run lint
- npm test
- npm run format:check
- npm run build

Do not commit or push.
```

---

## #18 follow-up — Simulation determinism regression

**VERBATIM**

```text
Continue milestone #18.

We confirmed a real deterministic-regression/flakiness issue.

Serial Playwright result:
- 3 runs with --workers=1
- identical final ramp transforms every time
- 2 passed
- 1 remained Mode: Running after 10s

Therefore this is no longer a browser-interaction problem.

Do NOT:
- increase the 10s Success timeout
- add retries
- weaken assertions
- change the known ramp solution

Diagnose simulation determinism.

Inspect/log for each run:
- ball position/velocity over time
- physics delta/timestep
- whether Bird/contact events occur
- whether any object is destroyed
- time at which ball should enter goal
- any frame-rate-dependent movement or collision behavior

Determine why identical initial state sometimes produces a different outcome.

Prefer the smallest fix that makes simulation behavior deterministic, e.g. fixed-step/update behavior if appropriate.
Do not introduce test-only gameplay behavior unless absolutely necessary.

After fixing:
- run all normal validation
- update/add focused tests
- append THIS FULL PROMPT verbatim to docs/CODEX_PROMPTS.md
- do not commit or push

Report:
- exact root cause
- exact fix
- why identical state is now deterministic
```

---

## #19 — MVP polish and broad regression/e2e coverage

**VERBATIM**

```text
Start milestone #19: MVP polish and broad regression/e2e coverage.

Do not add new gameplay mechanics.

Goals:
1. Stabilize the current Play-screen UX.
2. Expand browser e2e coverage across the main MVP flows.
3. Remove obvious stale/debug/test artifacts.
4. Keep simulation deterministic.

Play-screen polish:
- Keep Level N / puzzle title / difficulty clearly visible.
- Improve obvious spacing/alignment/readability issues.
- Keep controls clear:
  - Run/Pause
  - Rerun
  - Reset
  - Next Puzzle
- Keep puzzle selector states clear:
  - locked
  - available
  - completed
  - timed
- Keep parts tray readable.
- Add clear visual feedback when an edit placement/removal is rejected.
- No major redesign.

E2E coverage:
1. Puzzle solve:
   - edit ramps
   - Run
   - Success
   - Next Puzzle

2. Inventory:
   - remove player-owned ramp
   - inventory increments
   - place it again
   - inventory decrements

3. Rerun vs Reset:
   - modify layout
   - Run
   - Rerun restores run-start layout
   - Reset restores original puzzle JSON/inventory

4. Timed puzzle:
   - countdown starts on Run
   - Pause freezes timer
   - Resume continues
   - Rerun restarts full attempt timer
   - Timeout reaches Failed
   - Success stops timer

5. Puzzle switching/progression:
   - locked puzzle cannot be selected
   - success unlocks next puzzle
   - switching puzzles does not leak runtime state
   - progress persists in localStorage

6. Settings:
   - Unlock all exposes all built-in puzzles
   - disabling it preserves earned progress

7. Autonomous actors/contact rules:
   - Bird patrols deterministically
   - configured Bird→Block and Bird→Ramp reactions occur

8. Fixed vs editable parts:
   - fixed objects cannot be selected/moved/removed
   - player-owned parts can

Reliability requirements:
- Keep the fixed 60 Hz simulation stepping.
- No arbitrary long sleeps.
- Prefer state-based waits/assertions.
- Do not increase timeouts merely to hide failures.
- Do not add retries to mask flaky behavior.
- Stable test hooks are allowed only where needed.
- Run e2e serially when validating deterministic simulation.

Cleanup:
- Remove obsolete debug logging/artifacts.
- Ensure test-results/ remains ignored.
- Review console errors/warnings.
- Preserve the known harmless Vite bundle-size warning unless there is an obvious low-risk fix.
- Remove stale documentation that contradicts current behavior.

Documentation:
- Update README.md.
- Update docs/PROJECT_STATE.md.
- Update docs/ROADMAP.md.
- Append THIS FULL PROMPT verbatim to docs/CODEX_PROMPTS.md.

Do NOT implement backlog items:
- music
- rotation UX changes
- Puzzle Editor
- object coloring
- themed object libraries
- new component types

Validation:
- npm run typecheck
- npm run lint
- npm test
- npm run format:check
- npm run build
- npm run test:e2e where environment permits

Also run or recommend external verification:
npx playwright test --repeat-each=5 --workers=1

Do not commit or push.

Report:
- UI polish performed
- e2e scenarios added
- cleanup performed
- any bugs/flakiness discovered and fixed
- files changed
- all validation results
```

---

## #19 follow-up — Inventory double-click timing

**VERBATIM**

```text
Continue milestone #19.

Focused inventory e2e still fails.

Observed after the second click:
- pendingClickComponentId = "upper-ramp"
- pendingClickCompletedAt is set
- selectedComponentId = "upper-ramp"
- upperRampPresent = true

This indicates click #2 is being treated as a NEW first click, not as the second click of the double-click.

Likely cause:
The diagnostic assertions/waits inserted between click #1 and click #2 consume too much of the app's double-click interval.

Fix the Playwright helper, not gameplay semantics.

Requirements:
- Keep the real double-click timing rule unchanged unless evidence shows the UI itself is unreliable.
- Do not wait/poll for long intermediate assertions between the two clicks.
- Send two realistic completed clicks within the configured double-click threshold.
- You may capture/log the intermediate state without blocking long enough to invalidate the double-click.
- Prefer Playwright's real mouse double-click semantics or an equivalent explicit down/up/down/up sequence with controlled short delay.
- After the sequence, assert:
  - upper-ramp removed
  - pending click consumed
  - no drag occurred
  - Ramp inventory incremented exactly once

Do not add retries.
Do not weaken assertions.
Do not increase unrelated test timeouts.
Append THIS FULL PROMPT verbatim to docs/CODEX_PROMPTS.md.
Run normal validation.
Do not commit or push.

Report the exact timing sequence before/after the fix.
```

---

## #19 follow-up — Next Puzzle scenario timeout

**VERBATIM**

```text
Continue milestone #19.

Only remaining e2e failure:

"solves the first puzzle and advances through Next Puzzle"

Observed:
- Puzzle solves successfully.
- Next Puzzle button resolves visible, enabled, and stable.
- Test reaches the click, but the overall 30-second Playwright test timeout expires during that click.
- Other 8 scenarios pass.

This is an overall scenario-budget problem, not a gameplay failure.

Fix:
- Set ONLY this long end-to-end scenario to a 60-second test timeout.
- Do not change gameplay.
- Do not increase locator/assertion timeouts.
- Do not add retries.
- Do not change the 10-second Success assertion.
- Leave other tests at their existing timeout.

Append THIS FULL PROMPT verbatim to docs/CODEX_PROMPTS.md.
Run normal validation.
Do not commit or push.
```

---

## #19 documentation-only checkpoint

**VERBATIM**

```text
Documentation-only checkpoint after milestone #19.

Do not change gameplay code.

Update:
- README.md
- docs/PROJECT_STATE.md
- docs/ROADMAP.md
- docs/CODEX_PROMPTS.md

Record:
- #19 completed
- current 9-scenario e2e coverage
- deterministic 60 Hz simulation
- current progression/timer/actor/contact/inventory capabilities
- known Vite bundle-size warning

Update the next-phase roadmap with the agreed design:
1. Ball becomes a normal component/part.
2. Replace large controls with a compact toolbar.
3. Replace the small Parts tray with a dockable/collapsible Parts Palette beside the Play canvas.
4. Palette contents/counts remain per-puzzle.

Keep discussion backlog:
- music
- rotation UX
- Puzzle Editor + object coloring
- themed/original object libraries

Append THIS FULL PROMPT verbatim to docs/CODEX_PROMPTS.md.

Do not commit or push.
Report exactly what changed.
```

---

## #19 documentation-only checkpoint — numbered roadmap

**VERBATIM**

```text
Documentation-only checkpoint after milestone #19.

Do not change gameplay code.

Update:
- README.md
- docs/PROJECT_STATE.md
- docs/ROADMAP.md
- docs/CODEX_PROMPTS.md

Record current completed state:
- #19 completed
- current 9-scenario e2e coverage
- deterministic fixed 60 Hz simulation
- current progression, timer, autonomous actor, contact-rule, inventory, Rerun/Reset capabilities
- known harmless Vite bundle-size warning

Extend docs/ROADMAP.md explicitly with the next numbered milestones:

#20 — Ball as a normal component/part
- Remove unnecessary special-case assumptions around the current ball.
- Support ball through the general component/ownership model.
- Allow puzzles to define whether a ball is fixed, preplaced/player-owned, or available through inventory.
- Do not imply multiple balls are implemented yet unless architecture naturally supports them.

#21 — Compact Play toolbar
- Replace oversized Play controls with a compact toolbar.
- Preserve existing Run/Pause, Rerun, Reset, Next Puzzle behavior.
- Keep gameplay canvas as the primary visual focus.

#22 — Dockable Parts Palette
- Replace the current small Parts tray with a dockable/collapsible palette beside the Play canvas.
- Palette remains visible alongside gameplay when open.
- Contents and quantities remain per-puzzle.
- Global object library defines available object types; each puzzle defines its allowed subset/counts.
- Design for future categories, icons, scrolling, and additional object types.

#23 — Puzzle Editor foundation
- Separate Puzzle Editor screen/workspace.
- Create/edit puzzle scenes without overwriting bundled puzzles.
- Object placement and configuration.
- Configure fixed vs player-owned objects.
- Configure per-puzzle inventory.
- Include object coloring.
- User-created puzzles stored separately from built-in puzzles.

#24 — Rotation UX improvements
- Mouse-based rotation in addition to keyboard controls.
- Evaluate arrow keys vs Q/E.
- Clarify left/right vs up/down rotation-control mapping.
- Preserve deterministic placement/overlap validation.

#25 — Music/audio system
- Background music and gameplay sound-effect architecture.
- Per-theme/per-puzzle possibilities.
- Settings for volume/mute.
- Do not choose copyrighted music/assets.

#26 — Themed/original object libraries
- Support themed visual/object packs.
- Examples: fantasy/unicorn, workshop, space, fairy-tale-inspired.
- Use original/non-infringing assets and designs.
- Keep visual skin separate from physics/game behavior where practical.
- Animated visual skins should be possible.

#27 — Real puzzle pack / difficulty progression
- Design and implement a meaningful puzzle set rather than only architecture/demo scenes.
- Target structure can include approximately:
  - 4 Basic
  - 3 Medium
  - 3 Hard
- Puzzle is a concrete scene/challenge.
- Difficulty is metadata.
- Progression remains global sequential order.
- Include TIM-like contraption puzzles using the mechanics built so far.

Also record the agreed Play-screen architecture:
- Play is the default/root screen.
- No separate Home screen.
- Puzzle selector lives on the Play screen.
- Puzzle Editor and Settings are separate screens.
- Current level/puzzle title/difficulty are visible during play.
- Puzzle selector can open a grouped Basic / Medium / Hard panel.
- Progress persists locally.
- Sequential unlocking is default.
- Settings can enable Unlock All without deleting earned progress.

Maintain a clearly labeled discussion backlog for undecided details, but do not duplicate items already promoted into numbered roadmap milestones.

Append THIS FULL PROMPT verbatim to docs/CODEX_PROMPTS.md.

Do not commit or push.

Report:
- exact documentation files changed
- roadmap entries added/modified
- any stale or contradictory documentation removed
```

---

## #19 documentation-only checkpoint — scoped roadmap

**VERBATIM**

```text
Documentation-only checkpoint after milestone #19.

Do not change gameplay code.

Update:
- README.md
- docs/PROJECT_STATE.md
- docs/ROADMAP.md
- docs/CODEX_PROMPTS.md

Record current completed state:
- #19 completed
- current 9-scenario e2e coverage
- deterministic fixed 60 Hz simulation
- current progression, timer, autonomous actor, contact-rule, inventory, Rerun/Reset capabilities
- known harmless Vite bundle-size warning

Extend docs/ROADMAP.md only with these agreed numbered milestones:

#20 — Ball as a normal component/part
- Integrate Ball into the general component/ownership model.
- Allow puzzle definitions to determine whether Ball is fixed, preplaced/player-owned, or available in inventory.
- Reduce unnecessary Ball-specific assumptions.
- Preserve existing ball physics and puzzle behavior.

#21 — Compact Play toolbar
- Replace oversized Play controls with a compact toolbar.
- Preserve Run/Pause, Rerun, Reset and Next Puzzle behavior.
- Keep the gameplay canvas as the visual focus.

#22 — Dockable/collapsible Parts Palette
- Replace the current small Parts tray.
- Palette opens beside the Play canvas so the puzzle remains visible.
- Contents/counts remain per-puzzle.
- Global object library defines supported types.
- Individual puzzles define allowed types and quantities.
- Design so categories/icons/scrolling can be added later.

Do NOT invent or number milestones beyond #22.
Later milestones remain TBD until explicitly agreed.

Also preserve/restore an UNNUMBERED section at the END of docs/ROADMAP.md:

## Backlog / To Discuss
- Music
- Rotation UX
  - mouse rotation
  - arrow keys vs Q/E
  - left/right vs up/down mapping
- Puzzle Editor
  - object coloring
- Themed/original object libraries
  - unicorn/fantasy
  - other original themed packs
  - avoid copyrighted/branded characters/assets

Important:
- Backlog stays in ROADMAP.md.
- Backlog is NOT part of the numbered milestone sequence.
- Do not promote backlog items into milestones.

Record the agreed Play-screen architecture:
- Play is the default/root screen.
- No separate Home screen.
- Puzzle selector lives on the Play screen.
- Puzzle Editor and Settings are separate screens when implemented.
- Current level/puzzle title/difficulty remain visible during play.
- Puzzle selector can expose grouped Basic / Medium / Hard puzzles.
- Progress persists locally.
- Sequential unlocking is default.
- Settings can enable Unlock All without deleting earned progress.

Append THIS FULL PROMPT verbatim to docs/CODEX_PROMPTS.md.

Do not commit or push.

Report:
- exact documentation files changed
- roadmap entries added/modified
- backlog section restored/preserved
- any stale or contradictory documentation removed
```

---

## #20 — Ball as a normal component/part

**VERBATIM**

```text
Start milestone #20: integrate Ball into the general component/ownership/inventory model.

Goal:
Ball should use the same level-driven part architecture as Ramp and Block wherever practical, instead of being a special hardcoded gameplay object.

Requirements:

Level data / ownership
- Ball remains defined by puzzle JSON.
- Support Ball ownership semantics:
  - fixed
  - preplaced/player-owned
  - inventory/tray-available
- Fixed Ball:
  - cannot be selected, moved, removed, or returned to inventory.
- Player-owned Ball:
  - selectable and draggable in Edit mode.
  - removable using the existing removal interaction.
  - removal returns +1 Ball to inventory.
  - placing Ball from inventory consumes -1.
- Reset restores JSON-defined Ball placement and original inventory.
- Rerun restores the Ball state captured at Run start.

Physics
- Preserve existing Ball Matter physics behavior during Run.
- Ball remains dynamic during simulation.
- Do not change gravity, collision behavior, goal detection, or known puzzle solutions.
- Edit-mode placement must obey existing bounds/overlap validation.

Architecture
- Reduce Ball-specific state/UI code where it can cleanly use the generic part model.
- Do NOT force a risky large refactor merely for abstraction.
- Existing contact-rule tag `ball` must continue working.
- Preserve timer, progression, autonomous actors, puzzle switching, fixed-step simulation, and deterministic behavior.

Scope
- Current puzzles may continue to use one Ball.
- Architect cleanly enough that multiple Balls are not unnecessarily prevented, but do NOT implement multi-ball gameplay unless it falls out naturally and safely.
- Do not implement #21 toolbar or #22 Parts Palette changes yet.

Tests
Add focused tests for:
- fixed Ball behavior
- player-owned preplaced Ball
- Ball removal -> inventory increment
- Ball placement -> inventory decrement
- Reset
- Rerun
- overlap/bounds rejection
- existing goal/contact behavior

Update:
- README.md
- docs/PROJECT_STATE.md
- docs/ROADMAP.md

Append THIS FULL PROMPT verbatim to docs/CODEX_PROMPTS.md.

Run:
- npm run typecheck
- npm run lint
- npm test
- npm run format:check
- npm run build

Do not commit or push.

Report:
- Ball-specific assumptions removed/retained
- data-model changes
- inventory behavior
- files changed
- validation results
```

---

## #20 follow-up — Player-owned Ball Edit interaction

**VERBATIM**

```text
Continue milestone #20.

Bug:
A player-owned Ball cannot currently be selected or dragged in Edit mode.

Required behavior:
- Player-owned/preplaced Ball:
  - single click selects it
  - drag moves it in Edit mode
  - placement obeys playfield bounds and overlap validation
  - selected Ball has the same clear selection feedback as other editable parts
- Fixed Ball remains non-editable.
- Run/Pause disables Ball editing.
- Ball remains dynamic during Run.
- Removal/inventory/Reset/Rerun behavior from #20 must remain intact.
- Do not change puzzle physics or known solutions.

Diagnose why Ball is not participating in the existing editable-component pointer flow.
Prefer integrating it into the generic interaction path rather than adding a separate Ball-only handler.

Add focused tests.
Append THIS FULL PROMPT verbatim to docs/CODEX_PROMPTS.md.

Run typecheck, lint, tests, format check, build.
Do not commit or push.
```

---

## #20 repair — governing Sol review

**VERBATIM**

```text
Continue milestone #20 using docs/reviews/MILESTONE_20_SOL_REVIEW.md as the governing review.

Implement the focused repair plan. Do not redesign gameplay.

1. Fix Ball runtime-state regression
- Pause, Success, and Timeout must NOT snap the dynamic Ball back to its Edit-layout transform.
- Stop unconditional Ball transform synchronization during unrelated applyState() calls.
- Rerun must restore Run-start Ball position with fresh physics state.
- Reset must restore JSON Ball state.

2. Fix player-owned Ball verification
- Remove the E2E setup that calls scene.resetLevel() directly and leaves recreated components input-disabled.
- Test player-owned Ball through the real application flow.
- Player-owned Ball must:
  - select
  - drag
  - show selection feedback
  - obey bounds/overlap rules
  - be removable
  - return to Ball inventory
  - be placeable again from inventory
- Fixed Ball remains non-editable and shows fixed-part feedback.

3. Clean up obvious Ball ownership inconsistencies
- Reuse isEditablePart() for Ball.
- Distinguish missing component registry entry from genuinely fixed ownership.
- Do not report a missing/stale registry entry as “Fixed part”.

4. Make the existing one-Ball inventory model internally coherent
- Tray must not advertise Ball inventory that cannot actually be placed.
- Validate incoherent Ball ownership/placement/inventory combinations.
- Derive tray Ball geometry from level/component data rather than hardcoded radius where feasible.
- Do NOT implement multi-ball gameplay.

5. Keep scope bounded
Do NOT:
- change built-in Ball ownership merely to make tests pass
- make fixed-owned Ball physically static during Run
- change gravity/collision/goal/contact behavior
- redesign known puzzles
- perform a large generic editor/component refactor
- implement #21/#22

Tests:
- fixed Ball
- player-owned preplaced Ball selection/drag/removal/inventory
- tray Ball placement/removal
- Pause no-snap
- Success no-snap
- Timeout no-snap
- Rerun
- Reset
- validation of invalid Ball configurations

Update README, PROJECT_STATE, ROADMAP as needed.
Mark #20 complete only if production behavior and tests support it.

Append THIS FULL PROMPT verbatim to docs/CODEX_PROMPTS.md.

Run:
- npm run typecheck
- npm run lint
- npm test
- npm run format:check
- npm run build

Do not commit or push.

Report:
- each review finding addressed
- anything deliberately deferred
- files changed
- validation results
```

---

## #20 follow-up — E2E semantics

**VERBATIM**

```text
Continue milestone #20.

External E2E result:
13 tests: 10 passed, 3 failed.

Do NOT change gameplay until these failures are checked against intended semantics.

Failure 1 — player Ball drag:
Expected x=320, actual x=320.730994.
This appears to be normal canvas/browser coordinate scaling.
Use a small position tolerance (about ±1 px), consistent with existing ramp E2E handling.
Do not weaken ownership/inventory assertions.

Failure 2 — Pause live-position test:
The test expects Ball {x:400,y:120} after Pause, but actual y=139.236.
This is likely the CORRECT production behavior because gravity moved the Ball before Pause.

Rewrite this test so it:
- captures the actual live Ball position immediately before Pause
- pauses
- verifies the Ball remains at that captured live position while paused
- verifies it does NOT snap back to the Edit/run-start transform

Do not assert the original pre-Run position after Pause.

Apply the same semantic principle to Success and Timeout:
- capture/verify the live physical position
- ensure the state transition does not overwrite it with stale Edit transform.

Failure 3 — Rerun:
Rerun restores the Run-start layout AND immediately resumes simulation.
The test currently expects exact Run-start position and zero velocity after Rerun, but physics may already have advanced one or more fixed 60 Hz steps before Playwright reads it.

Fix the test deterministically:
- verify the Rerun restoration itself against the captured run-start Ball snapshot using an appropriate read-only test hook/state observation
- separately verify that the newly recreated Ball begins with fresh physics state
- do not require an arbitrary later browser read to still have zero velocity
- preserve the intended behavior that Rerun immediately runs

Do not:
- change fixed-step simulation
- change Rerun semantics
- change Ball physics
- add sleeps/retries
- loosen assertions unrelated to browser-coordinate tolerance

If investigation shows any real gameplay bug, report it before changing production behavior.

Add/update focused tests as necessary.
Append THIS FULL PROMPT verbatim to docs/CODEX_PROMPTS.md.

Run:
- npm run typecheck
- npm run lint
- npm test
- npm run format:check
- npm run build

Do not commit or push.

Report root cause and fix separately for all 3 failures.
```

---

## #20 follow-up — Ball edit-state trace

**VERBATIM**

```text
Continue milestone #20.

Focused Ball E2E result:
- Pause/Success/Timeout: PASS
- Rerun/Reset physics: PASS
- player-owned Ball edit/remove/replace: FAIL

Failure:
expectBallPosition() expected one position but actual Ball X differs by ~442 px.

This is not browser sub-pixel scaling.

Diagnose exactly which step at/around e2e/puzzle.e2e.ts:580 has the wrong semantic expectation.

Instrument the test after each operation and report:
- Ball id
- ownership
- fromTray
- x/y
- Ball inventory count
- selected component
- operation just performed

Specifically distinguish:
1. dragged preplaced Ball
2. removed Ball
3. Ball placed again from inventory
4. Reset-restored JSON Ball

Determine whether:
- tray placement intentionally uses a spawn position different from the removed Ball position, or
- production state/restoration is wrong.

Do not change gameplay unless a real bug is proven.
Do not increase POSITION_TOLERANCE.
Do not weaken inventory/ownership assertions.

Fix the test if its expected position is semantically wrong.

Append THIS FULL PROMPT verbatim to docs/CODEX_PROMPTS.md.
Run normal validation.
Do not commit or push.

Report exact root cause and the expected Ball position/state at each step.
```

---

## #20 follow-up — boundary Ball removal

**VERBATIM**

```text
Continue milestone #20.

Focused E2E still fails:

After moving the player-owned Ball to about (24,30), removeBall() is called.
Expected tray: Ball (1)
Actual tray: Ball (0)

Do NOT change the expectation or gameplay yet.

Diagnose the removal path precisely.

Instrument/report immediately before and after removeBall():
- Ball x/y
- Ball radius/body bounds
- selectedComponentId
- component id/kind/ownership/fromTray
- pointer coordinates used by removeBall()
- pointerdown/up/double-click handling
- whether removal handler executes
- Ball inventory before/after
- whether the Ball still exists afterward

Determine whether:
A. the E2E helper misses the Ball after the bounds-clamped drag, or
B. player-owned Ball removal has a real production bug.

Pay special attention to the Ball being near the top-left boundary at approximately (24,30).

If test targeting is wrong, fix only the helper/test.
If production removal is wrong, make the smallest coherent production fix.

Do not loosen inventory assertions.
Do not add arbitrary sleeps/retries.
Do not change Ball physics or ownership semantics.

Append THIS FULL PROMPT verbatim to docs/CODEX_PROMPTS.md.
Run normal validation.
Do not commit or push.

Report exact root cause before/with the fix.
```

---

## Post-#20 — minimal multi-Ball prototype

**VERBATIM**

```text
Continue after milestone #20.

Goal:
Add a second Ball to the prototype puzzle while keeping the existing Ball fixed/non-editable.

This intentionally introduces minimal multi-Ball support. Do not implement unrelated #21/#22 work.

Required prototype behavior:

* Keep the existing Ball exactly as-is:

  * ownership: fixed
  * non-selectable/non-draggable/non-removable in Edit
  * still dynamic under Matter physics during Run
* Add a second JSON-defined Ball with a unique id.
* The second Ball is:

  * preplaced
  * player-owned/editable
  * selectable by single click
  * draggable in Edit mode
  * shown with normal selection feedback
  * removable by the existing double-click interaction
  * returned to Ball inventory when removed
  * placeable again from Ball inventory
* Initial Ball inventory = 0.
* Remove editable Ball -> Ball inventory = 1.
* Place it again -> Ball inventory = 0.
* Reset restores both JSON-defined Balls and Ball inventory = 0.
* Rerun restores both Balls to their Run-start states with fresh physics state.

Architecture:

* Remove the current one-Ball assumption cleanly enough to support these two Balls.
* Balls must be identified by their JSON ids; no hardcoded prototype-Ball identity.
* Do not create a second parallel Ball interaction system.
* Reuse the generic component/ownership/editability path from #20.
* Generalize state/registry/scene handling only as much as required for multiple Ball instances.
* Keep `ball` contact tagging working for every Ball.
* Preserve existing gravity, collision, goal, timer, progression, actor/contact, puzzle-switching, and fixed 60 Hz simulation behavior.
* Do not perform a broad generic component/state refactor.

Placement validation:

* Each editable Ball must obey playfield bounds.
* It must not overlap another Ball, Ramp, or Block when edited/placed, consistent with current placement rules.
* Fixed Ball must participate as an obstacle during Edit validation.

Puzzle behavior:

* Place the new editable Ball where it does not unintentionally change the existing known puzzle solution.
* Do not redesign the puzzle.
* Existing fixed Ball behavior and existing E2E scenarios must remain valid.
* If current success/goal logic assumes a single Ball, generalize it minimally so Ball identity does not break goal detection; preserve current gameplay semantics.

Validation/schema:

* Replace the current one-Ball validation rules with coherent multi-Ball validation.
* Validate unique Ball ids.
* Inventory should represent unplaced player-owned Balls, not fixed Balls.
* Do not allow impossible inventory/placement combinations.

Tests:
Add focused tests for:

* fixed + player-owned Ball coexistence
* independent Ball ids/state
* editable Ball selection and drag
* Ball-vs-Ball overlap rejection
* editable Ball removal -> inventory +1
* replacement -> inventory -1
* Reset restores both Balls
* Rerun restores both Run-start Ball states
* fixed Ball remains non-editable
* existing goal/contact behavior works with multiple Ball instances

E2E:
Add one focused browser scenario covering the two-Ball prototype flow without weakening the existing 13 scenarios.

Update:

* README.md
* docs/PROJECT_STATE.md
* docs/ROADMAP.md only if needed to record that minimal multi-Ball support now exists
* append THIS FULL PROMPT verbatim to docs/CODEX_PROMPTS.md

Run:

* npm run typecheck
* npm run lint
* npm test
* npm run format:check
* npm run build
* npm run test:e2e -- --workers=1 where the environment permits

Do not commit or push.

Report:

* previous one-Ball assumptions found
* exact data/state changes
* second Ball JSON definition
* inventory semantics
* files changed
* unit/build results
* E2E result
* anything deliberately deferred
```

---

## #21 — Compact Play toolbar

**VERBATIM**

```text
Start milestone #21: compact Play toolbar.

Goal:
Replace the current oversized Play controls with a compact toolbar so the gameplay canvas remains the primary visual focus.

Requirements:

* Preserve existing behavior exactly:

  * Run / Pause toggle
  * Rerun
  * Reset
  * Next Puzzle
* Do not change gameplay/state semantics.
* Preserve existing enabled/disabled/visible states for each control.
* Keep controls clearly readable and clickable.
* Use a compact horizontal toolbar.
* Avoid reducing the gameplay canvas.
* Do not redesign puzzle selector, level information, timer, Settings, or Parts tray.
* Preserve responsive behavior reasonably at current supported viewport sizes.
* Keep existing element ids/test hooks where practical so E2E tests do not need unnecessary changes.
* Preserve current two-Ball behavior from the post-#20 work.
* Do not start #22 Parts Palette work.

Tests:

* Update focused UI/unit tests only where necessary.
* Existing tests must continue to compile/discover.

Documentation:

* Update README.md / PROJECT_STATE.md / ROADMAP.md only where #21 completion requires it.
* Append THIS FULL PROMPT verbatim to docs/CODEX_PROMPTS.md.

Run:

* npm run typecheck
* npm run lint
* npm test
* npm run format:check
* npm run build
* npx playwright test --list

Do not commit or push.

Report:

* toolbar layout implemented
* controls changed visually
* any ids/test hooks changed
* files changed
* validation results
```

---

## #22 — Dockable/collapsible Parts Palette

**VERBATIM**

```text
Start milestone #22: replace the current Parts tray with a dockable/collapsible Parts Palette.

Goal:
Create a real parts palette beside the Play canvas while preserving all existing inventory and placement behavior.

Requirements:

Layout

* Replace the current small Parts tray UI with a Parts Palette positioned beside the gameplay canvas.
* The palette must not cover the canvas.
* Keep the existing canvas size/aspect ratio unchanged.
* Open state shows the current puzzle's available player-part inventory.
* Add a clear collapse/expand control.
* Collapsed state should reduce visual clutter while keeping an obvious way to reopen it.
* Keep #21 compact toolbar unchanged.

Inventory semantics

* Palette contents remain entirely per-puzzle.
* Continue using the existing puzzle-defined inventory/state.
* Do not create global shared inventory.
* Global supported part types remain separate from per-puzzle quantities.
* Current supported inventory types remain Ball, Ramp, and Block.
* Preserve existing counts and updates:

  * placing consumes inventory
  * removing player-owned parts returns inventory
  * Reset restores puzzle defaults
  * puzzle switching updates palette contents immediately
* Fixed objects must not become inventory items.

Interaction

* Preserve existing click-to-place behavior.
* Preserve selection, drag, rotation, removal, bounds, and overlap semantics.
* Palette must be disabled/unusable during Run/Pause exactly as the existing tray is.
* Do not introduce drag-from-palette placement unless it already exists.
* Keep existing ids/test hooks where practical; avoid unnecessary E2E changes.

Architecture

* Do not hardcode puzzle-specific inventory in the palette.
* Palette should render from the existing inventory/state model.
* Structure the UI so future categories, icons, scrolling, and additional part types can be added without redesigning gameplay state.
* Do not implement those future features now.

Scope
Do NOT:

* add new part types
* change puzzle JSON semantics
* change inventory rules
* change gameplay physics/state
* change #21 toolbar
* start Puzzle Editor work
* redesign puzzle selector/settings
* perform unrelated refactors

Tests

* Add/update focused UI/state tests only where needed.
* Preserve all existing unit tests.
* Existing E2E scenarios must still compile/discover.

Documentation

* Update README.md, docs/PROJECT_STATE.md, and docs/ROADMAP.md as needed to mark #22 complete.
* Append THIS FULL PROMPT verbatim to docs/CODEX_PROMPTS.md.

Run:

* npm run typecheck
* npm run lint
* npm test
* npm run format:check
* npm run build
* npx playwright test --list

Do not commit or push.

Report:

* palette layout and collapse behavior
* whether any existing ids/test hooks changed
* inventory/state integration
* files changed
* validation results
* anything deliberately deferred
```

---

## GitHub Pages deployment

**VERBATIM**

```text
Add GitHub Pages deployment for Contraption Lab.

Context:

* Repository: `anatolschwarz/contraption-lab`
* GitHub Pages publishing source is already configured to use GitHub Actions.
* This is a Vite/Phaser static browser application.
* Expected Pages path: `/contraption-lab/`
* Do not change gameplay or UI behavior.
* Preserve all current uncommitted #22 work.

Before changing files:

* Inspect the existing Vite configuration, `.nvmrc`, package scripts, `.github/`, and current build output.
* Reuse existing configuration where possible; do not create duplicate Vite configs or deployment workflows.

Implement:

1. Vite Pages base path

* Ensure production builds use:
  `/contraption-lab/`
* Local `npm run dev` must continue working normally at the existing local URL/root.
* Make the smallest configuration change needed.

2. GitHub Pages workflow
   Create/update `.github/workflows/deploy-pages.yml`.

Requirements:

* Trigger automatically on pushes to `main`.
* Also allow manual `workflow_dispatch`.
* Checkout repository.
* Use the repository's Node version from `.nvmrc`.
* Use npm dependency caching where appropriate.
* Run `npm ci`.
* Run `npm run build`.
* Deploy the generated `dist/` directory using the official GitHub Pages Actions workflow:

  * configure-pages
  * upload-pages-artifact
  * deploy-pages
* Give the workflow only the permissions required for Pages deployment.
* Use the `github-pages` environment.
* Do not introduce third-party deployment services or packages.

3. Preserve development workflow

* `npm run dev` must continue working locally.
* Existing tests/build scripts must remain unchanged unless modification is genuinely required for Pages deployment.
* Do not commit generated `dist/`.
* Do not add secrets or credentials.

4. Documentation

* Add a concise GitHub Pages deployment section to README.md including the expected published URL:
  `https://anatolschwarz.github.io/contraption-lab/`
* Append THIS FULL PROMPT verbatim to `docs/CODEX_PROMPTS.md`.
* Do not alter ROADMAP milestone numbering for this deployment task.

Validation:
Run:

* npm run typecheck
* npm run lint
* npm test
* npm run format:check
* npm run build

Also inspect the built `dist/index.html` / asset references and confirm they resolve under `/contraption-lab/`, not `/`.

Verify the workflow YAML for syntax/configuration mistakes.

Do not run the GitHub Actions deployment locally.
Do not commit or push.

Report:

* files changed
* Vite base-path approach used
* workflow structure
* expected published URL
* validation results
* any manual GitHub-side step still required

Before finishing, double-check all changed files for syntax errors, formatting errors, accidental truncation, malformed YAML, and unintended unrelated changes.
```

---

## #22 Parts Palette toggle refinement

**VERBATIM**

```text
Refine milestone #22 Parts Palette UI.

Change only the palette toggle placement.

Requirements:

* Move `#parts-palette-toggle` from beside the canvas into the existing top row containing Puzzle and Settings.
* Place it on the far right of that row.
* Keep the Parts Palette itself exactly as implemented:

  * beside canvas on wide screens
  * below canvas on narrow screens
  * never overlay/shrink canvas
* Preserve toggle behavior, disabled state outside Edit, IDs/test hooks, inventory logic, gameplay, toolbar, and responsive behavior.
* Do not redesign other controls.

Also update `docs/ROADMAP.md` Backlog / To Discuss at the end with:

* Mobile / touch support

  * touch selection/dragging
  * mobile rotation controls
  * small-screen usability
  * real phone/tablet testing

Update relevant docs if needed.
Append THIS FULL PROMPT verbatim to `docs/CODEX_PROMPTS.md`.

Run:

* npm run typecheck
* npm run lint
* npm test
* npm run format:check
* npm run build
* npx playwright test --list

Do not commit or push.

Double-check syntax, formatting, truncation, and unrelated changes. Report files changed and validation results.
```

---

## #22 Parts Palette responsive close refinement

**VERBATIM**

```text
Refine #22 Parts Palette UI based on manual testing.

Fix only these UI issues.

1. Toggle labels
- Keep the top-right control id:
  #parts-palette-toggle
- When the palette is closed, the button label must be:
  Parts
- When the palette is open, the button label must be:
  Close
- Do not use:
  Parts: Open
  Parts: Close
  Collapse
  Palette

2. Closed palette on narrow/mobile layouts
- Currently, when the viewport becomes narrow, a redundant "Parts" palette/header line can appear even while the palette is closed.
- When the palette is closed, the ENTIRE palette UI must be hidden at every viewport width:
  - container
  - header/title
  - inventory content
  - any reserved layout space
- Responsive CSS must not override the hidden/closed state.

3. Open behavior
- On wide screens:
  - open palette remains beside the canvas
- On narrow screens:
  - open palette appears below the canvas
- It must never overlap or shrink the gameplay canvas.
- Closing it must remove the palette and its layout space completely.

4. Preserve behavior
Do not change:
- inventory logic
- per-puzzle counts
- placement/removal behavior
- gameplay
- physics
- toolbar
- puzzle selector/settings
- ids/test hooks
- disabled behavior outside Edit mode

5. Regression coverage
- Add/update a focused UI/E2E test for this exact behavior:
  - closed state label = "Parts"
  - open state label = "Close"
  - closed palette is completely hidden on both wide and narrow viewports
  - reopening restores it correctly
- Keep existing test hooks/ids.

6. Do not address unrelated Playwright timing
- Do not modify global/test timeouts or gameplay code because of the earlier #10 30-second timeout.
- Treat that as unrelated unless this change causes a reproducible failure.

Update relevant docs only if needed.

Append THIS FULL PROMPT verbatim to docs/CODEX_PROMPTS.md.

Run:
- npm run typecheck
- npm run lint
- npm test
- npm run format:check
- npm run build
- npx playwright test --list

Do not commit or push.

Double-check:
- responsive CSS precedence
- hidden-state rules
- syntax
- formatting
- accidental truncation
- unrelated changes

Report:
- root cause of the redundant mobile "Parts" line
- files changed
- exact label behavior
- regression test added/updated
- validation results
```

Fix the Playwright E2E suite for the #22 Parts Palette behavior.

Context:

- #22 is committed/pushed and manually verified.
- GitHub Pages deployment works.
- Parts palette now starts CLOSED.
- Top-right toggle:
  - closed label: "Parts"
  - open label: "Close"
- Inventory controls remain:
  - #tray-ball-button
  - #tray-block-button
  - #tray-ramp-button
- Manual checks of the previously failing gameplay flows passed.
- Do NOT change gameplay behavior to satisfy tests.

Problem:
Full Playwright run produced failures in scenarios that interact with inventory/progression after the palette began starting closed.

Goal:
Update E2E helpers/tests so they explicitly open the Parts palette before interacting with hidden inventory controls.

Requirements:

1. Inspect the failing tests and shared helpers first.
2. Prefer one small reusable helper, e.g. ensurePartsPaletteOpen(page), rather than scattered ad-hoc clicks.
3. The helper should:
   - detect whether the palette is already open
   - click #parts-palette-toggle only when needed
   - verify the palette becomes visible
   - avoid changing state unnecessarily
4. Update only tests/helpers that require palette access.
5. Preserve the dedicated #22 regression test for:
   - Parts/Close labels
   - full hidden state
   - reopen behavior
   - wide and narrow viewports
6. Do not:
   - change gameplay/state/inventory logic
   - increase global Playwright timeout merely to hide failures
   - modify unrelated tests
   - weaken assertions
7. Keep the known slow-machine timing issue separate unless a failure is reproducible after the palette fix.

Validation:

- npm run typecheck
- npm run lint
- npm test
- npm run format:check
- npm run build
- npx playwright test --list

Then attempt:

- npx playwright test --workers=1

If the sandbox blocks the local server, report that clearly and do not change code because of EPERM.

Append THIS FULL PROMPT verbatim to docs/CODEX_PROMPTS.md.

Do not commit or push.

Report:

- root cause
- helper/tests changed
- exact scenarios fixed
- validation results
- full Playwright result if runnable

Double-check syntax, formatting, truncation, and unrelated changes before finishing.

Implement milestone #23 — First Real Puzzle Pair.

IMPORTANT:

- Preserve the existing uncommitted E2E-cleanup changes. Do not undo or mix unrelated fixes.
- Reference image:
  docs/design/timed-puzzle-concepts.png
- Treat that image as the visual/design target.
- Do not commit or push.

#23 contains exactly two new polished puzzles:

1. Down the Ramp
2. Bridge the Gap

VISUAL TARGET

Move the Phaser playfield and reusable object rendering toward the reference image:

- light/off-white square-grid playfield
- dark gray fixed platforms with strong outlines
- warm wooden player ramps/planks with dark outlines
- glossy red Ball with simple highlight
- green bucket/cup-style Goal resembling the reference
- clean, readable geometry
- consistent visual language reusable by later puzzles

Prefer Phaser-drawn shapes; do not add external art dependencies.

Do not redesign the surrounding Play UI introduced in #21/#22.

PUZZLE 1 — DOWN THE RAMP

Reference: panel 1 in the image.

- Title: Down the Ramp
- Difficulty: Basic
- Timer: 10 seconds
- Ball starts on an elevated platform at upper-left.
- Goal sits on a low platform at lower-right.
- Player must place/rotate Ramp part(s) so the Ball can descend into the Goal.
- Use the minimum sensible Ramp inventory needed for a clear intended solution.
- No new mechanics.

PUZZLE 2 — BRIDGE THE GAP

Reference: panel 2 in the image.

- Title: Bridge the Gap
- Difficulty: Basic
- Timer: 12 seconds
- Ball starts on the left platform.
- Goal sits on an elevated/right platform.
- There is a visible gap between them.
- Player uses existing placeable parts to create a bridge/path.
- Spike-like shapes shown in the reference may be visual scenery only; do NOT introduce a new hazard/physics object type in this milestone.
- Falling into the gap should naturally fail through existing gameplay/timeout behavior.
- Choose the minimum sensible existing inventory needed for an intentional solution.

ARCHITECTURE

- Implement puzzles through the existing level JSON/data model.
- Reuse existing Ball/Ramp/Block/Goal/fixed geometry.
- Do not hard-code puzzle-specific behavior in the engine.
- Do not introduce new physics mechanics.
- Keep Reset/Rerun, inventory, progression, Parts Palette, timing, ownership and puzzle switching semantics unchanged.
- Both puzzles must be genuinely solvable.

CATALOG / PROGRESSION

- Integrate these as the first real Basic puzzles in the normal selector/progression.
- Do not remove existing prototype/test puzzles unless necessary; if replacement is needed, explain before doing it.
- Preserve stable puzzle ids once chosen.

DOCUMENTATION

Update docs/ROADMAP.md:

- add #23 — First Real Puzzle Pair
- list Down the Ramp and Bridge the Gap
- reference docs/design/timed-puzzle-concepts.png

Also add to Backlog / To Discuss:

- Settings: Ignore timer
  - timed puzzles continue running after zero
  - default Off
  - separate future feature; DO NOT implement in #23

Update PROJECT_STATE/README only where materially useful.
Append THIS FULL PROMPT verbatim to docs/CODEX_PROMPTS.md.

TESTING

Add focused unit/E2E coverage where needed for:

- both puzzles load
- timers are 10s / 12s
- inventory matches definitions
- Reset/Rerun remain valid
- progression/catalog integration

Do not weaken existing tests or raise global timeouts.

Run:

- npm run typecheck
- npm run lint
- npm test
- npm run format:check
- npm run build
- npx playwright test --list

Attempt full Playwright only if practical; sandbox EPERM is not a reason to alter code.

Before finishing, double-check:

- syntax
- formatting
- malformed level data
- accidental truncation
- solvability
- unrelated changes

Report:

- exact puzzle geometry/inventory chosen
- intended solution for each puzzle
- rendering/style changes
- files changed
- test results
- anything deferred

Do not commit or push.

Refine milestone #23 visuals only.

Reference:
docs/design/timed-puzzle-concepts.png

Goal:
Make the in-game objects look substantially closer in quality/style to the reference image, and make the Parts Palette visually show each part rather than only its name.

1. In-game object rendering

Improve reusable rendering for:

- Ball
- Goal
- Ramp
- Block
- Fixed platforms

Target style:

- strong clean outlines
- subtle highlights/shadows
- dimensional rather than flat
- red glossy Ball
- green bucket/cup-style Goal
- warm wooden Ramp/Block
- dark industrial fixed geometry

Keep rendering lightweight and Phaser-drawn.
Do not change physics bodies, dimensions, collision, puzzle geometry, or gameplay.

2. Parts Palette previews

Each inventory button must visually show the actual part type:

- Ball thumbnail
- Ramp thumbnail
- Block thumbnail

Keep:

- existing button ids
- part name
- inventory count
- accessibility/text labels

The visual preview should be the dominant element, with name/count secondary.

Prefer reusable CSS/SVG/rendering primitives rather than external image assets.

3. Consistency

Palette previews should visually correspond closely to how the same object appears inside the game.

Do not redesign the Parts Palette layout or behavior.

4. Scope

Do NOT change:

- puzzle solutions
- timers
- progression
- inventory semantics
- physics
- object sizes
- placement logic
- toolbar
- #22 behavior

Update tests only where markup changes require it.
Append THIS FULL PROMPT verbatim to docs/CODEX_PROMPTS.md.

Run:

- npm run typecheck
- npm run lint
- npm test
- npm run format:check
- npm run build
- npx playwright test --list

Do not commit or push.

Report:

- rendering improvements per object
- Parts Palette preview implementation
- files changed
- validation results

Double-check syntax, formatting, truncation, and unrelated changes.

Continue milestone #23 with the Play header refinement only.

Do NOT implement editable Bird yet.
Do NOT address the 3 currently known E2E failures in this step unless this header change directly causes a new failure.
Do not commit or push.

TARGET

Merge the current two top Play rows into one compact header.

Layout:

LEFT SIDE:
- Level position + difficulty, e.g.:
  LEVEL 3 OF 5 — HARD
- Puzzle name
- Timed indicator when applicable

RIGHT SIDE:
- Settings
- Parts

The right-side controls should be aligned to the far right.

PUZZLE NAME / SELECTOR

- Make the puzzle name itself clickable.
- Clicking the puzzle name opens the existing puzzle selector/list.
- Remove the redundant separate "Puzzle: <name>" control/row.
- Preserve existing:
  - puzzle grouping
  - locked/completed states
  - progression behavior
  - Unlock All behavior
  - selector accessibility/keyboard behavior where already supported
  - existing puzzle-switching semantics

TIMED

- Keep the TIMED indicator on the same header line.
- Untimed puzzles should not show a misleading TIMED label.

RESPONSIVE

- Keep the header usable at narrow/mobile widths.
- Allow sensible wrapping if necessary.
- Do not overlay or shrink the game canvas.
- Keep Parts Palette behavior from #22 unchanged.

SCOPE

Do NOT change:
- gameplay
- physics
- puzzle JSON
- timers
- inventory
- Parts Palette behavior
- Settings behavior
- progression logic
- Bird behavior
- object rendering/artwork

KNOWN E2E STATE

Before this change, the local full E2E run had 3 known failures:
- progression persistence after reload
- Unlock All progress preservation
- player-owned Ball remove/replace/reset

Do not weaken assertions, raise global timeouts, or change gameplay to hide those failures.

Update focused UI tests only as needed for the new header structure.

Append THIS FULL PROMPT verbatim to docs/CODEX_PROMPTS.md.

Run:
- npm run typecheck
- npm run lint
- npm test
- npm run format:check
- npm run build
- npx playwright test --list

Do not commit or push.

Double-check:
- syntax
- formatting
- DOM ids/test hooks
- responsive layout
- accessibility
- accidental truncation
- unrelated changes

Report:
- old vs new header structure
- how puzzle-name click opens the selector
- files changed
- validation results

Continue milestone #23 with Bird as a normal editable Part.

Also improve Bird presentation:
- use an actual Bird image/visual, not just a plain placeholder look
- preferably animated
- make Bird flight noticeably slower than it is now

Do NOT commit or push.

GOAL

Turn Bird into a normal player-editable part while preserving support for fixed Birds.

REQUIREMENTS

1. Bird as a normal Part
- Add Bird to the normal per-puzzle inventory system.
- Bird must appear in the Parts palette with:
  - visual preview
  - name
  - count
- Keep existing parts behavior unchanged for Ball / Ramp / Block.

2. Bird ownership/edit behavior
Support both:
- fixed Birds
- player-owned Birds

For player-owned Birds:
- selectable in Edit
- draggable in Edit
- removable in Edit
- removing returns Bird to inventory
- placeable again from Parts inventory
- Reset restores JSON defaults
- Rerun restores Run-start Bird state

For fixed Birds:
- remain non-editable
- keep fixed-part behavior/feedback

3. Bird runtime behavior
- A placed Bird becomes autonomous during Run, just like existing Bird actor behavior.
- Preserve deterministic movement / contact behavior / Pause / Resume / Timeout / Success / Rerun / Reset semantics.
- Make Bird movement noticeably slower than current behavior.
- Use the smallest coherent change for speed:
  - either lower the existing Bird patrol speed default
  - or introduce a clearly scoped Bird speed parameter if genuinely needed
- Do not introduce unrelated actor-system refactors.

4. Bird visual / image / animation
I want the Bird to look like a real game object, not just a plain marker.

Preferred implementation:
- original Bird artwork/shape
- preferably animated (for example wing flapping / bobbing)
- lightweight and local-first
- no copyrighted assets
- no paid/external dependencies

Good options:
- Phaser-drawn bird with layered shapes and a small wing-flap animation
- or a tiny original local SVG/sprite if that is cleaner

Requirements:
- visually readable at gameplay size
- clearly recognizable in the Parts palette preview
- in-game Bird visual should match the Parts preview closely
- do not over-engineer the asset pipeline

5. Puzzle/catalog integration
- Add Bird to inventory only where intended by puzzle data.
- Keep existing puzzles working.
- If needed, add/update one focused puzzle/test fixture that includes a player-owned Bird.
- Do not redesign #23 real puzzles unless Bird is intentionally added there.

6. Scope limits
Do NOT change:
- unrelated gameplay
- puzzle selector behavior
- Parts palette behavior beyond adding Bird
- timer logic
- header layout
- global E2E timeout strategy
- broader visual-polish backlog items beyond Bird itself

TESTS

Add/update focused coverage for:
- Bird inventory counts
- fixed Bird remains non-editable
- player-owned Bird selection/drag/removal/replacement
- Reset restores Bird defaults
- Rerun restores Run-start Bird state
- Bird preview appears in Parts palette
- Bird still performs deterministic autonomous behavior in Run
- slower Bird movement expectation only where necessary

Append THIS FULL PROMPT verbatim to docs/CODEX_PROMPTS.md.

Run:
- npm run typecheck
- npm run lint
- npm test
- npm run format:check
- npm run build
- npx playwright test --list

Attempt full Playwright only if practical; if sandbox EPERM blocks it, report that clearly and do not change code because of it.

Double-check:
- syntax
- formatting
- inventory/state consistency
- animation not drifting from physics position
- unrelated changes
- accidental truncation

Report:
- Bird visual approach used
- whether/how Bird is animated
- how much slower Bird became
- data/model changes
- files changed
- validation results

Continue milestone #23 with selector/header interaction refinement only.

Do NOT change gameplay.
Do NOT change Bird behavior.
Do NOT address the known E2E failures in this step unless this selector change directly requires test updates.
Do NOT commit or push.

TARGET

Improve the puzzle selector presentation and click target.

Requirements:

1. Selector/list item content
- In the puzzle selector/list, each puzzle entry should clearly show:
  - level number
  - puzzle name
  - difficulty
- Preserve existing locked / available / completed state information.
- Preserve existing grouping (Basic / Medium / Hard) unless the current implementation no longer uses grouping.

2. Clearly clickable current-puzzle control
- In the top header, make the current puzzle display obviously clickable.
- Do not rely on only the puzzle title text looking clickable.
- Use the existing current-puzzle area as the basis.

3. Whole group clickable
- Prefer making the whole current-puzzle group clickable, not only the puzzle name.
- Clicking anywhere in that group should open/close the existing selector.
- Preserve keyboard accessibility:
  - Enter should toggle it
  - aria-expanded should stay correct
  - existing selector open/close semantics should remain correct

Scope:
- Do NOT redesign Settings / Parts behavior.
- Do NOT change timer logic, gameplay, inventory, palette behavior, or puzzle progression rules.
- Do NOT add new features such as Show Solution or Ignore Timer in this step.

Tests:
- Update focused UI/E2E tests only where required by the new structure/interaction.
- Keep assertions strong.

Append THIS FULL PROMPT verbatim to docs/CODEX_PROMPTS.md.

Run:
- npm run typecheck
- npm run lint
- npm test
- npm run format:check
- npm run build
- npx playwright test --list

Do not commit or push.

Double-check:
- syntax
- formatting
- DOM ids/test hooks
- accessibility
- click target behavior
- accidental truncation
- unrelated changes

Report:
- old vs new selector/list entry format
- how the current-puzzle clickable group works
- files changed
- validation results

Continue milestone #23 with the puzzle selector refinement only.

Do NOT commit or push.

TARGET

Improve the current-puzzle control and puzzle selector presentation.

1. Selector/list entry format

Each puzzle entry must show exactly this information hierarchy:

- Puzzle name
- Level # + Level name

Example structure:

Puzzle Name
Level 3 · Level Name

IMPORTANT:
- Do NOT substitute difficulty for Level name.
- Do NOT substitute status for Level name.
- Locked/completed state may still be visually indicated separately, but it must not replace the requested content.
- Preserve Basic / Medium / Hard grouping if currently used.

Inspect the current puzzle/level data model first.
If "Puzzle name" and "Level name" are not currently separate data fields, do not invent arbitrary values or silently redefine existing fields. Report the model limitation and make the smallest coherent data-model adjustment needed.

2. Make current-puzzle control obviously clickable

The current puzzle information shown in the Play header must visually read as an interactive selector control.

Use appropriate cues such as:
- hover/focus state
- pointer cursor
- subtle button/container treatment
- dropdown chevron/indicator

Keep it visually compact.

3. Make the whole current-puzzle group clickable

Do not limit interaction to only the puzzle-name text.

The complete current-puzzle information group should toggle the existing puzzle selector.

Preserve:
- existing selector behavior
- locked/completed semantics
- puzzle switching
- progression
- Unlock All
- keyboard accessibility
- Enter/Space activation where appropriate
- aria-expanded
- existing stable test hooks where possible

Do NOT change:
- gameplay
- physics
- puzzle solutions/data except if a minimal name-field adjustment is genuinely required
- Settings
- Parts
- timers
- Bird behavior
- inventory
- Show Solution
- Ignore Timer
- 3D visual work

TESTS

Update focused UI/E2E coverage for:
- selector entries showing Puzzle name
- selector entries showing Level # + Level name
- whole current-puzzle group clickable
- keyboard toggle
- aria-expanded state

Do not weaken existing assertions or raise global timeouts.

Append THIS FULL PROMPT verbatim to docs/CODEX_PROMPTS.md.

Run:
- npm run typecheck
- npm run lint
- npm test
- npm run format:check
- npm run build
- npx playwright test --list

Double-check:
- requested information hierarchy is exact
- no difficulty/status substituted for Level name
- accessibility
- responsive behavior
- syntax/formatting
- accidental unrelated changes

Report:
- what existing fields represent Puzzle name and Level name
- exact selector entry format implemented
- clickable-group implementation
- files changed
- validation results

Refine the current puzzle selector/header presentation only.

Do not commit or push.

TARGET HEADER

The entire current-puzzle header control should be clickable and formatted exactly like:

Down the Ramp · Basic · Level 4

Meaning:
- Puzzle name
- Difficulty
- Level number

Do NOT show the level name in the header.
Do NOT duplicate the puzzle name.

TARGET SELECTOR LIST

Each selector card should show:

Puzzle name
Level # · Level name

Example:

Relay Ramps
Level 1 · Aim the Ramp

For Down the Ramp / Bridge the Gap, remove the current duplicate-name problem.

Inspect the data model:
- Puzzle name and Level name must be distinct concepts.
- Do not render the same field twice under different labels.
- If current data has identical values because the model/content was populated incorrectly, make the smallest coherent data correction.

Preserve:
- Basic / Medium / Hard grouping
- completed / available / locked state
- timed indicator
- selector behavior
- progression
- Unlock All
- accessibility
- whole current-puzzle group clickable

Do not change gameplay, physics, puzzle geometry, inventory, timers, Bird behavior, Settings, Parts, or unrelated UI.

Update focused tests for:
- header format: Puzzle name · Difficulty · Level #
- selector format: Puzzle name + Level # · Level name
- no duplicate puzzle/level naming when values should differ
- whole header group remains clickable

Run:
- npm run typecheck
- npm run lint
- npm test
- npm run format:check
- npm run build
- npx playwright test --list

Append THIS FULL PROMPT verbatim to docs/CODEX_PROMPTS.md.

Report:
- data fields used for Puzzle name / Level name / Difficulty / Level #
- exact header output
- exact selector-card output
- files changed
- validation results

Contraption Lab — Phase 2 documentation checkpoint.

Do NOT implement gameplay.
Do NOT commit or push.

Goal:
Record the approved Sunny Attic / Phase-2 direction in the repo before feature work starts.

SOURCE FILES

Locate these exact files under the Windows Downloads folder, somewhere under:

/mnt/c/Users/*/Downloads/

Files:
- contraption-lab-review-for-sol.md
- sunny-attic-design-v0.1.md
- sunny-attic-art-bible-v0.1.md

If more than one copy of any exact filename exists, STOP and report the paths.
Do not guess which copy to use.

1. COPY SOURCE DOCS VERBATIM

Create:

docs/design/phase2/

Copy the three source files there WITHOUT modifying their contents:

docs/design/phase2/contraption-lab-review-for-sol.md
docs/design/phase2/sunny-attic-design-v0.1.md
docs/design/phase2/sunny-attic-art-bible-v0.1.md

Verify copied files are byte-identical to the Downloads originals.

2. UPDATE AGENTS.md

Amend AGENTS.md for the approved Phase-2 direction.

Record:

Audience:
- private family game
- primary audience ages 6 and 4
- gentle
- child-facing play must not require reading
- no mandatory failure state
- timers/failure/locking may survive only as parent-gated options and are OFF by default

Scope:
- explicitly scoped original artwork, animation, audio/SFX, environments,
  visual effects and new game components are now allowed
- generated Phaser shapes may remain development/debug fallbacks
- no accounts/networking/cloud/backend/multiplayer/community sharing/mobile
  packaging/general-purpose editor unless explicitly scoped
- no new dependencies, paid services or accounts without owner approval

Architecture invariants:
- strict TypeScript
- deterministic fixed-step simulation
- JSON level definitions
- validation separate from rendering
- pure/testable state where practical
- declarative mechanics rather than character-specific gameplay code
- ownership/inventory semantics
- deterministic Reset/Rerun
- headless-verifiable reference solution required for new levels once the
  headless runner exists
- distinct reference solutions for materially different star routes

Keep the existing original-content/copyright restriction.

Make the smallest coherent amendment; do not rewrite AGENTS.md unnecessarily.

3. ADD PHASE-2 RECONCILIATION DOC

Create:

docs/PHASE2_RECONCILIATION.md

This is the approved planning delta, NOT current implemented behavior.

Use these source docs:
- the three copied Phase-2 docs
- current AGENTS.md
- current docs/PROJECT_STATE.md
- current docs/ROADMAP.md
- current code/schema where needed to avoid incorrect assumptions

Record concisely:

A. Fixed product decisions
- audience ages 6/4
- gentle / wordless child-facing play
- no failure by default
- timer/failure/locking parent-gated and off by default
- Sunny Attic Storybook-flat art direction approved
- reconcile/evolve current architecture; do not restart

B. Architecture decisions
- preserve deterministic/JSON/verifiable substrate
- add headless simulation runner before significant new level production
- Contact Actions v2: impulse, redirect, conditions
- explicitly note that Painted Blocks also require dynamic/toppling behavior;
  Contact Actions v2 alone is insufficient

C. Phase-2 milestones

#24 Project contract / AGENTS amendment
#25 Headless simulation runner
#26 Contact Actions v2
#27 Gentle default + parent gate + wordless Play shell
#28 Dynamic/toppling Block capability
#29 Storybook asset pipeline
#30 Chapter 1 L1 — Good Morning, Ball
#31 Chapter 1 L2 — Boing
#32 Chapter 1 L3 — Tea Time
#33 Chapter 1 L4 — Tell the Blocks
#34 Chapter 1 L5 — The Cat Is Not Moving
#35 Chapter 1 L6 — Wind Under the Window
#36 Chapter 1 acceptance pass

For each milestone include:
- target
- concise acceptance criteria
- no implementation details beyond what is needed to define the ticket

D. Chapter-1 repo vocabulary translation
- marble -> Ball
- plank -> Ramp
- teacup -> Goal presentation
- Painted Blocks -> Block-derived dynamic/toppling component semantics
- name required schema/runtime gains:
  referenceSolutions, future star goals, impulse, redirect, conditions,
  approach-side, airborne condition, deterministic dynamic/toppling behavior

E. Adopt / adapt / defer/drop summary for major Sunny Attic concepts.

F. Owner-only unresolved decisions:
- disposition of existing five prototype puzzles in child-facing UI
- parent-gate interaction
- provisional L4/L5 ordering pending family test
- whether SFX is required for Chapter-1-playable or follows immediately after

Do not reopen settled decisions.

4. UPDATE docs/ROADMAP.md

Preserve completed history through #23.

Add the Phase-2 milestones #24–#36 above as PLANNED, not completed.

Reconcile the existing backlog:
- do not duplicate items now covered by Phase 2
- preserve unrelated backlog items
- make clear Phase 2 supersedes conflicting old planning such as Ignore Timer
  being merely an optional future behavior; timers are now parent-gated/off
  by default per the product decision

Do not claim unimplemented behavior exists.

5. PROJECT_STATE.md

Do NOT rewrite PROJECT_STATE.md as part of this ticket.
It describes implemented state, while this ticket changes planning/contracts only.

If you notice materially stale factual statements, report them separately;
do not silently edit them.

6. PROMPT LOG

Append THIS FULL PROMPT verbatim to docs/CODEX_PROMPTS.md.

7. VALIDATION

Run:
- git diff --check
- npm run typecheck
- npm run lint
- npm test
- npm run format:check
- npm run build

Also verify:
- the three copied Fable files are byte-identical to the originals
- no gameplay/source files were changed
- no generated/source document was truncated
- Markdown formatting is structurally valid

Do not commit or push.

REPORT:
- exact source paths found in Downloads
- files added/changed
- byte-identity verification result
- short summary of AGENTS.md delta
- Phase-2 milestone list
- any PROJECT_STATE.md stale facts noticed
- validation results
- git status --short

Phase-2 docs checkpoint cleanup only.

Do not commit or push.
Do not modify the three verbatim files under docs/design/phase2/.

1. Add the smallest Prettier exclusion for:
   docs/design/phase2/*.md

2. Run:
   npm run format:check
   git diff --check

3. Verify the three Phase-2 files are still byte-identical to the originals in Downloads.

4. Run:
   git status --short

Do not touch or stage:
- docs/design/*Zone.Identifier*
- docs/reviews/

Append this full prompt verbatim to docs/CODEX_PROMPTS.md.

Report:
- .prettierignore change
- validation results
- byte-identity result
- git status --short

Phase-2 docs cleanup: remove duplication between ROADMAP.md and PHASE2_RECONCILIATION.md only.

Do NOT commit or push.
Do NOT change gameplay/source files.
Do NOT change AGENTS.md.
Do NOT change the three verbatim Fable docs.

Goal:
Keep the detailed Phase-2 rationale and planning in:
docs/PHASE2_RECONCILIATION.md

Keep docs/ROADMAP.md as the concise execution roadmap.

Required structure:

1. docs/PHASE2_RECONCILIATION.md
Keep:
- fixed product decisions
- architecture rationale
- adopt/adapt/defer/drop decisions
- Chapter-1 vocabulary/schema translation
- detailed milestone targets and acceptance criteria
- owner-only open questions

2. docs/ROADMAP.md
Preserve completed history through #23.

For #24–#36, reduce each milestone to:
- milestone number + title
- Planned status
- one concise target/summary line

Do NOT repeat detailed acceptance criteria or design rationale there.

Add a clear reference such as:
"See docs/PHASE2_RECONCILIATION.md for Phase-2 rationale, detailed acceptance criteria, and design decisions."

Preserve unrelated backlog items.

Do not remove any unique information; if information exists only in ROADMAP.md, move it to PHASE2_RECONCILIATION.md before shortening ROADMAP.md.

Append THIS FULL PROMPT verbatim to docs/CODEX_PROMPTS.md.

Run:
- npm run format:check
- git diff --check

Report:
- what duplication was removed
- whether any information was moved
- files changed
- validation results
- git status --short

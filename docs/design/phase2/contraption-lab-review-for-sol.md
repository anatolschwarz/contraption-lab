# Contraption Lab — Repo Review & Reconciliation Notes
Reviewer: Claude (Fable 5), 2026-08-11. Reviewed: github.com/anatolschwarz/contraption-lab @ main (commit 424735b, "Add editable animated Bird parts").
Purpose: bridge between the CURRENT REPO STATE and the two proposal docs
(sunny-attic-design-v0.1.md, sunny-attic-art-bible-v0.1.md), which were written
BEFORE this review, greenfield. Repo is canon; proposals are proposals.

---

## Context the reviewer had

- Target audience decision (see owner's cover note): girls aged 6 and 4;
  nothing weird or scary; minimal owner involvement in implementation.
- Proposal docs define: "Sunny Attic" world/tone, 9-part cast with
  personality-as-mechanic, no-failure bedrock + optional per-child challenge
  layers, wordless UI, six Chapter-1 level cards with reference-solution
  requirements, Style-A flat storybook art direction.

## Insight 1 — Repo and proposals conflict on audience-critical mechanics

The repo's choices are sensible for a general prototype and WRONG for the
stated audience. Four collisions, severity order:

1. Timed levels + "Failed — Time expired" (Down the Ramp: 10s; Bridge the
   Gap: 12s) vs proposal's no-failure bedrock. Most frustrating mechanic in
   the build for a 4-year-old.
2. `destroy` contact rules (bird destroys blocks AND ramps on touch) vs
   warm-silly tone. Part-vanishes-on-contact is a session-ending confusion
   moment at this age.
3. Locked puzzles in the selector. Refusing a 4-year-old's pick has no upside
   in a family game. (Mitigation exists: Settings "Unlock all" — consider
   making it the default.)
4. Text-dependent UI (failure message, difficulty labels, titles) vs wordless
   canon. Both players are pre/early readers.

DECISION REQUIRED FROM OWNER (do not infer): is Contraption Lab (a) evolving
so the audience IS the spec, or (b) staying general, with Sunny Attic as a
themed content pack layered on top? The owner's cover note states the choice.

## Insight 2 — AGENTS.md forbids what the proposals require

AGENTS.md scope restrictions: no audio, no complex graphics, no extra game
components; README: "generated shapes and text only, no external artwork."
The art bible (9 illustrated parts, environments, FX) and the design doc's
sound-driven humor violate the repo's own agent rules. Implementation agents
following AGENTS.md will refuse or thrash. AGENTS.md must be amended
deliberately, as its own change, BEFORE related tickets run — not discovered
mid-ticket.

## Insight 3 — The architecture is good and already verifiability-first

Fixed 60 Hz accumulator (deterministic stepping), JSON-as-truth levels with
separate validation, pure state functions, fixed/player ownership model,
declarative contact rules, reference solutions in tests (e2e checks the known
two-ramp solution at +/-1 px; realPuzzles.test.ts carries reference paths).
The hard substrate for autonomous level production already exists. Preserve
these properties in any adaptation.

## Insight 4 — One gap blocks autonomous level production

Solvability is currently proven only in Playwright (browser, serial, slow).
The Vitest reference-path checks validate PLACEMENT LEGALITY, not that the
simulation reaches the goal. So "does this level solve?" is not a fast
headless check, and every new level needs a human or browser run to trust.
Highest-leverage next milestone: a HEADLESS SIMULATION RUNNER —
simulate(level, placements) -> { solved, ticks, events } — runnable in Vitest.
This converts level creation into agent-parallelizable, self-verifying work.

## Insight 5 — The proposal cast maps onto existing systems

The Bird proves the pattern: JSON-defined actor + declarative contact rules +
zero actor-specific gameplay code. The Cat is an actor with no patrol plus a
new contact action. BUT most proposal parts need contact ACTIONS beyond
`destroy`:
- impulse/launch: spring mattress, jack-in-the-box, fan (fan also needs an
  airborne-only condition)
- redirect/teleport: teapot (in lid, out spout), cat (approach-side-
  deterministic pat)
- constraint: string & pulley (likely the hardest; Matter constraints)
Recommended as ONE coherent milestone ("contact actions v2: impulse,
redirect, conditions") before any themed level content — it unlocks 5+ of the
9 proposed parts at once.

## Insight 6 — Reconcile, don't adopt

Do not merge the proposal docs as-is:
- Vocabulary conflicts: proposal "marble" ~= repo "Ball"; proposal "plank" ~=
  repo "Ramp"; proposal "painted blocks" ~= repo "Block" (but proposal blocks
  are a toppling CHAIN — dynamic, not the repo's static block).
- The proposals assume greenfield; the repo has 5 puzzles, progression,
  timers, and tests that the proposals ignore.
- The art direction has ENGINE implications: the repo renders generated
  Phaser shapes; illustrated sprites require an asset pipeline and
  sprite/physics-body separation (hitboxes from silhouettes) in the 960x540
  space. Generated images are REFERENCE ART until that milestone exists.
  Style A (flat, thick outlines) was chosen partly because it can coexist
  with generated shapes during a transition.

## Suggested milestone order (proposal, for the delta plan)

1. Owner decision recorded (Insight 1) + AGENTS.md amendment (Insight 2)
2. Headless simulation runner (Insight 4)
3. Contact actions v2: impulse, redirect, conditions (Insight 5)
4. Audience-mode changes per the decision: no-failure default, unlock-all
   default, wordless-UI pass, timers optional per profile
5. Themed content: Sunny Attic parts as a pack; Chapter-1 cards adapted to
   repo vocabulary, each with headless-verified reference solutions (and
   separate reference routes where star goals imply different routes: L3, L5)
6. Asset pipeline milestone; only then illustrated art enters the build

## Facts checked during review

- 50 files, ~6.1 MB; TypeScript strict, Vite, Phaser 3 + bundled Matter,
  Vitest (11 test files), Playwright e2e (15 scenarios per README), GitHub
  Pages CI. Level schema in src/levels/levelTypes.ts: parts = balls, ramps,
  blocks + floor, goal, gravity, inventory, contactRules (destroy only),
  actors (patrol only), optional timeLimitSeconds. Milestones #1-#23
  complete per docs/PROJECT_STATE.md and docs/ROADMAP.md. Backlog already
  contains "Themed/original object libraries" — the natural slot for Sunny
  Attic under decision (b).

# The Sunny Attic — Design Document v0.1

A Rube-Goldberg physics puzzle game in the spirit of *The Incredible Machine*.
Private family project. Audience: two girls, ages 6 and 4. Nothing weird, nothing scary.
Status: artistic design phase. No technical spec yet, no code.

---

## 1. World & tone (canon)

- **World:** one enormous sunny attic, infinite sideways. A big skylight, warm
  afternoon light, floating dust motes. Each chapter is a "corner" of the attic
  (toy corner, tea-party corner, nap corner, window corner...).
- **Tone:** warm-silly. Humor comes from visible cause-and-effect (boings,
  wobbles, ridiculous landings) and from sound (boing, pbbbt, tada, purr).
  Nothing deadpan-dark, nothing spooky, nothing that startles.
- **Running gag:** boxes are labeled with crayon drawings of their contents —
  wrong every time (a box drawn with a fish contains hats).
- **Premise (whole story, one sentence):** a marble rolls into the attic and
  wants to reach the far end; every level helps it cross one corner. The marble
  has no face and no voice. Chapter ends are tiny wordless vignettes
  (e.g. the marble rests in a matchbox bed).
- **UI is wordless.** Goals are shown as pictures (marble + cup + sparkle).
  No reading required anywhere in play.

## 2. Play philosophy (canon)

- **No failure — bedrock, never optional.** A machine that doesn't work is not
  wrong; the marble rolls back and waits. No timer, no lives, no score, no
  losing state.
- **Challenge is optional and layered on top**, per-child profile:
  - Star goals (solve with <= N parts; runtime under M seconds; special routes)
  - Part budgets (limited inventory vs open toybox)
  - Wobble mode (parts behave slightly imperfectly, for replays)
  - Profiles picked by picture at launch; settings behind a parent gate
    (long-press or simple math prompt). Default profile = maximal gentle.
  - v1 ships no-failure only; the level format carries star fields from day one
    so challenge layers are a later flip, not a rework.
- **Two-kids asymmetry:** every level is a puzzle for the 6-year-old and a toy
  for the 4-year-old. Every part is pokeable (tap = a small delightful
  reaction). Chapter 1 solvable by the 6yo alone; later chapters
  "with a grown-up".
- **Celebrate hard:** solve -> confetti, purr, marble hop. Disproportionate joy
  is correct for this audience.
- **Unintended solutions are celebrated, never patched.** A solved level is a
  solved level.

## 3. Cast v1 — 9 parts (canon)

Design rule: every part is readable in one second of watching, and has exactly
one personality quirk that IS its mechanic. Mechanics are characterization.

| Part | Temperament | Mechanic / rule |
|---|---|---|
| Plank | Honest worker | Static ramp/bridge. Does exactly what you place. |
| Spring mattress (striped) | Enthusiastic | Bounces; bounce height = fall height. |
| The Cat | Sleepy, playful | FIXED part (never placed). Wakes when touched, pat-pat-pat sends the marble in a direction DETERMINED BY APPROACH SIDE (left flank -> right; back -> up-and-behind). Asleep again instantly. Purrs on level solve. Tap: stretch; long-press: slow-blink. |
| Balloon (slightly deflated) | Melancholy | Lifts slowly. On a sharp corner it does NOT pop — it lets go and flies around going pbbbt, then lands empty (lift lost, laugh gained). |
| Painted blocks | Gossip | Domino chain; direction changers and delay lines. Each plays a xylophone note when tapped or toppled. |
| Ribbon fan (wobbly) | Pushy | Pushes AIRBORNE things only; grounded things ignore it. Aimable (left/right, two heights). Ribbons show the wind. |
| Jack-in-the-box | Coiled fun | Wind-up, one-shot launcher. Payoff is a friendly pop-up face and a "doing!" — a giggle, never a flinch. (Replaced the mousetrap.) |
| String & pulley | Diplomat | Connects two things: weight goes down, something else goes up. |
| Teapot | Tea-party energy | Pour-through redirection: marble in the lid, out the spout. Spout direction matters. Toots steam when used. |

Amendments log (decisions made during level design):
1. Fan rule sharpened: airborne-only. (Was "ignores heavy things" — ambiguous.)
2. Cat made deterministic by approach side. (Was "random-ish" — wrong for a
   no-frustration game. Chaos in flavor, reliability in play.)
3. Mousetrap cut (stored violence); jack-in-the-box replaces it.
4. Balloon de-popped (popping frightens 4-year-olds); fly-around instead.

## 4. Level card format (canon)

Each level is specified as a card with fields:
SETTING, NEW PART, GOAL-PICTURE, LAYOUT, INTENDED SOLUTION, POKE (4yo),
PUZZLE (6yo), LAUGH, STAR (future).

- INTENDED SOLUTION is design prose (relative placements + the chain).
  Exact coordinates belong to the technical spec phase; at implementation each
  card's solution is encoded as a machine-verifiable REFERENCE SOLUTION the
  simulator must solve headlessly before the level ships.
- Where a STAR implies a DIFFERENT route (not just a constraint), the card
  carries a reference solution per star route too. Applies in Ch.1 to L3
  (no-plank route) and L5 (back-pat bank shot).
- Part names in cards must match the cast table exactly (machine-consumable).

## 5. Chapter 1 — "The Sunny Corner" (six level cards)

### L1 — Good Morning, Marble
- SETTING: sunbeam by the skylight; a shelf, one cardboard box, dust motes
- NEW PART: Plank
- GOAL-PICTURE: marble -> teacup -> sparkle
- LAYOUT: marble on high shelf (left); teacup on box (right, lower); one gap;
  one Plank in inventory; plank near-snaps into place
- INTENDED SOLUTION: bridge the gap with the Plank; RUN; marble rolls into cup
- POKE: marble wiggles; cup clinks; sunbeam motes swirl. Placement itself is
  poke-solvable
- PUZZLE: none — this level is the contract: place, run, joy
- LAUGH: plink, confetti, distant purr
- STAR: solve on first RUN

### L2 — Boing
- SETTING: mattress corner; wardrobe, hatstand in background
- NEW PART: Spring mattress
- GOAL-PICTURE: marble (up-arrow) teacup
- LAYOUT: marble rolls off fixed shelf and falls; cup is UP on a tall box;
  mattress in inventory; one obvious floor zone + two plausible ones
- INTENDED SOLUTION: mattress under the fall point; marble bounces up into cup
- POKE: mattress sproing-jiggles; hatstand hat tips comically and resets
- PUZZLE: bounce height depends on fall height — first physical intuition
- LAUGH: the sproing; on a miss the marble knocks the hat onto itself and
  wears it back to start
- STAR: solve with mattress on first placement

### L3 — Tea Time
- SETTING: tea-party corner; doll table set for tea; the cup is UNDER the table
- NEW PART: Teapot
- GOAL-PICTURE: marble -> teapot -> teacup
- LAYOUT: marble path along tabletop; cup unreachable below; Teapot + one
  Plank in inventory; teapot spout aims down-left when placed on table edge
- INTENDED SOLUTION: Plank guides marble into the Teapot lid; marble exits the
  spout, redirected under the table into the cup
- POKE: teapot toots steam; doll plates chime
- PUZZLE: first redirection — in becomes out, somewhere else; spout direction
  matters
- LAUGH: kettle-toot as the marble passes; tea-pour sound on landing
- STAR: no Plank used (a steeper direct roll exists) — separate reference route

### L4 — Tell the Blocks
- SETTING: toy corner; staircase of picture books; painted blocks scattered
- NEW PART: Painted blocks (chain of 6)
- GOAL-PICTURE: marble -> falling blocks -> teacup
- LAYOUT: tunnel to cup shut by a leaning book (marble alone too light to push
  it); blocks in inventory; block-sized ledge curves around the book's far
  side; marble's pre-placed plank path passes the first block position and
  includes a FLAT PAUSE STRETCH (readability: marble visibly waits while the
  chain falls)
- INTENDED SOLUTION: line blocks along the ledge; running marble tips block 1;
  chain topples around the corner; last (big) block shoves the book open;
  marble arrives just behind and rolls through into the cup
- POKE: each block plays a xylophone note
- PUZZLE: sequence and timing — something must happen BEFORE the marble
  arrives; heavy does what light can't
- LAUGH: chain falls as an ascending xylophone scale; the book flops open to a
  picture of a fish
- STAR: all 6 blocks in one unbroken chain
- RISK NOTE: hardest level to read wordlessly. If table-testing with the girls
  shows confusion, swap L4 and L5.

### L5 — The Cat Is Not Moving
- SETTING: nap corner; sun-warmed blanket; The Cat asleep dead-center between
  marble and cup
- NEW PART: The Cat (fixed; never placed, never moved)
- GOAL-PICTURE: marble -> cat paw -> teacup
- LAYOUT: no route past the cat; cup right; one Plank in inventory; two
  approach ramps exist — LEFT flank arrival = patted rightward (goal route);
  BACK arrival = patted up-and-behind (fun route / star route)
- INTENDED SOLUTION: Plank routes marble to the cat's left flank; pat-pat-pat;
  marble sails into the cup; cat asleep again before it lands
- POKE: tap = stretch and purr; long-press = slow-blink
- PUZZLE: the cat is deterministic BY APPROACH SIDE — reads as personality,
  plays as rule; choosing the approach is the puzzle
- LAUGH: pat-pat-pat signature beat; instant re-sleep topper
- STAR: solve via the back-pat route (bank shot off a box) — separate
  reference route

### L6 — Wind Under the Window
- SETTING: window corner; open skylight; breathing curtains; Ribbon fan on a
  stool
- NEW PART: Ribbon fan (+ return of Spring mattress; first two-part chain)
- GOAL-PICTURE: marble (up-arrow, wavy-arrow) teacup
- LAYOUT: cup atop a tall stack across a wide gap — too far for any bounce
  alone; Mattress and Fan in inventory; fan aimable (left/right, two heights)
- INTENDED SOLUTION: mattress under the fall -> high bounce -> fan bends the
  flight mid-air into the cup
- POKE: fan ribbons flutter; curtains billow
- PUZZLE: two parts must AGREE — bounce height and fan height must meet;
  first real trial-and-refine loop
- LAUGH: the bent trajectory looks delightfully wrong until it's right; on
  solve the fan blows the confetti sideways off-screen
- STAR: solve in <= 3 runs
- DESIGN CONSTRAINT (from diagramming): the fan's two height settings must
  bracket the realistic bounce-apex band, so meeting the wind is forgiving —
  never pixel-hunting.

### Difficulty staircase (proof)
L1 poke-solvable -> L2 one placement, one intuition -> L3 one redirection ->
L4 sequencing/timing -> L5 rule-reading -> L6 two-part coordination.
The 4yo owns L1-L2 and the poking layer everywhere; the 6yo's real work starts
at L3; L6 is "with a grown-up" first time.

## 6. Open questions

1. L4 vs L5 order — decide after a family table-read.
2. Art style — undecided (options include: illustrated warm style; the girls'
   own drawings as sprites). Deserves its own artistic round.
3. Sound palette — half the comedy; needs a dedicated pass (list of ~15 SFX).
4. Chapter count / marble's wordless arc — artistic round 3 candidate.
5. Cast expansion to ~15 with interaction ("argument") pairs — round 2
   candidate; jack-in-the-box, balloon, string & pulley have no levels yet.

## 7. Downstream plan (for later sessions — not this phase)

1. This document = the WHY. Hand it unchanged to any implementation session.
2. Technical spec = the HOW (one-time): engine choice, screen grid, part
   physics properties, level file schema (with star fields + reference
   solutions), headless verification harness, determinism requirements
   (fixed timestep, seeded RNG). Can be drafted by a Claude Code session from
   this doc.
3. Level cards = the WHAT (renewable): one card -> one build ticket. An agent
   implements the level, encodes the card's intended solution (and star
   routes) as reference solutions, and proves the simulator solves them
   headlessly before the ticket closes.
4. Human involvement points: approve technical spec; family table-reads;
   accept/reject levels against their cards. Everything else is agent work.

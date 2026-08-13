# Reference Art Session — The Sunny Attic

Complete record of the reference-art generation run. Companion to
`assets-manifest.json` (machine-readable) and `sunny-attic-art-bible-v0.4.md`
(the prompts).

- **Generator:** Sol (ChatGPT), one dedicated thread
- **Curation:** Claude, against the art bible checklist
- **Result:** 39 assets accepted over 13 turns
- **Status:** reference art — NOT game-ready sprites (see Pipeline handoff)

---

## 1. How the run worked

One asset family per prompt; 3–4 variants each; Claude reviewed every variant
and named one keeper; rejects were never downloaded. Sol was given a verdict
line at the top of each new turn so its own thread stayed in sync.

Three guards prevented style drift, and all three were needed:

1. **Anchor references, never siblings.** Each family has one anchor image
   that every member references. Chaining sibling-to-sibling compounds drift.
2. **Explicit flatness language.** "Side-on orthographic" was misread as a 3/4
   turn three separate times. The phrasing that worked: *"front-on flat, like
   a playing card seen straight ahead — NO side face, NO edge, NO thickness,
   NO angle, NO 3D."*
3. **Per-batch human review.** Two batches failed in ways no prompt would have
   caught (mixed-up colours in wrongly named files; three mattresses in one
   image).

Anchors: `block_honey` (blocks), `cat_asleep` (cat poses), `attic_base` (all
six corners), `teacup_empty` (tea set).

## 2. Failures worth remembering

| What happened | Cause | Fix |
|---|---|---|
| Isometric blocks, mattress, plank | "side-on orthographic" ambiguous | "playing card seen straight ahead", no thickness |
| Lilac blocks turned 3/4 and went wide | referenced the previous sibling, not the anchor | always re-anchor |
| Colours in the wrong files, two blocks per image, half-cropped images | three same-shape assets batched in one turn | ≤2 same-family assets per turn; "exactly one whole object, centred" |
| Attic backdrops rendered in perspective | prompt described "an interior" | describe a flat cut-paper backdrop; floor as a bottom strip only |
| Painterly backdrop vs flat parts | models default to depth for scenes | accepted — the richer backdrop makes flat parts pop |

## 3. Decisions taken during the run

- **Wood grain is canon** for blocks (the accepted honey anchor has it).
- **The earlier Gemini set was discarded**; everything is Sol-generated, one
  style lineage.
- **Mattress "squashed" deleted from scope** — done in-engine by squashing
  the idle sprite.
- **Marble pick favoured readability over beauty** — the simplest swirl
  survives at ~60 px; a prettier two-swirl variant was rejected.
- **Cat faces right when patting**, consistent with the L5 card (marble
  arrives at the left flank, is patted rightward).
- **Backdrops stay opaque**; only parts and fx need background removal.

## 4. The Chapter-1 assets (30)

### Parts (13)
| project_name | source file | notes |
|---|---|---|
| marble_v1.png | marble_variant_2 | protagonist |
| marble_hop_v1.png | marble_hop_variant_2 | celebration |
| marble_waiting_v1.png | marble_waiting_variant_1 | idle/retry |
| plank_v1.png | plank_variant_3 | = repo Ramp |
| mattress_idle_v1.png | mattress_variant_3 | impulse part |
| teacup_empty_v1.png | teacup_empty_variant_2 | the goal |
| teacup_goal_v1.png | teacup_goal_variant_2 | goal reached |
| teapot_idle_v1.png | teapot_idle_variant_2 | redirect part |
| teapot_tooting_v1.png | teapot_tooting_variant_1 | redirect active |
| fan_off_v1.png | fan_off_variant_3 | airborne-only part |
| fan_running_v1.png | fan_running_variant_3 | fan active |
| cat_asleep_v1.png | cat_asleep_variant_3 | CAT ANCHOR; fixed actor |
| cat_patting_v1.png | cat_patting_variant_3 | approach-side pat |

### Blocks (7) — all anchored to block_honey
block_honey_v1 (ANCHOR), block_teal_v1, block_lilac_v1, block_rose_v1,
block_orange_v1, block_cream_v1, block_big_final_v1 (heavy last block).

### Cat extras (2)
cat_stretching_v1 (poke reaction), cat_purring_v1 (celebration).

### Environments (7) — all anchored to attic_base
attic_base_v1 (ANCHOR), corner_L1_v1 … corner_L6_v1.

### FX (1)
sparkle_v1.

## 5. Bank assets (turns 11-13)

Originally deferred, then generated while the style thread was hot. These
have NO Chapter-1 level and NO Phase-2 milestone — they are bank for later
chapters, and are marked "(future part...)" in the manifest's
repo_equivalent field:

| project_name | source file | note |
|---|---|---|
| balloon_floating_v1.png | balloon_floating_variant_1 | lift part, idle |
| balloon_flying_v1.png | balloon_flying_variant_3 | lets go and flies; never pops |
| jackbox_closed_v1.png | jackbox_closed_variant_2 | one-shot launcher, wound |
| jackbox_popped_v1.png | jackbox_popped_variant_2 | friendly clown; gentle, not startling |
| pulley_v1.png | pulley_variant_1 | wheel only; string/weight dynamic in-engine |
| pbbbt_trail_v1.png | pbbbt_trail_variant_1 | balloon flight fx |
| box_sock_v1.png | box_sock_variant_1 | label gag |
| box_teapot_v1.png | box_teapot_variant_1 | label gag |
| box_star_v1.png | box_star_variant_2 | label gag |

Nothing from the art bible remains ungenerated. The only scoped-out item is
the squashed mattress (in-engine effect).

## 6. Pipeline handoff (milestone #29)

These are reference images, not sprites. Before they enter the build:

- Remove the cream background from all parts and fx; keep backdrops opaque.
- Decide final sprite dimensions in the 960×540 space; trim transparent
  margins.
- Sprites determine trimming, scale and anchor points ONLY. Matter body
  geometry remains independently defined gameplay geometry — rendering and
  physics responsibilities stay separated (#29 acceptance criterion).
- Rendering and physics-body responsibilities stay separated; generated Phaser
  primitives remain the debug fallback.
- Note: goal/hop marbles are redrawn simplifications of `marble_v1`, not
  pixel copies. Acceptable for composed assets; unify at #29 if it matters.

## 7. Open follow-ups

- Family table-read to settle the provisional L4/L5 ordering.
- SFX pass (sound carries half the comedy; no assets generated yet).
- UI iconography: picture-goals, RUN button, profile pictures, parent gate.

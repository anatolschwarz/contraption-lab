# The Sunny Attic — Art Bible v0.4 (Style A: Storybook flat)

Companion to sunny-attic-design-v0.1.md. Purpose: reference-image generation.
Supersedes v0.1, v0.2 and v0.3.

**HOW TO USE:** every prompt block below is FULLY SELF-CONTAINED. Copy ONE
block (the quoted `>` text), paste it into the image generator as-is,
generate 3-4 variants, curate with Section 1, save the keeper, move to the
next block. Nothing to prepend, nothing to reference, no block depends on
another. Where a generator supports reference images, Section 2 says when to
use them — but every prompt also works standalone.

Changes from v0.3:
1. FLATNESS PHRASING HARDENED. "Side-on orthographic" was misread as a 3/4
   turn three times. Every sprite prompt now says "front-on flat, like a
   playing card seen straight ahead — NO side face, NO edge, NO thickness,
   NO angle, NO 3D".
2. Wood grain is now CANON for the blocks (the accepted honey keeper has it);
   every block prompt asks for soft subtle grain.
3. Ring contrast rule added: the ring must never be as dark as the outline.
4. Block proportion made explicit: twice as tall as wide, domino on end.
5. REFERENCE-IMAGE RULE (Section 2): always reference the ORIGINAL anchor
   keeper, never the most recent sibling — chaining references caused
   compounding drift.
6. Status list reset: the earlier Gemini set was discarded; all assets are
   being regenerated in a single Sol thread.

---

## 1. Curation checklist — run on EVERY generated image

- [ ] Flat side-on view. NO top face, NO side face, NO 3/4 angle, NO isometric
- [ ] Light from the upper left
- [ ] Thick, soft, rounded DARK-BROWN outlines, even weight (reject black)
- [ ] Palette only: warm cream, honey yellow, soft orange, dusty rose,
      muted teal, soft lilac
- [ ] Object only — no ground line, no shadow puddle, no extra props
- [ ] ONE object per image — no sets, no grids, no contact sheets
- [ ] Still readable when shrunk to ~60 px tall
- [ ] No text, no watermark, no logo, no sparkle glyph
- [ ] Faces (if any): closed eyes as curved lines, open eyes as dots, small
      gentle smile, nothing exaggerated or toothy
- [ ] Feels like the same toybox as the keepers so far

The three checks that catch nearly all rejects: flat side-on, dark-brown
outline (not black), one object only.

## 2. Working notes

- Generate 3-4 per prompt. Pick for STYLE MATCH first, cuteness second.
- If a result is off-style, DELETE adjectives rather than adding more.
- Reference images (if the generator supports them): ALWAYS reference the
  ORIGINAL ANCHOR keeper for that family, never the most recently generated
  sibling. Chaining sibling-to-sibling compounds drift (this is what broke
  the lilac block). Anchors: `block_honey_v1` for all blocks;
  `cat_asleep_v1` for all cat poses; `attic_base_v1` for all six corners.
- If a batch drifts, do not tweak the drifted result — re-run the prompt
  fresh against the anchor.
- Keeper naming: `part_state_v1.png` (e.g. `cat_asleep_v1.png`).
- Watermarks: if the tool bakes one in, crop it before saving a keeper.

## 3. Status — single Sol thread, all assets regenerating

The earlier Gemini set was discarded; nothing from it is in use. One
generator, one style lineage.

KEEPERS SO FAR (do not regenerate):
- attic base       -> `attic_base_variant_3.png`
- block honey      -> `honey_yellow_block_variant_2.png`   [STYLE ANCHOR]
- block teal       -> `muted_teal_block_variant_2.png`

DELETED FROM SCOPE: mattress squashed (done in-engine by squashing the idle
sprite).

REMAINING, in order:
1. Blocks: soft lilac, soft orange, warm cream, dusty rose, big final block
2. Plank; mattress idle; marble hero
3. Teacup idle; teacup with marble; teapot idle; teapot tooting
4. Jack-in-the-box closed; jack-in-the-box popped; pulley wheel
5. Balloon floating; balloon deflating; fan off; fan running
6. Cat: asleep (anchor), patting, stretching, purring
7. Marble hop; marble waiting
8. Six corner dressings (anchor: attic base)
9. Goal sparkle; pbbbt trail; box labels (fish, sock, teapot, star)

---

# 4. PROMPTS

## 4.1 The untested anchor — generate FIRST

### Attic base — backdrop
> Children's picture book illustration, flat vector style, completely flat
> 2D game background with NO perspective, NO depth, NO receding floor,
> NO vanishing point — like flat cut-paper scenery seen straight on.
> A cozy attic wall: a plain warm cream wall surface, one slanted dark wooden
> roof beam crossing the upper right, a simple square skylight in the upper
> left with a pale blue sky patch and one strong pale sunbeam shape falling
> diagonally, a few small floating dust motes, and a single flat horizontal
> wooden floor strip along the very bottom edge only. Thick soft rounded
> dark-brown outlines of even weight, flat colour fills, no gradients, no
> texture, no shading. Palette: warm cream, honey yellow, soft orange, dusty
> rose, muted teal, soft lilac. The entire middle and lower area must be empty
> and uncluttered — no furniture, no shelves, no boxes, no plants, no pictures.
> Wide landscape composition, no text, no watermark, no characters.
## 4.2 Painted blocks — ONE block per image, never a set

(Anchor for ALL blocks: `honey_yellow_block_variant_2.png`. Reference that
one every time — never the previous sibling. Each prompt stands alone too.
Honey yellow and muted teal are already done; the rest remain.)

### Painted block — honey yellow
> Children's picture book illustration, flat vector style, strictly front-on flat
> 2D game sprite, like a playing card seen straight ahead — NO side face, NO
> edge, NO thickness, NO angle, NO 3D, not isometric.
> ONE single wooden toy block standing upright, twice as tall as it is wide like
> a domino on end, painted honey yellow with soft subtle wood grain and a clearly visible darker painted ring in the
> centre of the face. Thick soft rounded DARK-BROWN outlines (not black),
> minimal flat shading. The ring must contrast clearly against the block face,
> never as dark as the outline. Light from upper left. Exactly one block, seen
> perfectly flat from the front — no other blocks, no ground, no shadow. Square composition, tightly cropped, plain
> light cream background, no text, no watermark.

### Painted block — muted teal
> Children's picture book illustration, flat vector style, strictly front-on flat
> 2D game sprite, like a playing card seen straight ahead — NO side face, NO
> edge, NO thickness, NO angle, NO 3D, not isometric.
> ONE single wooden toy block standing upright, twice as tall as it is wide like
> a domino on end, painted muted teal with soft subtle wood grain and a clearly visible darker painted ring in the
> centre of the face. Thick soft rounded DARK-BROWN outlines (not black),
> minimal flat shading. The ring must contrast clearly against the block face,
> never as dark as the outline. Light from upper left. Exactly one block, seen
> perfectly flat from the front — no other blocks, no ground, no shadow. Square composition, tightly cropped, plain
> light cream background, no text, no watermark.

### Painted block — soft lilac
> Children's picture book illustration, flat vector style, strictly front-on flat
> 2D game sprite, like a playing card seen straight ahead — NO side face, NO
> edge, NO thickness, NO angle, NO 3D, not isometric.
> ONE single wooden toy block standing upright, twice as tall as it is wide like
> a domino on end, painted soft lilac with soft subtle wood grain and a clearly visible medium-purple painted ring in the
> centre of the face. Thick soft rounded DARK-BROWN outlines (not black),
> minimal flat shading. The ring must contrast clearly against the block face,
> never as dark as the outline. Light from upper left. Exactly one block, seen
> perfectly flat from the front — no other blocks, no ground, no shadow. Square composition, tightly cropped, plain
> light cream background, no text, no watermark.

### Painted block — soft orange
> Children's picture book illustration, flat vector style, strictly front-on flat
> 2D game sprite, like a playing card seen straight ahead — NO side face, NO
> edge, NO thickness, NO angle, NO 3D, not isometric.
> ONE single wooden toy block standing upright, twice as tall as it is wide like
> a domino on end, painted soft orange with soft subtle wood grain and a clearly visible darker painted ring in the
> centre of the face. Thick soft rounded DARK-BROWN outlines (not black),
> minimal flat shading. The ring must contrast clearly against the block face,
> never as dark as the outline. Light from upper left. Exactly one block, seen
> perfectly flat from the front — no other blocks, no ground, no shadow. Square composition, tightly cropped, plain
> light cream background, no text, no watermark.

### Painted block — warm cream
> Children's picture book illustration, flat vector style, strictly front-on flat
> 2D game sprite, like a playing card seen straight ahead — NO side face, NO
> edge, NO thickness, NO angle, NO 3D, not isometric.
> ONE single wooden toy block standing upright, twice as tall as it is wide like
> a domino on end, painted warm cream with soft subtle wood grain and a clearly visible darker painted ring in the
> centre of the face. Thick soft rounded DARK-BROWN outlines (not black),
> minimal flat shading. The ring must contrast clearly against the block face,
> never as dark as the outline. Light from upper left. Exactly one block, seen
> perfectly flat from the front — no other blocks, no ground, no shadow. Square composition, tightly cropped, plain
> light cream background, no text, no watermark.

### Painted block — big final block
> Children's picture book illustration, flat vector style, strictly front-on flat
> 2D game sprite, like a playing card seen straight ahead — NO side face, NO
> edge, NO thickness, NO angle, NO 3D, not isometric.
> ONE single large wooden toy block standing upright, noticeably taller and
> chunkier than a domino — the heavy last block of a chain — painted warm
> cream with soft subtle wood grain and a clearly visible darker painted ring in the centre of the face. Thick
> soft rounded DARK-BROWN outlines (not black), minimal flat shading. Light
> from upper left. Exactly one block — no other blocks, no ground, no
> shadow. Square composition, tightly cropped, plain light cream background,
> no text, no watermark.

## 4.3 Remaining part regenerations

### Jack-in-the-box — closed
> Children's picture book illustration, flat vector style, strictly side-on
> orthographic view like a 2D game sprite, no perspective, no visible top
> face, not an isometric cube — a completely flat square front face only. A
> wooden toy jack-in-the-box seen straight from the side, square front
> painted with dusty-rose and cream diamonds, a small crank handle sticking
> out on the right side, lid closed flat on top. Thick soft rounded
> dark-brown outlines, minimal flat shading. Light from upper left. Object
> only, no ground, no shadow. Square composition, tightly cropped, plain
> light cream background, no text, no watermark.

### String & pulley — wheel only
> Children's picture book illustration, flat vector style, strictly side-on
> orthographic view like a 2D game sprite, no perspective. A simple wooden
> pulley wheel with a small bracket and hook above it, warm honey wood,
> visible centre pin. NO string, NO rope, NO weight, NO hanging hook below —
> just the wheel and its top bracket. Thick soft rounded dark-brown
> outlines, minimal flat shading. Light from upper left. Object only, no
> ground, no shadow. Square composition, tightly cropped, plain light cream
> background, no text, no watermark.

## 4.4 Cat poses

### Cat — asleep (plain hero, no hearts)
> Children's picture book illustration, flat vector style, strictly side-on
> view like a 2D game sprite. A plump ginger cat sleeping curled in a ball,
> seen from the side, eyes closed as two happy curved lines, small gentle
> smile, tail wrapped around its body, simple darker ginger stripe markings.
> Thick soft rounded dark-brown outlines, minimal flat shading. Light from
> upper left. Cat only — no blanket, no mat, no hearts, no ground, no
> shadow. Square composition, tightly cropped, plain light cream background,
> no text, no watermark.

### Cat — patting
> Children's picture book illustration, flat vector style, strictly side-on
> view like a 2D game sprite. A plump ginger cat with simple darker ginger
> stripe markings, sitting up in profile, one front paw raised mid-air in a
> soft pat-pat gesture, eyes barely open as narrow dots, sweet sleepy
> expression, small gentle smile. Thick soft rounded dark-brown outlines,
> minimal flat shading. Light from upper left. Cat only — no props, no
> ground, no shadow. Square composition, tightly cropped, plain light cream
> background, no text, no watermark.

### Cat — stretching
> Children's picture book illustration, flat vector style, strictly side-on
> view like a 2D game sprite. A plump ginger cat with simple darker ginger
> stripe markings, doing a long stretch in profile, front legs low and back
> arched high, eyes closed as two happy curved lines, content gentle smile.
> Thick soft rounded dark-brown outlines, minimal flat shading. Light from
> upper left. Cat only — no props, no ground, no shadow. Square composition,
> tightly cropped, plain light cream background, no text, no watermark.

(Purr/victory pose: the existing asleep-with-hearts keeper covers it.)

## 4.5 Remaining heroes

### Teapot — idle
> Children's picture book illustration, flat vector style, strictly side-on
> orthographic view like a 2D game sprite, no perspective. A round chubby
> teapot seen from the side, warm cream body with dusty-rose polka dots, lid
> resting open, friendly curved spout pointing left, simple handle on the
> right. Thick soft rounded dark-brown outlines, minimal flat shading. Light
> from upper left. Object only — no steam, no ground, no shadow. Square
> composition, tightly cropped, plain light cream background, no text, no
> watermark.

### Marble — celebration hop
> Children's picture book illustration, flat vector style, strictly side-on
> view like a 2D game sprite. A glossy honey-amber toy marble with one
> simple soft swirl inside, no face, caught mid-hop in the air with two tiny
> curved motion arcs beneath it. Thick soft rounded dark-brown outline,
> minimal flat shading. Light from upper left. Marble only — no ground, no
> confetti, no shadow. Square composition, tightly cropped, plain light
> cream background, no text, no watermark.

### Marble — waiting
> Children's picture book illustration, flat vector style, strictly side-on
> view like a 2D game sprite. A glossy honey-amber toy marble with one
> simple soft swirl inside, no face, resting still and calm, one small soft
> dust mote floating beside it. Thick soft rounded dark-brown outline,
> minimal flat shading. Light from upper left. Marble and one dust mote only
> — no ground, no shadow. Square composition, tightly cropped, plain light
> cream background, no text, no watermark.

## 4.6 The six Chapter 1 corners — AFTER the attic base is a keeper

(Use the attic-base keeper as reference image where supported. Each prompt
stands alone regardless.)

### L1 — sunbeam corner
> Children's picture book illustration, flat vector style, side-on view of
> an interior like a 2D game background, no perspective floor, no isometric.
> A cozy attic seen from the side: warm wooden floor along the bottom,
> slanted wooden roof beams above, a big skylight in the upper left with one
> strong sunbeam pouring down, floating dust motes, a wooden shelf mounted
> on the left wall, and a single cardboard box on the right with a child's
> crayon drawing of a fish on its label. Middle of the scene open for
> gameplay. Thick soft rounded dark-brown outlines, minimal flat shading, no
> gradients. Palette: warm cream, honey yellow, soft orange, dusty rose,
> muted teal, soft lilac. Calm cozy storybook mood, wide landscape
> composition, no text, no watermark, no characters.

### L2 — mattress corner
> Children's picture book illustration, flat vector style, side-on view of
> an interior like a 2D game background, no perspective floor, no isometric.
> A cozy attic seen from the side: warm wooden floor along the bottom,
> slanted wooden roof beams above, a big skylight in the upper left pouring
> warm afternoon light, floating dust motes, a tall wooden wardrobe on the
> left, a hatstand holding one round hat, and a tall cardboard box on the
> right. Middle of the scene open for gameplay. Thick soft rounded
> dark-brown outlines, minimal flat shading, no gradients. Palette: warm
> cream, honey yellow, soft orange, dusty rose, muted teal, soft lilac. Calm
> cozy storybook mood, wide landscape composition, no text, no watermark, no
> characters.

### L3 — tea-party corner
> Children's picture book illustration, flat vector style, side-on view of
> an interior like a 2D game background, no perspective floor, no isometric.
> A cozy attic seen from the side: warm wooden floor along the bottom,
> slanted wooden roof beams above, a big skylight in the upper left pouring
> warm afternoon light, floating dust motes, a small doll table set for tea
> in the middle with tiny plates and a doily on top, a soft rug beneath it,
> and clear open space visible under the table. Thick soft rounded
> dark-brown outlines, minimal flat shading, no gradients. Palette: warm
> cream, honey yellow, soft orange, dusty rose, muted teal, soft lilac. Calm
> cozy storybook mood, wide landscape composition, no text, no watermark, no
> characters.

### L4 — toy corner
> Children's picture book illustration, flat vector style, side-on view of
> an interior like a 2D game background, no perspective floor, no isometric.
> A cozy attic seen from the side: warm wooden floor along the bottom,
> slanted wooden roof beams above, a big skylight in the upper left pouring
> warm afternoon light, floating dust motes, a staircase made of stacked
> picture books rising on the left, and a large book leaning against a box
> tunnel on the right. Middle of the scene open for gameplay. Thick soft
> rounded dark-brown outlines, minimal flat shading, no gradients. Palette:
> warm cream, honey yellow, soft orange, dusty rose, muted teal, soft lilac.
> Calm cozy storybook mood, wide landscape composition, no text, no
> watermark, no characters.

### L5 — nap corner
> Children's picture book illustration, flat vector style, side-on view of
> an interior like a 2D game background, no perspective floor, no isometric.
> A cozy attic seen from the side: warm wooden floor along the bottom,
> slanted wooden roof beams above, a big skylight in the upper left pouring
> warm afternoon light, floating dust motes, and a striped blanket spread
> flat on the floor in a pool of light, extra calm and mostly empty scene.
> Thick soft rounded dark-brown outlines, minimal flat shading, no
> gradients. Palette: warm cream, honey yellow, soft orange, dusty rose,
> muted teal, soft lilac. Calm cozy storybook mood, wide landscape
> composition, no text, no watermark, no characters.

### L6 — window corner
> Children's picture book illustration, flat vector style, side-on view of
> an interior like a 2D game background, no perspective floor, no isometric.
> A cozy attic seen from the side: warm wooden floor along the bottom,
> slanted wooden roof beams above, a big open skylight in the upper left
> with light curtains gently billowing, warm afternoon light, floating dust
> motes, a small wooden stool, and a tall stack of cardboard boxes on the
> right. Middle of the scene open for gameplay. Thick soft rounded
> dark-brown outlines, minimal flat shading, no gradients. Palette: warm
> cream, honey yellow, soft orange, dusty rose, muted teal, soft lilac. Calm
> cozy storybook mood, wide landscape composition, no text, no watermark, no
> characters.

## 4.7 Box-label gag — one per label

### Box — fish label
> Children's picture book illustration, flat vector style, strictly side-on
> orthographic view like a 2D game sprite, no perspective, no visible top
> face. A plain cardboard box seen from the side, flaps closed, with a
> child's crayon drawing of a FISH on a paper label on its front. Thick soft
> rounded dark-brown outlines, minimal flat shading. Light from upper left.
> Object only, no ground, no shadow. Square composition, tightly cropped,
> plain light cream background, no words or letters anywhere, no watermark.

### Box — sock label
> Children's picture book illustration, flat vector style, strictly side-on
> orthographic view like a 2D game sprite, no perspective, no visible top
> face. A plain cardboard box seen from the side, flaps closed, with a
> child's crayon drawing of a SOCK on a paper label on its front. Thick soft
> rounded dark-brown outlines, minimal flat shading. Light from upper left.
> Object only, no ground, no shadow. Square composition, tightly cropped,
> plain light cream background, no words or letters anywhere, no watermark.

### Box — teapot label
> Children's picture book illustration, flat vector style, strictly side-on
> orthographic view like a 2D game sprite, no perspective, no visible top
> face. A plain cardboard box seen from the side, flaps closed, with a
> child's crayon drawing of a TEAPOT on a paper label on its front. Thick
> soft rounded dark-brown outlines, minimal flat shading. Light from upper
> left. Object only, no ground, no shadow. Square composition, tightly
> cropped, plain light cream background, no words or letters anywhere, no
> watermark.

### Box — star label
> Children's picture book illustration, flat vector style, strictly side-on
> orthographic view like a 2D game sprite, no perspective, no visible top
> face. A plain cardboard box seen from the side, flaps closed, with a
> child's crayon drawing of a STAR on a paper label on its front. Thick soft
> rounded dark-brown outlines, minimal flat shading. Light from upper left.
> Object only, no ground, no shadow. Square composition, tightly cropped,
> plain light cream background, no words or letters anywhere, no watermark.

(Design rule: box contents never match the label; pairing happens at
level-design time, not generation time.)

## 4.8 FX

### Goal sparkle
> Children's picture book illustration, flat vector style. A single gentle
> four-pointed sparkle, honey yellow with a soft cream glow ring, rounded
> points, simple and clean. Thin soft dark-brown outline. Object only, no
> ground. Square composition, tightly cropped, plain light cream background,
> no text, no watermark.

### Pbbbt trail
> Children's picture book illustration, flat vector style. A loopy playful
> dotted line path curving through empty space with three tiny air-puff
> clouds along it, soft lilac and cream, comic and gentle, no balloon, no
> other object. Thin soft dark-brown outlines. Tightly cropped, plain light
> cream background, no text, no watermark.

---

## 5. Not yet specified (future passes)

- Chapter-end vignette scenes (after the wordless-arc design round)
- UI: picture-goal iconography, RUN button, profile pictures, parent gate
- Later-chapter corners and any cast additions

## 6. Engine note (do not send to the image generator)

Sprites define hitboxes; the repo currently renders generated Phaser shapes
in a 960x540 space. These images are REFERENCE ART until an asset-pipeline
milestone exists (see contraption-lab-review-for-sol.md, Insight 6). Final
sprite dimensions, transparent backgrounds, and trimming come from that
milestone — do not hand-cut assets before it lands.

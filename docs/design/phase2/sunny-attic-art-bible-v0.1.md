# The Sunny Attic — Art Bible v0.1 (Style A: Storybook flat)

> **SUPERSEDED by sunny-attic-art-bible-v0.4.md** (this file is kept as provenance; its prompts lack the flatness, anchor-discipline, wood grain and ring-contrast rules discovered during generation — do not generate from it).

Companion to sunny-attic-design-v0.1.md. Purpose: reference-image generation
before implementation. Every prompt below is ready to paste.

---

## 1. Consistency preamble — PREPEND TO EVERY PROMPT, VERBATIM

> Children's picture book illustration, flat vector style, thick soft rounded
> dark-brown outlines, no gradients, minimal flat shading, simple readable
> shapes, warm afternoon sunlight mood. Palette: warm cream, honey yellow,
> soft orange, dusty rose, muted teal, soft lilac. Centered on a plain light
> cream background, no text, no watermark.

## 2. Global rules (apply while generating and curating)

- Light always comes from the upper left (the skylight). Reject images lit
  otherwise — this is the #1 consistency killer.
- Every object must stay readable when imagined at ~60 px tall. Reject
  cluttered detail.
- Outlines: same thickness feel everywhere. Reject thin/sketchy lines.
- Faces: eyes as simple curved lines when closed, plain dots when open;
  smiles small and gentle. Nothing exaggerated, nothing toothy.
- Generate 3-4 per prompt; pick for STYLE MATCH first, cuteness second.
- Workflow: generate the HERO image of a part first; then use it as the
  reference image (image-to-image / character reference) for its VARIATIONS.
  Never generate variations from scratch.
- File naming for keepers: part_state_vN.png (e.g. cat_asleep_v2.png).

## 3. The protagonist

### Marble — hero
> A single glossy toy marble, honey-amber colored with a soft swirl inside,
> round and friendly, no face, sitting in a small pool of warm light.
### Marble — celebration hop
> (reference: marble hero) The same amber marble caught mid-hop just above the
> ground, tiny motion arcs beneath it, a few confetti dots around, joyful.
### Marble — waiting
> (reference: marble hero) The same amber marble resting at the base of a
> small slope, patient and calm, one soft dust mote nearby.

## 4. The cast — 9 parts

### The Cat
HERO — asleep (style test winner; regenerate if needed):
> A plump ginger cat sleeping curled up on a striped blanket, eyes closed as
> two happy curved lines, gentle smile, tail wrapped around its body.
Variations (all with cat hero as reference):
> ...same ginger cat sitting up, one front paw raised mid-air in a soft
> pat-pat gesture, eyes barely open, sweet sleepy face.
> ...same ginger cat doing a long stretch, front low, back high, eyes closed,
> content.
> ...same ginger cat curled as in sleep but with a big happy closed-eye smile
> and two small hearts floating above — the purring-on-victory pose.

### Plank
> A simple wooden toy plank, warm honey wood with two visible darker wood
> stripes, slightly rounded ends, lying horizontally.
(One sprite; the engine rotates it. Reject perspective/3D looks.)

### Spring mattress
HERO — idle:
> A small striped toy mattress, cream and dusty-rose stripes, slightly puffy,
> three simple spring coils visible underneath, cheerful and bouncy looking.
Variation — squashed:
> ...same striped mattress pressed down in the middle, springs compressed,
> puffy edges bulging up.

### Balloon
HERO — floating:
> A slightly under-inflated round balloon, soft lilac, a short string hanging
> down, gentle wrinkle near the knot, floating calmly.
Variations:
> ...same lilac balloon zooming through the air letting out air, comically
> wobbling flight path shown as a loopy dotted line behind it, cheeks-puffed
> feeling but no face.
> ...same lilac balloon lying empty and flat on the ground, small and
> deflated, one tiny puff of air above it, endearing not sad.

### Painted blocks
HERO — the set:
> Six wooden toy blocks standing in a row from small to big, each painted a
> different soft color: dusty rose, honey yellow, muted teal, soft lilac,
> soft orange, warm cream, simple painted ring around each.
Variation — mid-topple:
> ...same six painted blocks caught mid-fall in a domino chain, first ones
> down, last big one still standing, small motion arcs.

### Ribbon fan
HERO — off:
> A small round desk fan on a short stand, muted teal body, cream blades
> visible behind a simple round grille, three little ribbons tied to the
> grille hanging still.
Variation — on:
> ...same teal desk fan running, blades as a soft blur disc, the three
> ribbons streaming sideways in the wind, two simple curved wind lines.

### Jack-in-the-box
HERO — closed:
> A wooden toy jack-in-the-box, cube with dusty-rose and cream diamond
> pattern, a small crank handle on the side, lid closed, friendly and
> inviting.
Variation — popped:
> ...same jack-in-the-box with lid open and a soft-cheeked smiling clown face
> on a spring popping up, arms open wide, joyful and gentle, small "doing"
> motion arcs.

### String & pulley
> A simple wooden pulley wheel hanging from a hook, warm honey wood, a soft
> cream string running over it with a small round weight on one end.

### Teapot
HERO — idle:
> A round chubby teapot, warm cream with dusty-rose polka dots, open lid,
> friendly curved spout pointing left, sitting cheerfully.
Variation — tooting:
> ...same polka-dot teapot with a soft puff of steam rising from the spout in
> three little clouds, mid-toot, cheerful.

### Teacup (the goal)
HERO — idle:
> A small round teacup on a saucer, muted teal with a cream rim, simple
> handle, inviting and open.
Variation — goal reached:
> ...same teal teacup with the amber marble resting inside, a gentle sparkle
> above the cup, tiny confetti dots.

## 5. Environments

### Attic base (backdrop template)
> A wide cozy attic interior, warm wooden floor and slanted beams, a big
> skylight upper left pouring warm afternoon light, floating dust motes,
> cardboard boxes here and there, soft cream walls, empty middle ground for
> gameplay, storybook calm.
(Generate wide/landscape. This is the master backdrop; corners below are
re-dressings of it — use it as reference image for all of them.)

### Corner dressings (one per Chapter 1 level; attic base as reference)
L1 sunbeam corner:
> ...same attic with a strong single sunbeam from the skylight, one wooden
> shelf on the left wall, a single cardboard box on the right with a crayon
> drawing of a fish on its label.
L2 mattress corner:
> ...same attic with a tall wardrobe, a hatstand holding one round hat, and a
> tall cardboard box, cozy corner feeling.
L3 tea-party corner:
> ...same attic with a small doll table set for tea, tiny plates and a doily,
> soft rug beneath, space visible under the table.
L4 toy corner:
> ...same attic with a staircase made of stacked picture books, one big book
> leaning against a box tunnel, toys peeking from boxes.
L5 nap corner:
> ...same attic with a striped sun-warmed blanket spread on the floor in a
> pool of skylight light, extra soft and calm.
L6 window corner:
> ...same attic close to the open skylight, light curtains gently billowing,
> a wooden stool, a tall stack of boxes on the right.

### Boxes running gag (extras, generate as needed)
> A cardboard box with a crayon-style child's drawing label of a {fish /
> sock / teapot / star}, closed flaps, warm and simple.
(Contents never match the label — pair labels and contents at level-design
time, not generation time.)

## 6. FX sprites

Goal sparkle:
> A single gentle four-pointed sparkle, honey yellow with a cream glow ring,
> soft and rounded, floating.
Confetti (celebration set):
> A loose scatter of small round and rectangular confetti pieces in dusty
> rose, honey yellow, muted teal and lilac, falling gently.
Wind lines (fan):
> Three simple curved wind lines, soft teal, flowing left to right, rounded
> ends, minimal.
Pbbbt trail (balloon flight):
> A loopy playful dotted line path with three tiny air-puff clouds along it,
> soft lilac and cream, comic and gentle.

## 7. Not yet specified (future art passes)

- Chapter-end vignette scenes (marble in a matchbox bed, etc.) — after the
  wordless-arc design round.
- UI: picture-goal iconography, RUN button, profile pictures, parent gate.
- Later-chapter corners and cast expansion parts.

## 8. Acceptance checklist per generated image

[ ] Light from upper left  [ ] Outline weight matches hero set
[ ] Reads at small size    [ ] Palette within the six named colors
[ ] No text/watermark      [ ] Plain light background (parts/FX only)
[ ] Face rules respected   [ ] Feels like the same toybox as the rest

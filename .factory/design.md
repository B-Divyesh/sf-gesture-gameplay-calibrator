# MoveMap visual thesis — the calibration field notebook

## Direction and rationale

MoveMap looks like the notebook beside a maker's half-wired prototype: squared
paper, torn slips, pencil construction lines, inked measurements, and one
decisive red grease-pencil mark. Gesture recognition is probabilistic; the
notebook metaphor makes trial, uncertainty, and correction feel expected. It
also keeps the product distinct from glossy fitness apps and opaque AI camera
demos. Decoration always explains: grids imply measurement, check marks record
observations, and paper depth separates steps in the experiment.

This is intentionally a single light treatment. A paper notebook is materially
light, and repainting it as a generic dark dashboard would break the thesis.
The canvas is explicitly painted in every route and installed-app surface.

## Tokens

- `paper` `#f4efdF`: warm recycled notebook stock; page background.
- `sheet` `#fffaf0`: clean working sheet and input surfaces.
- `ink` `#162a43`: blue-black fountain pen; body text and controls.
- `ink-muted` `#526174`: graphite annotation; secondary text.
- `rule` `#b9c8ca`: blue-grey graph rulings and boundaries.
- `red-pencil` `#b83a31`: active mark, warning, and primary action.
- `red-deep` `#8f2824`: pressed state and readable red text.
- `green-ink` `#22634c`: reliable/pass state.
- `amber-ink` `#8a5712`: caution/near-threshold state.
- `danger` `#9d2f2a`: failure and destructive action.

All body text combinations meet WCAG AA (4.5:1); state is always paired with
a word, number, texture, or icon rather than color alone.

## Type and scale

No network fonts. Headlines and handwritten annotations use the native
handwritten stack (`Segoe Print`, `Bradley Hand`, `Comic Sans MS`, cursive) as
an accent, never for dense text. Measurements and body copy use the local
system sans stack (`Inter` when installed, `Avenir Next`, `Segoe UI`, sans-serif).
The scale is 16, 18, 22, 28, 40, and 56px with 1.5 body leading. Numbers use
tabular figures. Body measure is capped near 68 characters.

## Spacing, shape, and depth

An 8px rhythm underpins 8/16/24/32/48/64px spacing. Sheets have irregular but
restrained 10–18px radii, 1px ink rules, and offset shadows that resemble paper
on a desk. Primary controls are at least 48px tall; all targets are at least
44px. On phones the desk becomes one vertical experiment: preview, current
instruction, then record. Secondary notebook notes and decorative hero crop
away before controls shrink.

## Interaction grammar and motion

The current experiment step is a red circled number. Captured samples arrive
like a short pencil stroke (180ms opacity + 4px translate); paper panels lift
by 2px on hover. Confidence updates without animated counting and the history
plot draws only when a new reading arrives. Nothing loops. Under
`prefers-reduced-motion: reduce`, all transforms, animated plot drawing, and
smooth scrolling become instant opacity/state changes.

## Asset plan and provenance

- Hero: an original AI-generated editorial still life of an open graph-paper
  field notebook containing an abstract articulated paper figure and calibration
  marks. It establishes the workshop world without depicting a real person or
  claiming webcam output. Used as a responsive WebP with explicit dimensions.
- Icons, landmark overlay, chart, paper clips, ticks, and ruled textures are
  authored in project SVG/CSS so they remain crisp and semantically controlled.
- PWA icons are original programmatic artwork using the `M` route-line mark.
- The 1200×630 social preview is a center crop of the original generated hero;
  the 180px Apple touch icon is a resize of the original programmatic PWA mark.

### Hero prompt sheet

Use case: `stylized-concept`. Asset type: landing-page editorial hero.
Scene: top-down maker's desk, open cream graph-paper lab notebook.
Subject: abstract articulated human-shaped paper cutout made from simple navy
geometric pieces, three tomato-red pencil checkpoint circles, a small metal
binder clip, measurement arrows and non-legible scribble marks.
Style: tactile editorial still life, hand-cut paper collage and colored pencil,
subtle real paper fibers, deliberately imperfect craft.
Composition: landscape, notebook angled slightly, clear quiet paper area, all
objects fully contained, no UI screenshot.
Light: soft window light from upper left, gentle physical shadows.
Palette: cream paper, blue-black ink, faded blue grid, tomato red, muted green.
Negative list: no real people, no faces, no readable text, no logos, no brands,
no screens, no glowing gradients, no plastic 3D render, no watermark, no extra
limbs, no surveillance imagery.

Generated with the factory image model (`factory-image`) on 2026-08-28 using
`/opt/fleet/lib/gen-image.sh`. The generated output is original for MoveMap;
the final reviewed prompt is saved alongside the source asset.

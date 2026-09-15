# Homepage Visual Contract

**Status:** V1 implementation contract, owner-authorized 2026-09-15.

This contract turns the homepage's existing visual intent into a testable rendering system. It does not add a
feature surface. It defines how the same quiet, single-passage encounter should survive different viewport
sizes, display densities, and browser rendering environments.

## Product intent

The sacred passage is the primary visual object. The author is secondary. Controls and status text are
tertiary. A visitor should perceive the same hierarchy and approximately the same compositional character on a
phone, laptop, desktop, Retina/HiDPI display, or 4K display even though the absolute pixel dimensions differ.

The goal is **perceptual invariance, not screenshot identity**. Browser/OS text rasterizers legitimately differ.
The repo owns the font request, CSS size, weight, line-height, measure, whitespace, and layout. The operating
system owns the final glyph rasterization.

## Invariants

1. **Passage first.** Cormorant Garamond 400 remains the passage face and the dominant text.
2. **Attribution recedes.** Source Sans Pro 300 is the author face. Its size remains substantial enough to read,
   but its stroke weight must not compete with the passage.
3. **Relational composition.** Hero text size, maximum measure, and inline whitespace are fluid. No fixed
   `700px` hero text ceiling defines the composition.
4. **Bounded measure.** Small screens may use most of the viewport; large screens gain whitespace rather than
   stretching the passage indefinitely.
5. **Full-view encounter.** The first hero fills the dynamic viewport (`100dvh`, with `100vh` fallback) and the
   longest eligible passage must not collide with the scroll affordance.
6. **DPR is not a layout input.** CSS geometry must remain the same at a fixed CSS viewport when
   `devicePixelRatio` changes. Do not multiply font sizes or widths by DPR in JavaScript.
7. **No synthetic weights.** Passage and attribution disable font synthesis. A missing requested font/weight is
   observable in the live-font check instead of being silently treated as equivalent.
8. **Mobile is not globally shrunk desktop.** The old mobile `body` font-size reductions are removed. The hero
   scales directly through its own bounded tokens; panel/control typography keeps the normal document baseline.
9. **Content envelope, not today's lucky quote.** Visual QA injects the longest eligible Hidden Words passage
   before measuring, so success means the composition survives the corpus envelope.
10. **No framework/build step.** This remains static HTML/CSS/JS and GitHub Pages.

## V1 tokens

The implementation deliberately keeps the system small:

```css
--quote-size: clamp(1.35rem, calc(1.1rem + 1vmin), 2.35rem);
--quote-leading: 1.5;
--quote-measure: clamp(43rem, 45vw, 80rem);
--author-size: clamp(1.15rem, calc(.98rem + .82vmin), 2.15rem);
--hero-inline-padding: clamp(1.25rem, 5vw, 6rem);
```

These are starting values, not sacred constants. Future changes should tune the tokens against this contract,
not add screen-specific one-off overrides unless a demonstrated edge case requires one.

## Validation surfaces

`tests/visual-contract.mjs` is separate from behavioral parity.

### Structural / deterministic

```bash
make visual-contract
```

This blocks Google Fonts and the external Badíʿ vendor and proves the CSS/layout contract across the viewport
matrix. It checks, among other things:

- author computed weight = 300 and passage = 400;
- expected font-family declarations remain present;
- wrapper width stays inside the composition envelope;
- measure stays bounded relative to passage size;
- wrapper stays horizontally centered;
- quote size and line-height stay inside the contract;
- longest eligible passage has no horizontal overflow and does not collide with the scroll arrow;
- hero covers the viewport;
- document does not gain horizontal overflow;
- 1440×900 and 1920×1080 CSS geometry is invariant between DPR 1 and DPR 2;
- the fluid quote scale grows monotonically and caps on 4K.

### Live font fidelity

```bash
make visual-contract-live
```

This is deliberately network-dependent. It adds `document.fonts` assertions that the requested
Cormorant Garamond 400 and Source Sans Pro 300 faces actually resolve from Google Fonts. A CDN/network outage
may make this red even while the structural contract is sound, so it is not folded into hermetic parity.

### Screenshot evidence

Set `VISUAL_EVIDENCE_DIR` to capture one first-viewport PNG per matrix case:

```bash
VISUAL_EVIDENCE_DIR=docs/audit/2026-09-15/V1 make visual-contract-live
```

Screenshots are review evidence, not the oracle. Cross-OS pixel identity is explicitly not required.

## Viewport matrix

The V1 harness covers:

| Class | CSS viewport | DPR |
|---|---:|---:|
| phone | 390×844 | 3 |
| laptop | 1280×800 | 1 |
| laptop | 1440×900 | 1 and 2 |
| desktop | 1920×1080 | 1 and 2 |
| large desktop | 2560×1440 | 2 |
| 4K | 3840×2160 | 1 |

The duplicated CSS viewports at two DPRs are intentional: they prove that display density changes raster
resolution, not page composition.

## Deliberate non-goals for V1

- No JavaScript DPI/device-pixel-ratio scaling.
- No self-hosted font binaries.
- No change to wallpaper or iOS widget.
- No container-query or framework migration.
- No attempt to force macOS, Windows, Linux, or mobile browsers to rasterize glyph edges identically.
- No behavioral changes to daily selection, collections, Badíʿ date, Yesterday, copy, theme, or source selection.

If live-machine review still shows a material font-fidelity problem after this contract lands, self-hosting the
font assets is a separate hypothesis and should get its own bounded unit.

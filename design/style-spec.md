# Style Spec: Night Court Glass

Main style: glassmorphism with 3D parallax. Supporting style: Apple-fluid motion with hard-cut transitions.
The subject: a pickleball court at dusk, seen through panes of smoked glass. The glass carries the information (date, form). The court underneath is the brand.
Tokens: `design-dna.json`.

## 1. Glass material recipe

| Property | Standard glass (`.glass`) | Strong glass (`.glass--strong`, form panel) |
|---|---|---|
| Backdrop | `blur(20px) saturate(1.4)` | `blur(28px) saturate(1.4)` |
| Tint | `rgba(17,26,22,0.55)` (ink) | `rgba(17,26,22,0.72)` |
| Border | 1px `rgba(246,245,238,0.14)` | 1px `rgba(246,245,238,0.14)` |
| Top highlight | inset `0 1px 0 rgba(246,245,238,0.10)` plus a 1px top-edge linear highlight, cream 0.22 to 0 over the first 40% of the width | same |
| Specular | one radial spot, cream 0.08, 40% card width, follows the pointer (hover tilt only) | none (the form stays calm) |
| Noise | SVG `feTurbulence` grain baked into a 128px PNG tile, 3% opacity, `mix-blend-mode: overlay`. Static. Stops banding on the blur. | same |
| Shadow | `shadow.glass` | `shadow.glass-lift` |
| Radius | 24px | 32px |

Fallback without `backdrop-filter`: solid `#111A16` at 0.92 with the same border. Text contrast stays the same because the tint, not the blur, sets it.
Limit: no more than 4 blurred surfaces in the viewport at once (GPU cost).

## 2. 3D depth system

- One `perspective: 1400px` on the scene root. Children use `transform-style: preserve-3d`.
- Six fixed layers, z0 to z5 (see `design-dna.json` depth.layers). Parallax factor is applied to scroll and to the pointer offset.
- Pointer parallax: up to ±12px x/y at z5, scaled by each layer's factor. Lerp 0.08 per frame. Never scroll-jacked.
- Card hover tilt: rotateX/rotateY up to 8deg, translateZ 24px, from the pointer position on the card. It returns over 600ms with `fluid`.
- Light comes from the top-left in every layer. Highlights and shadows must agree with that.

## 3. Hero layer list (back to front)

1. **z0 film**: HyperFrames loop (`shot-plan.md`). The poster is shown first.
2. **z1 scrim**: ink overlay, 0.55 at the top, 0.35 at mid-height, 0.85 at the bottom, plus a radial vignette. This keeps the headline at 4.5:1 or better on any frame.
3. **z2 court lines**: SVG kitchen line, baseline and centerline in lime at 0.18 opacity, drawn in perspective. Moves slower than the content.
4. **z3 back glass slab**: a wide strong-glass slab behind the headline, offset to the right, blurring the film.
5. **z4 content**: Archivo micro kicker "PADDLEBASE · MEETUP", an h1 "Paddlebase registration" (Plus Jakarta 800, display-xl), a scoreboard date chip, and the lime CTA "Register".
6. **z5 front shard**: a small glass ball token (56px circle with an orange core dot) at the lower left. It is the only object that moves faster than the content.

## 4. Card treatment (event details)

- Standard glass, 24px radius, 24px padding (32px at 1024px and up).
- Contents: Archivo micro label (lime), value in display 22px cream, one line of mist text.
- Grid: 3 columns at 1024px and up, 1 column at 375px. Tilt only applies on `(hover: hover) and (pointer: fine)`.
- Scroll entrance: each card rises from translateZ -120 and rotateX 12deg to flat, staggered 70ms.

## 5. Form treatment

- One strong-glass panel, max width 640px, radius 32px, padding 24px on phones and 40px at 768px and up.
- Fields stack at 375px. At 768px and up they pair up: name with venue, courts with rates, email with phone.
- Input: height 52px, radius 12px, fill `rgba(15,21,18,0.6)`, border `border.input`, cream text 16px, mist placeholder.
- Labels sit above the input and are always visible (no floating-only labels). They use 14px Inter 600 in cream.
- Error state: 1px orange border, orange 4px left tick, error text in `#FF8A65` 14px under the field, `aria-describedby` wired, an icon plus the text (never color alone).
- Valid state: a lime check glyph at the right edge of the input. The border does not change.
- Honeypot: kept out of the layout, `tabindex=-1`, `autocomplete=off`, `aria-hidden`.

## 6. Button states (primary, lime)

| State | Treatment |
|---|---|
| Rest | Lime fill `#D4F73A`, ink text, Inter 700 16px, 52px tall, radius 14px, padding 0 28px |
| Hover | Fill `#C6F032`, translateY -2px, `shadow.lime-glow`, 240ms `fluid` |
| Active | scale 0.97, 140ms |
| Focus-visible | 2px ink inner gap plus a 2px lime outer ring (offset 3px) |
| Loading | Label becomes "Sending…", an Archivo spinner bar replaces the arrow, `aria-busy=true`, disabled |
| Disabled | Lime at 0.4 opacity over ink, `cursor: not-allowed`, no hover |
| Success | Morphs into a check pill, then the panel shows the success message |

Secondary (ghost) button: cream text, 1px `border.glass-hi`. Hover adds a cream 0.08 fill.

## 7. Focus rings

- Global `:focus-visible`: `outline: 2px solid #D4F73A; outline-offset: 3px`, radius follows the element. 14.5:1 against ink.
- Inputs: lime border plus a `0 0 0 3px rgba(212,247,58,0.35)` halo.
- Never `outline: none` without a replacement. Rings render above glass (no clipping from `overflow: hidden`; use an offset or an inset ring inside clipped cards).

## 8. Anti-slop list (banned)

- Purple, violet, indigo, or any hue not in the palette.
- Aurora, mesh, or "AI" gradients. The only gradients allowed are the scrim and the glass edge highlight.
- Glass floating on empty black. There is always court footage or court geometry behind it.
- Infinite yoyo floating cards, elastic or bounce easing.
- Default 2s fade-ins for everything.
- Blur above 28px, or glass tint lighter than 0.55 behind text.
- More than one lime CTA visible at once.
- Fake dashboards, stock court photos, emoji icons.
- Orange buttons with white text.
- Inter in the headlines (headlines use Plus Jakarta Sans; Inter is for body text only).

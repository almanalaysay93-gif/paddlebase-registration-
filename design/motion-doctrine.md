# Motion Doctrine

Feel: fluid like Apple product pages when gliding, hard like a smash at section changes. One GSAP master timeline per section with ScrollTrigger. Animate transform, opacity and filter only.

## Timing scale

| Token | ms | Use |
|---|---|---|
| micro | 140 | press, check glyph |
| short | 240 | hover, focus halo |
| base | 420 | field error reveal, card settle |
| long | 720 | card entrance, tilt return (600) |
| transition | 900 | section transitions |
| hero-intro | 1400 | first load choreography, total |

Stagger: 40ms (characters or line pieces), 70ms (cards), 110ms (hero layers).

## Easing and weight

- `fluid` (expo.out): almost everything that arrives. Fast start, long soft settle. This is the Apple feel.
- `settle` (power3.out): small UI changes.
- `strike` (power4.in): the exit half of an aggressive transition. It builds weight, then cuts.
- `snap` (expo.inOut): masks and wipes that must feel mechanical.
- Weight rule: bigger and nearer layers move less distance with more duration. The front shard is the only light object.
- Anticipation: each aggressive transition starts with an 80ms counter-move (2% scale-down or 6px pull back) before the strike.
- Follow-through: content lands with 0 overshoot. Glass highlights trail the card by 60ms.
- Banned: elastic, bounce, back with overshoot above 1.2, infinite idle loops on UI.

## Scroll parallax

- ScrollTrigger `scrub: 0.8`, `anticipatePin: 1`, no markers in production.
- Layer translateY = scrollProgress × layerDepthRange × parallax factor (z0 0.15 up to z5 1.25).
- The hero pins for 60% of the viewport height while the headline pushes toward the camera (scale 1 to 1.08, translateZ +60) and the film drifts back.
- Pointer parallax (fine pointers only) adds at most 12px, lerped 0.08.

## Hover tilt

- Fine pointers only. rotateX/Y up to 8deg mapped from the pointer, translateZ 24px, specular spot follows.
- Enter: 240ms `settle`. Leave: 600ms `fluid` back to flat. Throttled to rAF.

## Hero intro (1400ms)

1. 0ms: poster is visible, scrim at 0.85.
2. 100ms: court lines draw (stroke-dashoffset, 700ms `snap`).
3. 250ms: back slab slides in from x +80px, blur 24 to 20, 800ms `fluid`.
4. 400ms: h1 lines rise 40px to 0 with clip-path reveal, 110ms stagger, 900ms `fluid`.
5. 750ms: date chip counts its Archivo digits in place (scoreboard flip, 420ms).
6. 950ms: CTA scales 0.92 to 1 and fades in, 420ms `fluid`. Front shard arrives last.
7. Film fades in over the poster once `canplaythrough` fires (600ms crossfade).

## Named aggressive transitions

1. **"Overhead Smash"** (hero to details): hero content scales 1 to 0.86, rotateX 0 to 18deg and blurs 0 to 24px with `strike` (500ms). At the same moment the detail cards arrive from translateZ -400 and rotateX -24deg to flat with `fluid` (700ms), overlapping by 150ms. The background film holds.
2. **"Kitchen Line Wipe"** (details to registration): a lime bar 6px tall sweeps diagonally across the viewport at 12deg (`snap`, 600ms). It works as a hard mask: behind it the section is revealed with the backdrop going from blur 24 to 0 and the form panel rising from scale 0.94 with `fluid`. The bar leaves at the opposite edge and fades out. This is the one moment lime is used decoratively.
3. **"Dink Drop"** (submit to success): the form panel compresses (scaleY 0.96, 120ms anticipation), then the fields collapse upward with a 40ms stagger and blur out (`strike`, 360ms). The success card drops in from y -24 with `fluid` (520ms) and an orange dot lands on the check.

Each transition runs once per direction, is reversible with scrub, and never takes longer than 900ms.

## Reduced motion (`prefers-reduced-motion: reduce`)

| Off | Kept |
|---|---|
| Video (poster `<img>` only, video element not loaded) | Poster image |
| Scroll parallax, pinning, pointer parallax | Static layered composition at rest positions |
| Hover tilt, specular follow | Hover color and border change |
| Overhead Smash, Kitchen Line Wipe, Dink Drop | Opacity fades of 200ms, no movement |
| Line draw, scoreboard flip | Final states shown immediately |
| Blur animation | Static blur on glass (material, not motion) |

Implement it with `gsap.matchMedia()` so there are two contexts. The reduced context registers only opacity tweens. It must be checked again live when the setting changes.

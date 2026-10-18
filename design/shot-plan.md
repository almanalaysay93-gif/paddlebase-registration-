# Shot Plan: HyperFrames Background Loop "Dusk Court"

Claim: courts come alive when operators connect. Emotional thesis: calm anticipation before the first serve. It is a background, so there is no text, no logo and no hook copy in the film; the page carries those.

## Format

- Duration: **12.0s**, 30fps, 360 frames, seamless loop.
- Master: 1920×1080 (16:9). Mobile crop: **1080×1350 (4:5)** composed separately with the same `render(t)`, centered on the kitchen zone (the composition keeps its focal area inside the middle 56% of the width).
- Deterministic: pure `render(t)`, seeded noise (seed `0x0A18`), no Math.random, Date.now or timers. `hf.onSeek(t) => timeline.seek(t)`.

## Palette in the film

- Ground: ink `#0F1512` to `#111A16`. Court surface: green `#1F6E43` falling to `#2A3B32` at the edges (lighting falloff, not a decorative gradient).
- Court lines: lime `#D4F73A` at 0.35 to 0.6.
- Ball and light streak: orange `#FF5722` (the only warm hue, under 2% of the frame area).
- Haze: cream `#F6F5EE` at 0.04 to 0.08.
- Overall luminance stays low (average L under 18%) so the page scrim plus glass keep text at 4.5:1 or better.

## Layers (back to front)

1. **Sky/ink field**: flat ink with a very faint cream haze band at the horizon.
2. **Court plane**: perspective court, camera at 18deg elevation, slow dolly along the baseline.
3. **Court lines**: lime strokes. A light pulse travels along the kitchen line once per loop.
4. **Net**: thin cream mesh lines at 0.2, slight parallax against the court.
5. **Ball arc**: an orange ball crosses the net in a dink arc (frames 120 to 210), with a short motion trail and a soft shadow on the court.
6. **Bokeh lights**: 6 seeded floodlight discs, cream 0.06, very slow drift on a circular path.
7. **Grain**: seeded film grain at 3%, regenerated deterministically per frame from `t`.

## Loop seam strategy

- Every moving value is a function of `phase = t / 12` through `sin` and `cos` of `2π·phase` or integer multiples of it, so frame 360 equals frame 0.
- The camera dolly is a closed ellipse (±40px x, ±12px y), not a one-way move.
- Ball: the arc happens mid-loop; at frames 0 and 359 the ball is off-screen.
- Grain seed = `frameIndex % 360`.
- Check: frame 0 and frame 360 render with an identical hash; the encode wraps with no stutter.

## Poster

- Frame **150** (ball at the apex over the net, lime pulse at the center). Exported as `poster.avif` (target 70KB) and `poster.jpg` (target 140KB) at 1920×1080, plus a 1080×1350 mobile poster.

## Encodes and budget

| File | Codec | Size | Bitrate target | Budget |
|---|---|---|---|---|
| `bg-1080.webm` | VP9, CRF 36, 2-pass, no audio | 1920×1080 | ~1.0 Mbps | ≤ 1.6 MB |
| `bg-1080.mp4` | H.264 High, CRF 26, `+faststart`, no audio | 1920×1080 | ~1.2 Mbps | ≤ 2.0 MB |
| `bg-mobile.webm` | VP9 | 1080×1350 | ~0.7 Mbps | ≤ 1.1 MB |
| `bg-mobile.mp4` | H.264 | 1080×1350 | ~0.8 Mbps | ≤ 1.3 MB |

Total first video payload per device: at most 2 MB. Lazy-load after the poster paints. Skip it on `prefers-reduced-motion` and `Save-Data`.
Verify with ffprobe: 30fps, 360 frames, 12.000s, no audio stream, expected dimensions. Run two renders and compare hashes.

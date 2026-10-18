# UI/UX Design System

Resolved by hand from the bundled design references (no install, no search CLI run, per the free/local rule). Dials recorded: **variance 6** (asymmetric hero, centered form), **motion 8** (aggressive transitions requested), **density 3** (spacious event page).
Source queries that would reproduce this: `style "glassmorphism event landing dark"`, `ux "form inline validation mobile"`, `gsap "scroll parallax section transition"`. Rejected alternatives: light-theme glass and flat scoreboard (see `directions.md`).

## Style
Dark glassmorphism over court footage. Tokens in `design-dna.json`, material in `style-spec.md`.

## Palette pairs used (WCAG 2.x contrast, computed)

| Foreground / background | Ratio | Use | Verdict |
|---|---|---|---|
| Cream #F6F5EE / Ink #111A16 | 16.24 | body, headings | AAA |
| Ink #111A16 / Lime #D4F73A | 14.51 | primary button label | AAA |
| Lime #D4F73A / Ink #111A16 | 14.51 | focus ring, kicker, check | AAA |
| Ink #111A16 / Lime-alt #C6F032 | 13.45 | button hover | AAA |
| Mist #A9B3AD / Ink #111A16 | 8.23 | secondary text, placeholder | AAA |
| Error #FF8A65 / Ink #111A16 | 7.67 | error message text | AAA |
| Orange #FF5722 / Ink #111A16 | 5.61 | error border, signal dot | AA (UI ≥ 3:1 easily) |
| Cream / Green-dark #2A3B32 | 10.85 | text on court-deep surfaces | AAA |
| Lime / Green-dark #2A3B32 | 9.70 | labels on court-deep | AAA |
| Cream / Green #1F6E43 | 5.70 | text on court green | AA |
| Lime / Green #1F6E43 | 5.09 | lime label on green | AA |
| White / Orange | 3.16 | none (banned) | Fails body text |
| Orange / Cream | 2.89 | none (banned) | Fails |
| Green-dark / Ink | 1.50 | none as text; surface step only | n/a |

Glass is calculated as ink because the tint (0.55 to 0.72 ink) plus the hero scrim keeps the effective background at or below the ink luminance plus about 10%. Verify on the brightest video frame (poster frame 150) in the audit.

## Type
Plus Jakarta Sans 800 for display, Inter 400 to 600 for body and UI, Archivo 700 tabular for scoreboard numbers. All are OFL from Google Fonts; load them with `display=swap` and preload the h1 weight. Inputs use 16px minimum (stops iOS zoom).

## Components
- Button primary/ghost: states in `style-spec.md` §6. Height 52px.
- Input: 52px tall, label above, help or error slot below (`aria-describedby`), `aria-invalid` on error.
- Glass card, glass panel, date chip, toast/banner (`role=status` for success, `role=alert` for network error).

## Focus
Lime 2px outline, 3px offset on all interactives. Inputs add a 3px lime halo at 0.35. Tab order: skip, header CTA, hero CTA, form fields 1 to 6, submit, footer.

## Touch targets
All interactive elements have at least a 44×44px hit area. Buttons and inputs are 52px. The header ghost button is 44px. Footer links get padding so they reach 44px. Leave 8px or more between adjacent targets.

## 375px layout
- Gutter 16px, so content width is 343px. Single column everywhere.
- H1 is clamped to 44px and wraps to 2 lines ("Paddlebase / registration"). The date chip wraps under it, full width, and the CTA is full width.
- Hero height is `100svh` with a minimum of 560px. Parallax depth is halved on coarse pointers. No hover tilt.
- Cards stack with 16px gaps. Form panel padding is 24px and fields stack.
- At most 2 blurred surfaces on screen on mobile, and the blur drops to 16px for GPU budget.
- No horizontal scroll: 3D layers sit in an `overflow: clip` wrapper.

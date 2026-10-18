# UI/UX Audit (design phase)

This is a spec-level audit. Browser evidence (375px and 1440px, keyboard pass, reduced motion) is due in the build phase.

| Check | Status | Notes |
|---|---|---|
| Text contrast ≥ 4.5:1 | Pass (spec) | Every text pair is 5.09:1 or higher; see the table in `uiux-design-system.md`. |
| UI contrast ≥ 3:1 | Pass | Input border cream 0.24 on ink is about 3.1:1 effective; error border orange 5.61:1; focus lime 14.51:1. Recheck the input border in the build. |
| Banned pairs | Logged | White on orange and orange on cream are banned. |
| Text over video | Risk | Depends on the scrim and glass tint. Measure on poster frame 150 and on the brightest frame. |
| Focus visible | Pass (spec) | Lime ring on all interactives. No `outline: none`. |
| Keyboard | Spec | Logical tab order. Enter submits. Error focus moves to the first invalid field. |
| Labels | Pass | Visible labels, `for`/`id`, autocomplete tokens, inputmode set. |
| Errors | Pass | Inline text plus icon plus border (not color only), `aria-invalid`, `aria-describedby`, live region for the submit result. |
| Touch targets | Pass | Interactives are 52px, minimum 44px. |
| 375px | Spec | Single column, full-width CTA, no horizontal scroll, 16px inputs. |
| Reduced motion | Pass (spec) | Video, parallax, tilt and the 3 transitions are off. Poster and 200ms fades remain. `gsap.matchMedia`. |
| Performance | Risk | `backdrop-filter` cost on low-end Android. Cap blurred layers (4 on desktop, 2 on mobile). Video ≤ 2 MB, lazy-loaded. |
| Motion safety | Pass | No flashing over 3 per second. Kitchen Line Wipe is a single lime bar, not a strobe. |
| Language/timezone | Pass | Date is shown with the `Asia/Manila` label and a `<time>` value. |

Open items: venue name and address, welcome email text, hosting choice.

# Page Map

Single page. Skip link, then a sticky glass header (logo "PaddleBase" plus a ghost "Register" anchor that hides while the hero CTA is visible).

## 1. Hero `#top`

- Kicker (Archivo micro, lime): `PADDLEBASE · OPERATORS MEETUP`
- H1: **Paddlebase registration**
- Sub: `An afternoon for court owners and operators across Southern Mindanao. Bring your venue; leave with a network.` [placeholder]
- Date chip (scoreboard): `Sunday, October 18, 2026 · 2:00 PM` with `Asia/Manila (GMT+8)` in micro text below. Machine value `<time datetime="2026-10-18T14:00:00+08:00">`.
- CTA (lime): `Register` (anchors to `#register`). Reassure line: `Free · takes under a minute`.

## 2. Event details `#details` (Overhead Smash in)

Section title: `What to expect` [placeholder]. Three glass cards:

| Card | Label | Value | Line |
|---|---|---|---|
| When | WHEN | Sun, Oct 18 · 2:00 PM | `Asia/Manila time. Doors open 1:30 PM.` [placeholder] |
| Where | WHERE | `[Venue TBD]` | `Address shared with registrants.` [placeholder; open item] |
| Who | WHO | Court owners & operators | `List your courts on PaddleBase and meet the team.` [placeholder] |

## 3. Registration `#register` (Kitchen Line Wipe in)

Title: `Save your spot`. Sub: `We'll email a confirmation right away.`

| # | Field id | Label | Input | Required | Inline rule (validate on blur, then on input after the first error) | Error copy |
|---|---|---|---|---|---|---|
| 1 | `name` | Full name | text, `autocomplete=name` | yes | trimmed, 2 to 80 chars | `Enter your full name.` |
| 2 | `venue_name` | Venue name | text, `autocomplete=organization` | yes | trimmed, 2 to 120 chars | `Enter your venue's name.` |
| 3 | `courts_count` | Number of courts | text, `inputmode=numeric` | yes | whole number, 1 to 200 (`^\d+$`) | `Use a whole number, 1 or more.` |
| 4 | `rates` | Court rate (₱ per hour) | text, `inputmode=decimal` | yes | number 0 or above, up to 2 decimals (`^\d+(\.\d{1,2})?$`) | `Enter a number, like 350 or 350.50.` |
| 5 | `email` | Email | email, `autocomplete=email` | yes | `^[^\s@]+@[^\s@]+\.[^\s@]{2,}$` | `Enter a valid email, like name@venue.ph.` |
| 6 | `phone` | Mobile number | tel, `inputmode=tel`, `autocomplete=tel` | yes | PH mobile: `^(\+63|0)9\d{9}$` after removing spaces and dashes | `Use a PH mobile number, like 0917 123 4567.` |

Plus a hidden honeypot field `website`.

States:
- Sending: button reads `Sending…`, all fields stay editable but submit is disabled.
- Success (Dink Drop): `You're registered. Check your inbox for a welcome email from PaddleBase.` [welcome text placeholder]
- Duplicate: `This email is already registered.` on the email field.
- Network error: a banner `Couldn't send. Check your connection and try again.` Values are kept.
- Server field errors map to the same inline slots.

## 4. Footer

`© 2026 PaddleBase · paddlebase.org` plus a back-to-top link. No other navigation.

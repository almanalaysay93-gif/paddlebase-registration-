# Paddlebase Registration

One-page registration site for the Paddlebase event on **Sunday, October 18, 2026, 2:00 PM (Asia/Manila)**. A demo for paddlebase.org.

Registrations go to a Google Sheet through a Google Apps Script web app. Each sign-up emails the owner and sends the registrant a welcome note.

## What's here

| Path | What it is |
|---|---|
| `index.html`, `css/`, `js/` | The static site (GitHub Pages) |
| `js/config.js` | Set `APPS_SCRIPT_URL` to your deployed `/exec` URL |
| `assets/` | Rendered background loop (16:9 and 4:5, MP4 + WebM, posters) |
| `hyperframes/` | HyperFrames source for the background loop |
| `apps-script/` | `Code.gs` for the backend and `SETUP.md` for setup |
| `design/` | Design specs and decisions |

## Run locally

Open `index.html` in a browser, or serve the folder:

```bash
npx serve .
```

## Rebuild the background loop

```bash
cd hyperframes
npx --yes hyperframes@0.8.169 check
npx --yes hyperframes@0.8.169 render --fps 30 --format mp4 --crf 26 -o renders/bg.mp4
npx --yes hyperframes@0.8.169 render --fps 30 --format webm --crf 36 -o renders/bg.webm
npx --yes hyperframes@0.8.169 render -c mobile/index.html --fps 30 --format mp4 --crf 26 -o renders/bg-mobile.mp4
npx --yes hyperframes@0.8.169 render -c mobile/index.html --fps 30 --format webm --crf 36 -o renders/bg-mobile.webm
```

Copy the outputs into `assets/`. Posters are frame 150 of each MP4.

## Backend setup

Follow `apps-script/SETUP.md`. In short: paste `Code.gs` into the Google Sheet's Apps Script editor, set the owner email, run the setup and trigger functions, deploy as a web app, then put the `/exec` URL in `js/config.js`.

## Deploy

GitHub Pages serves the `main` branch root.

# 3DNews

A futuristic, explorable **3D sphere of news**. Live headlines are mapped onto a
rotating sphere of thumbnails — drag to spin it in any direction, and when you
settle on a post it animates open into a rich detail card. Built as a throwaway
MVP to explore a novel news-browsing UX.

![concept](docs/concept.txt)

## Stack
Vite + React + TypeScript · react-three-fiber / drei / postprocessing (neon
bloom) · zustand · Tailwind CSS.

## Run it

```bash
pnpm install
pnpm dev
```

Open http://localhost:5173. **It runs with no setup** — without an API key it
loads a bundled sample dataset (`public/sample-news.json`).

### Use live news (optional)
1. Get a free key at https://newsapi.org/register
2. `cp .env.example .env` and set `VITE_NEWSAPI_KEY=your_key`
3. Restart `pnpm dev`

NewsAPI's free tier only allows browser requests from `localhost`, which is all
this MVP needs.

## How to use
- **Drag** anywhere to spin the sphere in any direction; **scroll** to zoom.
- **Stop** on a thumbnail near the center — it focuses and the detail card slides in.
- Use the **feed selector** (top-right HUD) to switch feeds. **ALL** is selected
  by default and shows every article across categories; each option shows its
  article **count**. Switching is instant (all feeds are loaded up front).
- Click **Read full article ↗** to open the source.

## Notes
- Article images come from third-party CDNs that often lack CORS headers, so some
  can't be drawn into WebGL. Those tiles fall back to a generated neon placeholder
  showing the headline — the sphere always looks full.

## Build
```bash
pnpm build
```

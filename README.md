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

The app supports **4 providers** — set any combination of keys in `.env` and
results are merged and deduplicated automatically. Priority order: Currents →
NewsData → GNews → NewsAPI.

```
cp .env.example .env
```

| Env var | Provider | Free tier | Sign up |
|---------|----------|-----------|---------|
| `VITE_CURRENTS_API_KEY` | Currents API | 1 000 req/day, browser-safe | currentsapi.services |
| `VITE_NEWSDATA_KEY` | NewsData.io | 200 req/day, browser-safe | newsdata.io |
| `VITE_GNEWS_KEY` | GNews | 100 req/day, dev only | gnews.io |
| `VITE_NEWSAPI_KEY` | NewsAPI.org | localhost only | newsapi.org |

Restart `pnpm dev` after editing `.env`. The **left-side HUD** shows how many
articles were fetched from each active provider.

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

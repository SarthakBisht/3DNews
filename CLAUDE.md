# 3DNews — stack-specific rules

Futuristic 3D news browser: live headlines mapped onto a spinnable 3D sphere of
thumbnails; stop on a post and it expands into a rich detail card. Throwaway MVP
— optimize for the wow factor, not production hardening.

## Stack
- Vite + React 18 + TypeScript (strict).
- 3D: `@react-three/fiber` + `@react-three/drei` + `@react-three/postprocessing` (Bloom).
- State: `zustand`. Styling: Tailwind CSS.

## Commands
- Install: `pnpm install`
- Dev: `pnpm dev` (opens http://localhost:5173)
- Build: `pnpm build` (must pass with no TS errors)

## Conventions
- Function components + hooks only. One clear purpose per file; keep R3F
  components small.
- Co-locate component logic; share types via `src/lib/types.ts`.
- Don't cross-import from other MVP folders — copy what you need.
- No backend/db/auth unless the experiment needs it (it currently doesn't:
  everything runs client-side).

## News data
- Source: NewsAPI.org `/v2/top-headlines` (free dev key; browser requests only
  work from `localhost`).
- All category feeds are fetched once on load (`fetchAllFeeds`); the **ALL** feed
  is the deduped union, and feed switching/counts are computed client-side.
- Key: `VITE_NEWSAPI_KEY` in `.env` (copy from `.env.example`).
  **Never commit `.env`. Never read or print the key.**
- No key / fetch error → automatic fallback to `public/sample-news.json`, so the
  app always runs.

## Image textures (important)
- Article images are third-party and frequently lack CORS headers, so WebGL may
  refuse to texture them. Always load via the `placeholderTexture` fallback path
  in `src/lib/placeholderTexture.ts`; never assume an image URL will load.

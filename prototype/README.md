# Casino Game — prototype app

Vite + React (JavaScript) + Tailwind CSS v4 + lottie-web.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build into dist/
```

## Keys

- `G` — show / hide the layout guides from Figma (frame 629:6879).

## Layout

- `src/stage` — the fixed 1920x1080 stage, scaled to fit the window.
- `src/game` — game state and all money math.
- `src/ui`, `src/scene`, `src/screens`, `src/styles` — UI, Lottie scene, screens, tokens.
- `public/assets`, `public/lottie` — raster skins and Lottie files.
- `D` — show / hide the debug panel (only rendered with `?debug=1`).
- `Space` / `Enter` — FIGHT (PLAY on the setup screen), `T` — TAKE, `S` — SKIP animation.

## URL parameters

- `?seed=123` — same fights every time (see `docs/demo-seeds.md`).
- `?difficulty=easy|medium|high` — preselect the difficulty.
- `?debug=1` — show the debug panel.

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

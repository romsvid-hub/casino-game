# Witchbound — game prototype

**Witchbound** (working title) is a clickable browser prototype of an escalating-risk / cash-out game with a battle wrapper. A knight fights through 7 gates in a Slavic night forest: each won fight raises the multiplier, **TAKE** collects the winnings at any time, and a lost fight loses the bet. Gate 6 is the vovkulak boss, gate 7 is Baba Yaga; only beating her gives the **MAX WIN**.

It is built from the approved Figma designs for testing, presenting and client approval. **It is not production code**, and all game numbers are placeholders.

- **Play online:** https://casino-game-bice.vercel.app (updates automatically after every merge into `main`)
- **Client demo guide:** [`README-demo.md`](README-demo.md)

## Run locally

Requires Node 22+.

```bash
cd prototype
npm install
npm run dev        # http://localhost:5173
```

| Command (in `prototype/`) | What it does |
| --- | --- |
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Production build into `prototype/dist/` |
| `npm run lint` | ESLint (default Vite React config) |
| `npm run check:logic` | Game logic and money checks, all demo seeds (no browser) |
| `npm run qa` | Visual states next to Figma, money checks, Lottie mount cost → `docs/qa/report.html` |
| `npm run qa:smoke` | Chromium, Firefox, WebKit: window sizes, keyboard, skip, click spam, refresh |
| `npm run assets:weight` | Size of the Lottie files and images in `public/` |

The QA suites use Playwright. Install the browsers once with `npx playwright install chromium firefox webkit`. CI (`.github/workflows/ci.yml`) runs lint, build and all three suites on every pull request.

## URL parameters

| Parameter | Effect |
| --- | --- |
| `?seed=13` | Fixed random seed: the first round after page load replays the same fights. Ready-made stories are in [`docs/demo-seeds.md`](docs/demo-seeds.md). |
| `?difficulty=easy\|medium\|high` | Preselect the difficulty |
| `?debug=1` | Debug panel: game state, forced win / lose, effective RTP per gate |
| `?intro=1` | Plays the splash and shows the rules card on every load (client demos). `?intro=0` skips the splash (used by the test suites) |
| `?go=<scenario>` | Opens one exact moment for review: `lobby`, `g<N>-enter`, `g<N>-wait`, `g<N>-win`, `g<N>-lose`, `g<N>-take` (gate N = 1–7; take from gate 2). |
| `?rig=1` | Character rig view: every part outline, its pivot (dot) and the bone to its parent; `#/rig` lists every pose at rest |
| `#/kit` | UI Kit page: every component in every state, next to its Figma reference |

Example: https://casino-game-bice.vercel.app/?seed=13&difficulty=medium

Keys: `Space` / `Enter` = FIGHT (PLAY on the setup screen), `T` = TAKE, `S` = skip the animation, `D` = hide the debug panel, `G` = layout guides.

## Design source

- Figma file **Mavka_game**: https://www.figma.com/design/LXMHPQWUYxLjZiYVTfbx5X/Mavka_game (file key `LXMHPQWUYxLjZiYVTfbx5X`)
  - Page `Screen Design` (0:1) and page `UI Kit` (292:3759).
  - Reference battle scenes: L3 forest `756:6778`, L6 open field `756:6539`, L7 hut / Baba Yaga `748:6069`.
- Figma is the source of truth for visuals. The changes of 04–06.11 are listed in [`docs/figma-changelog-2026-11-04.md`](docs/figma-changelog-2026-11-04.md).

## Repository layout

| Path | Contents |
| --- | --- |
| `prototype/src/game/` | Game state machine and all money math. **Numbers live only in `config.js`.** |
| `prototype/src/scene/` | Battle scene: backgrounds, characters, FX, animation director |
| `prototype/src/ui/`, `src/screens/`, `src/styles/` | UI components, `/kit` page, design tokens |
| `prototype/public/` | Lottie files and images |
| `prototype/scripts/` | QA suites and the asset weight report |
| `docs/` | Roadmap, decisions, open questions, game rules, demo seeds, QA report, status report |

Workflow: one block = one branch = one pull request into `main`, Conventional Commits, decisions logged in [`docs/decisions.md`](docs/decisions.md), open questions in [`docs/open-questions.md`](docs/open-questions.md).

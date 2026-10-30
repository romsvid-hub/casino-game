# Casino Game — prototype

Design-engineering prototype of a browser gambling game (escalating-risk / cash-out mechanic with a battle wrapper). Demo for testing, presenting and client approval, not production. The level-by-level plan is `docs/ROADMAP.md`.

## Design source

- Figma is the source of truth for visuals: file "Mavka_game", fileKey `LXMHPQWUYxLjZiYVTfbx5X`.
  - UI Kit page `292:3759`. Screens page `0:1`.
  - Round setup lives in the bottom dock, no lobby: section `587:5124` (frames `587:5125` setup, `587:5302` battle).
- Before building any UI element, read it with the Figma MCP (`get_screenshot`, `get_design_context`, `get_variable_defs`, `get_metadata`). After building, compare your result with a Figma screenshot.

## Product constraints

- Fixed stage 1920x1080, scaled to fit the window with letterbox. No mobile layout.
- UI language English. No sound.

## Stack

- Vite + React (JavaScript, no TypeScript) + Tailwind CSS v4 + lottie-web (`svg` renderer). Deploy on Vercel.
- No extra libraries without asking.

## Code rules

- All money and multiplier math lives in `prototype/src/game/` only. Components only display values.
- Game numbers are placeholders in `prototype/src/game/config.js` until the client confirms them.
- Animations: Lottie files from `prototype/public/lottie` (1920x1080, transparent, characters pre-positioned). Win amounts and buttons are HTML on top, never baked into Lottie.

## Workflow

- One level = one branch `feature/lN-name` = one PR into `main`. Never push to `main` directly.
- Conventional Commits (`feat:`, `fix:`, `style:`, `refactor:`, `docs:`, `chore:`).
- Before finishing a level: run the build, list what you changed, and check the level's "Done when" list in `docs/ROADMAP.md`.
- Log every assumption or trade-off in `docs/decisions.md` (date | decision | why).
- Open client questions live in `docs/open-questions.md`.

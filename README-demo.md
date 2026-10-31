# Battle of Multipliers — demo v0.1

A clickable browser prototype of the escalating-risk / cash-out game with a battle wrapper. It is built from the approved Figma designs (file "Mavka_game") for testing, presenting and approval. **It is not production code.**

**Link:** _to be added once the Vercel project is connected_ (for local runs see `prototype/README.md`: `npm install && npm run dev`).

## How to play (3 lines)
1. Pick a bet and a difficulty in the bottom panel, then press **PLAY**.
2. Each **FIGHT** won moves the knight to the next gate and raises the multiplier. **TAKE** ends the round and collects AT RISK.
3. Lose a fight and the bet is lost. Beat the boss on the last gate for the **MAX WIN**.

Keyboard: Space / Enter = FIGHT (PLAY on the setup screen), T = TAKE, S = skip the animation. The ⓘ medallion opens the rules; ≡ opens the menu (Skip animations, Reset demo balance).

## Demo links
Append these to the link and reload the page before each run (the bet stays at 5.00):

| Story | Parameters | Result |
| --- | --- | --- |
| Early defeat | `?seed=2&difficulty=medium` | First fight lost → −5.00 |
| Take at level 3 | `?seed=1&difficulty=medium` | 3 wins, press TAKE → +12.00 |
| Boss win | `?seed=13&difficulty=medium` | 7 wins → MAX WIN +95.00 |

Easy and High seeds are listed in `docs/demo-seeds.md`.

## What is placeholder
- **Every game number:** multipliers per gate, win chances (80 / 65 / 45 %), bet limits and chips, starting demo balance (40.00). They live in one file, `prototype/src/game/config.js`, and are marked `PLACEHOLDER`.
- **The Easy and High multiplier curves:** derived from Medium (Figma only shows Medium).
- **The rules text:** a draft adapted from the old prototype.
- Open questions for the client are collected in `docs/open-questions.md`.

## Not in v0.1
- Sound and music
- Mobile / portrait layout (the stage is a fixed 1920×1080, scaled to the window)
- A lobby screen (the setup lives in the bottom panel, as agreed)
- Extra enemies and the second boss (one enemy type and one boss only)
- Real money, accounts, persistence (refreshing the page resets the demo balance)

## For the team
- Visual QA report with Figma next to the app: `docs/qa/report.html` (open it locally after `npm run qa`).
- QA checklist and results: `docs/qa/checklist.md`.
- Decisions and trade-offs: `docs/decisions.md`. Game rules and the state diagram: `docs/game-rules.md`.

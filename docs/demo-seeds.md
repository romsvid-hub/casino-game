# Demo seeds

Fixed `?seed=` values that replay the same fights every time, for presenting the prototype. Add them to the app URL (local: `http://localhost:5173/`, later the Vercel link).

- `?seed=N` fixes the RNG. The seed only covers the **first round after the page loads**, so reload the page before each demo.
- `?difficulty=easy|medium|high` preselects the difficulty.
- Bet: keep the default **5.00**. The outcome does not depend on the bet, but the amounts below assume 5.00.
- Press **FIGHT** for every fight. Do not use the debug panel. SKIP is fine: it changes nothing.

| Difficulty | Story | URL params | What happens |
| --- | --- | --- | --- |
| Medium | Early defeat | `?seed=2&difficulty=medium` | The first fight is lost → DEFEAT −5.00, balance 35.00 |
| Medium | Cash out at level 3 | `?seed=1&difficulty=medium` | 3 wins (×1.20, ×1.60, ×2.40), then **TAKE** → CASHED OUT +12.00, balance 47.00. A 4th FIGHT would lose. |
| Medium | Boss win | `?seed=13&difficulty=medium` | 7 wins in a row, boss on gate 7 → MAX WIN +95.00 (×19.00), balance 130.00 |
| Easy | Early defeat | `?seed=4&difficulty=easy` | The first fight is lost → DEFEAT −5.00 |
| Easy | Cash out at level 3 | `?seed=1&difficulty=easy` | 3 wins, then **TAKE** → +7.75 (×1.55) |
| Easy | Boss win | `?seed=3&difficulty=easy` | 7 wins → MAX WIN +23.00 (×4.60) |
| High | Early defeat | `?seed=1&difficulty=high` | The first fight is lost → DEFEAT −5.00 |
| High | Cash out at level 3 | `?seed=52&difficulty=high` | 3 wins, then **TAKE** → +25.25 (×5.05) |
| High | Boss win | `?seed=29&difficulty=high` | 7 wins → MAX WIN +1,173.00 (×234.60) |

Suggested client demo (Medium): `?seed=2` → `?seed=1` (take at level 3) → `?seed=13` (boss).

All results are checked by replaying each seed through the reducer (`game/machine.js`). The multipliers and win chances are placeholders (`config.js`), so the payouts change if the client changes them. A seed keeps the same win/lose sequence as long as the win chance stays the same.

# QA checklist (v0.1)

There are three automated suites. Run them from `prototype/`:

| Command | What it checks | Last result (2026-10-31) |
| --- | --- | --- |
| `npm run check:logic` | Reducer and money math against the Figma level frames, guards, seed determinism, win rates, all 9 demo seeds | ✅ all pass |
| `npm run qa` | 13 key states at 1920×1080 next to Figma (`docs/qa/report.html`), money consistency, Lottie mount cost, console errors | ✅ 53 / 53 |
| `npm run qa:smoke` | Chromium, Firefox, WebKit: window sizes, keyboard-only round, Skip, click spam, refresh, Rules/Menu, `/kit` | ✅ 69 / 69 |

## Browsers (macOS)
- [x] Chrome — Chromium engine, automated (`qa:smoke`), plus the in-app Chromium preview used during levels 1–10
- [x] Firefox — automated (`qa:smoke`)
- [x] Safari — WebKit engine, automated (`qa:smoke`). **Manual pass in real Safari still recommended** (fonts, backdrop blur).
- [ ] Manual pass in real Chrome / Safari / Firefox on a MacBook before the client demo

## Window sizes (automated in all three engines)
- [x] 1280×720 — stage 1280×720, no letterbox
- [x] 1440×900 — stage 1440×810, letterbox 45 px top / bottom
- [x] 1920×1080 — stage 1920×1080
- [x] 2560×1440 — stage 2560×1440
The stage stays 16:9, uncropped and centred, and fills the window on one side.

## Interaction
- [x] Keyboard-only round: Enter = PLAY, Space = FIGHT, T = TAKE, S = SKIP, Enter on the focused NEW ROUND
- [x] Skip during every animation state: ENTERING → DECISION, FIGHTING → result, RESOLVING → result, WIN_BANNER → DECISION
- [x] Click spam on FIGHT (6 fast clicks) runs exactly one fight
- [x] Click spam on TAKE (6 fast clicks) pays once
- [x] Refreshing mid-round returns to SETUP with the starting demo balance. Nothing is persisted except the "Skip animations" setting.
- [x] Result popups: NEW ROUND is focused, Tab stays inside the popup, Esc is ignored
- [x] Rules and Menu: open from the medallions, close with Esc / buttons; the Skip animations toggle works
- [x] No debug panel without `?debug=1`
- [x] No console or page errors in any suite

## Money (automated, `npm run qa`)
- [x] Balance before − bet + payout = balance after (defeat, cashed out, MAX WIN)
- [x] AT RISK (dock) = WIN (counter) = TAKE amount = Cashed out popup amount
- [x] IF WON = the amount on FIGHT ("up to …")
- [x] MAX WIN popup = IF WON before the boss fight. The balance changes only when the popup shows.
- [x] Every amount shows 2 decimals

## Performance
- [x] Lottie JSON loads per round in three batches (setup / round / boss), not 8.8 MB up front
- [x] The JS cost of mounting any clip during a round is under the 100 ms long-task target (typical worst 25 ms; 65 ms seen once under CPU load in headless)
- [x] The in-app Chromium preview with GPU (Level 8): 59.8 fps average, p95 frame 17.6 ms, no long tasks over a 20 s round
- [ ] **Manual:** Chrome performance panel on a MacBook during a fight. Target: no long tasks over 100 ms. The headless runs use software rendering (SwiftShader), so their frame numbers do not count.

## Known, deliberate differences from Figma
They are listed in `docs/decisions.md`. The main ones:
- Character poses and scale come from the Lottie files, not from the static Figma frames.
- No Sound medallion, because the prototype has no audio.
- The boss gate shows as Current, not Final.
- Counter/Win has no POTENTIAL WIN line.
- Plate/Multiplier shows only in DECISION.
- The Cashed out popup keeps the component's rays and coins.
- The round-end panels are built in HTML, because the Lottie panels have the note line baked in.

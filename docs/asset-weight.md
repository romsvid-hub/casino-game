# Asset weight

Total size of what the game loads from `prototype/public/`. Measure with `npm run assets:weight` (in `prototype/`) before and after every art change. Budget for the Figma update: about 1.5 MB of images per scene.

## Before the Figma 04–06.11 update (block H, 2026-11-07, main @ ab61b51)

| Group | Files | Size |
| --- | --- | --- |
| Lottie JSON | 25 | 8.72 MB |
| Images | 71 | 0.96 MB |
| Other public files | 0 | 0.00 MB |
| Total public/ | 96 | 9.69 MB |

Largest: `lottie/bg_scene.json` 2.55 MB, `lottie/boss_06_dead.json` 1.31 MB, `lottie/hero_05_dead.json` 0.86 MB, `lottie/enemy_05_dead.json` 0.73 MB, `lottie/popup_maxwin.json` 0.38 MB

All characters are still Lottie (old knight, vovkulak, boss). In blocks C–E they move to cropped WebP sprites from Figma, so the Lottie total should drop. The next measurement goes below.

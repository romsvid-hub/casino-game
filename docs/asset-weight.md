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

## After block C+B (2026-11-07): characters are Figma sprites

| Group | Files | Size |
| --- | --- | --- |
| Lottie JSON | 7 | 3.43 MB |
| Images | 113 | 4.22 MB |
| Other public files | 0 | 0.00 MB |
| Total public/ | 120 | 7.65 MB |

Largest: `lottie/bg_scene.json` 2.55 MB, `lottie/popup_maxwin.json` 0.38 MB, `lottie/fx_boss_land_shake.json` 0.31 MB, `sprites/vovkulakBoss-attack@2x.webp` 0.24 MB, `sprites/vovkulakBoss-victory@2x.webp` 0.19 MB

- The 18 character Lottie files (old knight, vovkulak, boss: 5.29 MB) are removed. Lottie is now backgrounds and FX only (3.43 MB).
- New: 17 pose sprites + 4 rim-light masks in `public/sprites/`, WebP @1x and @2x (2.9 MB both sets). A browser loads one set: `srcset` picks @1x or @2x by screen density.
- Per scene (hero + its enemy): forest **0.64 MB @1x / 1.46 MB @2x**, field (boss) **0.74 MB @1x / 1.70 MB @2x**. The field scene at @2x is above the ~1.5 MB budget; @2x is encoded at WebP q0.74 (q0.86 for @1x). Baba Yaga is not counted yet (block D).

## After block D (2026-11-07): Baba Yaga

| Group | Files | Size |
| --- | --- | --- |
| Lottie JSON | 7 | 3.43 MB |
| Images | 126 | 5.78 MB |
| Other public files | 0 | 0.00 MB |
| Total public/ | 133 | 9.21 MB |

Largest: `lottie/bg_scene.json` 2.55 MB, `lottie/popup_maxwin.json` 0.38 MB, `lottie/fx_boss_land_shake.json` 0.31 MB, `sprites/vovkulakBoss-attack@2x.webp` 0.24 MB, `sprites/babaYaga-attack@2x.webp` 0.23 MB

- New: 5 Baba Yaga poses (WebP @1x/@2x), one gold and one red cage light, the red defeat light (half resolution).
- Hut scene (hero + Baba Yaga + lights): **0.76 MB @1x / 2.0 MB @2x**. Above the ~1.5 MB budget at @2x; the hut background (block E) will add to it. Options if needed: q0.65 for @2x, or @1.5x instead of @2x.

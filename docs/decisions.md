# Decisions log

Log every assumption, trade-off and client answer here. Newest at the bottom.

| Date | Decision | Why |
| --- | --- | --- |
| 2026-10-30 | L1: `lottie-web` pinned to exactly 5.12.2. | The roadmap says the Lottie files were tested on 5.12. `^5.12` would install 5.13. |
| 2026-10-30 | L1: the stage scales by a fractional factor (`min(w/1920, h/1080)`), not by whole steps. | It fills the window as much as possible while staying 16:9 with letterbox. |
| 2026-10-30 | L2: numbers use **Kurale**, not Spectral. | Every number text node on the CTAs (347:4215 / 347:4245), Counter/Win (349:4258) and the Dock (336:3939) is styled with UI/Number * = Kurale Regular. Spectral SemiBold appears only in two `note/highlight` annotations. The *descriptions* of CTA / Fight and Counter/Win still say "Spectral SemiBold, tabular figures"; we follow the rendered design and ask the client to confirm (see open-questions.md). |
| 2026-10-30 | L2: Kurale has no tabular figures (measured: "1111" = 76.9 px vs "0000" = 127.5 px at 46 px even with `tabular-nums`). | `font-variant-numeric: tabular-nums` stays on number styles. Animated counters (L6+) must stop digits jumping in the component, e.g. by setting a fixed width per digit. |
| 2026-10-30 | L2: kept collections **UI Kit** (9 of 10 colors) and **Typography** (all 31 values). | These are what the current UI Kit page and the battle screens use. |
| 2026-10-30 | L2: dropped `color/neutral/ash` (#7d746a). | It has zero usages in the file. |
| 2026-10-30 | L2: dropped the whole **Fantasy UI** collection (26 colors: surface/*, gold/*, ember/*, leaf/*, moon/*, text/*, line/*). | Nothing on the UI Kit page uses it. On Screens it is used only by legacy "EXP A / EXP B" concept frames (ember/300, gold/100, gold/300, leaf/300, text/muted). |
| 2026-10-30 | L2: dropped the **Fantasy/*** text styles (12). | They are used only in the legacy EXP A/B screens. Only UI/* styles became utilities (`type-*`). |
| 2026-10-30 | L2: dropped the **Fantasy/*** effect styles (Panel, Button, Button Hover Gold/Ember, Pressed, Medallion, Glow Gold/Ember/Leaf, Text Shadow). | They have zero usages. The effects really applied in the UI Kit are raw text shadows and glows, and those became tokens: `--fx-text-shadow`, `--fx-text-shadow-hard`, `--fx-glow-teal(-soft)`, `--fx-glow-amber(-strong)`, plus utilities `fx-glow-teal / fx-glow-amber / fx-glow-win`. "Overlay/Backdrop blur" (used 6x) became `--fx-backdrop-blur`. |
| 2026-10-30 | L2: the FIGHT label gradient (#b6fff7 → #3fe0d0) is not a variable in Figma. | It will be added as a component-level token in L5 when CtaButton is built. |
| 2026-10-30 | L2: added app-level tokens that are not in Figma: `--color-stage-letterbox` and `--debug-*` (guide overlay colors). | This keeps every raw color inside tokens.css. |
| 2026-10-30 | L2: used `@theme static` for colors. | Tailwind v4 otherwise drops theme variables that no utility uses yet, and `/kit` showed empty swatches. |
| 2026-10-30 | L3: raster skins are the **original source images** behind the Figma nodes, not 2x exports. | A 2x export of a node inside section 292:3771 comes out 100% opaque with the section's dark background (#151414) baked in. The source images are transparent, and the 2x export adds no detail because the sources themselves are that size. The natural sizes are recorded in `src/assets.js`, and components scale them down to their UI Kit size. |
| 2026-10-30 | L3: CTA skins come from the CTA component image fills (616x240, 2x of 308x120): `skin-fight-default / -hover / -disabled`, `skin-take`. | These images are not in section 292:3771. In Figma, Fight Pressed reuses Default, Fight Highlight and CTA / Play (instance 587:5038 = CTA / Fight · Highlight) reuse Hover, and every **Take** state uses one image. So in L5 the Take Hover / Pressed / Disabled states must come from CSS. |
| 2026-10-30 | L3: the 6 `_ui-kit-cta` renders (708x276, with glow margin) are kept in `assets/ui/cta/` as WebP q97. | WebP saves 70–80% (2.0 MB → 0.5 MB) with no visible loss (PSNR 32–45 dB measured on composited pixels). They are not used yet, because L5 should follow the Figma fills. |
| 2026-10-30 | L3: did not export `asset/side_plain (vector source)` 540:2602. | The PNG version 540:2082 is the same art. |
| 2026-10-30 | L3: no other component uses an image fill outside section 292:3771, apart from the CTA skins above. | Checked Skin/Side, Dock/Decision, Popup/Round end, Path/Gate, Counter/Win, Popup/Result, Popup/Actions, Plate/Multiplier, HUD and Skip. The Towel side reuses `dock_L`, and Plate/Multiplier and Chip/Bet crop `dock_tile`. |
| 2026-10-30 | L3: `LottieLayer` gives each instance its own `structuredClone` of the cached JSON. | lottie-web mutates `animationData`, so sharing one cached object between layers would corrupt it. |
| 2026-10-30 | L3: `public/` is about 10 MB (Lottie 8.8 MB, UI 1.0 MB). | This is under the ~25 MB target. |

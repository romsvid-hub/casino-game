# Casino Game — прототип: інструкція по рівнях

Oct 30, 2026 · @Roman

Мета — робочий демо-прототип гри в браузері під узгоджені макети Figma, зібраний у Claude Code за 12 рівнів. Кожен рівень дає одну перевірену річ і один PR із preview-посиланням. Старий прототип береться лише як зразок логіки, верстка і графіка — з Figma та `lottie_here`.

## Як працювати з документом

Один рівень = одна гілка = один PR. Наступний рівень починаєш лише після того, як попередній злитий у `main` і preview виглядає правильно.

1. У Claude Code в корені репо: `git checkout main && git pull`, потім Claude сам створить гілку з назвою з рівня.
2. Вставляєш промпт рівня англійською як є. Якщо Claude питає — відповідай коротко; якщо пропонує план — перевір, що він не виходить за межі рівня.
3. Перевіряєш за списком «Готово, коли» локально (`npm run dev`) і на Vercel preview.
4. Просиш Claude відкрити PR (або робиш сам у GitHub Desktop), дивишся diff, зливаєш.
5. Ставиш галочку в таблиці рівнів і переходиш далі.

Правила на весь проєкт (вони ж будуть у `CLAUDE.md`, тому в промптах не повторюються):

- Figma-файл `Mavka_game`, fileKey `LXMHPQWUYxLjZiYVTfbx5X`. Сторінка UI Kit — `292:3759`, екрани — `0:1`. Узгоджений варіант налаштувань раунду — секція `587:5124` (усе в нижній панелі, лобі немає).
- Полотно 1920×1080, масштабується цілим під вікно зі збереженням пропорцій. Мобільної версії немає.
- Мова UI — англійська, як у макетах. Звуків немає.
- Усі гроші й множники рахуються в одному модулі, екрани лише показують значення.
- Цифри гри — заглушки з конфігу, поки Артем не дасть свої.
- Conventional Commits: `feat:`, `fix:`, `style:`, `refactor:`, `docs:`, `chore:`.

Якщо Claude Code «загубив контекст» посеред рівня — скажи йому: `Re-read CLAUDE.md and docs/ROADMAP.md, then continue Level N.`

## Стек: що лишаємо і що прибрали

Для першого прототипу лишаємо мінімум, який дає живе посилання для Артема: Vite + React + Tailwind + lottie-web + Vercel. Усе інше винесено в бонус, щоб не гальмувати демо.

| Що | Рішення | Чому |
| --- | --- | --- |
| Vite + React (JavaScript, без TypeScript) | лишаємо | швидкий старт; JS легше читати, ніж TS |
| Tailwind CSS v4 | лишаємо | токени як CSS-змінні через `@theme` |
| Токени | Figma MCP → `tokens.css` напряму | без Style Dictionary для однієї теми це зайвий крок |
| lottie-web 5.12, renderer `svg` | лишаємо | наші файли тестовані саме на ньому |
| Vercel + preview на кожен PR | лишаємо | посилання для Артема без зусиль |
| Сторінка `/kit` у самому застосунку | замість Storybook | всі компоненти і стани на одній сторінці, нуль налаштувань |
| Storybook + Chromatic | бонус | корисно для практики з курсу, не потрібно для демо |
| Style Dictionary | бонус | знадобиться, коли токени підуть у стек Артема |
| TypeScript, тести, стейт-менеджери, роутер | прибрали | для демо не потрібні; стан — один `useReducer` |
| PixiJS / canvas | прибрали | сцена — шари Lottie у DOM; рендер для продакшну обирає Артем |
| Звук, мобільна версія, лобі | немає | за рішенням Романа від 30.10 |

## Карта рівнів

Після рівня 4 гра вже грається через дебаг-панель, після 8 — виглядає як бій, після 11 — це демо для Артема.

| # | Рівень | Результат на preview | Навичка з курсу | Гілка |
| --- | --- | --- | --- | --- |
| 0 | Репозиторій | порожній репо з `CLAUDE.md` і документацією | 02 Git, 04 Claude Code, 09 MCP | `main` |
| 1 | Скелет | темне полотно 1920×1080 на Vercel | 03 HTML/CSS, 08 Deploy | `feature/l1-scaffold` |
| 2 | Токени | сторінка кольорів і шрифтів | 06 Dev Mode + tokens | `feature/l2-tokens` |
| 3 | Ассети | сцена-фон і список ассетів | 06, 09 MCP | `feature/l3-assets` |
| 4 | Логіка | гра працює через дебаг-панель | 05 JS + React | `feature/l4-game-logic` |
| 5 | Базові компоненти | сторінка `/kit` з усіма станами | 03, 05, 07 (ідея stories) | `feature/l5-ui-kit` |
| 6 | HUD | верхня частина екрана | 03, 05 | `feature/l6-hud` |
| 7 | Нижня панель | Setup → Battle за макетом 587:5124 | 05 | `feature/l7-dock` |
| 8 | Сцена і Lottie | герой і ворог б'ються | 05 | `feature/l8-scene` |
| 9 | Результати | Victory / Defeat / Cashed out | 05 | `feature/l9-results` |
| 10 | Правила, меню, бос | повний раунд до MAX WIN | 05 | `feature/l10-full-loop` |
| 11 | QA і демо | продакшн-посилання, тег `v0.1` | 10 Capstone | `feature/l11-qa` |
| Б | Бонус | Storybook на Chromatic, Style Dictionary | 06, 07 | `feature/bonus-*` |

## Рівень 0 — репозиторій і правила для Claude

Результат: репо `romsvid-hub/casino-game` з папкою `prototype/` під застосунок, `CLAUDE.md` з правилами і `docs/` з цим документом. Коду ще немає.

Руками, до Claude Code:

1. На GitHub створи репо `casino-game`: Private (проєкт клієнта), з README. Клонуй у `~/Documents/Casino Game/casino-game` (GitHub Desktop або `git clone`).
2. Експортуй цей документ у Markdown (меню документа → Export) і поклади поруч з репо як `ROADMAP.md`.
3. Відкрий термінал у папці репо і запусти `claude`.
4. Підключи Figma MCP, якщо ще не підключений (лекція 09): `claude mcp add --transport http figma https://mcp.figma.com/mcp`, потім у Claude Code `/mcp` → figma → Authenticate. Перевірка: попроси «покажи скріншот вузла 587:5125».

Промпт:

```text
You are working in the repo romsvid-hub/casino-game. This is a design-engineering prototype of a browser gambling game (escalating-risk / cash-out mechanic with a battle wrapper). It is a demo for testing, presenting and client approval, not production.

Level 0 task: set up the repo for agentic work. Do NOT scaffold the app yet.

1. Move ../ROADMAP.md into docs/ROADMAP.md (it is the level-by-level plan; read it fully).
2. Create this structure:
   - prototype/            (the app will live here from Level 1)
   - docs/ROADMAP.md
   - docs/open-questions.md (copy the "Open questions" section from the roadmap)
   - docs/decisions.md      (empty log: date | decision | why)
   - CLAUDE.md
   - .gitignore (node, macOS, .env*, .vercel)
3. Write CLAUDE.md with these rules (keep it short, imperative):
   - Source of truth for visuals is Figma file "Mavka_game", fileKey LXMHPQWUYxLjZiYVTfbx5X. UI Kit page 292:3759. Screens page 0:1. Round setup lives in the bottom dock, no lobby: section 587:5124 (frames 587:5125 setup, 587:5302 battle). Use the Figma MCP (get_screenshot, get_design_context, get_variable_defs, get_metadata) before building any UI element, and compare your result with a Figma screenshot.
   - Fixed stage 1920x1080, scaled to fit the window with letterbox. No mobile layout. UI language English. No sound.
   - Stack: Vite + React (JavaScript, no TypeScript) + Tailwind CSS v4 + lottie-web (svg renderer). Deploy on Vercel. No extra libraries without asking.
   - All money and multiplier math lives in prototype/src/game/ only; components only display values. Game numbers are placeholders in prototype/src/game/config.js until the client confirms them.
   - Animations: Lottie files from prototype/public/lottie (1920x1080, transparent, characters pre-positioned). Win amounts and buttons are HTML on top, never baked into Lottie.
   - One level = one branch feature/lN-name = one PR into main. Conventional Commits. Never push to main directly.
   - Before finishing a level: run the build, list what you changed, and check the level's "Done when" list from docs/ROADMAP.md.
   - Log any assumption or trade-off in docs/decisions.md.
4. Commit as "chore: repo setup and project rules" and push to main (this one time only, the repo is empty).

At the end, show me the tree and the CLAUDE.md content.
```

Готово, коли:

- [ ] Репо на GitHub, у `main` є `CLAUDE.md`, `docs/`, `prototype/`
- [ ] Claude Code бачить Figma (скріншот 587:5125 відкривається)

## Рівень 1 — скелет і перший деплой

Результат: застосунок у `prototype/` показує темне полотно 1920×1080 з напрямними зон із макета, яке масштабується під будь-яке вікно. Він же вже живе на Vercel.

Руками, після промпту: на vercel.com → Add New Project → імпорт `casino-game` → Root Directory = `prototype`, Framework = Vite. Далі кожен PR отримує своє preview-посилання.

```text
Level 1 (branch feature/l1-scaffold). Read CLAUDE.md first.

Scaffold the app inside prototype/:
1. Vite + React (JavaScript) + Tailwind CSS v4 (@tailwindcss/vite plugin). Add lottie-web as a dependency now (used from Level 3).
2. Folder layout: src/stage, src/game, src/ui, src/scene, src/screens, src/styles, public/assets, public/lottie.
3. Build a <Stage> component: a fixed 1920x1080 box, centered in the viewport, scaled with transform: scale() to fit the window while keeping 16:9 (letterbox with a near-black background). Recompute on resize. Expose the scale through React context so later levels can convert pointer coordinates if needed.
4. Inside the stage, render a debug overlay toggled with the "G" key that draws the layout zones from the Figma layout (file LXMHPQWUYxLjZiYVTfbx5X, frame 629:6879 has a hidden group "_Guides (hide before export)" 629:6941): safe area 40/24, HUD 24-137, win counter 560,150 800x120, battlefield 280-880, ground line y=730, hero center x=560, enemy center x=1340, dock 210,888 1500x168. Read 629:6941 via Figma MCP (get_metadata) to verify the zones.
5. Page title "Casino Game - prototype". Remove all Vite boilerplate.
6. npm run build must pass. Add a short prototype/README.md (how to run).

Commit in small steps, push the branch and open a PR "feat: L1 scaffold and 1920 stage".
```

Готово, коли:

- [ ] При зміні розміру вікна полотно лишається 16:9 і не обрізається
- [ ] Клавіша G показує зони, вони збігаються з гайдами в Figma
- [ ] У PR є робоче preview-посилання Vercel

## Рівень 2 — токени і шрифти

Результат: кольори, типографіка і ефекти з Figma живуть у `tokens.css` і доступні як Tailwind-класи. Сторінка `/kit` показує палітру й усі стилі тексту.

Що є в Figma: колекції змінних **UI Kit** (10 кольорів), **Fantasy UI** (26 кольорів) і **Typography** (31 значення); текстові стилі `UI/*` і `Fantasy/*` на Ruslan Display (заголовки, кнопки) та Kurale (цифри, текст); 11 ефектів `Fantasy/*` (тіні, свічення). Обидва шрифти є в Google Fonts.

Увага: у старій специфікації цифри були Spectral, а в стилях зараз Kurale. Промпт просить Claude перевірити, який шрифт реально стоїть на кнопках і в лічильнику.

```text
Level 2 (branch feature/l2-tokens). Read CLAUDE.md first.

Goal: one source of truth for design tokens, taken from Figma, without Style Dictionary.
1. Use the Figma MCP (get_variable_defs, get_design_context) on file LXMHPQWUYxLjZiYVTfbx5X. Collections: "UI Kit" (color/accent/*, color/neutral/*, color/text/*), "Fantasy UI" (surface/*, gold/*, ember/*, leaf/*, moon/*, text/*, line/*), "Typography" (font/family/*, font/size/*, font/line-height/*). Also read text styles UI/* and Fantasy/*, and effect styles Fantasy/* (Panel, Button, Glow Gold, Glow Ember, Glow Leaf, Text Shadow...).
2. Check which components actually use which collection (inspect CTA / Fight 347:4215, Counter/Win 349:4258, Dock/Decision 336:3939). Keep only tokens that are used; note unused ones in docs/decisions.md.
3. Write prototype/src/styles/tokens.css: CSS custom properties with names mirroring Figma paths (e.g. --color-accent-teal, --gold-500, --font-size-number-hero). Then a Tailwind v4 @theme block mapping them to utilities (colors, fontFamily display/number, fontSize scale). Effects become CSS variables for box-shadow / drop-shadow / text-shadow plus small utility classes (.fx-glow-gold etc.).
4. Fonts: load Ruslan Display and Kurale from Google Fonts (latin + cyrillic). Verify on the CTA buttons and Counter/Win which family the numbers use (Kurale vs Spectral) and follow Figma; log the finding in decisions.md. Numbers must use tabular figures where the font supports it.
5. Add a /kit route (simple hash switch, no router library): sections "Colors" (swatch + token name + hex) and "Type" (every UI/* style rendered with sample text "FIGHT 1,234.50 x2.40").
6. Compare /kit against Figma screenshots and fix mismatches.

PR: "feat: L2 design tokens from Figma".
```

Готово, коли:

- [ ] У коді немає hex-кольорів поза `tokens.css`
- [ ] `/kit` показує палітру і стилі, шрифти виглядають як у Figma
- [ ] Рішення про Kurale/Spectral записане в `decisions.md`

## Рівень 3 — ассети

Результат: у репо лежать усі растрові шкурки UI і всі Lottie-файли. На полотні вже грає живий фон `bg_scene`.

Джерела:

- Figma, секція `Assets (raster skins)` `292:3771`: плашки HUD, кнопок, воріт, панелі, попапів, іконки, торці.
- Локально: `~/Documents/Casino Game/lottie_here` (25 `.json` + `README.md` з таймінгами) і `~/Documents/Casino Game/_ui-kit-cta/` (6 PNG плашок кнопок).

```text
Level 3 (branch feature/l3-assets). Read CLAUDE.md first.

1. Lottie: copy every *.json and README.md from "~/Documents/Casino Game/lottie_here" into prototype/public/lottie/ (skip preview.html and _source.zip). Move that README to docs/lottie.md and read it: it lists every file, duration, loop/once, and timing rules (hit lands ~0.27 s into an attack, boss ~0.38 s; fx_boss_land_shake plays together with boss_01_enter; popup_maxwin has markers intro/loop).
2. Raster skins: in Figma file LXMHPQWUYxLjZiYVTfbx5X export every node in section 292:3771 "Assets (raster skins)" at 2x as PNG (use the Figma MCP asset download / screenshot tools; keep transparency). Save to prototype/public/assets/ui/ with kebab-case names from the layer names (asset/hud_balance_L -> hud-balance-l.png). Also copy the 6 PNGs from "~/Documents/Casino Game/_ui-kit-cta/" to prototype/public/assets/ui/cta/. Convert large PNGs to WebP if it saves >40% without visible loss; keep the PNG originals out of the repo if they are not used.
3. Where a component in the UI Kit uses an image fill that is not in section 292:3771 (check Skin/Side 540:2099, Dock/Decision 336:3939, Popup/Round end 475:2904, Path/Gate 335:3892), export that image too.
4. Create prototype/src/assets.js: one manifest object with all asset URLs and natural sizes, grouped (hud, cta, dock, gates, popups, sides, icons, lottie).
5. Add a <LottieLayer> component (src/scene/LottieLayer.jsx) wrapping lottie-web: props src, loop, autoplay, segment/marker, onComplete, className; renderer "svg"; destroys on unmount; preloads JSON via fetch with an in-memory cache.
6. Render bg_scene.json full-stage behind everything (looping). Add an "Assets" section to /kit showing every PNG with its name and size.

PR: "feat: L3 assets and Lottie layer".
```

Готово, коли:

- [ ] На полотні живий фон (хмари, туман, смолоскип)
- [ ] `/kit` → Assets: усі шкурки з прозорим фоном, без обрізаних країв
- [ ] Розмір `public/` розумний (орієнтир до \~25 МБ)

## Рівень 4 — ігрова логіка

Результат: увесь раунд існує як машина станів без графіки. Його можна пройти через дебаг-панель, цифри беруться з одного конфіга-заглушки. Зі старого прототипу беремо ідею CONFIG / state / busy, але правила — наші:

- Ставка списується з балансу на старті раунду; після старту ставку і складність змінити не можна.
- AT RISK (воно ж TAKE) = ставка × множник останніх пройдених воріт; IF WON = ставка × множник наступних воріт.
- Поразка — ставка втрачена. TAKE — AT RISK йде на баланс.
- Останні ворота — бос. Перемога над ним = автоматичний MAX WIN і кінець раунду.

```text
Level 4 (branch feature/l4-game-logic). Read CLAUDE.md and the old prototype logic described below.

Build the game core in prototype/src/game/ with no visuals except a debug panel.

1. config.js (ALL numbers are placeholders, mark each with // PLACEHOLDER - pending client):
   - startingBalance 40, betOptions [1, 2, 5, 10, 20] (check the chip values in Figma frame 587:5125 and use those), defaultBet 5, minBet, maxBet.
   - difficulties: easy / medium / high, each with label, winChance (0.80 / 0.65 / 0.45 as in the old prototype) and gates: an array of multipliers per level. Use the numbers visible in Figma level frames (section 473:1920 levels 1-5, result frames 474:2007) where present; the final gate is the boss, max multiplier placeholder x19.00 for medium. Scale easy/high proportionally and log that in docs/decisions.md.
   - timings (ms) for UI beats: resultBanner 1500, crossfade 150, countUp 400/600.
2. money.js: pure functions only - atRisk(bet, passedGates), ifWon(bet, nextGate), payout, formatMoney (2 decimals, en-US, tabular). Round to cents once, in one place.
3. rng.js: seeded RNG (mulberry32). Seed from URL ?seed=123, otherwise random. Debug overrides: forceNext = 'win' | 'lose' | null.
4. machine.js: a reducer for useReducer with explicit states and events:
   states: SETUP -> ENTERING -> DECISION -> FIGHTING -> RESOLVING -> (WIN_BANNER -> ENTERING next enemy | DEFEAT) ; DECISION -> CASHED_OUT ; boss win -> MAX_WIN ; DEFEAT / CASHED_OUT / MAX_WIN -> SETUP ("new round", same bet and difficulty kept).
   events: SET_BET, SET_DIFFICULTY, PLAY, ENTER_DONE, FIGHT, ANIM_DONE, TAKE, SKIP, NEW_ROUND, MENU.
   Guards: PLAY only if balance >= bet (else stay in SETUP with flag insufficientBalance); FIGHT/TAKE ignored unless in DECISION; TAKE disabled before the first win (nothing to take); SKIP jumps any animation state to its end result.
   The reducer decides the fight result at FIGHT (using rng) so animations only play an already-known outcome.
   Expose derived selectors: level, gates with status (passed/current/next/locked/final), atRisk, ifWon, nextMultiplier, isBoss, canTake, canFight.
5. useGame() hook returning [state, actions, derived].
6. A debug panel (toggle with "D" key, top-right, small, monospace) showing state name, balance, bet, difficulty, level, atRisk, ifWon, seed, plus buttons for every event and "force win / force lose".
7. Add docs/game-rules.md: the rules in plain English, the state diagram as a Mermaid block, and the placeholder table.

Old prototype reference (logic only, do not copy its UI): CONFIG with difficulties {easy 0.80, medium 0.65, high 0.45}, stake deducted up front, busy flag locks buttons during animations, backToStart after round.

PR: "feat: L4 game state machine and money math".
```

Готово, коли:

- [ ] Через дебаг-панель проходиш усі три фінали: Defeat, Cashed out, MAX WIN після боса
- [ ] Цифри AT RISK / IF WON збігаються з кадрами рівнів 1–5 у Figma
- [ ] З однаковим `?seed=` раунд щоразу іде однаково
- [ ] Є `docs/game-rules.md` зі схемою станів

## Рівень 5 — базові UI-компоненти

Результат: усі «цеглинки» з UI Kit зібрані як React-компоненти з пропсами-варіантами, як у Figma. `/kit` показує кожен у всіх станах. Це наша заміна Storybook для першого прототипу.

| Компонент | Figma | Варіанти |
| --- | --- | --- |
| `Skin3Slice` + `SkinSide` | Skin/Side `540:2099` | Style Towel / Plain, Side L / R, Size L 168 / M 120 |
| `CtaButton` | CTA / Fight `347:4215`, CTA / Take `347:4245`, CTA / Play (інстанс `587:5038`) | Default, Hover, Pressed, Disabled, Highlight; label + amount |
| `SkipButton` | CTA / Skip `466:2071` | Default, Hover |
| `Stepper` | Stepper `536:1901`, Stepper/Arrow `536:1900` | Up / Down × 4 стани |
| `BetChip` | Chip/Bet · S `585:4702` | Default, Selected, Disabled |
| `DifficultySegment` | Segment/Difficulty `585:4757` | Easy / Medium / High × Default, Selected, Disabled |
| `ModeBadge` | Badge/Mode `585:4776` | Easy / Medium / High |
| `MultiplierPlate` | Plate/Multiplier `554:4220` | значення ×N |

```text
Level 5 (branch feature/l5-ui-kit). Read CLAUDE.md first.

Build the base UI components in prototype/src/ui/, one file each, matching the Figma UI Kit (file LXMHPQWUYxLjZiYVTfbx5X, page 292:3759). For EVERY component: call get_design_context and get_screenshot on the node first, use tokens from tokens.css and images from src/assets.js, no hardcoded colors.

Components and nodes:
- Skin3Slice (left / stretchable center / right image skin, CSS grid or border-image) + SkinSide: Skin/Side 540:2099 (Style Towel|Plain, Side Left|Right, Size L=168|M=120). Read the note 540:3445.
- CtaButton: CTA / Fight 347:4215 and CTA / Take 347:4245, 308x120, states Default/Hover/Pressed/Disabled/Highlight, props variant (fight|take|play), label, amount, state override for /kit. Real hover/active/disabled must work via CSS too. CTA / Play: find the main component of instance 587:5038.
- SkipButton: CTA / Skip 466:2071.
- Stepper: 536:1901 with Stepper/Arrow 536:1900 (Up/Down x Default/Hover/Pressed/Disabled).
- BetChip: Chip/Bet S 585:4702. DifficultySegment: 585:4757. ModeBadge: 585:4776. MultiplierPlate: 554:4220.

Rules: semantic <button> elements, keyboard focus ring that fits the style, aria-pressed for selectable chips/segments, disabled = real disabled attribute. Transitions 120-150 ms. Text is real HTML text with the Figma text styles, never baked into images.

Add a "Components" section to /kit: every component in every state side by side, with the Figma screenshot of the same node next to it (save screenshots to docs/figma-refs/ and show them only on /kit). Fix visible differences until they match within a few pixels.

PR: "feat: L5 base UI components".
```

Готово, коли:

- [ ] На `/kit` кожен компонент стоїть поруч із скріншотом Figma і збігається
- [ ] Hover, pressed, disabled працюють мишкою і з клавіатури
- [ ] Текст на кнопках — живий HTML, не картинка

## Рівень 6 — HUD

Результат: верхня частина екрана збігається з макетом і живе від стану гри: баланс, медальйони Rules і Menu, шлях воріт та лічильник виграшу. Медальйон Sound не показуємо, бо звуків немає.

```text
Level 6 (branch feature/l6-hud). Read CLAUDE.md and docs/game-rules.md.

Build the HUD in prototype/src/ui/hud/ and place it on the stage, wired to useGame(). Verify every element against Figma (get_design_context + get_screenshot) and against the full screens 340:4055 and 473:1037 (level 2) for position.

1. HudBalance: HUD/Balance 302:3760, 3-slice skin, stretches with the value. Position x40 y24. Value from state.balance, formatted by money.js.
2. HudMedallion: HUD/Medallion 302:3800, icons Rules and Menu only (Default/Hover). Do NOT render Sound (no audio in this prototype, log in decisions.md). Clicks dispatch openRules / openMenu (modals come in Level 10; for now console.log).
3. ProgressPath: Progress/Path · Levels 473:943 (Levels=0..7+) built from Path/Gate 335:3892 states and Path/Chain 335:3893. Behaviour per note 335:3934: only reached levels are shown; after a win the Current gate becomes Passed and a new Current gate is added (glow fades in 200 ms). The last gate of the round uses State=Final (boss). Include the fx/shade layer (rounded rect, black 60%, blur 40, 40 px outside). Centered at the top (y 24).
4. CounterWin: Counter/Win 349:4258, 800x120 at x560 y150: WIN label, big number, POTENTIAL WIN + amount. During a round: WIN = atRisk, POTENTIAL WIN = ifWon. Numbers count up over 400 ms (ease-out) when they change.
5. MultiplierPlate above the enemy's head (~y 320-384, centered on x 1340): shows the next multiplier xN. Hidden in SETUP.
6. Everything hidden or shown per state exactly as in the Figma screens: check SETUP (587:5125), DECISION (340:4055) and levels 1-5 (472:7862, 473:1037, 473:1127, 473:1217, 473:1307).

Use the debug panel to step through levels and confirm the HUD updates. PR: "feat: L6 HUD".
```

Готово, коли:

- [ ] Скріншоти рівнів 1–5 із застосунку збігаються з Figma за HUD
- [ ] Після перемоги ворота заповнюються, а цифри плавно дораховуються

## Рівень 7 — нижня панель

Результат: раунд налаштовується і грається з нижньої панелі точно як у секції `587:5124`. Setup: ставка зі степером і фішками, складність сегментами, PLAY по центру. Battle: ставка заблокована, складність — бейдж, FIGHT / TAKE. Стара модалка налаштувань і лобі не робимо.

| Стан гри | Варіант панелі | Figma |
| --- | --- | --- |
| SETUP | Setup: BET + фішки, PLAY, DIFFICULTY + chance | `587:4973`, контекст `587:5125` |
| ENTERING, FIGHTING, RESOLVING | Animation (кнопки вимкнені, є Skip) | `466:2114` |
| DECISION | Decision / Battle: BET + AT RISK, FIGHT, TAKE, NEXT + IF WON, бейдж режиму | `336:3939`, `587:5070`, контекст `587:5302` |
| WIN\_BANNER, DEFEAT, CASHED\_OUT, MAX\_WIN | Result | `466:2139` |

```text
Level 7 (branch feature/l7-dock). Read CLAUDE.md and docs/game-rules.md.

Build <Dock> in prototype/src/ui/dock/: 1500x168 at x210 y888, 3-slice skin (Dock/Decision 336:3939: skin/left and skin/right fixed 99 px, skin/fill tiles, skin/gem centered on the top ornament). Read the notes 336:3981 and the texts in section 587:4971 first.

Variants driven by game state (see the table in docs/ROADMAP.md Level 7):
1. Setup (frames 587:4973 and in context 587:5125): left = BET value + Stepper + 5 BetChip (S); center = CTA / Play; right = DIFFICULTY label + win chance ("chance" text) + 3 DifficultySegment. Stepper down disabled at min bet, up disabled at max bet or balance. If balance < bet: PLAY disabled and a short hint (log copy in decisions.md).
2. Animation (466:2114): FIGHT/TAKE disabled, SkipButton visible.
3. Decision / Battle (336:3939, 587:5070, in context 587:5302): left = BET (locked, no stepper/chips) + AT RISK, ModeBadge on the frame above BET/AT RISK; center = CTA Fight (amount = ifWon) + CTA Take (amount = atRisk, disabled before the first win); right = NEXT xN + IF WON. Use Highlight state on Fight when it is the suggested action per Figma note 347:4216.
4. Result (466:2139).

Behaviour: after a win AT RISK and IF WON count up 0.4 s and NEXT steps to the next gate; switching variants crossfades 150 ms; keyboard: Space/Enter = Fight, T = Take, S = Skip (document in README).

Remove the debug buttons that duplicate the dock (keep the debug panel itself). Compare full-stage screenshots of SETUP and DECISION with 587:5125 and 587:5302. PR: "feat: L7 dock setup and battle".
```

Готово, коли:

- [ ] Раунд від ставки до фіналу грається лише кнопками панелі, без дебаг-панелі
- [ ] Після старту раунду ставку й складність змінити не можна
- [ ] Setup і Battle збігаються з 587:5125 та 587:5302

## Рівень 8 — сцена і Lottie-режисер

Результат: персонажі виходять, б'ються, гинуть і радіють відповідно до стану гри; світло переходить на того, хто діє. Результат бою вже відомий з логіки, анімація лише його програє.

Шари знизу вгору: `bg_scene` → фокус-світло → герой → ворог / бос → FX → HUD і панель → попапи.

```text
Level 8 (branch feature/l8-scene). Read CLAUDE.md, docs/lottie.md and docs/game-rules.md.

Build the battle scene in prototype/src/scene/ using <LottieLayer>.

1. Layer stack inside the stage: bg_scene (loop) -> FocusLight -> Hero slot -> Enemy slot -> FX slot -> UI. Each slot is a full-stage 1920x1080 layer (files are pre-positioned, no offsets needed).
2. AnimationDirector (src/scene/director.js + useDirector hook): maps game state transitions to clip sequences and dispatches ANIM_DONE when a sequence ends. Clips (see docs/lottie.md):
   - Round start (ENTERING, level 1): hero_01_enter + after 0.7 s enemy_01_enter -> then hero_02_idle / enemy_02_idle loops -> ENTER_DONE.
   - Next enemy (after a win): enemy_01_enter (or boss_01_enter + fx_boss_land_shake together, plus a CSS shake of the stage container at 0.9 s, ±6 px, 0.35 s) -> idle loops.
   - FIGHT with known result: win -> hero_03_attack, at 0.27 s enemy_03_hit (or enemy_05_dead if this fight kills it; enemies die in one fight in this prototype, so it is always *_dead on a win); lose -> enemy_04_attack (boss_04_attack), at 0.27 s (boss 0.38 s) hero_05_dead.
   - Boss: use boss_* clips when the current gate is the final one; boss win -> boss_06_dead -> hero_06_victory loop.
   - Win banner beat: hero_06_victory for ~1.2 s, then next enemy enters.
   - Cash out: hero_06_victory loop.
3. Focus light: fx_focus_hero / fx_focus_enemy / fx_focus_clash, crossfaded via CSS opacity 300-400 ms: idle -> hero, attacking side -> that side, impact -> clash.
4. Pose switches: crossfade 70 ms between the outgoing and incoming clip of the same character (two LottieLayers per slot, A/B) to hide pose jumps.
5. Skip: jumps the current sequence to its last frame and fires ANIM_DONE immediately. A global "reduce motion" flag (from prefers-reduced-motion, later also from Menu) makes every sequence skip automatically.
6. Preload all clips the round can need at SETUP; never show a blank frame between clips.
7. Remove the placeholder characters/blocks if any. Performance target: steady 60 fps on a MacBook in Chrome with the full stack running; if not, log measurements in decisions.md.

Compare key frames with Figma screens 457:7471 (hero enter), 457:7257 (hero attacks), 456:7095 (enemy attacks), 380:5467 (victory), 380:5864 (defeat), and boss 650:7598, 629:6613, 621:6326. PR: "feat: L8 scene and animation director".
```

Готово, коли:

- [ ] Раунд виглядає як бій: вихід, атака, удар, смерть, наступний ворог
- [ ] Бос з'являється на останніх воротах з трусом і пилом
- [ ] Skip завжди одразу веде до результату
- [ ] Немає порожніх кадрів і різких стрибків поз

## Рівень 9 — результати і попапи

Результат: кожен фінал раунду виглядає як у Figma. Після перемоги — банер Victory у зоні лічильника. Після поразки — Defeat. Після TAKE — модалка Cashed out. Після боса — MAX WIN з Lottie-променями і монетами. Сума і кнопки в усіх попапах — HTML.

```text
Level 9 (branch feature/l9-results). Read CLAUDE.md, docs/lottie.md, docs/game-rules.md.

Build result UI in prototype/src/ui/results/. First inspect section 474:2007 (frames 474:2008 victory L3->4, 474:2089 defeat, 474:2175 cashed out, 474:2256 new round), 380:5467 / 380:5864 (simple enemy victory/defeat), 629:6879 / 640:7126 (boss victory/defeat) and 660:5112 (BOSS FINAL max win). Follow exactly which element each frame shows.

1. ResultBanner: Popup/Result 337:3924, Type=Victory / Defeat, 800x120 in the Counter/Win zone. Per note 337:3925: replaces Counter/Win for ~1.5 s with a 150 ms crossfade; Victory amount counts 0 -> +amount in 0.6 s ease-out, then xold -> xnew; Defeat shows at once with a 200 ms shake, no coins.
2. RoundEndModal: Popup/Round end 475:2904 (Type=Cashed out 474:1921, Type=Defeat 475:2905) over Overlay/Modal scrim 475:2895, with Popup/Actions 479:3045 (NEW ROUND + bet, MENU). Cashed out plays popup_cashed_out.json behind the panel (it already contains the panel art without the amount): the amount and buttons are HTML positioned on top at the panel coordinates (460,250 1000x540 on the stage). Use whatever the Figma frames show for Defeat (banner only vs. modal).
3. MaxWinModal: popup_maxwin.json - play marker "intro" once then loop marker "loop"; HTML amount (+X.XX, count-up 0.8 s) and "xN · bet B" line, Popup/Actions below, as in 660:5112. Triggered by MAX_WIN.
4. NEW ROUND -> SETUP with the same bet and difficulty (frame 474:2256). MENU -> opens the menu (Level 10; for now go to SETUP).
5. Balance in the HUD updates at the moment the payout is shown (count-up 400 ms).
6. Focus: Enter/Space triggers NEW ROUND inside modals; focus is trapped in the modal; Esc does nothing (a round result must be acknowledged).

PR: "feat: L9 results and round-end popups".
```

Готово, коли:

- [ ] Усі чотири фінали (Victory-банер, Defeat, Cashed out, MAX WIN) збігаються з кадрами Figma
- [ ] Сума в попапі = сума, що додалася до балансу
- [ ] NEW ROUND повертає до Setup із тією ж ставкою

## Рівень 10 — правила, меню і повний цикл

Результат: гра самодостатня для людини, яка бачить її вперше. Є правила, меню з кількома налаштуваннями, стан «недостатньо балансу», і раунд проходиться від першого ворога до боса без дебагу. Текст правил беремо зі старого прототипу, перекладаємо англійською і позначаємо як чернетку.

Модалки беремо з кадрів лобі лише як візуальний зразок (саме лобі не робимо): L2 How to play `555:4908`, L3 Settings `555:5065`, L4 недостатньо балансу `555:5220`.

```text
Level 10 (branch feature/l10-full-loop). Read CLAUDE.md and docs/game-rules.md.

1. RulesModal (opened from the Rules medallion): visual reference L2 "How to play" 555:4908 and Panel/Header 554:4743. Content (English, mark as DRAFT - pending client in a comment and in docs/open-questions.md), adapted from the old prototype to our rules:
   - Your knight fights enemies one by one. Each win moves you to the next gate and raises the multiplier.
   - FIGHT: take the next fight. If you lose, you lose your bet.
   - TAKE: end the round and collect AT RISK (bet x current multiplier).
   - NEXT shows the next multiplier, IF WON what you get if you win the next fight.
   - Difficulty changes the win chance and how fast the multiplier grows.
   - The last gate is the boss. Beat it to get the MAX WIN; the round ends automatically.
2. MenuModal (Menu medallion): reference L3 Settings 555:5065, Toggle 554:4742. Items: "Skip animations" (toggle -> global reduce-motion flag from Level 8), "Rules", "Reset demo balance" (back to startingBalance), "Close". Menu is disabled during animation states.
3. Insufficient balance: reference L4 555:5220. In SETUP when balance < min bet show that state with a "Reset demo balance" action.
4. Full loop check: play complete rounds on every difficulty until the boss, with ?seed= values that produce: early defeat, cash out at level 3, boss win. Save these seeds in docs/demo-seeds.md with what each one shows (useful for presenting to the client).
5. Hide the debug panel unless ?debug=1 is in the URL.

PR: "feat: L10 rules, menu and full round loop".
```

Готово, коли:

- [ ] Людина без пояснень розуміє гру з Rules
- [ ] Є три демо-seed: поразка, забрав на 3-му рівні, перемога над босом
- [ ] Без `?debug=1` дебаг-панелі не видно

## Рівень 11 — QA проти макетів і демо

Результат: продакшн-посилання на Vercel, яке можна сміливо відправити Артему, і тег `v0.1`. До нього додається автоматичне порівняння екранів із Figma. Це фінальний проєкт курсу на живому проєкті: специфікація → агент → рев'ю.

```text
Level 11 (branch feature/l11-qa). Read CLAUDE.md, docs/game-rules.md, docs/demo-seeds.md.

1. Visual QA script (prototype/scripts/visual-qa.mjs, Playwright as a devDependency): opens the app at 1920x1080 with each demo seed and ?debug=1, drives it to these states and screenshots them: SETUP, DECISION level 1..5, hero attacks, enemy attacks, victory banner, defeat, cashed out, boss entrance, boss final MAX WIN. Pair every state with its Figma frame (get_screenshot: 587:5125, 472:7862, 473:1037, 473:1127, 473:1217, 473:1307, 457:7257, 456:7095, 474:2008, 474:2089, 474:2175, 650:7598, 660:5112) and write docs/qa/report.html: Figma left, app right, and a pixel-diff overlay. Animated frames will differ slightly; judge layout, UI and numbers.
2. Fix every UI mismatch you find (position, size, font, color, missing element). List what you deliberately left different and why in decisions.md.
3. Money consistency checks (automated in the same script): balance before - bet + payout = balance after; AT RISK in the dock = WIN in Counter/Win = TAKE amount = Cashed out popup amount; IF WON = amount on FIGHT; all amounts have 2 decimals.
4. Manual checklist in docs/qa/checklist.md: Chrome, Safari, Firefox on macOS; window sizes 1280x720, 1440x900, 1920x1080, 2560x1440; keyboard-only round; Skip during every animation; double-click spam on FIGHT/TAKE cannot break state; refresh mid-round returns to SETUP cleanly.
5. Performance: lazy-load Lottie JSON per round, no long tasks > 100 ms during a fight in the Chrome performance panel; log numbers.
6. Write README-demo.md for the client: link, how to play in 3 lines, demo seeds with links, what is placeholder (game numbers, rules text), what is not in v0.1 (sound, mobile, lobby, extra enemies).
7. After merge: production deploy on Vercel, git tag v0.1 with a short release note.

PR: "chore: L11 QA, polish and v0.1 demo".
```

Готово, коли:

- [ ] `docs/qa/report.html` показує всі ключові стани поруч з Figma, суттєвих розбіжностей немає
- [ ] Перевірки сум проходять
- [ ] Продакшн-посилання і `README-demo.md` готові для Артема

## Бонус — Storybook + Chromatic, Style Dictionary

Після `v0.1`, для практики з курсу (лекції 06 і 07). Демо ці рівні не блокують. Користь: публічний Storybook для Артема і токени в форматі W3C, які легко перенести в його стек.

```text
Bonus A (branch feature/bonus-storybook). Read CLAUDE.md.
Add Storybook (React + Vite) inside prototype/. Write stories for every component in src/ui (one story per Figma variant/state, args mirroring the component props), plus MDX docs pages for CtaButton and Dock with a link to the Figma node. Load tokens.css and fonts in .storybook/preview. Publish to Chromatic (I will provide the project token as CHROMATIC_PROJECT_TOKEN in GitHub secrets) and add a GitHub Action that runs Chromatic on every PR. Remove the Components section from /kit only after Storybook covers everything.
```

```text
Bonus B (branch feature/bonus-style-dictionary). Read CLAUDE.md.
Export the Figma variables used in tokens.css to tokens/tokens.json in W3C DTCG format (use the Figma MCP get_variable_defs). Add Style Dictionary to generate prototype/src/styles/tokens.css from it with an npm script "tokens". The generated file must be identical in meaning to the current hand-written one; diff and explain any change. Document the pipeline Figma -> tokens.json -> CSS in docs/tokens.md.
```

## Відкриті питання до Артема

Поки відповідей немає, у коді стоять заглушки (`config.js`, позначка `PLACEHOLDER`). Відповідь записуємо в `docs/decisions.md` і міняємо лише конфіг.

- [ ] Фінальний бос = автоматичний максимальний виграш, після нього раунд закінчується. Скільки рівнів у раунді, який максимальний множник для кожної складності, і де стоїть другий бос: проміжний рівень чи фінал іншої складності?
- [ ] Множники на кожних воротах і шанс перемоги за складністю (зараз 80 / 65 / 45 % зі старого прототипу).
- [ ] Ставки: мінімум, максимум, номінали фішок, стартовий демо-баланс.
- [ ] Текст правил (зараз чернетка зі старого прототипу).
- [ ] Після v0.1: звуки, мобільний ландшафт, звичайні вовки і другий бос — чи потрібні для наступного показу?

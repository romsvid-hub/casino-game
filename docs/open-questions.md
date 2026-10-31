## Відкриті питання до Артема

Поки відповідей немає, у коді стоять заглушки (`config.js`, позначка `PLACEHOLDER`). Відповідь записуємо в `docs/decisions.md` і міняємо лише конфіг.

- [ ] Фінальний бос = автоматичний максимальний виграш, після нього раунд закінчується. Скільки рівнів у раунді, який максимальний множник для кожної складності, і де стоїть другий бос: проміжний рівень чи фінал іншої складності?
- [ ] Множники на кожних воротах і шанс перемоги за складністю (зараз 80 / 65 / 45 % зі старого прототипу).
- [ ] Ставки: мінімум, максимум, номінали фішок, стартовий демо-баланс.
- [ ] Текст правил (зараз чернетка зі старого прототипу).
- [ ] Після v0.1: звуки, мобільний ландшафт, звичайні вовки і другий бос — чи потрібні для наступного показу?
- [ ] Number font: the CTA / Fight and Counter/Win component descriptions say "Spectral SemiBold, tabular figures", but every number in the design is set in Kurale (which has no tabular figures). Which one is final?
- [ ] Gates per round: Figma level frames show 7 multipliers (boss = ×19.00), but the boss-final frame 660:5112 labels them "Gate 4…9". Is it 7 gates or 9?
- [ ] Max bet: what value should the "MAX" chip use (prototype assumes 20, capped by balance)?
- [ ] Rules / Menu during a round: Figma shows the medallions only on the setup screen. Should players be able to open Rules or the menu mid-round?
- [x] Setup screen: Figma shows the knight already standing there, but the round start plays his entrance from the left. Keep both (he walks back in), or show no knight on setup? **Resolved (PR #12):** no knight on the start screen, the totem is the focus; the hero walks in after PLAY.
- [ ] Rules text (DRAFT): the "How to play" modal uses six lines adapted from the old prototype to our rules (`src/ui/modals/RulesModal.jsx`). Please confirm or replace them, and tell us whether to show an RTP figure (the Figma lobby frame shows "[96.00%]" as a placeholder).
- [ ] Subtitle under "SLAVIC FOREST": Figma 587:5180 has "Lorem ipsum"; the prototype shows "A cash-out battle in the Slavic forest". What is the final line?
- [ ] Final game name: "Slavic Forest" (start-screen title in Figma) or "Battle of Multipliers" (README, release, repo description)?
- [ ] Boss / MAX WIN signalling: Figma has no dedicated state for "this is the last fight". Our proposal (L12 review fixes): the boss gate is always on the path (locked Final marker with the fights left, lit Final gate on the boss level), a "FINAL BATTLE · MAX WIN ×19.00" banner before the boss enters, the plain "×19.00" multiplier over the boss (as in Figma), and the dock reads "MAX WIN" / "max win 95.00" with FIGHT highlighted. Please confirm or send a design.

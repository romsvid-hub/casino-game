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
- [ ] Boss / MAX WIN signalling — **to confirm with Artem.** Since 04.11 MAX WIN exists only on gate 7 (Baba Yaga); gate 6 (vovkulak boss) is a normal win. In the prototype only Baba Yaga gets the "FINAL BATTLE · MAX WIN ×19.00" banner before she enters, and on her gate the dock reads "MAX WIN" / "max win 95.00" with FIGHT highlighted. Figma 748:6069 still shows "IF WON" and FIGHT "risk 57.50" there. Keep the MAX WIN labels for her, or follow the frame?
- [x] Gate 6 vovkulak boss: should it get a "boss" signal of its own? **Resolved (Roman, 07.11):** yes, like the old boss, a bit brighter: "BOSS BATTLE · ×11.50" banner before it enters, FIGHT highlighted, landing dust and shake. No MAX WIN wording (it is a normal win).
- [ ] Dock FIGHT sub-label: Figma reference frames 756:6778 / 756:6539 / 748:6069 show "risk 12.00" (= AT RISK), the prototype shows "up to 19.50" (= IF WON). Which one? (Handled in block F.)


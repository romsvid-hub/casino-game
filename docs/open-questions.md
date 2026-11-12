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
- [ ] Next enemy entrance (block C+B): with sprites the next vovkulak slides in from the right and fades in (500 ms); the old Lottie had a jump-in. Is a slide-in fine until there is entrance art? — *to confirm with Roman*
- [ ] Dead pose timing: the body darkens at the blow, then fades out from 0.9 s to 1.8 s (placeholder for the ash FX). OK as a stand-in? — *to confirm with Roman*
- [ ] Baba Yaga entrance: she slides in from the right with her Idle pose (as briefed, "walk-in uses Idle"), plus the boss landing dust and shake. Should she fly in on the mortar instead (splash art), or no landing shake for her? — *to confirm with Roman*
- [ ] Lobby 885:10856 has no balance and no Rules/Menu buttons. The prototype follows the frame, so the player does not see the balance while choosing a bet. Keep it? — *to confirm with Roman*
- [ ] Lobby facts (RTP 96.00%, BET range, MAX MULTIPLIER): the frame shows them in brackets as placeholders and BET up to 10.00, config has max bet 20. — *to confirm with Artem*

### From the 11.11 sync (don't decide here)
- [ ] CHANCE 65 % in the lobby dock: the chance of one fight or of the whole round? The label may change once Artem sends the math. The prototype shows the per-fight win chance from `config.js`. — *to confirm with Artem*
- [ ] Light orb on Baba Yaga: Figma 11.11 places `FX/Light orb` on her Idle, Hit, Attack and Victory poses, but the brief says "Baba Yaga has no orb: her light is the cage". The prototype follows Figma. Keep it or remove it? Figma's entrance frame 843:6370 also has a 64 px orb inside the cage. — *to confirm with Roman*
- [ ] Yaga entrance: walks in from the right (now) or flies in by mortar. — *to confirm with Roman*
- [ ] How the next enemy appears after a win (now: slides in from the right). — *to confirm with Roman*
- [ ] TAKE outcome scene (idea, not briefed): the knight returns and the village lights up in proportion to the gates passed. — *Roman*
- [ ] Ash animation for the caged knight: still darken + fade. — *Roman will brief*
- [ ] Sound: postponed to the very end (client, 09.11). None added.
- [ ] Counter/Win size: the 11.11 Yaga frames draw WIN smaller than the prototype's Number XL. Not in the brief, left as is. — *to confirm with Roman*

### Character rig (12.11)
- [ ] Five poses stay one flat part, because Figma's API serves their part images as empty placeholders: Vovkulak Victory, Vovkulak Boss Hit, Attack, Dead, Victory. They still get whole-body motion (breathing, jolt, raise). Re-export once Figma serves them, or check those layers in the file. — *Roman*
- [ ] Merged parts (one image for several limbs): knight Dead and Caged; Vovkulak and Boss Dead; Vovkulak Hit and Boss Hit `таз та ноги`; Yaga Attack `Руки з мітлою`, Hit `ноги таз`, Dead body. The cage is drawn on Yaga's arm (`права рука з кліткою`), so the pendulum swings the arm from the shoulder, not the cage from the hand. — *Roman*
- [ ] Missing joints: hero Walk has one arm (`arm`) plus the shield; hero Attack has no torso (head and the sword arm hang on the hips); hero Idle has no left lower leg (only `thigh L`). — *Roman*
- [ ] Pivots I am unsure of (no overlap with the parent, set at the nearest edge): hero Idle `cape front`, hero Attack `head`, hero Hit `head` and `shield shards`, Vovkulak Attack `arm L`. Check with `?rig=1`; Figma `pivot / <part>` markers override them. — *Roman*
- [ ] Walk back home after a win: Figma has no mirrored walk pose, so the knight steps back while facing right. Mirror him, or keep it? — *Roman*

### Splash and lobby (12.11)
- [ ] Knight's hover emotion: PLAY hover only lifts the knight 3 px into a warm light. A `Hero — емоція 1` layer would go in the same slot. — *Roman*
- [ ] Should the crowd's emotion sequence repeat later in the lobby, or stay once per intro? — *Roman*
- [ ] Lobby village: Figma's lobby 885:10856 shows lit windows, but after the theft the story leaves the village dark. The prototype keeps it dark (and on return visits too). Keep it dark? — *Roman*
- [ ] Hidden layers come from the source art, not Figma's API (it does not serve hidden layers): the lit village is the lobby's `будівлі` layer moved to the splash position, the six crowd emotions come from `Assets_illustrations/Натовп`. The middle villager has no separate body file there; his Figma body is used. — *Roman*
- [ ] SKIP becomes PLAY by a crossfade in place (SKIP 308 px, PLAY 364 px wide), not by morphing one plate. — *Roman*

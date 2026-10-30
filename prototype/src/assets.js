// Asset manifest: every raster skin and Lottie file the app can load.
// Raster skins are the original (transparent) source images behind the nodes in
// Figma section 292:3771; w/h are their natural pixel sizes. Components scale them
// down to the size used in the UI Kit (e.g. hud_balance_L 258x168 -> 129x84 in HUD/Balance).
// CTA skins come from the CTA / Fight 347:4215 and CTA / Take 347:4245 image fills.

const ui = (file, w, h, figma) => ({ src: `/assets/ui/${file}`, w, h, figma })
const lottie = (name, duration, mode) => ({ src: `/lottie/${name}.json`, duration, mode })

export const assets = {
  hud: {
    balanceL: ui('hud-balance-l.png', 258, 168, 'asset/hud_balance_L'),
    balanceC: ui('hud-balance-c.png', 298, 168, 'asset/hud_balance_C'),
    balanceR: ui('hud-balance-r.png', 78, 168, 'asset/hud_balance_R'),
    medalSound: ui('hud-medal-sound.png', 140, 149, 'asset/hud_medal_sound'),
    medalEmpty: ui('hud-medal-empty.png', 140, 152, 'asset/hud_medal_empty'),
  },

  cta: {
    // Used by the CTA components in Figma (3-slice of one image, 308x120 on stage).
    skinFightDefault: ui('cta/skin-fight-default.png', 616, 240, 'CTA / Fight · Default, Pressed'),
    skinFightHover: ui('cta/skin-fight-hover.png', 616, 240, 'CTA / Fight · Hover, Highlight, Play'),
    skinFightDisabled: ui('cta/skin-fight-disabled.png', 616, 240, 'CTA / Fight · Disabled'),
    skinTake: ui('cta/skin-take.png', 616, 240, 'CTA / Take · all states'),
    // Older full-plate renders from _ui-kit-cta (with glow margin), kept for reference.
    fightDefault: ui('cta/fight-default.webp', 708, 276, '_ui-kit-cta'),
    fightHover: ui('cta/fight-hover.webp', 708, 276, '_ui-kit-cta'),
    fightDisabled: ui('cta/fight-disabled.webp', 708, 276, '_ui-kit-cta'),
    takeDefault: ui('cta/take-default.webp', 708, 276, '_ui-kit-cta'),
    takeHover: ui('cta/take-hover.webp', 708, 276, '_ui-kit-cta'),
    takeDisabled: ui('cta/take-disabled.webp', 708, 276, '_ui-kit-cta'),
    // Legacy button 3-slice from the raster section.
    btnL: ui('btn-l.png', 160, 243, 'asset/btn_L'),
    btnC: ui('btn-c.png', 200, 243, 'asset/btn_C'),
  },

  dock: {
    left: ui('dock-l.png', 135, 230, 'asset/dock_L'),
    tile: ui('dock-tile.png', 69, 230, 'asset/dock_tile'),
    divider: ui('dock-div.png', 41, 230, 'asset/dock_div'),
    gem: ui('dock-gem.png', 172, 230, 'asset/dock_gem'),
  },

  gates: {
    passed: ui('gate-passed.png', 176, 176, 'asset/gate_passed'),
    current: ui('gate-current.png', 176, 176, 'asset/gate_current'),
    next: ui('gate-next.png', 176, 176, 'asset/gate_next'),
    locked: ui('gate-locked.png', 176, 176, 'asset/gate_locked'),
    final: ui('gate-final.png', 176, 176, 'asset/gate_final'),
    chain: ui('chain.png', 81, 52, 'asset/chain'),
    tag: ui('tag.png', 130, 60, 'asset/tag'),
  },

  popups: {
    alertVictory: ui('alert-victory.png', 459, 233, 'asset/alert_victory'),
    victory: ui('pop-victory.png', 440, 208, 'asset/pop_victory'),
    defeat: ui('pop-defeat.png', 440, 229, 'asset/pop_defeat'),
  },

  sides: {
    // Skin/Side 540:2099: Towel uses the dock_L image, Plain uses side_plain.
    towel: ui('dock-l.png', 135, 230, 'asset/dock_L'),
    plain: ui('side-plain.png', 156, 504, 'asset/side_plain'),
  },

  icons: {
    swords: ui('icon-swords.png', 88, 85, 'asset/icon_swords'),
    bag: ui('icon-bag.png', 88, 89, 'asset/icon_bag'),
  },

  // Vector parts of UI Kit components (exported as SVG from Figma).
  vectors: {
    arrowUp: {
      default: ui('svg/arrow-up-default.svg', 32, 24, 'Stepper/Arrow Up · Default'),
      hover: ui('svg/arrow-up-hover.svg', 32, 24.75, 'Stepper/Arrow Up · Hover'),
      pressed: ui('svg/arrow-up-pressed.svg', 32, 24, 'Stepper/Arrow Up · Pressed'),
      disabled: ui('svg/arrow-up-disabled.svg', 32, 24, 'Stepper/Arrow Up · Disabled'),
    },
    arrowDown: {
      default: ui('svg/arrow-down-default.svg', 32, 24, 'Stepper/Arrow Down · Default'),
      hover: ui('svg/arrow-down-hover.svg', 32, 24.75, 'Stepper/Arrow Down · Hover'),
      pressed: ui('svg/arrow-down-pressed.svg', 32, 24, 'Stepper/Arrow Down · Pressed'),
      disabled: ui('svg/arrow-down-disabled.svg', 32, 24, 'Stepper/Arrow Down · Disabled'),
    },
    skipIcon: ui('svg/skip-icon.svg', 34.26, 25.95, 'CTA / Skip · icon'),
    skipIconHover: ui('svg/skip-icon-hover.svg', 52.46, 44.15, 'CTA / Skip · icon hover'),
    skipGlow: ui('svg/skip-glow.svg', 111.8, 129.75, 'CTA / Skip · fx/glow'),
    skipRim: ui('svg/skip-rim.svg', 78, 78, 'CTA / Skip · fx/rim'),
    pips: {
      easy: ui('svg/pips-easy.svg', 32, 8, 'Segment/Difficulty · risk Easy'),
      medium: ui('svg/pips-medium.svg', 32, 8, 'Segment/Difficulty · risk Medium'),
      high: ui('svg/pips-high.svg', 32, 8, 'Segment/Difficulty · risk High'),
      disabled: ui('svg/pips-disabled.svg', 32, 8, 'Segment/Difficulty · risk Disabled'),
    },
    badgePips: {
      easy: ui('svg/badge-pips-easy.svg', 33, 9, 'Badge/Mode · risk Easy'),
      medium: ui('svg/badge-pips-medium.svg', 33, 9, 'Badge/Mode · risk Medium'),
      high: ui('svg/badge-pips-high.svg', 33, 9, 'Badge/Mode · risk High'),
    },
  },

  // 1920x1080, transparent, 30 fps. Durations and modes from docs/lottie.md.
  lottie: {
    bgScene: lottie('bg_scene', 12, 'loop'),
    focusHero: lottie('fx_focus_hero', 3, 'loop'),
    focusEnemy: lottie('fx_focus_enemy', 3, 'loop'),
    focusClash: lottie('fx_focus_clash', 3, 'loop'),
    heroEnter: lottie('hero_01_enter', 2.2, 'once'),
    heroIdle: lottie('hero_02_idle', 2.4, 'loop'),
    heroAttack: lottie('hero_03_attack', 0.9, 'once'),
    heroHit: lottie('hero_04_hit', 0.6, 'once'),
    heroDead: lottie('hero_05_dead', 1.33, 'once'),
    heroVictory: lottie('hero_06_victory', 2.4, 'loop'),
    enemyEnter: lottie('enemy_01_enter', 1.5, 'once'),
    enemyIdle: lottie('enemy_02_idle', 2.4, 'loop'),
    enemyHit: lottie('enemy_03_hit', 0.6, 'once'),
    enemyAttack: lottie('enemy_04_attack', 0.9, 'once'),
    enemyDead: lottie('enemy_05_dead', 1.33, 'once'),
    enemyVictory: lottie('enemy_06_victory', 2.4, 'loop'),
    bossEnter: lottie('boss_01_enter', 1.8, 'once'),
    bossLandShake: lottie('fx_boss_land_shake', 1.8, 'once'),
    bossIdle: lottie('boss_02_idle', 3, 'loop'),
    bossHit: lottie('boss_03_hit', 0.6, 'once'),
    bossAttack: lottie('boss_04_attack', 1, 'once'),
    bossVictory: lottie('boss_05_victory', 2.4, 'loop'),
    bossDead: lottie('boss_06_dead', 1.33, 'once'),
    popupMaxWin: lottie('popup_maxwin', 3, 'markers: intro, loop'),
    popupCashedOut: lottie('popup_cashed_out', 0.5, 'once, hold last frame'),
  },
}

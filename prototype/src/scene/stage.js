// Scene layout on the 1920x1080 stage, from the Figma reference battle frames
// (L3 forest 756:6778, L6 field 756:6539, L7 hut 748:6069) and changelog item 32.
// Positions are layout, not game numbers, so they live here and not in game/config.js.
import { HOME, STEP } from '../game/fightScript.js'
import { MOVE_EASE } from './motion.js'

export { HOME, STEP }
// Every character stands on its shadow centre; all shadows sit on one line.
export const SHADOW_Y = 750

// Plate/Multiplier top-left per enemy: it sits over that enemy's head (756:6778, 756:6539, 843:6410).
export const PLATE_POS = {
  vovkulak: { x: 1193, y: 360 },
  vovkulakBoss: { x: 1201, y: 327 },
  babaYaga: { x: 1247, y: 276 },
}

// Location of each enemy's gate: forest (L1–5), open field (L6), hut (L7).
export const SCENE_OF = { vovkulak: 'forest', vovkulakBoss: 'field', babaYaga: 'hut' }

// Sprite set per enemy kind.
export const ENEMY_SPRITES = { vovkulak: 'vovkulak', vovkulakBoss: 'vovkulakBoss', babaYaga: 'babaYaga' }

// Stage moves (CSS transitions), easings from scene/motion.js (block E, 12.11).
export const MOVE = {
  step: { ms: 200, ease: MOVE_EASE.step }, // attacker steps forward
  back: { ms: 250, ease: MOVE_EASE.back }, // attacker returns home after a blow
  home: { ms: 300, ease: MOVE_EASE.home }, // winner walks back home between levels
  walkIn: { ms: 1300, ease: MOVE_EASE.walkIn }, // knight walks in from the left at round start (walk cycle in scene/motions.js)
  enemyIn: { ms: 500, ease: MOVE_EASE.enemyIn }, // next enemy slides in from the right
}
export const WALK_IN_FROM = -260
export const ENEMY_IN_FROM = HOME.enemy + 260

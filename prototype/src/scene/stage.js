// Scene layout on the 1920x1080 stage, from the Figma reference battle frames
// (L3 forest 756:6778, L6 field 756:6539, L7 hut 748:6069) and changelog item 32.
// Positions are layout, not game numbers, so they live here and not in game/config.js.
import { HOME, STEP } from '../game/fightScript.js'

export { HOME, STEP }
// Every character stands on its shadow centre; all shadows sit on one line.
export const SHADOW_Y = 750

// Plate/Multiplier top-left per enemy: it sits over that enemy's head (Figma 05.11).
export const PLATE_POS = {
  vovkulak: { x: 1193, y: 360 },
  vovkulakBoss: { x: 1201, y: 327 },
  babaYaga: { x: 1247, y: 306 },
}

// Location of each enemy's gate: forest (L1–5), open field (L6), hut (L7).
export const SCENE_OF = { vovkulak: 'forest', vovkulakBoss: 'field', babaYaga: 'hut' }

// Hero rim light on the upper body, coloured by the scene light (changelog item 23,
// group "rim light (upper body)": 2 px drop shadow). Colours are tokens.
export const RIM = {
  forest: { color: 'var(--color-rim-forest)', x: -3, y: -3 },
  field: { color: 'var(--color-rim-field)', x: 3, y: -3 },
  hut: { color: 'var(--color-rim-hut)', x: 4, y: -2 },
}

// Sprite set per enemy kind.
export const ENEMY_SPRITES = { vovkulak: 'vovkulak', vovkulakBoss: 'vovkulakBoss', babaYaga: 'babaYaga' }

// Motion (CSS transitions). Only the minimal motion for now (07.11 brief).
export const MOVE = {
  step: { ms: 200, ease: 'ease-out' }, // attacker steps forward
  back: { ms: 250, ease: 'ease-in-out' }, // attacker returns home after a blow
  home: { ms: 300, ease: 'ease-in-out' }, // winner walks back home between levels
  walkIn: { ms: 1300, ease: 'linear' }, // knight walks in from the left at round start
  enemyIn: { ms: 500, ease: 'ease-out' }, // next enemy slides in from the right
}
export const WALK_IN_FROM = -260
export const ENEMY_IN_FROM = HOME.enemy + 260

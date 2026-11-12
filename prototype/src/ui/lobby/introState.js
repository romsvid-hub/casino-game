// When the intro splash and the rules card show (12.11 splash brief).
// - The splash plays once per browser session; `?intro=1` forces it (and the rules
//   card) on every load for client demos, `?intro=0` turns it off (tests).
// - The rules card shows on the first lobby entry; afterwards it waits behind "?".
// Storage can be unavailable (private mode), so every access is guarded.
const KEY_SPLASH = 'witchbound.splashSeen'
const KEY_RULES = 'witchbound.rulesSeen'

const param = () => (typeof window === 'undefined' ? null : new URLSearchParams(window.location.search).get('intro'))

function read(key) {
  try {
    return window.sessionStorage.getItem(key) === '1'
  } catch {
    return false
  }
}
function write(key) {
  try {
    window.sessionStorage.setItem(key, '1')
  } catch {
    // ignore
  }
}

const go = () => (typeof window === 'undefined' ? null : new URLSearchParams(window.location.search).get('go'))
const rules = () => (typeof window === 'undefined' ? null : new URLSearchParams(window.location.search).get('rules'))

export function shouldPlayIntro() {
  if (go()) return false // review links open straight at their moment
  const p = param()
  if (p === '1') return true
  if (p === '0') return false
  return !read(KEY_SPLASH)
}
export const markIntroSeen = () => write(KEY_SPLASH)

export function shouldShowRules() {
  if (rules() === '0') return false
  if (rules() === '1') return true
  const p = param()
  if (p === '1' || p === '0') return true
  return !read(KEY_RULES)
}
export const markRulesSeen = () => write(KEY_RULES)

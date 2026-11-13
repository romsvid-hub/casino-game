// When the intro splash shows (12.11 splash brief): once per browser session;
// `?intro=1` forces it on every load for client demos, `?intro=0` turns it off (tests).
// The rules card is always part of the lobby (review 12.11).
// Storage can be unavailable (private mode), so every access is guarded.
const KEY_SPLASH = 'witchbound.splashSeen'

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

export function shouldPlayIntro() {
  if (go()) return false // review links open straight at their moment
  const p = param()
  if (p === '1') return true
  if (p === '0') return false
  return !read(KEY_SPLASH)
}
export const markIntroSeen = () => write(KEY_SPLASH)


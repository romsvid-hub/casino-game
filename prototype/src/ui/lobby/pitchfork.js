// The right villager pumps his pitchfork (13.11 brief, layer 885:10923): two beats
// up and down with a small tilt, then a 0.6 s rest; each loop is ±10 % longer or
// shorter so it never looks mechanical. Web Animations on `transform` only; paused
// on a hidden tab; nothing under reduced motion (the caller checks).
const BEAT_MS = 1100
const REST_MS = 600

const beat = (from, to) => [
  { offset: from, transform: 'translateY(0) rotate(0deg)', easing: 'ease-in-out' },
  { offset: from + (to - from) * 0.4, transform: 'translateY(-16px) rotate(-4deg)', easing: 'ease-in-out' },
  { offset: from + (to - from) * 0.75, transform: 'translateY(4px) rotate(2deg)', easing: 'ease-in-out' },
]
// Two beats, then the rest (held at 0) inside one keyframe list.
function frames(total) {
  const b = (BEAT_MS / total)
  return [...beat(0, b), ...beat(b, 2 * b), { offset: 2 * b, transform: 'translateY(0) rotate(0deg)' }, { offset: 1, transform: 'translateY(0) rotate(0deg)' }]
}

export function startPitchfork(el, random = Math.random) {
  if (!el) return () => {}
  let anim = null
  let stopped = false
  const loop = () => {
    if (stopped) return
    const k = 0.9 + random() * 0.2
    const total = (2 * BEAT_MS + REST_MS) * k
    anim = el.animate(frames(2 * BEAT_MS + REST_MS), { duration: total, easing: 'linear' })
    anim.onfinish = loop
  }
  const onVis = () => (document.hidden ? anim?.pause() : anim?.play())
  document.addEventListener('visibilitychange', onVis)
  loop()
  return () => {
    stopped = true
    document.removeEventListener('visibilitychange', onVis)
    anim?.cancel()
  }
}

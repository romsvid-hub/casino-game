import { useEffect, useEffectEvent, useRef, useState } from 'react'
import LottieLayer from './LottieLayer.jsx'

const CROSSFADE_MS = 70
let nextId = 0

// One character / FX slot on the stage. Plays a "cue":
//   { key, src, loop, delay?, then?, playDelay? }
// A new cue key mounts a second layer on top (A/B), fades it in over 70 ms once
// its first frame is ready, then drops the old layer, which hides pose jumps
// between files. A finished one-shot cue continues with `cue.then` if given,
// otherwise it holds its last frame. `playDelay` holds the first frame before
// playing (see LottieLayer). A null cue fades the slot out.
export default function ClipSlot({ cue, className = '' }) {
  const [layers, setLayers] = useState([]) // [{ id, cue, shown }]
  const headKey = useRef(null) // key of the cue currently at the top of the slot
  const pending = useRef(null)
  const drop = useRef(null)

  const push = (c) => {
    headKey.current = c.key
    setLayers((ls) => [...ls, { id: ++nextId, cue: c, shown: false }])
  }

  // Cue objects are rebuilt every render; the key (and playDelay) identify the cue.
  // Every change is applied from a timer (0 ms unless the cue has a delay), so the
  // slot never sets state synchronously inside the effect.
  const onCue = useEffectEvent(() => {
    clearTimeout(pending.current)
    const apply = () => {
      if (!cue) {
        headKey.current = null
        setLayers((ls) => ls.map((l) => ({ ...l, shown: false })))
        pending.current = setTimeout(() => setLayers([]), CROSSFADE_MS + 20)
      } else if (cue.key === headKey.current) {
        // Same clip, new options (e.g. a held body now told when to turn to ash).
        setLayers((ls) => ls.map((l) => (l.cue.key === cue.key ? { ...l, cue: { ...l.cue, playDelay: cue.playDelay } } : l)))
      } else push(cue)
    }
    pending.current = setTimeout(apply, cue?.delay ?? 0)
  })
  useEffect(() => onCue(), [cue?.key, cue?.playDelay])

  useEffect(
    () => () => {
      clearTimeout(pending.current)
      clearTimeout(drop.current)
    },
    [],
  )

  const onReady = (id) => {
    setLayers((ls) => ls.map((l) => (l.id === id ? { ...l, shown: true } : l)))
    clearTimeout(drop.current)
    drop.current = setTimeout(() => setLayers((ls) => ls.filter((l) => l.id >= id)), CROSSFADE_MS + 20)
  }

  const onComplete = (layer) => {
    if (layer.cue.then && headKey.current === layer.cue.key) push(layer.cue.then)
  }

  return (
    <div className={`pointer-events-none absolute inset-0 ${className}`}>
      {layers.map((layer) => (
        <div
          key={layer.id}
          className="absolute inset-0"
          style={{ opacity: layer.shown ? 1 : 0, transition: `opacity ${CROSSFADE_MS}ms linear` }}
        >
          <LottieLayer
            src={layer.cue.src}
            loop={layer.cue.loop}
            playDelay={layer.cue.playDelay}
            onReady={() => onReady(layer.id)}
            onComplete={() => onComplete(layer)}
          />
        </div>
      ))}
    </div>
  )
}

import { useEffect, useRef, useState } from 'react'

const easeOut = (t) => 1 - (1 - t) ** 3

// Animates a displayed number towards `value` (ease-out). The first render
// shows the value directly; later changes count from the previous value.
export function useCountUp(value, duration = 400) {
  const [shown, setShown] = useState(value)
  const fromRef = useRef(value)

  useEffect(() => {
    const from = fromRef.current
    if (from === value || duration <= 0) {
      fromRef.current = value
      setShown(value)
      return
    }
    let frame
    const start = performance.now()
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration)
      const current = from + (value - from) * easeOut(t)
      fromRef.current = current
      setShown(current)
      if (t < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [value, duration])

  return shown
}

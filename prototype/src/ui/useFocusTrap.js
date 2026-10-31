import { useEffect, useRef } from 'react'

// Keeps keyboard focus inside a modal and focuses `initialRef` once on open.
// Esc calls `onEscape` if given; otherwise it is swallowed (result popups must
// be acknowledged with a button).
export function useFocusTrap(containerRef, initialRef, onEscape) {
  const onEscapeRef = useRef(onEscape)
  onEscapeRef.current = onEscape

  useEffect(() => {
    initialRef.current?.focus()
    const el = containerRef.current
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onEscapeRef.current?.()
        return
      }
      if (e.key !== 'Tab') return
      const focusable = [...el.querySelectorAll('button:not(:disabled), [href], input:not(:disabled)')]
      if (!focusable.length) return
      const i = focusable.indexOf(document.activeElement)
      const next = e.shiftKey ? (i <= 0 ? focusable.length - 1 : i - 1) : (i + 1) % focusable.length
      e.preventDefault()
      focusable[next].focus()
    }
    el.addEventListener('keydown', onKey)
    return () => el.removeEventListener('keydown', onKey)
  }, [containerRef, initialRef])
}

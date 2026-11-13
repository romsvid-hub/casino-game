import { useEffect, useState } from 'react'
import { config } from '../../game/config.js'
import { STATES } from '../../game/machine.js'

// Which result UI is visible: a banner in the counter zone, then (for round
// ends) the modal. Figma: VICTORY 474:2008 / 629:6879, DEFEAT banner 380:5864 →
// modal 474:2089, CASHED OUT 474:2175, boss victory banner → MAX WIN 660:5112.
export function useResultStage(phase) {
  const [modalReady, setModalReady] = useState(false)
  // A new phase starts with the banner again (reset during render, not in an effect).
  const [seenPhase, setSeenPhase] = useState(phase)
  if (seenPhase !== phase) {
    setSeenPhase(phase)
    setModalReady(false)
  }
  const bannerThenModal = phase === STATES.DEFEAT || phase === STATES.MAX_WIN

  useEffect(() => {
    if (!bannerThenModal) return
    const id = setTimeout(() => setModalReady(true), config.timings.resultBanner)
    return () => clearTimeout(id)
  }, [phase, bannerThenModal])

  const ready = modalReady && seenPhase === phase
  if (phase === STATES.WIN_BANNER) return 'banner'
  if (phase === STATES.CASHED_OUT) return 'modal'
  if (bannerThenModal) return ready ? 'modal' : 'banner'
  return null
}

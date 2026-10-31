import { lazy, Suspense, useEffect, useMemo, useState } from 'react'
import Stage from './stage/Stage.jsx'
import GuidesOverlay from './stage/GuidesOverlay.jsx'
import Scene, { useBossShake } from './scene/Scene.jsx'
import { prefersReducedMotion, useDirector } from './scene/director.js'
// /kit is a dev / review page: loaded on demand so it stays out of the game bundle.
const KitPage = lazy(() => import('./screens/KitPage.jsx'))
import { useGame } from './game/useGame.js'
import DebugPanel from './ui/DebugPanel.jsx'
import Hud from './ui/hud/Hud.jsx'
import Dock from './ui/dock/Dock.jsx'
import ResultsLayer, { useResultStage } from './ui/results/ResultsLayer.jsx'
import RulesModal from './ui/modals/RulesModal.jsx'
import MenuModal from './ui/modals/MenuModal.jsx'
import LowBalanceNotice from './ui/dock/LowBalanceNotice.jsx'
import { config } from './game/config.js'
import { STATES } from './game/machine.js'

function useHashRoute() {
  const [hash, setHash] = useState(window.location.hash)
  useEffect(() => {
    const onHash = () => setHash(window.location.hash)
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])
  return hash.replace(/^#\/?/, '')
}

export default function App() {
  const route = useHashRoute()

  if (route === 'kit')
    return (
      <Suspense fallback={null}>
        <KitPage />
      </Suspense>
    )

  return <Game />
}

// The debug panel is only rendered with ?debug=1 in the URL.
const DEBUG = new URLSearchParams(window.location.search).get('debug') === '1'
const SKIP_KEY = 'casino.skipAnimations'

// "Skip animations" (Menu): remembered per browser, defaults to the OS
// reduce-motion setting. Storage can be unavailable (private mode), so guard it.
function useSkipAnimations() {
  const [value, setValue] = useState(() => {
    try {
      const saved = window.localStorage.getItem(SKIP_KEY)
      if (saved != null) return saved === '1'
    } catch {
      // ignore
    }
    return prefersReducedMotion()
  })
  const update = (next) => {
    setValue(next)
    try {
      window.localStorage.setItem(SKIP_KEY, next ? '1' : '0')
    } catch {
      // ignore
    }
  }
  return [value, update]
}

function Game() {
  const [state, actions, derived] = useGame()
  const [autoBeats, setAutoBeats] = useState(true)
  const [skipAnimations, setSkipAnimations] = useSkipAnimations()
  const [modal, setModal] = useState(null) // null | 'rules' | 'menu'
  const scene = useDirector(state, actions, derived, { enabled: autoBeats, reduceMotion: skipAnimations })
  const shaking = useBossShake(state, scene)
  const resultStage = useResultStage(state.phase)
  // The HUD balance takes the payout only when the payout popup appears.
  const hudState = resultStage === 'modal' ? state : { ...state, balance: derived.balanceBeforePayout }
  // MENU on a round-end popup returns to setup and opens the menu there.
  const resultActions = useMemo(
    () => ({
      ...actions,
      menu: () => {
        actions.menu()
        setModal('menu')
      },
    }),
    [actions],
  )
  const showLowBalance = state.phase === STATES.SETUP && derived.belowMinBet && !modal

  // Test hook for scripts/visual-qa.mjs: only with ?debug=1.
  useEffect(() => {
    if (DEBUG) window.__casino = { state, derived, actions, resultStage, modal }
  })

  return (
    <>
      <Stage>
        {/* Whole stage content shakes when the boss lands. */}
        <div className={`absolute inset-0 ${shaking ? 'stage-shake' : ''}`}>
          <Scene scene={scene} state={state} gateCount={derived.gates.length} />
          <Hud
            state={hudState}
            derived={derived}
            onRules={() => setModal('rules')}
            onMenu={() => setModal('menu')}
          />
          <Dock state={state} actions={actions} derived={derived} keysEnabled={!modal} className="top-[888px] left-[210px]" />
          {showLowBalance && (
            <LowBalanceNotice
              balance={state.balance}
              minBet={derived.minBet}
              startingBalance={config.startingBalance}
              onAdd={actions.resetBalance}
              className="absolute top-[744px] left-[638px]"
            />
          )}
          <ResultsLayer state={state} actions={resultActions} stage={resultStage} />
          {modal === 'rules' && <RulesModal difficulty={state.difficulty} onClose={() => setModal(null)} />}
          {modal === 'menu' && (
            <MenuModal
              skipAnimations={skipAnimations}
              onSkipAnimations={setSkipAnimations}
              onRules={() => setModal('rules')}
              onResetBalance={() => {
                actions.resetBalance()
                setModal(null)
              }}
              onClose={() => setModal(null)}
            />
          )}
        </div>
        <GuidesOverlay />
      </Stage>
      {DEBUG && (
        <DebugPanel state={state} actions={actions} derived={derived} autoBeats={autoBeats} onAutoBeats={setAutoBeats} />
      )}
    </>
  )
}

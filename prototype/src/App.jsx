import { useEffect, useState } from 'react'
import Stage from './stage/Stage.jsx'
import GuidesOverlay from './stage/GuidesOverlay.jsx'
import LottieLayer from './scene/LottieLayer.jsx'
import KitPage from './screens/KitPage.jsx'
import { assets } from './assets.js'
import { useGame } from './game/useGame.js'
import DebugPanel from './ui/DebugPanel.jsx'
import Hud from './ui/hud/Hud.jsx'
import Dock from './ui/dock/Dock.jsx'
import { useBeatTimer } from './scene/useBeatTimer.js'

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

  if (route === 'kit') return <KitPage />

  return <Game />
}

function Game() {
  const [state, actions, derived] = useGame()
  const [autoBeats, setAutoBeats] = useState(true)
  useBeatTimer(state, actions, autoBeats)

  return (
    <>
      <Stage>
        <LottieLayer src={assets.lottie.bgScene.src} loop />
        <Hud
          state={state}
          derived={derived}
          // Rules and Menu modals arrive in Level 10.
          onRules={() => console.log('openRules')}
          onMenu={() => console.log('openMenu')}
        />
        <Dock state={state} actions={actions} derived={derived} className="top-[888px] left-[210px]" />
        <GuidesOverlay />
      </Stage>
      <DebugPanel state={state} actions={actions} derived={derived} autoBeats={autoBeats} onAutoBeats={setAutoBeats} />
    </>
  )
}

import { useEffect, useState } from 'react'
import Stage from './stage/Stage.jsx'
import GuidesOverlay from './stage/GuidesOverlay.jsx'
import KitPage from './screens/KitPage.jsx'

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

  return (
    <Stage>
      <GuidesOverlay />
    </Stage>
  )
}

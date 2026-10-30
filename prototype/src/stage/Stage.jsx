import { useEffect, useState } from 'react'
import { StageContext, STAGE_WIDTH, STAGE_HEIGHT } from './StageContext.js'

function fitScale() {
  return Math.min(window.innerWidth / STAGE_WIDTH, window.innerHeight / STAGE_HEIGHT)
}

// Fixed 1920x1080 canvas, centered and scaled to fit the window (letterbox).
export default function Stage({ children }) {
  const [scale, setScale] = useState(fitScale)

  useEffect(() => {
    const onResize = () => setScale(fitScale())
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  return (
    <StageContext.Provider value={{ scale }}>
      <div className="fixed inset-0 flex items-center justify-center overflow-hidden bg-stage-letterbox">
        <div
          style={{ width: STAGE_WIDTH * scale, height: STAGE_HEIGHT * scale }}
          className="relative shrink-0"
        >
          <div
            style={{
              width: STAGE_WIDTH,
              height: STAGE_HEIGHT,
              transform: `scale(${scale})`,
              transformOrigin: '0 0',
            }}
            className="absolute top-0 left-0 overflow-hidden bg-neutral-ink"
          >
            {children}
          </div>
        </div>
      </div>
    </StageContext.Provider>
  )
}

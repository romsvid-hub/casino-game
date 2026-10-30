import { createContext, useContext } from 'react'

export const STAGE_WIDTH = 1920
export const STAGE_HEIGHT = 1080

// Current stage scale (screen px per stage px). Use it to convert pointer
// coordinates: stageX = (clientX - stageRect.left) / scale.
export const StageContext = createContext({ scale: 1 })

export function useStage() {
  return useContext(StageContext)
}

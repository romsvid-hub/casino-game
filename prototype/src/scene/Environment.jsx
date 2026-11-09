import { useEffect, useState } from 'react'
import env from './env.json'

// Battle locations rebuilt from the Figma layers (src/scene/env.json):
// forest 340:4055 (gates 1–5), open field 756:6539 (gate 6), hut 843:6410 (gate 7).
const SCENES = ['forest', 'field', 'hut']

// Forest parallax, relative to level 3 (the reference frame): each level moves the
// near ground 64 px, the trees 30 px and the clouds 20 px to the left.
const PARALLAX_STEP = { near: 64, trees: 30, clouds: 20 }
const REFERENCE_GATE = 2

function parallaxVars(scene, gate) {
  const levels = scene === 'forest' ? gate - REFERENCE_GATE : 0
  const vars = {}
  for (const [key, step] of Object.entries(PARALLAX_STEP)) vars[`--plx-${key}`] = `${-step * levels}px`
  return vars
}

export function layerStyle(layer) {
  const style = { left: layer.x, top: layer.y, width: layer.w, height: layer.h }
  if (layer.blend) style.mixBlendMode = layer.blend
  if (layer.opacity != null) style.opacity = layer.opacity
  if (layer.bg) style.background = layer.bg
  if (layer.blur) style.filter = `blur(${layer.blur}px)`
  if (layer.rotate) style.transform = `rotate(${layer.rotate}deg)`
  if (layer.plx) style.transform = `translateX(var(--plx-${layer.plx}))`
  return style
}

export function EnvLayer({ layer }) {
  const className = `absolute block max-w-none ${layer.plx ? 'env-parallax' : ''}`
  if (layer.kind === 'rect') return <div aria-hidden className={className} style={layerStyle(layer)} />
  return <img src={layer.src} alt="" aria-hidden draggable={false} className={className} style={layerStyle(layer)} />
}

export const envImageUrls = (scene) =>
  [...env[scene].layers, ...env[scene].focus].filter((l) => l.kind === 'img').map((l) => l.src)

// Every location already shown stays mounted, so returning from a boss location
// to the forest on a new round crossfades without loading anything again.
export default function Environment({ scene, gate, focus }) {
  const [mounted, setMounted] = useState([scene])
  useEffect(() => {
    setMounted((list) => (list.includes(scene) ? list : [...list, scene]))
  }, [scene])

  return SCENES.filter((name) => name === scene || mounted.includes(name)).map((name) => (
    <div
      key={name}
      data-qa={name === scene ? `env-${name}` : undefined}
      className={`env-scene absolute inset-0 ${name === scene ? 'env-scene--active' : ''}`}
      style={parallaxVars(name, gate)}
    >
      {env[name].layers.map((layer) => (
        <EnvLayer key={layer.name} layer={layer} />
      ))}
      <div className="env-focus" style={{ opacity: focus ? 1 : 0 }}>
        {env[name].focus.map((layer) => (
          <EnvLayer key={layer.name} layer={layer} />
        ))}
      </div>
    </div>
  ))
}

// FX / Hero light (victory) 843:7066: drawn for a knight standing on his step
// (x 725); a knight who took the win at home gets it shifted with him.
const HERO_LIGHT_X = 725

export function HeroLight({ x }) {
  return (
    <div
      data-qa="hero-light"
      className="pointer-events-none absolute inset-0"
      style={{ transform: `translateX(${x - HERO_LIGHT_X}px)`, animation: 'fade-in 300ms ease-out both' }}
    >
      {env.heroLight.map((layer) => (
        <EnvLayer key={layer.name} layer={layer} />
      ))}
    </div>
  )
}

import { useState } from 'react'
import env from './env.json'
import { layerStyle } from './layerStyle.js'

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

// Idle motion, same drift and pulse as the old background (bg_scene, 12 s loop).
// Drift uses the CSS `translate` property, so it adds to the parallax `transform`.
const MOTION = {
  clouds: 'env-drift-clouds',
  mist: 'env-drift-mist',
  'ground-fog': 'env-drift-fog',
  'moon-glow-core': 'env-pulse-moon-core',
  'moon-glow-wide': 'env-pulse-moon-wide',
  'torch-glow-core': 'env-flicker-core',
  'torch-glow-wide': 'env-flicker-wide',
  'torch-warm-pool': 'env-flicker-pool',
}
const EMBER = /^ember-(\d+)$/

function layerMotion(name) {
  const ember = EMBER.exec(name)
  if (!ember) return { motion: MOTION[name] ?? '' }
  const i = Number(ember[1])
  return { motion: 'env-ember', delay: { animationDuration: `${3 + (i % 3)}s`, animationDelay: `${-i * 0.7}s` } }
}

export function EnvLayer({ layer }) {
  const { motion, delay } = layerMotion(layer.name)
  const className = `absolute block max-w-none ${layer.plx ? 'env-parallax' : ''} ${motion}`
  const style = { ...layerStyle(layer), ...delay }
  if (layer.kind === 'rect') return <div aria-hidden className={className} style={style} />
  return <img src={layer.src} alt="" aria-hidden draggable={false} className={className} style={style} />
}

// Every location already shown stays mounted, so returning from a boss location
// to the forest on a new round crossfades without loading anything again.
export default function Environment({ scene, gate, focus }) {
  const [mounted, setMounted] = useState([scene])
  // A newly shown location joins the list during render (no extra effect pass).
  if (!mounted.includes(scene)) setMounted([...mounted, scene])

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

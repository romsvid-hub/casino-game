import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { layerStyle } from '../../scene/Environment.jsx'
import env from '../../scene/env.json'
import CtaButton from '../CtaButton.jsx'
import INTRO from './intro.json'
import { playIntro, SKIP_RATE } from './introTimeline.js'
import { startPitchfork } from './pitchfork.js'
import RulesCard from './RulesCard.jsx'
import SpeechBubble from './SpeechBubble.jsx'

// Lobby 885:10856, and the splash 885:10802 that turns into it (12.11 brief).
// The background is shared: sky, forest, three fog bands, the village (dark: Baba
// Yaga has taken its light), ground and fence, with a slow ambient drift. The intro
// adds the lit village, the 12 window lights, Baba Yaga's flight, the big logo and
// SKIP on top, then hands over to the rules card, the knight, the crowd and the dock.
// Lobby layout 13.11 (885:10856). The crowd moved left in Figma to make room for
// the speech bubble; CROWD_SHIFT and BUBBLE_TIP are provisional until the Figma
// wrapper 993:6620 can be read (docs/open-questions.md).
const CROWD_SHIFT = -60
const BUBBLE_TIP = { x: 1568, y: 596 } // top of the right villager's head (after the shift)
const BUBBLE_TEXT = 'The Witch stole our light! You are the one brave enough to enter the dark forest. Beat the wolves on the path, reach her hut\u00a0— and bring our light back home.'

// The 12 `FX/Light orb` instances in the splash windows (964:8731 …): stage px and
// instance opacity, read from Figma.
const ORBS = [
  [36, 615, 31, 32, 0.98], [190, 630, 28, 35, 0.98], [499, 629, 28, 35, 0.98], [573, 635, 25, 35, 0.98], [668, 647, 19, 32, 0.98],
  [801, 689, 19, 32, 0.98], [1065, 683, 17, 25, 0.98], [1245, 662, 17, 24, 0.98], [1527, 637, 25, 35, 0.98], [1649, 621, 27, 38, 0.98],
  [385, 648, 24, 32, 1], [322, 640, 25, 36, 1],
].map(([x, y, w, h, a]) => ({ x, y, w, h, a }))

const reduceMotion = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

const L = (name) => env.lobby.layers.find((l) => l.name === name)
const C = (name) => env.lobby.crowd.find((l) => l.name === name)
const Img = ({ layer, className = '', ...rest }) => (
  <img src={layer.src} alt="" aria-hidden draggable={false} className={`absolute block max-w-none ${className}`} style={layerStyle(layer)} {...rest} />
)

// One villager: body (+ pitchfork arm) with the two alternative faces over it.
// `children` (the speech bubble) belong to the villager, not to his arm.
function Villager({ who, body, arm, armRef, className = '', children, ...rest }) {
  return (
    <div className={`absolute inset-0 ${className}`} {...rest}>
      <Img layer={body} />
      {arm && (
        <Img
          layer={arm}
          ref={armRef}
          data-qa="pitchfork"
          // Pivot: the hand on the shaft (≈ stage 1695, 755 before the shift).
          style={{ ...layerStyle(arm), transformOrigin: '50% 64%' }}
        />
      )}
      <Img layer={INTRO[`crowd-${who}-emotion-1`]} data-i="emotion-1" style={{ ...layerStyle(INTRO[`crowd-${who}-emotion-1`]), opacity: 0 }} />
      <Img layer={INTRO[`crowd-${who}-emotion-2`]} data-i="emotion-2" style={{ ...layerStyle(INTRO[`crowd-${who}-emotion-2`]), opacity: 0 }} />
      {children}
    </div>
  )
}

// The far layers share one "camera breath" about the stage centre.
const breathOrigin = (l) => `${960 - l.x}px ${540 - l.y}px`
const reducedNow = () => {
  const html = document.documentElement
  return reduceMotion() || html.dataset.motion === 'reduced' || 'still' in html.dataset
}

export default function LobbyScreen({ visible, difficulty, intro = false, onIntroDone }) {
  const { logo, hero } = env.lobby
  const root = useRef(null)
  const anims = useRef([])
  const pressed = useRef(0)
  const arm = useRef(null)
  // Right after the intro the crowd and the bubble are already on screen: their
  // return-visit entrances stay off until the lobby is left once.
  const [afterIntro, setAfterIntro] = useState(intro)
  useEffect(() => {
    if (!visible) setAfterIntro(false)
  }, [visible])
  // The pitchfork shake runs while the lobby is shown.
  useEffect(() => {
    if (!visible || reducedNow()) return
    return startPitchfork(arm.current)
  }, [visible])

  // The intro waits behind the black cover until every image (and the fonts) is
  // decoded, then the timeline runs once. SKIP works while loading too.
  useLayoutEffect(() => {
    if (!intro || !root.current) return
    const el = root.current
    const dock = document.querySelector('[data-dock]')
    const balance = document.querySelector('[data-qa="hud-balance"]')
    const holds = [dock, balance].map((x) => x?.animate([{ opacity: 0 }, { opacity: 0 }], { duration: 1, fill: 'forwards' }))
    let cancelled = false
    let list = []
    const images = [...el.querySelectorAll('img')].map((img) => img.decode().catch(() => {}))
    const fonts = document.fonts?.ready ?? Promise.resolve()
    const ready = Promise.all([...images, fonts])
    // Never wait forever on a slow network: start after 6 s whatever is loaded.
    Promise.race([ready, new Promise((r) => setTimeout(r, 6000))]).then(() => {
      if (cancelled) return
      holds.forEach((h) => h?.cancel())
      el.setAttribute('data-ready', '')
      list = playIntro(el, [dock, balance], { orbs: ORBS, reduced: reduceMotion() })
      anims.current = list
      if (pressed.current === 1) list.forEach((a) => a.updatePlaybackRate(SKIP_RATE))
      else if (pressed.current > 1) list.forEach((a) => a.finish())
      let done = false
      const finish = () => {
        if (done) return
        done = true
        onIntroDone?.()
      }
      Promise.all(list.map((a) => a.finished)).then(finish, finish)
    })
    return () => {
      cancelled = true
      holds.forEach((h) => h?.cancel())
      list.forEach((a) => a.cancel())
      ;[dock, balance].forEach((x) => x?.getAnimations().forEach((a) => a.cancel()))
    }
    // the intro plays once per mount
  }, [intro])

  // SKIP, a click anywhere, Space or Enter: first ×4, a second press jumps to the end.
  const skip = () => {
    pressed.current += 1
    if (pressed.current === 1) anims.current.forEach((a) => a.updatePlaybackRate(SKIP_RATE))
    else anims.current.forEach((a) => a.finish())
  }
  useLayoutEffect(() => {
    if (!intro) return
    const onKey = (e) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault()
        e.stopPropagation()
        skip()
      }
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [intro])

  return (
    <div
      ref={root}
      data-qa="lobby"
      data-intro={intro ? '' : undefined}
      aria-hidden={!visible}
      className={`lobby absolute inset-0 ${visible ? 'lobby--visible' : ''} ${intro ? '' : 'lobby--settled'} ${afterIntro ? 'lobby--after-intro' : ''}`}
      onClick={intro ? skip : undefined}
    >
      {/* Shared background, alive like the battle scenes (13.11): the sky with its
          clouds drifts and zooms, three fog bands sway, trees and village breathe
          together, ground and fence stay still. Same DOM on the splash and in the
          lobby, so the motion never resets at the hand-over. */}
      <Img layer={L('sky')} className="env-drift-clouds lobby-sky" data-qa="lobby-sky" />
      <Img layer={L('forest')} className="env-breath" style={{ ...layerStyle(L('forest')), transformOrigin: breathOrigin(L('forest')) }} />
      <Img layer={INTRO['fog-far']} className="env-drift-fog lobby-fog lobby-fog--far" />
      <Img layer={INTRO['village-dark']} className="env-breath" style={{ ...layerStyle(INTRO['village-dark']), transformOrigin: breathOrigin(INTRO['village-dark']) }} />
      {intro && <Img layer={INTRO['village-lit']} data-i="lit" className="env-breath" style={{ ...layerStyle(INTRO['village-lit']), transformOrigin: breathOrigin(INTRO['village-lit']) }} />}
      {/* The 12 window lights sit in the background stack as in Figma (over the
          village, under the fog, ground and fence), and fly from there to her mortar. */}
      {intro &&
        ORBS.map((o, i) => (
          <div key={i} data-i="orb" data-index={i} className="absolute" style={{ left: o.x, top: o.y, width: o.w, height: o.h, opacity: o.a }} aria-hidden>
            <div className="size-full">
              <div className="intro-orb size-full rounded-full" style={{ '--flicker': `${600 + ((i * 337) % 800)}ms`, animationDelay: `${-((i * 211) % 900)}ms` }} />
            </div>
          </div>
        ))}
      <Img layer={INTRO['fog-mid']} className="env-drift-fog lobby-fog lobby-fog--mid" />
      {/* A gust of fog while Baba Yaga blows the lights out. */}
      {intro && <Img layer={INTRO['fog-mid']} data-i="gust" style={{ ...layerStyle(INTRO['fog-mid']), opacity: 0 }} />}
      <Img layer={L('ground')} />
      <Img layer={INTRO['fog-near']} className="env-drift-fog lobby-fog lobby-fog--near" />
      <Img layer={L('fence')} />

      <RulesCard logo={logo} difficulty={difficulty} />

      {/* Crowd 885:10919: the people at the back stay still. */}
      <div data-i="crowd" className="lobby-crowd absolute inset-0" style={{ translate: `${CROWD_SHIFT}px 0` }}>
        <Img layer={C('crowd-back')} />
        {/* `Правий персонаж` with the pitchfork arm and his speech bubble. */}
        <Villager who="right" body={C('crowd-right')} arm={C('crowd-right-arm')} armRef={arm} data-qa="villager-right">
          <SpeechBubble tip={{ x: BUBBLE_TIP.x - CROWD_SHIFT, y: BUBBLE_TIP.y }} data-i="bubble" className={afterIntro ? '' : 'speech-bubble--pop'} style={intro ? { opacity: 0 } : undefined}>
            {BUBBLE_TEXT}
          </SpeechBubble>
        </Villager>
        <Villager who="center" body={C('crowd-center')} className="lobby-breathe lobby-breathe--a" />
        <Villager who="left" body={C('crowd-left')} className="lobby-breathe lobby-breathe--b" />
      </div>
      <img src={hero.src} alt="" aria-hidden data-i="hero" draggable={false} className="lobby-hero absolute block max-w-none" style={layerStyle(hero)} />

      {intro && (
        <>
          <div data-i="yaga" className="absolute top-0 left-0" style={{ opacity: 0 }} aria-hidden>
            <img src={INTRO['yaga-mortar'].src} alt="" draggable={false} className="block max-w-none" style={{ width: INTRO['yaga-mortar'].w, height: INTRO['yaga-mortar'].h }} />
          </div>
          <div data-i="logo-move" className="pointer-events-none absolute inset-0">
            <div data-i="glow" className="intro-logo-glow absolute" style={{ opacity: 0 }} aria-hidden />
            <img
              src={INTRO['logo-big'].src}
              alt=""
              data-i="logo-big"
              draggable={false}
              className="absolute block max-w-none"
              style={{ ...layerStyle(INTRO['logo-big']), opacity: 0 }}
            />
          </div>
          <div data-i="cover" className="absolute inset-0 bg-neutral-ink" aria-hidden />
          {/* CTA / Skip (intro) 885:10854, where PLAY will be. */}
          <div data-i="skip" className="absolute top-[921px] left-[778px]">
            <CtaButton
              variant="skip"
              label="SKIP"
              aria-label="Skip intro"
              onClick={(e) => {
                e.stopPropagation()
                skip()
              }}
            />
          </div>
        </>
      )}
    </div>
  )
}

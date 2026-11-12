import { useLayoutEffect, useRef } from 'react'
import { config } from '../../game/config.js'
import { formatMoney, formatMultiplier } from '../../game/money.js'
import { EnvLayer, layerStyle } from '../../scene/Environment.jsx'
import env from '../../scene/env.json'
import CtaButton from '../CtaButton.jsx'
import INTRO from './intro.json'
import { playIntro, SKIP_RATE } from './introTimeline.js'

// Lobby 885:10856, and the splash 885:10802 that turns into it (12.11 brief).
// The background is shared: sky, forest, three fog bands, the village (dark: Baba
// Yaga has taken its light), ground and fence, with a slow ambient drift. The intro
// adds the lit village, the 12 window lights, Baba Yaga's flight, the big logo and
// SKIP on top, then hands over to the rules card, the knight, the crowd and the dock.
const RULES = [
  'Choose your bet and difficulty, then press PLAY.',
  'Each enemy shows a multiplier. Beat it and the multiplier grows.',
  'After every victory decide: TAKE the win now or FIGHT the next, stronger enemy.',
  'Lose a fight and the bet for this round is lost.',
  'The result of every fight is random. Skill does not change the odds.',
]

// The 12 `FX/Light orb` instances in the splash windows (964:8731 …): stage px and
// instance opacity, read from Figma.
const ORBS = [
  [36, 615, 31, 32, 0.98], [190, 630, 28, 35, 0.98], [499, 629, 28, 35, 0.98], [573, 635, 25, 35, 0.98], [668, 647, 19, 32, 0.98],
  [801, 689, 19, 32, 0.98], [1065, 683, 17, 25, 0.98], [1245, 662, 17, 24, 0.98], [1527, 637, 25, 35, 0.98], [1649, 621, 27, 38, 0.98],
  [385, 648, 24, 32, 1], [322, 640, 25, 36, 1],
].map(([x, y, w, h, a]) => ({ x, y, w, h, a }))

const reduceMotion = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

function Fact({ label, value }) {
  return (
    <div className="flex flex-col items-start gap-[4px] whitespace-nowrap">
      <span className="type-label-xs text-text-muted">{label}</span>
      <span className="lobby-fact text-text-parchment">{value}</span>
    </div>
  )
}

const L = (name) => env.lobby.layers.find((l) => l.name === name)
const C = (name) => env.lobby.crowd.find((l) => l.name === name)
const Img = ({ layer, className = '', ...rest }) => (
  <img src={layer.src} alt="" aria-hidden draggable={false} className={`absolute block max-w-none ${className}`} style={layerStyle(layer)} {...rest} />
)

// One villager: body (+ pitchfork arm) with the two alternative faces over it.
function Villager({ who, body, arm, className }) {
  return (
    <div className={`absolute inset-0 ${className}`}>
      <Img layer={body} />
      {arm && <Img layer={arm} className="lobby-pitchfork" />}
      <Img layer={INTRO[`crowd-${who}-emotion-1`]} data-i="emotion-1" style={{ ...layerStyle(INTRO[`crowd-${who}-emotion-1`]), opacity: 0 }} />
      <Img layer={INTRO[`crowd-${who}-emotion-2`]} data-i="emotion-2" style={{ ...layerStyle(INTRO[`crowd-${who}-emotion-2`]), opacity: 0 }} />
    </div>
  )
}

export default function LobbyScreen({ visible, difficulty, intro = false, onIntroDone }) {
  const d = config.difficulties[difficulty]
  const maxMultiplier = d.gates[d.gates.length - 1]
  const { logo, hero } = env.lobby
  const root = useRef(null)
  const anims = useRef([])
  const pressed = useRef(0)

  // The intro waits behind the black cover until every image (and the fonts) is
  // decoded, then the timeline runs once. SKIP works while loading too.
  useLayoutEffect(() => {
    if (!intro || !root.current) return
    const el = root.current
    const dock = document.querySelector('[data-dock]')
    const hold = dock?.animate([{ opacity: 0 }, { opacity: 0 }], { duration: 1, fill: 'forwards' })
    let cancelled = false
    let list = []
    const images = [...el.querySelectorAll('img')].map((img) => img.decode().catch(() => {}))
    const fonts = document.fonts?.ready ?? Promise.resolve()
    const ready = Promise.all([...images, fonts])
    // Never wait forever on a slow network: start after 6 s whatever is loaded.
    Promise.race([ready, new Promise((r) => setTimeout(r, 6000))]).then(() => {
      if (cancelled) return
      hold?.cancel()
      el.setAttribute('data-ready', '')
      list = playIntro(el, dock, { orbs: ORBS, reduced: reduceMotion() })
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
      hold?.cancel()
      list.forEach((a) => a.cancel())
      if (dock) dock.getAnimations().forEach((a) => a.cancel())
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
      className={`lobby absolute inset-0 ${visible ? 'lobby--visible' : ''} ${intro ? '' : 'lobby--settled'}`}
      onClick={intro ? skip : undefined}
    >
      {/* Shared background with the slow ambient loop. */}
      <Img layer={L('sky')} className="lobby-amb-sky" />
      <Img layer={L('forest')} className="lobby-amb-forest" />
      <Img layer={INTRO['fog-far']} className="lobby-amb-fog lobby-amb-fog--far" />
      <Img layer={INTRO['village-dark']} />
      {intro && <Img layer={INTRO['village-lit']} data-i="lit" />}
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
      <Img layer={INTRO['fog-mid']} className="lobby-amb-fog lobby-amb-fog--mid" />
      {/* A gust of fog while Baba Yaga blows the lights out. */}
      {intro && <Img layer={INTRO['fog-mid']} data-i="gust" style={{ ...layerStyle(INTRO['fog-mid']), opacity: 0 }} />}
      <Img layer={L('ground')} />
      <Img layer={INTRO['fog-near']} className="lobby-amb-fog lobby-amb-fog--near" />
      <Img layer={L('fence')} />

      {(
        <section
          aria-label="How to play"
          data-i="card"
          className="absolute top-[93px] left-[548px] flex h-[765px] w-[824px] flex-col items-start gap-[20px] overflow-hidden rounded-[12px] border-2 border-solid border-neutral-iron bg-neutral-ink px-[40px] pt-[24px] pb-[36px]"
          style={{ boxShadow: 'var(--fx-modal-shadow)', textShadow: 'var(--fx-text-shadow-soft)' }}
        >
          <div className="flex w-[680px] flex-col items-center gap-[16px]">
            <img src={logo.src} alt="WITCHBOUND" data-i="card-logo" draggable={false} className="block h-[292px] w-[519px] max-w-none" />
            <h2 className="type-title-m m-0 h-[24px] w-full text-center text-accent-amber">HOW TO PLAY</h2>
          </div>
          <ol className="m-0 flex w-full list-none flex-col gap-[20px] p-0">
            {RULES.map((text, i) => (
              <li key={i} className="flex h-[28px] w-full items-start gap-[20px]">
                <span className="type-number-m w-[32px] shrink-0 text-center text-accent-amber">{i + 1}</span>
                <span className="lobby-rule min-w-0 flex-1 text-text-parchment">{text}</span>
              </li>
            ))}
          </ol>
          <div className="h-px w-full shrink-0 bg-neutral-iron" />
          <div className="flex w-full items-center gap-[99px]">
            <Fact label="RTP" value={`[${config.displayRtp.toFixed(2)}%]`} />
            <Fact label="BET" value={`[${formatMoney(config.minBet)} – ${formatMoney(config.maxBet)}]`} />
            <Fact label="MAX MULTIPLIER" value={`[${formatMultiplier(maxMultiplier)}]`} />
          </div>
          <p className="type-label-xs m-0 w-full text-center whitespace-pre text-text-muted">
            {'18+  ·  Set your limits before you play  ·  Demo balance has no cash value'}
          </p>
        </section>
      )}

      {/* Crowd 885:10919: the people at the back stay still. */}
      <div data-i="crowd" className="lobby-crowd absolute inset-0">
        <Img layer={C('crowd-back')} />
        <Villager who="right" body={C('crowd-right')} arm={C('crowd-right-arm')} />
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

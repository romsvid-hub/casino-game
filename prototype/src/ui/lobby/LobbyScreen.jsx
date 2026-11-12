import { useLayoutEffect, useRef } from 'react'
import { config } from '../../game/config.js'
import { formatMoney, formatMultiplier } from '../../game/money.js'
import { EnvLayer, layerStyle } from '../../scene/Environment.jsx'
import env from '../../scene/env.json'
import FX from '../../scene/fx.json'
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

// The 12 `FX/Light orb` instances in the splash windows (964:8731 …), stage px.
const ORBS = [
  [36, 615, 31, 32], [190, 630, 28, 35], [499, 629, 28, 35], [573, 635, 25, 35], [668, 647, 19, 32], [801, 689, 19, 32],
  [1065, 683, 17, 25], [1245, 662, 17, 24], [1527, 637, 25, 35], [1649, 621, 27, 38], [385, 648, 24, 32], [322, 640, 25, 36],
].map(([x, y, w, h]) => ({ x, y, w, h }))

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

export default function LobbyScreen({ visible, difficulty, intro = false, showRules = true, onIntroDone }) {
  const d = config.difficulties[difficulty]
  const maxMultiplier = d.gates[d.gates.length - 1]
  const { logo, hero } = env.lobby
  const root = useRef(null)
  const anims = useRef([])
  const pressed = useRef(0)

  // The intro timeline runs once, from the first paint of the lobby.
  useLayoutEffect(() => {
    if (!intro || !root.current) return
    const dock = document.querySelector('[data-dock]')
    const list = playIntro(root.current, dock, { orbs: ORBS, reduced: reduceMotion() })
    anims.current = list
    let done = false
    const finish = () => {
      if (done) return
      done = true
      onIntroDone?.()
    }
    Promise.all(list.map((a) => a.finished)).then(finish, finish)
    return () => {
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
      <Img layer={INTRO['fog-mid']} className="lobby-amb-fog lobby-amb-fog--mid" />
      <Img layer={L('ground')} />
      <Img layer={INTRO['fog-near']} className="lobby-amb-fog lobby-amb-fog--near" />
      <Img layer={L('fence')} />

      {(showRules || intro) && (
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
          {/* The stolen lights fly under Baba Yaga's layer. */}
          {ORBS.map((o, i) => (
            <div key={i} data-i="orb" data-index={i} className="absolute" style={{ left: o.x, top: o.y, width: o.w, height: o.h }} aria-hidden>
              <div className="size-full">
                <img
                  src={FX.lightOrb.src}
                  alt=""
                  className="intro-orb absolute block max-w-none"
                  style={{ inset: '-100% -107%', '--flicker': `${600 + ((i * 337) % 800)}ms`, animationDelay: `${-((i * 211) % 900)}ms` }}
                  draggable={false}
                />
              </div>
            </div>
          ))}
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

import { assets } from '../assets.js'

const ARROWS = { up: assets.vectors.arrowUp, down: assets.vectors.arrowDown }

// Stepper/Arrow 536:1900: hit area 32x24, Default / Hover / Pressed / Disabled.
export function StepperArrow({ direction = 'up', state, disabled = false, onClick, label, className = '' }) {
  const svg = ARROWS[direction]
  return (
    <button
      type="button"
      aria-label={label ?? (direction === 'up' ? 'Increase' : 'Decrease')}
      className={`stepper-arrow ui-focus ${className}`}
      data-state={state}
      data-forced={state ? '' : undefined}
      disabled={disabled || state === 'disabled'}
      onClick={onClick}
      style={{
        '--arrow-default': `url(${svg.default.src})`,
        '--arrow-hover': `url(${svg.hover.src})`,
        '--arrow-pressed': `url(${svg.pressed.src})`,
        '--arrow-disabled': `url(${svg.disabled.src})`,
      }}
    />
  )
}

// Stepper 536:1901: up arrow above down arrow (32x48).
// Down is disabled at the minimum bet; up at the max bet or the balance.
export default function Stepper({ onUp, onDown, upDisabled, downDisabled, upState, downState, className = '' }) {
  return (
    <div className={`flex flex-col ${className}`} role="group" aria-label="Bet">
      <StepperArrow direction="up" label="Increase bet" onClick={onUp} disabled={upDisabled} state={upState} />
      <StepperArrow direction="down" label="Decrease bet" onClick={onDown} disabled={downDisabled} state={downState} />
    </div>
  )
}

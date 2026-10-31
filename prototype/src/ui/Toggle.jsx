import { assets } from '../assets.js'

// Toggle 554:4742 (On / Off). Settings rows use it at 88x44.
export default function Toggle({ checked, onChange, label, className = '' }) {
  const svg = checked ? assets.vectors.toggle.on : assets.vectors.toggle.off
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`ui-focus block h-[44px] w-[88px] shrink-0 cursor-pointer rounded-full border-0 bg-transparent p-0 ${className}`}
    >
      <img src={svg.src} alt="" className="block size-full" />
    </button>
  )
}

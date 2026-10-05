'use client'

interface Props {
  checked: boolean
  disabled?: boolean
  onChange: () => void
}

// Interrupteur vert (actif) / rouge (inactif), en Tailwind pur (pas de dépendance au thème PrimeReact).
export default function SwitchVertRouge({ checked, disabled, onChange }: Props) {
  return (
    <button type="button" role="switch" aria-checked={checked} disabled={disabled} onClick={onChange}
      className={`tw-relative tw-inline-flex tw-h-6 tw-w-11 tw-flex-shrink-0 tw-cursor-pointer tw-items-center tw-rounded-full tw-border-0 tw-transition-colors
        disabled:tw-cursor-not-allowed disabled:tw-opacity-50
        ${checked ? 'tw-bg-green-500' : 'tw-bg-red-500'}`}>
      <span className={`tw-inline-block tw-h-5 tw-w-5 tw-transform tw-rounded-full tw-bg-white tw-shadow tw-transition-transform
        ${checked ? 'tw-translate-x-5' : 'tw-translate-x-0.5'}`} />
    </button>
  )
}

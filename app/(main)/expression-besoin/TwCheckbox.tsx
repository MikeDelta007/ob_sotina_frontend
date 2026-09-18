'use client'

interface Props {
  id: string
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
  disabled?: boolean
}

// Checkbox stylée en TailwindCSS (préfixe tw-) — remplace le composant Checkbox de
// PrimeReact, jugé trop petit/carré visuellement.
export default function TwCheckbox({ id, checked, onChange, label, disabled }: Props) {
  return (
    <label htmlFor={id} className={`tw-flex tw-items-center tw-gap-2 tw-select-none ${disabled ? 'tw-opacity-50 tw-cursor-not-allowed' : 'tw-cursor-pointer'}`}>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={e => onChange(e.target.checked)}
        className="tw-h-5 tw-w-5 tw-rounded tw-border-2 tw-border-gray-300 tw-text-blue-600 tw-cursor-pointer tw-accent-blue-600 focus:tw-ring-2 focus:tw-ring-blue-400 disabled:tw-cursor-not-allowed"
      />
      <span className="tw-text-sm">{label}</span>
    </label>
  )
}

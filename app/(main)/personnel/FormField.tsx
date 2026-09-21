import type { ReactNode } from 'react'

interface FormFieldProps {
  label: string
  required?: boolean
  error?: string
  hint?: string
  children: ReactNode
  className?: string
}

// Bloc label + champ + message d'erreur, réutilisé par tous les formulaires du module
// personnel (fiche personnel, mon profil) pour un rendu cohérent (Tailwind, préfixe tw-).
export function FormField({ label, required, error, hint, children, className }: FormFieldProps) {
  return (
    <div className={`tw-flex tw-flex-col tw-gap-1 ${className ?? ''}`}>
      <label className="tw-text-sm tw-font-medium tw-text-[var(--text-color)]">
        {required && <span className="tw-mr-1 tw-text-red-600">*</span>}
        {label}
      </label>
      {children}
      {error ? (
        <small className="tw-text-red-600">{error}</small>
      ) : hint ? (
        <small className="tw-text-[var(--text-color-secondary)]">{hint}</small>
      ) : null}
    </div>
  )
}

// Panneau de section (fieldset visuel) regroupant plusieurs FormField.
export function FormSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="tw-flex tw-flex-col tw-gap-4 tw-rounded-xl tw-border tw-border-[var(--surface-border)] tw-bg-[var(--surface-50)] tw-p-4">
      <h4 className="tw-m-0 tw-text-xs tw-font-semibold tw-uppercase tw-tracking-wide tw-text-[var(--text-color-secondary)]">
        {title}
      </h4>
      {children}
    </section>
  )
}

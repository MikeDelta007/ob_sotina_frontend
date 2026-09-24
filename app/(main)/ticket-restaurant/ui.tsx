'use client'
import { useMemo, useState, type ReactNode } from 'react'

// Petits composants 100 % Tailwind (préfixe tw-) du module Ticket restaurant — sans PrimeReact.
// Tailwind est configuré sans "preflight" : chaque élément natif doit donc être stylé explicitement.

type Variante = 'primaire' | 'succes' | 'danger' | 'contour' | 'texte'

const VARIANTES: Record<Variante, string> = {
  primaire: 'tw-bg-blue-600 tw-text-white hover:tw-bg-blue-700 tw-border-blue-600',
  succes: 'tw-bg-green-600 tw-text-white hover:tw-bg-green-700 tw-border-green-600',
  danger: 'tw-bg-red-600 tw-text-white hover:tw-bg-red-700 tw-border-red-600',
  contour: 'tw-bg-white tw-text-gray-700 hover:tw-bg-gray-50 tw-border-gray-300',
  texte: 'tw-bg-transparent tw-text-blue-600 hover:tw-bg-blue-50 tw-border-transparent',
}

export function Bouton({ children, variante = 'primaire', chargement, disabled, className = '', ...rest }:
  { children: ReactNode; variante?: Variante; chargement?: boolean } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type="button" disabled={disabled || chargement}
      className={`tw-inline-flex tw-items-center tw-justify-center tw-gap-2 tw-rounded-lg tw-border tw-px-4 tw-py-2 tw-text-sm tw-font-medium tw-transition disabled:tw-cursor-not-allowed disabled:tw-opacity-50 ${VARIANTES[variante]} ${className}`}
      {...rest}>
      {chargement && <span className="tw-h-4 tw-w-4 tw-animate-spin tw-rounded-full tw-border-2 tw-border-white tw-border-t-transparent" />}
      {children}
    </button>
  )
}

const COULEURS_BADGE = {
  attente: 'tw-bg-yellow-100 tw-text-yellow-800',
  succes: 'tw-bg-green-100 tw-text-green-800',
  danger: 'tw-bg-red-100 tw-text-red-800',
  info: 'tw-bg-blue-100 tw-text-blue-800',
}
export function Badge({ children, couleur }: { children: ReactNode; couleur: keyof typeof COULEURS_BADGE }) {
  return <span className={`tw-inline-block tw-rounded-full tw-px-3 tw-py-1 tw-text-xs tw-font-semibold ${COULEURS_BADGE[couleur]}`}>{children}</span>
}

export function Alerte({ children, type = 'erreur' }: { children: ReactNode; type?: 'erreur' | 'info' }) {
  const c = type === 'erreur' ? 'tw-border-red-300 tw-bg-red-50 tw-text-red-800' : 'tw-border-blue-300 tw-bg-blue-50 tw-text-blue-800'
  return <div className={`tw-rounded-lg tw-border tw-px-4 tw-py-3 tw-text-sm ${c}`}>{children}</div>
}

export function Champ({ etiquette, children }: { etiquette: string; children: ReactNode }) {
  return (
    <div className="tw-flex tw-flex-col tw-gap-1">
      <label className="tw-text-sm tw-font-medium tw-text-gray-700">{etiquette}</label>
      {children}
    </div>
  )
}

export const CLASSE_INPUT =
  'tw-w-full tw-rounded-lg tw-border tw-border-gray-300 tw-bg-white tw-px-3 tw-py-2 tw-text-sm tw-text-gray-800 focus:tw-border-blue-500 focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-blue-200'

export function Modal({ ouvert, titre, onFermer, children, pied, largeur = 'tw-max-w-xl' }:
  { ouvert: boolean; titre: string; onFermer: () => void; children: ReactNode; pied?: ReactNode; largeur?: string }) {
  if (!ouvert) return null
  return (
    <div className="tw-fixed tw-inset-0 tw-z-[2000] tw-flex tw-items-center tw-justify-center tw-bg-black/40 tw-p-4" onClick={onFermer}>
      <div className={`tw-flex tw-max-h-[90vh] tw-w-full ${largeur} tw-flex-col tw-rounded-xl tw-bg-white tw-shadow-xl`} onClick={e => e.stopPropagation()}>
        <div className="tw-flex tw-items-center tw-justify-between tw-border-b tw-border-gray-200 tw-px-5 tw-py-4">
          <h4 className="tw-m-0 tw-text-lg tw-font-semibold tw-text-gray-800">{titre}</h4>
          <button type="button" onClick={onFermer} aria-label="Fermer"
            className="tw-rounded-full tw-border-0 tw-bg-transparent tw-px-2 tw-text-xl tw-leading-none tw-text-gray-400 hover:tw-text-gray-700">×</button>
        </div>
        <div className="tw-overflow-y-auto tw-px-5 tw-py-4">{children}</div>
        {pied && <div className="tw-flex tw-gap-2 tw-border-t tw-border-gray-200 tw-px-5 tw-py-3">{pied}</div>}
      </div>
    </div>
  )
}

export interface Colonne<T> {
  titre: string
  rendu: (ligne: T) => ReactNode
  alignement?: 'gauche' | 'centre' | 'droite'
}

// Tableau avec recherche (sur le texte de `recherche(ligne)`) et pagination.
export function Tableau<T>({ lignes, colonnes, recherche, vide, chargement, entete, parPage = 10 }:
  { lignes: T[]; colonnes: Colonne<T>[]; recherche: (l: T) => string; vide: string; chargement?: boolean; entete?: ReactNode; parPage?: number }) {
  const [filtre, setFiltre] = useState('')
  const [page, setPage] = useState(0)

  const filtrees = useMemo(() => {
    const f = filtre.trim().toLowerCase()
    return f ? lignes.filter(l => recherche(l).toLowerCase().includes(f)) : lignes
  }, [lignes, filtre, recherche])

  const nbPages = Math.max(1, Math.ceil(filtrees.length / parPage))
  const pageCourante = Math.min(page, nbPages - 1)
  const affichees = filtrees.slice(pageCourante * parPage, (pageCourante + 1) * parPage)
  const align = (a?: string) => a === 'centre' ? 'tw-text-center' : a === 'droite' ? 'tw-text-right' : 'tw-text-left'

  return (
    <div className="tw-flex tw-flex-col tw-gap-3">
      <div className="tw-flex tw-items-center tw-justify-between tw-gap-3">
        <div>{entete}</div>
        <input value={filtre} onChange={e => { setFiltre(e.target.value); setPage(0) }} placeholder="Rechercher…"
          className={`${CLASSE_INPUT} tw-max-w-xs`} />
      </div>

      <div className="tw-overflow-x-auto tw-rounded-lg tw-border tw-border-gray-200">
        <table className="tw-w-full tw-border-collapse tw-text-sm">
          <thead className="tw-bg-gray-50">
            <tr>
              {colonnes.map(c => (
                <th key={c.titre} className={`tw-px-4 tw-py-3 tw-text-xs tw-font-semibold tw-uppercase tw-tracking-wide tw-text-gray-500 ${align(c.alignement)}`}>{c.titre}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {chargement && (
              <tr><td colSpan={colonnes.length} className="tw-px-4 tw-py-8 tw-text-center tw-text-gray-400">Chargement…</td></tr>
            )}
            {!chargement && affichees.length === 0 && (
              <tr><td colSpan={colonnes.length} className="tw-px-4 tw-py-8 tw-text-center tw-text-gray-400">{vide}</td></tr>
            )}
            {!chargement && affichees.map((l, i) => (
              <tr key={i} className="tw-border-t tw-border-gray-100 hover:tw-bg-gray-50">
                {colonnes.map(c => (
                  <td key={c.titre} className={`tw-px-4 tw-py-3 tw-align-top tw-text-gray-700 ${align(c.alignement)}`}>{c.rendu(l)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filtrees.length > parPage && (
        <div className="tw-flex tw-items-center tw-justify-between tw-text-sm tw-text-gray-500">
          <span>{filtrees.length} résultat(s)</span>
          <div className="tw-flex tw-items-center tw-gap-2">
            <Bouton variante="contour" className="!tw-px-3 !tw-py-1" disabled={pageCourante === 0} onClick={() => setPage(pageCourante - 1)}>‹</Bouton>
            <span>{pageCourante + 1} / {nbPages}</span>
            <Bouton variante="contour" className="!tw-px-3 !tw-py-1" disabled={pageCourante >= nbPages - 1} onClick={() => setPage(pageCourante + 1)}>›</Bouton>
          </div>
        </div>
      )}
    </div>
  )
}

// Sélecteur multiple avec recherche : liste de cases à cocher + pastilles des éléments choisis.
export function SelectionMultiple({ options, valeur, onChange, placeholder }:
  { options: { label: string; value: string }[]; valeur: string[]; onChange: (v: string[]) => void; placeholder: string }) {
  const [filtre, setFiltre] = useState('')
  const visibles = options.filter(o => o.label.toLowerCase().includes(filtre.trim().toLowerCase()))
  const basculer = (v: string) => onChange(valeur.includes(v) ? valeur.filter(x => x !== v) : [...valeur, v])

  return (
    <div className="tw-flex tw-flex-col tw-gap-2">
      {valeur.length > 0 && (
        <div className="tw-flex tw-flex-wrap tw-gap-1">
          {valeur.map(v => {
            const o = options.find(x => x.value === v)
            return (
              <span key={v} className="tw-inline-flex tw-items-center tw-gap-1 tw-rounded-full tw-bg-blue-100 tw-px-3 tw-py-1 tw-text-xs tw-font-medium tw-text-blue-800">
                {o?.label ?? v}
                <button type="button" onClick={() => basculer(v)} aria-label="Retirer"
                  className="tw-border-0 tw-bg-transparent tw-p-0 tw-text-blue-500 hover:tw-text-blue-800">×</button>
              </span>
            )
          })}
        </div>
      )}
      <input value={filtre} onChange={e => setFiltre(e.target.value)} placeholder={placeholder} className={CLASSE_INPUT} />
      <div className="tw-max-h-48 tw-overflow-y-auto tw-rounded-lg tw-border tw-border-gray-200">
        {visibles.length === 0 && <div className="tw-px-3 tw-py-4 tw-text-center tw-text-sm tw-text-gray-400">Aucun agent</div>}
        {visibles.map(o => (
          <label key={o.value} className="tw-flex tw-cursor-pointer tw-items-center tw-gap-3 tw-px-3 tw-py-2 tw-text-sm tw-text-gray-700 hover:tw-bg-gray-50">
            <input type="checkbox" className="tw-h-4 tw-w-4 tw-accent-blue-600" checked={valeur.includes(o.value)} onChange={() => basculer(o.value)} />
            {o.label}
          </label>
        ))}
      </div>
    </div>
  )
}

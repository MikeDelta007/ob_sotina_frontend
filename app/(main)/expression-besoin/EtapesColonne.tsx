'use client'
import { tracesEb, type ExpressionBesoin } from './types'

interface Props {
  eb: ExpressionBesoin
  // Le créateur est généralement déjà affiché dans sa propre colonne (Demandeur) —
  // on ne le réaffiche pas ici par défaut pour ne pas dupliquer l'info.
  avecCreateur?: boolean
}

// Détail complet de la chaîne de validation, affiché directement dans les listes (pas dans
// un dialogue à part) : qui a validé ou rejeté à chaque étape, et pourquoi en cas de rejet —
// visible par toutes les parties concernées (créateur, bénéficiaire, CSA, Directeur).
export default function EtapesColonne({ eb, avecCreateur = false }: Props) {
  const etapes = tracesEb(eb).filter(e => avecCreateur || e.role !== 'Créateur')

  return (
    <div className="flex flex-column gap-1">
      {etapes.map((e, i) => (
        <div key={i} className="text-xs">
          <span className="font-medium">{e.role}</span> : {
            e.statut === 'valide' ? <span className="text-green-600 font-medium">Validé</span>
            : e.statut === 'rejete' ? <span className="text-red-600 font-medium">Rejeté</span>
            : <span className="text-color-secondary">En attente</span>
          }
          {e.nom ? ` (${e.nom})` : ''}
          {e.statut === 'rejete' && e.motif && <div className="text-red-500">Motif : {e.motif}</div>}
        </div>
      ))}
    </div>
  )
}

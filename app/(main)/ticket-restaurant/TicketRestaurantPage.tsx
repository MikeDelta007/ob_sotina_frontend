'use client'
import { useContext, useState } from 'react'
import { UserContext } from '@/app/userContext'
import { aUnDesRoles } from '@/app/rolesUtilisateur'
import MesTicketsTab from './MesTicketsTab'
import AValiderTab from './AValiderTab'
import ToutesTab from './ToutesTab'

export default function TicketRestaurantPage() {
  const { user } = useContext(UserContext)

  const peutValider = aUnDesRoles(user, ['DIRECTEUR'])
  // Créer une demande nécessite le rôle supplémentaire TICKET_RESTAURANT (ou être Directeur)
  const peutCreer = aUnDesRoles(user, ['TICKET_RESTAURANT']) || peutValider

  const onglets = [
    peutCreer && { key: 'mes', titre: 'Mes demandes', contenu: <MesTicketsTab /> },
    peutValider && { key: 'avalider', titre: 'À valider', contenu: <AValiderTab /> },
    peutValider && { key: 'toutes', titre: 'Toutes les demandes', contenu: <ToutesTab /> },
  ].filter((o): o is Exclude<typeof o, false> => !!o)

  const [actif, setActif] = useState(onglets[0].key)
  const courant = onglets.find(o => o.key === actif) ?? onglets[0]

  return (
    <div className="tw-rounded-xl tw-bg-white tw-p-6 tw-shadow">
      <div className="tw-mb-5">
        <h3 className="tw-m-0 tw-text-xl tw-font-semibold tw-text-gray-800">Tickets restaurant</h3>
        <p className="tw-mb-0 tw-mt-1 tw-text-sm tw-text-gray-500">
          Cochez les dates et choisissez les agents : le total est calculé à 1 500 FCFA par jour et par agent.
        </p>
      </div>

      <div className="tw-mb-5 tw-flex tw-gap-1 tw-border-b tw-border-gray-200">
        {onglets.map(o => (
          <button key={o.key} type="button" onClick={() => setActif(o.key)}
            className={`tw-cursor-pointer tw-border-0 tw-border-b-2 tw-bg-transparent tw-px-4 tw-py-2 tw-text-sm tw-font-medium tw-transition
              ${o.key === courant.key ? 'tw-border-blue-600 tw-text-blue-600' : 'tw-border-transparent tw-text-gray-500 hover:tw-text-gray-800'}`}>
            {o.titre}
          </button>
        ))}
      </div>

      {courant.contenu}
    </div>
  )
}

'use client'
import { useContext, useState } from 'react'
import { UserContext } from '@/app/userContext'
import { aUnDesRoles } from '@/app/rolesUtilisateur'
import MesTicketsTab from './MesTicketsTab'
import AValiderTab from './AValiderTab'
import ToutesTab from './ToutesTab'

export default function TicketCarburantPage() {
  const { user } = useContext(UserContext)

  // Seul un compte avec le rôle supplémentaire TICKET_CARBURANT peut demander — le CSA et le
  // Directeur ne font que valider.
  const peutCreer = aUnDesRoles(user, ['TICKET_CARBURANT'])
  const peutValider = aUnDesRoles(user, ['CSA', 'DIRECTEUR', 'ASSISTANTE_DIRECTEUR'])

  const onglets = [
    peutCreer && { key: 'mes', titre: 'Mes demandes', contenu: <MesTicketsTab /> },
    peutValider && { key: 'avalider', titre: 'À valider', contenu: <AValiderTab /> },
    peutValider && { key: 'toutes', titre: 'Toutes les demandes', contenu: <ToutesTab /> },
  ].filter((o): o is Exclude<typeof o, false> => !!o)

  const [actif, setActif] = useState(onglets[0]?.key)
  const courant = onglets.find(o => o.key === actif) ?? onglets[0]

  if (!courant) return null

  return (
    <div className="tw-rounded-xl tw-bg-white tw-p-6 tw-shadow">
      <div className="tw-mb-5">
        <h3 className="tw-m-0 tw-text-xl tw-font-semibold tw-text-gray-800">Tickets carburant</h3>
        <p className="tw-mb-0 tw-mt-1 tw-text-sm tw-text-gray-500">
          Sélectionnez le trajet (ville de départ, ville d&apos;arrivée) et le nombre de tickets demandé.
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

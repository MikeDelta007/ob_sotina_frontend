'use client'
import { useContext } from 'react'
import { TabPanel, TabView } from 'primereact/tabview'
import { UserContext } from '@/app/userContext'
import { aUnDesRoles } from '@/app/rolesUtilisateur'
import MesTicketsTab from './MesTicketsTab'
import AValiderTab from './AValiderTab'
import ToutesTab from './ToutesTab'

export default function TicketRestaurantPage() {
  const { user } = useContext(UserContext)
  const peutValider = aUnDesRoles(user, ['DIRECTEUR'])
  // Créer une demande nécessite le droit TICKET_RESTAURANT (ou être Directeur)
  const peutCreer = aUnDesRoles(user, ['TICKET_RESTAURANT']) || peutValider

  const onglets = [
    peutCreer && { key: 'mes', header: 'Mes demandes', leftIcon: 'pi pi-ticket mr-2', content: <MesTicketsTab /> },
    peutValider && { key: 'avalider', header: 'À valider', leftIcon: 'pi pi-check-square mr-2', content: <AValiderTab /> },
    { key: 'toutes', header: 'Toutes les demandes', leftIcon: 'pi pi-list mr-2', content: <ToutesTab /> },
  ].filter((o): o is Exclude<typeof o, false> => !!o)

  return (
    <div className="card">
      <div className="mb-4">
        <h3 className="m-0">Tickets restaurant</h3>
        <p className="text-color-secondary mt-1 mb-0">
          Demande de tickets restaurant par période, jours de la semaine et agents concernés
        </p>
      </div>

      <TabView>
        {onglets.map(o => (
          <TabPanel key={o.key} header={o.header} leftIcon={o.leftIcon}>
            {o.content}
          </TabPanel>
        ))}
      </TabView>
    </div>
  )
}

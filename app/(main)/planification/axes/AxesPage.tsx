'use client'
import { useContext, useEffect } from 'react'
import { UserContext } from '@/app/userContext'
import { aUnDesRoles } from '@/app/rolesUtilisateur'
import { TabPanel, TabView } from 'primereact/tabview'
import { useAxeStore } from './useAxeStore'
import AxesTab from './AxesTab'
import CampagnesTab from './CampagnesTab'

export default function AxesPage() {
  const { user } = useContext(UserContext)
  // Rôles de supervision globale, toujours autorisés ; en dehors de ceux-là, seul le chef de la
  // division Hygiène et Sécurité y a accès (et non n'importe quel chef de service) — vérifié
  // côté serveur, pas seulement ici.
  const estAutoriseParRole = aUnDesRoles(user, ['ADMIN', 'DIRECTEUR', 'ASSISTANTE_DIRECTEUR', 'CSA'])

  const { estChefHygieneSecurite, estChefHSCharge, fetchEstChefHygieneSecurite } = useAxeStore()

  const estAutorise = estAutoriseParRole || estChefHygieneSecurite
  const peutGerer = estAutorise
  const verificationEnCours = !estAutoriseParRole && !estChefHSCharge

  useEffect(() => {
    if (estAutoriseParRole) return
    fetchEstChefHygieneSecurite()
  }, [estAutoriseParRole])

  if (verificationEnCours) {
    return <div className="card">Vérification de vos droits d&apos;accès…</div>
  }
  if (!estAutorise) {
    return <div className="card">Accès réservé au Directeur, à l&apos;Assistante Directeur, au CSA, à l&apos;Admin, ou au chef de la division Hygiène et Sécurité.</div>
  }

  return (
    <div className="card">
      <div className="mb-4">
        <h3 className="m-0">Axes</h3>
      </div>

      <TabView>
        <TabPanel header="Axes" leftIcon="pi pi-directions mr-2">
          <AxesTab peutGerer={peutGerer} />
        </TabPanel>
        <TabPanel header="Campagnes" leftIcon="pi pi-calendar mr-2">
          <CampagnesTab peutGerer={peutGerer} />
        </TabPanel>
      </TabView>
    </div>
  )
}

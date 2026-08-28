'use client'
import { useContext } from 'react'
import { TabPanel, TabView } from 'primereact/tabview'
import { UserContext } from '@/app/userContext'
import MesExpressionsTab from './MesExpressionsTab'
import AValiderTab from './AValiderTab'
import ATraiterTab from './ATraiterTab'

export default function ExpressionBesoinPage() {
  const { user } = useContext(UserContext)
  const role = user?.profil?.name

  const peutSoumettre = role === 'CHEF_SERVICE'
  const peutValider = role === 'CSA' || role === 'DIRECTEUR' || role === 'ADMIN'
  const peutTraiter = role === 'CHEF_COMPTABLE' || role === 'AGENT_COMPTABLE'

  return (
    <div className="card">
      <div className="mb-4">
        <h3 className="m-0">Expressions de besoin</h3>
        <p className="text-color-secondary mt-1 mb-0">
          Soumission, validation et traitement des demandes avant mandatement
        </p>
      </div>

      <TabView>
        {peutSoumettre && (
          <TabPanel header="Mes expressions de besoin" leftIcon="pi pi-file-edit mr-2">
            <MesExpressionsTab />
          </TabPanel>
        )}
        {peutValider && (
          <TabPanel header="À valider" leftIcon="pi pi-check-square mr-2">
            <AValiderTab />
          </TabPanel>
        )}
        {peutTraiter && (
          <TabPanel header="À traiter" leftIcon="pi pi-wallet mr-2">
            <ATraiterTab />
          </TabPanel>
        )}
      </TabView>
    </div>
  )
}

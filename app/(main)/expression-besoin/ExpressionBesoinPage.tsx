'use client'
import { useContext } from 'react'
import { TabPanel, TabView } from 'primereact/tabview'
import { UserContext } from '@/app/userContext'
import MesExpressionsTab from './MesExpressionsTab'
import AValiderTab from './AValiderTab'
import ValideesTab from './ValideesTab'
import ATraiterTab from './ATraiterTab'
import TraiteesTab from './TraiteesTab'

export default function ExpressionBesoinPage() {
  const { user } = useContext(UserContext)
  const role = user?.profil?.name

  const peutTraiter = role === 'CHEF_COMPTABLE' || role === 'AGENT_COMPTABLE'
  const peutValider = role === 'CSA' || role === 'DIRECTEUR'
  const peutSoumettre = role === 'CHEF_SERVICE' || peutTraiter || peutValider

  const onglets = [
    peutSoumettre && { key: 'mes', header: 'Mes expressions de besoin', leftIcon: 'pi pi-file-edit mr-2', content: <MesExpressionsTab /> },
    peutValider && { key: 'avalider', header: 'À valider', leftIcon: 'pi pi-check-square mr-2', content: <AValiderTab /> },
    peutValider && { key: 'validees', header: 'Validées', leftIcon: 'pi pi-verified mr-2', content: <ValideesTab /> },
    peutTraiter && { key: 'atraiter', header: 'À traiter', leftIcon: 'pi pi-wallet mr-2', content: <ATraiterTab /> },
    peutTraiter && { key: 'traitees', header: 'Traitées', leftIcon: 'pi pi-verified mr-2', content: <TraiteesTab /> },
  ].filter((o): o is Exclude<typeof o, false> => !!o)

  return (
    <div className="card">
      <div className="mb-4">
        <h3 className="m-0">Expressions de besoin</h3>
        <p className="text-color-secondary mt-1 mb-0">
          Soumission, validation et traitement des demandes avant mandatement
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

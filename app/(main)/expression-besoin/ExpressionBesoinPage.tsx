'use client'
import { aUnDesRoles } from '@/app/rolesUtilisateur'
import { useContext } from 'react'
import { TabPanel, TabView } from 'primereact/tabview'
import { UserContext } from '@/app/userContext'
import MesExpressionsTab from './MesExpressionsTab'
import MesExpressionsLieesTab from './MesExpressionsLieesTab'
import AValiderTab from './AValiderTab'
import ValideesTab from './ValideesTab'
import RejeteesTab from './RejeteesTab'
import ATraiterTab from './ATraiterTab'
import TraiteesTab from './TraiteesTab'

export default function ExpressionBesoinPage() {
  const { user } = useContext(UserContext)
  const aRole = (r: string) => aUnDesRoles(user, [r])

  const peutTraiter = aRole('CHEF_COMPTABLE') || aRole('AGENT_COMPTABLE')
  const peutValider = aRole('CSA') || aRole('DIRECTEUR')
  const peutSoumettre = aRole('CHEF_SERVICE') || peutTraiter || peutValider
  // Un agent simple ne crée jamais d'expression de besoin : il consulte, en lecture seule,
  // celles où son chef l'a déclaré bénéficiaire.
  const estAgentSimple = aRole('AGENT')
  // CSA/Directeur voient ce que traite la comptabilité, mais en lecture seule
  const peutVoirTraitement = peutTraiter || peutValider

  const onglets = [
    peutSoumettre && { key: 'mes', header: 'Mes expressions de besoin', leftIcon: 'pi pi-file-edit mr-2', content: <MesExpressionsTab /> },
    estAgentSimple && { key: 'liees', header: 'Mes expressions de besoin', leftIcon: 'pi pi-eye mr-2', content: <MesExpressionsLieesTab /> },
    peutValider && { key: 'avalider', header: 'À valider', leftIcon: 'pi pi-check-square mr-2', content: <AValiderTab /> },
    peutValider && { key: 'validees', header: 'Validées', leftIcon: 'pi pi-verified mr-2', content: <ValideesTab /> },
    peutValider && { key: 'rejetees', header: 'Rejetées', leftIcon: 'pi pi-times-circle mr-2', content: <RejeteesTab /> },
    peutVoirTraitement && { key: 'atraiter', header: 'À traiter', leftIcon: 'pi pi-wallet mr-2', content: <ATraiterTab lectureSeule={!peutTraiter} /> },
    peutVoirTraitement && { key: 'traitees', header: 'Traitées', leftIcon: 'pi pi-verified mr-2', content: <TraiteesTab /> },
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

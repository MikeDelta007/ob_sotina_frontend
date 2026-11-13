'use client'
import { aUnDesRoles } from '@/app/rolesUtilisateur'
import { useContext } from 'react'
import { TabPanel, TabView } from 'primereact/tabview'
import { UserContext } from '@/app/userContext'
import { useNotificationCounts } from '@/layout/useNotificationCounts'
import OngletBadge from '@/layout/OngletBadge'
import MesExpressionsTab from './MesExpressionsTab'
import MesExpressionsLieesTab from './MesExpressionsLieesTab'
import AValiderTab from './AValiderTab'
import MontantReduitTab from './MontantReduitTab'
import ValideesTab from './ValideesTab'
import RejeteesTab from './RejeteesTab'
import ATraiterTab from './ATraiterTab'
import TraiteesTab from './TraiteesTab'
import ArchiveesTab from './ArchiveesTab'

export default function ExpressionBesoinPage() {
  const { user } = useContext(UserContext)
  const notificationCounts = useNotificationCounts(!!user)
  const aRole = (r: string) => aUnDesRoles(user, [r])

  const estAdmin = aRole('ADMIN')
  const peutTraiter = aRole('CHEF_COMPTABLE') || aRole('AGENT_COMPTABLE')
  // L'Admin voit toutes les expressions de besoin (supervision + correction avant
  // mandatement), mais ne valide/ne traite jamais lui-même — lecture seule sur ces écrans.
  const peutValider = aRole('CSA') || aRole('DIRECTEUR') || aRole('ASSISTANTE_DIRECTEUR') || estAdmin
  const peutSoumettre = aRole('CHEF_SERVICE') || peutTraiter || (peutValider && !estAdmin)
  // Un agent simple ne crée jamais d'expression de besoin : il consulte, en lecture seule,
  // celles où son chef l'a déclaré bénéficiaire.
  const estAgentSimple = aRole('AGENT')
  // CSA/Directeur/Admin voient ce que traite la comptabilité, mais en lecture seule
  const peutVoirTraitement = peutTraiter || peutValider
  // Seuls ceux qui peuvent archiver ont besoin de retrouver ce qu'ils ont archivé
  const peutArchiver = aRole('DIRECTEUR') || estAdmin

  const onglets = [
    peutSoumettre && { key: 'mes', header: 'Mes expressions de besoin', leftIcon: 'pi pi-file-edit mr-2', content: <MesExpressionsTab /> },
    estAgentSimple && { key: 'liees', header: 'Mes expressions de besoin', leftIcon: 'pi pi-eye mr-2', content: <MesExpressionsLieesTab /> },
    peutValider && {
      key: 'avalider',
      header: <span className="flex align-items-center">À valider <OngletBadge count={notificationCounts.expressionBesoin} /></span>,
      leftIcon: 'pi pi-check-square mr-2', content: <AValiderTab />
    },
    peutValider && { key: 'validees', header: 'Validées', leftIcon: 'pi pi-verified mr-2', content: <ValideesTab /> },
    peutValider && { key: 'montantreduit', header: '< 20 000 FCFA', leftIcon: 'pi pi-arrow-down mr-2', headerClassName: 'eb-onglet-montant-reduit', content: <MontantReduitTab /> },
    peutValider && { key: 'rejetees', header: 'Rejetées', leftIcon: 'pi pi-times-circle mr-2', content: <RejeteesTab /> },
    peutVoirTraitement && { key: 'atraiter', header: 'À traiter', leftIcon: 'pi pi-wallet mr-2', content: <ATraiterTab lectureSeule={!peutTraiter} /> },
    peutVoirTraitement && { key: 'traitees', header: 'Traitées', leftIcon: 'pi pi-verified mr-2', content: <TraiteesTab /> },
    peutArchiver && { key: 'archivees', header: 'Archivées', leftIcon: 'pi pi-inbox mr-2', content: <ArchiveesTab /> },
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
          <TabPanel key={o.key} header={o.header} leftIcon={o.leftIcon}
            headerClassName={'headerClassName' in o ? o.headerClassName : undefined}>
            {o.content}
          </TabPanel>
        ))}
      </TabView>
    </div>
  )
}

'use client'
import { useEffect, useState } from 'react'
import { saveAs } from 'file-saver'
import axiosInstance from '@/app/api/axiosInstance'
import { Alerte, Badge, Bouton, Champ, CLASSE_INPUT, Modal, SelectionMultiple, Tableau, type Colonne } from './ui'
import { useTicketRestaurantStore } from './useTicketRestaurantStore'
import { fmt, datesCochees, MONTANT_PAR_JOUR, STATUT_LABEL, type StatutTR, type TicketRestaurant } from './types'

const COULEUR_STATUT: Record<StatutTR, 'attente' | 'succes' | 'danger'> = { EN_ATTENTE: 'attente', VALIDEE: 'succes', REJETEE: 'danger' }
const AUJOURDHUI = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })

export default function MesTicketsTab() {
  const { mesAgents, agentsErreur, motifs, mesTickets, loading, error, fetchMesAgents, fetchMotifs, fetchMesTickets, creer } = useTicketRestaurantStore()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [motifId, setMotifId] = useState('')
  const [agentIds, setAgentIds] = useState<string[]>([])
  const [err, setErr] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)

  useEffect(() => { fetchMesAgents(); fetchMotifs(); fetchMesTickets() }, [])

  const openCreate = () => {
    setMotifId(''); setAgentIds([]); setErr(''); setDialogOpen(true)
  }

  const montantTotal = MONTANT_PAR_JOUR * agentIds.length
  const formulaireValide = !!motifId && agentIds.length > 0

  const enregistrer = async () => {
    if (!formulaireValide) { setErr('Choisissez un motif et au moins un agent'); return }
    setSubmitting(true)
    try {
      await creer({ motifId, agentIds })
      setDialogOpen(false)
    } catch (e: any) {
      setErr(e?.response?.data?.errorMessage ?? e?.response?.data?.message ?? 'Erreur lors de l\'enregistrement')
    } finally {
      setSubmitting(false)
    }
  }

  const telecharger = async (t: TicketRestaurant) => {
    setDownloadingId(t.id)
    try {
      const { data } = await axiosInstance.get(`ticket-restaurant/${t.id}/liste.pdf`, { responseType: 'blob' })
      saveAs(data, `tickets_restaurant_${t.id}.pdf`)
    } finally {
      setDownloadingId(null)
    }
  }

  const colonnes: Colonne<TicketRestaurant>[] = [
    { titre: 'Motif', rendu: t => t.motifLibelle },
    { titre: 'Date', rendu: t => datesCochees(t) },
    { titre: 'Agents', rendu: t => `${t.agentNoms?.length ?? 0} agent(s)`, alignement: 'centre' },
    { titre: 'Montant', rendu: t => fmt(t.montantTotal), alignement: 'droite' },
    { titre: 'Statut', rendu: t => <Badge couleur={COULEUR_STATUT[t.statut]}>{STATUT_LABEL[t.statut]}</Badge>, alignement: 'centre' },
    { titre: 'Motif de rejet', rendu: t => t.motifRejet || '—' },
    {
      titre: 'Actions', alignement: 'centre',
      rendu: t => t.statut === 'VALIDEE' && (
        <Bouton chargement={downloadingId === t.id} onClick={() => telecharger(t)}>Télécharger le PDF</Bouton>
      ),
    },
  ]

  return (
    <div>
      <Tableau lignes={mesTickets} colonnes={colonnes} chargement={loading}
        recherche={t => `${STATUT_LABEL[t.statut]} ${t.motifLibelle ?? ''} ${t.motifRejet ?? ''} ${(t.agentNoms ?? []).join(' ')}`}
        vide="Aucune demande de tickets restaurant"
        entete={<Bouton onClick={openCreate}>+ Nouvelle demande</Bouton>} />

      <Modal ouvert={dialogOpen} titre="Nouvelle demande de tickets restaurant" onFermer={() => setDialogOpen(false)}
        pied={
          <>
            <Bouton variante="contour" className="tw-flex-1" onClick={() => setDialogOpen(false)} disabled={submitting}>Annuler</Bouton>
            <Bouton className="tw-flex-1" chargement={submitting} onClick={enregistrer}>Enregistrer</Bouton>
          </>
        }>
        <div className="tw-flex tw-flex-col tw-gap-5">
          <div className="tw-rounded-lg tw-bg-gray-50 tw-px-4 tw-py-3 tw-text-sm tw-text-gray-600">
            Demande pour aujourd&apos;hui, <span className="tw-font-medium tw-text-gray-800">{AUJOURDHUI}</span>.
          </div>

          <Champ etiquette="Motif *">
            <select value={motifId} onChange={e => setMotifId(e.target.value)} className={CLASSE_INPUT}>
              <option value="">Choisir…</option>
              {motifs.map(m => <option key={m.id} value={m.id}>{m.libelle}</option>)}
            </select>
          </Champ>

          <Champ etiquette="Agents * (tout le personnel)">
            <SelectionMultiple valeur={agentIds} onChange={setAgentIds}
              placeholder={agentsErreur ? 'Liste indisponible' : 'Rechercher un agent…'}
              options={mesAgents.map(a => ({ label: `${a.lastname ?? ''} ${a.firstname ?? ''}`.trim(), value: a.id }))} />
            {agentsErreur && (
              <span className="tw-text-xs tw-text-red-600">
                La liste des agents n&apos;a pas pu être chargée (vérifiez que le backend est à jour et redémarré).
              </span>
            )}
          </Champ>

          {agentIds.length > 0 && (
            <div className="tw-flex tw-items-center tw-justify-between tw-rounded-lg tw-bg-gray-50 tw-px-4 tw-py-3">
              <span className="tw-text-sm tw-text-gray-500">{fmt(MONTANT_PAR_JOUR)} × {agentIds.length} agent(s)</span>
              <strong className="tw-text-gray-800">{fmt(montantTotal)}</strong>
            </div>
          )}

          {err && <Alerte>{err}</Alerte>}
          {error && !err && <Alerte>{error}</Alerte>}
        </div>
      </Modal>
    </div>
  )
}

'use client'
import { useEffect, useMemo, useState } from 'react'
import { saveAs } from 'file-saver'
import axiosInstance from '@/app/api/axiosInstance'
import { Alerte, Badge, Bouton, Champ, Modal, SelectionMultiple, Tableau, type Colonne } from './ui'
import { useTicketRestaurantStore } from './useTicketRestaurantStore'
import { fmt, datesCochees, semainesAffichees, MONTANT_PAR_JOUR, STATUT_LABEL, type StatutTR, type TicketRestaurant } from './types'

const JOURS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven']
const MOIS_COURTS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.']
const libelle = (iso: string) => `${iso.slice(8, 10)} ${MOIS_COURTS[Number(iso.slice(5, 7)) - 1]}`
const COULEUR_STATUT: Record<StatutTR, 'attente' | 'succes' | 'danger'> = { EN_ATTENTE: 'attente', VALIDEE: 'succes', REJETEE: 'danger' }

export default function MesTicketsTab() {
  const { mesAgents, agentsErreur, mesTickets, loading, error, fetchMesAgents, fetchMesTickets, creer } = useTicketRestaurantStore()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dates, setDates] = useState<string[]>([])
  const [agentIds, setAgentIds] = useState<string[]>([])
  const [err, setErr] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)

  useEffect(() => { fetchMesAgents(); fetchMesTickets() }, [])

  const semaines = useMemo(() => semainesAffichees(4), [])

  const openCreate = () => {
    setDates([]); setAgentIds([]); setErr(''); setDialogOpen(true)
  }
  const basculer = (iso: string, coche: boolean) =>
    setDates(ds => coche ? [...ds, iso].sort() : ds.filter(d => d !== iso))

  const montantTotal = dates.length * MONTANT_PAR_JOUR * agentIds.length
  const formulaireValide = dates.length > 0 && agentIds.length > 0

  const enregistrer = async () => {
    if (!formulaireValide) { setErr('Cochez au moins une date et choisissez au moins un agent'); return }
    setSubmitting(true)
    try {
      await creer({ dates, agentIds })
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
    { titre: 'Dates', rendu: t => datesCochees(t) },
    { titre: 'Agents', rendu: t => `${t.agentNoms?.length ?? 0} agent(s)`, alignement: 'centre' },
    { titre: 'Jours', rendu: t => t.nombreJours, alignement: 'centre' },
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
        recherche={t => `${STATUT_LABEL[t.statut]} ${t.motifRejet ?? ''} ${(t.agentNoms ?? []).join(' ')}`}
        vide="Aucune demande de tickets restaurant"
        entete={<Bouton onClick={openCreate}>+ Nouvelle demande</Bouton>} />

      <Modal ouvert={dialogOpen} titre="Nouvelle demande de tickets restaurant" onFermer={() => setDialogOpen(false)} largeur="tw-max-w-2xl"
        pied={
          <>
            <Bouton variante="contour" className="tw-flex-1" onClick={() => setDialogOpen(false)} disabled={submitting}>Annuler</Bouton>
            <Bouton className="tw-flex-1" chargement={submitting} onClick={enregistrer}>Enregistrer</Bouton>
          </>
        }>
        <div className="tw-flex tw-flex-col tw-gap-5">
          <div>
            <div className="tw-mb-3 tw-text-sm tw-font-medium tw-text-gray-700">Dates concernées * (cochez les jours)</div>

            <div className="tw-flex tw-max-h-80 tw-flex-col tw-gap-3 tw-overflow-y-auto tw-pr-1">
              {semaines.map(sem => (
                <div key={sem.lundi}>
                  <div className="tw-mb-1 tw-text-xs tw-font-semibold tw-text-gray-500">
                    Semaine du {libelle(sem.lundi)} au {libelle(sem.fin)}
                  </div>
                  <div className="tw-grid tw-grid-cols-5 tw-gap-2">
                    {sem.jours.map((jour, k) => {
                      const coche = dates.includes(jour.iso)
                      return (
                        <label key={k}
                          className={`tw-flex tw-select-none tw-flex-col tw-items-center tw-justify-center tw-gap-1 tw-rounded-lg tw-border-2 tw-py-2 tw-transition
                            ${!jour.actif ? 'tw-cursor-not-allowed tw-border-gray-200 tw-bg-gray-50 tw-opacity-40'
                              : coche ? 'tw-cursor-pointer tw-border-blue-600 tw-bg-blue-50'
                              : 'tw-cursor-pointer tw-border-gray-200 hover:tw-border-blue-300'}`}>
                          <span className="tw-text-xs tw-uppercase tw-text-gray-500">{JOURS[k]}</span>
                          <input type="checkbox" className="tw-h-5 tw-w-5 tw-cursor-pointer tw-accent-blue-600"
                            checked={coche} disabled={!jour.actif} onChange={e => basculer(jour.iso, e.target.checked)} />
                          <span className={`tw-text-sm ${coche ? 'tw-font-semibold tw-text-blue-700' : 'tw-text-gray-700'}`}>{libelle(jour.iso)}</span>
                        </label>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
            <p className="tw-mb-0 tw-mt-2 tw-text-xs tw-text-gray-500">
              {dates.length} date(s) cochée(s).
            </p>
          </div>

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

          {dates.length > 0 && agentIds.length > 0 && (
            <div className="tw-flex tw-items-center tw-justify-between tw-rounded-lg tw-bg-gray-50 tw-px-4 tw-py-3">
              <span className="tw-text-sm tw-text-gray-500">{dates.length} jour(s) × {fmt(MONTANT_PAR_JOUR)} × {agentIds.length} agent(s)</span>
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

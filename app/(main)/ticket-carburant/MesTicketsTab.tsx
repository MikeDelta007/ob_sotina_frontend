'use client'
import { useEffect, useState } from 'react'
import { saveAs } from 'file-saver'
import axiosInstance from '@/app/api/axiosInstance'
import { Alerte, Badge, Bouton, Champ, Modal, Tableau, CLASSE_INPUT, type Colonne } from '../ticket-restaurant/ui'
import { useTicketCarburantStore } from './useTicketCarburantStore'
import { STATUT_LABEL, type StatutTC, type TicketCarburant } from './types'

const COULEUR_STATUT: Record<StatutTC, 'attente' | 'succes' | 'danger'> = { EN_ATTENTE: 'attente', VALIDEE: 'succes', REJETEE: 'danger' }

export default function MesTicketsTab() {
  const { villes, villesErreur, motifs, mesTickets, loading, error, fetchVilles, fetchMotifs, fetchMesTickets, creer } = useTicketCarburantStore()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [motifId, setMotifId] = useState('')
  const [date, setDate] = useState('')
  const [villeDepartId, setVilleDepartId] = useState('')
  const [villeArriveeId, setVilleArriveeId] = useState('')
  const [nombreTickets, setNombreTickets] = useState<number | ''>('')
  const [err, setErr] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)

  useEffect(() => { fetchVilles(); fetchMotifs(); fetchMesTickets() }, [])

  const openCreate = () => {
    setMotifId(''); setDate(''); setVilleDepartId(''); setVilleArriveeId(''); setNombreTickets(''); setErr(''); setDialogOpen(true)
  }

  const formulaireValide = motifId && date && villeDepartId && villeArriveeId
    && villeDepartId !== villeArriveeId && typeof nombreTickets === 'number' && nombreTickets > 0

  const enregistrer = async () => {
    if (!formulaireValide) {
      setErr(villeDepartId && villeDepartId === villeArriveeId
        ? 'La ville de départ et la ville d\'arrivée doivent être différentes'
        : 'Remplissez tous les champs')
      return
    }
    setSubmitting(true)
    try {
      await creer({ motifId, date, villeDepartId, villeArriveeId, nombreTicketsDemande: nombreTickets as number })
      setDialogOpen(false)
    } catch (e: any) {
      setErr(e?.response?.data?.errorMessage ?? e?.response?.data?.message ?? 'Erreur lors de l\'enregistrement')
    } finally {
      setSubmitting(false)
    }
  }

  const telecharger = async (t: TicketCarburant) => {
    setDownloadingId(t.id)
    try {
      const { data } = await axiosInstance.get(`ticket-carburant/${t.id}/fiche.pdf`, { responseType: 'blob' })
      saveAs(data, `demande_carburant_${t.id}.pdf`)
    } finally {
      setDownloadingId(null)
    }
  }

  const colonnes: Colonne<TicketCarburant>[] = [
    { titre: 'Date', rendu: t => new Date(t.date).toLocaleDateString('fr-FR') },
    { titre: 'Trajet', rendu: t => `${t.villeDepartNom} — ${t.villeArriveeNom}` },
    { titre: 'Motif', rendu: t => t.motifLibelle },
    { titre: 'Demandé', rendu: t => t.nombreTicketsDemande, alignement: 'centre' },
    { titre: 'Accordé', rendu: t => t.nombreTicketsAccorde ?? '—', alignement: 'centre' },
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
        recherche={t => `${STATUT_LABEL[t.statut]} ${t.motifLibelle} ${t.villeDepartNom} ${t.villeArriveeNom}`}
        vide="Aucune demande de carburant"
        entete={<Bouton onClick={openCreate}>+ Nouvelle demande</Bouton>} />

      <Modal ouvert={dialogOpen} titre="Nouvelle demande de carburant" onFermer={() => setDialogOpen(false)}
        pied={
          <>
            <Bouton variante="contour" className="tw-flex-1" onClick={() => setDialogOpen(false)} disabled={submitting}>Annuler</Bouton>
            <Bouton className="tw-flex-1" chargement={submitting} onClick={enregistrer}>Enregistrer</Bouton>
          </>
        }>
        <div className="tw-flex tw-flex-col tw-gap-4">
          <Champ etiquette="Motif du déplacement *">
            <select value={motifId} onChange={e => setMotifId(e.target.value)} className={CLASSE_INPUT}>
              <option value="">Choisir…</option>
              {motifs.map(m => <option key={m.id} value={m.id}>{m.libelle}</option>)}
            </select>
          </Champ>

          <Champ etiquette="Date *">
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className={CLASSE_INPUT} />
          </Champ>

          <div className="tw-grid tw-grid-cols-2 tw-gap-4">
            <Champ etiquette="Ville de départ *">
              <select value={villeDepartId} onChange={e => setVilleDepartId(e.target.value)} className={CLASSE_INPUT}>
                <option value="">Choisir…</option>
                {villes.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
              </select>
            </Champ>
            <Champ etiquette="Ville d'arrivée *">
              <select value={villeArriveeId} onChange={e => setVilleArriveeId(e.target.value)} className={CLASSE_INPUT}>
                <option value="">Choisir…</option>
                {villes.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
              </select>
            </Champ>
          </div>
          {villesErreur && (
            <span className="tw-text-xs tw-text-red-600">La liste des villes n&apos;a pas pu être chargée.</span>
          )}

          <Champ etiquette="Nombre de tickets demandé *">
            <input type="number" min={1} value={nombreTickets}
              onChange={e => setNombreTickets(e.target.value === '' ? '' : Number(e.target.value))}
              className={CLASSE_INPUT} placeholder="0" />
          </Champ>

          {err && <Alerte>{err}</Alerte>}
          {error && !err && <Alerte>{error}</Alerte>}
        </div>
      </Modal>
    </div>
  )
}

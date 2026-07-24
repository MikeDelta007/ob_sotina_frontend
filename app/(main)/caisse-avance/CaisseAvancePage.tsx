'use client'
import { useEffect, useRef, useState } from 'react'
import { saveAs } from 'file-saver'
import axiosInstance from '@/app/api/axiosInstance'
import { Button } from 'primereact/button'
import { Card } from 'primereact/card'
import { Column } from 'primereact/column'
import { DataTable } from 'primereact/datatable'
import { Dropdown } from 'primereact/dropdown'
import { InputText } from 'primereact/inputtext'
import { Message } from 'primereact/message'
import { TabPanel, TabView } from 'primereact/tabview'
import { Tag } from 'primereact/tag'
import { Toast } from 'primereact/toast'
import { useCaisseStore } from './useCaisseStore'
import { useMandatementStore } from './useMandatementStore'
import { fmt, SEUIL_ALERTE, type Mandatement, type Approvisionnement } from './types'
import MandatementModal from './MandatementModal'
import CaisseGestionModal from './CaisseGestionModal'
import ReliquatsTab from './ReliquatsTab'
import MotifsTab from './MotifsTab'

const FILES_ORIGIN = (axiosInstance.defaults.baseURL ?? '').replace(/\/?api\/v1\/?$/, '')

const TYPE_OPTIONS = [
  { label: 'Tous types', value: 'TOUS' },
  { label: 'Simple', value: 'SIMPLE' },
  { label: 'Cumulatif', value: 'CUMULATIF' },
]
const MODE_OPTIONS = [
  { label: 'Tous modes', value: 'TOUS' },
  { label: 'Espèces', value: 'ESPECES' },
  { label: 'Chèque', value: 'CHEQUE' },
]

export default function CaisseAvancePage() {
  const { caisse, mandatements, approvisionnements, loading, error,
          fetchCaisse, fetchMotifs, fetchAllMotifs, fetchMandatements, fetchApprovisionnements,
          showApprovisionnementModal, openApprovisionnementModal, closeApprovisionnementModal } = useCaisseStore()
  const { openModal } = useMandatementStore()
  const [search, setSearch]     = useState('')
  const [filterType, setFilterType] = useState('TOUS')
  const [filterMode, setFilterMode] = useState('TOUS')
  const [exportingApprov, setExportingApprov] = useState(false)
  const [exportingMandatements, setExportingMandatements] = useState(false)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const toast = useRef<Toast>(null)

  useEffect(() => {
    fetchCaisse()
    fetchMotifs()
    fetchAllMotifs()
    fetchMandatements()
    fetchApprovisionnements()
  }, [])

  const solde        = caisse?.montant ?? 0
  const alerteSolde  = solde > 0 && solde <= SEUIL_ALERTE
  const caisseVide   = solde === 0

  const filtered = mandatements.filter(m => {
    const matchSearch = !search ||
      m.factures.some(f =>
        f.numero?.toLowerCase().includes(search.toLowerCase()) ||
        f.motifLibelle?.toLowerCase().includes(search.toLowerCase()))
    const matchType = filterType === 'TOUS' || m.type === filterType
    const matchMode = filterMode === 'TOUS' || m.modePaiement === filterMode
    return matchSearch && matchType && matchMode
  })

  const totalDecaisse = mandatements
    .filter(m => m.modePaiement === 'ESPECES' && m.decaisse)
    .reduce((s, m) => s + (m.montantDecaisse ?? 0), 0)

  const reliquatsEnAttente = mandatements.filter(m =>
    m.typePaiement === 'AVANCE' && (m.montantReliquat ?? 0) > 0 && !m.reliquatPaye).length

  const downloadDecaissement = async (id: string) => {
    setDownloadingId(id)
    try {
      const { data } = await axiosInstance.get(`mandatement/${id}/decaissement.pdf`,
        { responseType: 'blob' })
      saveAs(data, `decaissement_${id}.pdf`)
    } catch {
      toast.current?.show({ severity: 'error', summary: 'Erreur', detail: 'Téléchargement du décaissement impossible' })
    } finally {
      setDownloadingId(null)
    }
  }

  const exportMandatements = async () => {
    setExportingMandatements(true)
    try {
      const { data } = await axiosInstance.get('mandatement/export.xlsx',
        { responseType: 'blob' })
      saveAs(data, 'mandatements_caisse_avance.xlsx')
    } catch {
      toast.current?.show({ severity: 'error', summary: 'Erreur', detail: 'Export des mandatements impossible' })
    } finally {
      setExportingMandatements(false)
    }
  }

  const exportApprovisionnements = async () => {
    setExportingApprov(true)
    try {
      const { data } = await axiosInstance.get('caisse-avance/approvisionnements/export.xlsx',
        { responseType: 'blob' })
      saveAs(data, 'approvisionnements_caisse_avance.xlsx')
    } catch {
      toast.current?.show({ severity: 'error', summary: 'Erreur', detail: 'Export des approvisionnements impossible' })
    } finally {
      setExportingApprov(false)
    }
  }

  const approvMontantBody = (a: Approvisionnement) => <strong className="text-green-600">+{fmt(a.montant)}</strong>
  const approvSoldeAvantBody = (a: Approvisionnement) => fmt(a.soldeAvant)
  const approvSoldeApresBody = (a: Approvisionnement) => <strong>{fmt(a.soldeApres)}</strong>
  const approvDateBody = (a: Approvisionnement) => (
    <span className="text-color-secondary text-sm">
      {a.date ? new Date(a.date).toLocaleDateString('fr-FR') : '—'}
    </span>
  )
  const approvCreeParBody = (a: Approvisionnement) => <Tag severity="secondary" value={a.creePar} />

  const totalApprovisionne = approvisionnements.reduce((s, a) => s + (a.montant ?? 0), 0)

  const facturesBody = (m: Mandatement) => (
    <div className="flex flex-column gap-1">
      {m.factures.map(f => (
        <span key={f.numero} className="font-mono text-sm text-primary">{f.numero}</span>
      ))}
    </div>
  )

  const motifsBody = (m: Mandatement) => (
    <div className="flex flex-column gap-1">
      {m.factures.map(f => (
        <span key={f.numero} className="text-sm">
          {f.motifLibelle ?? '—'}{' '}
          {m.type === 'CUMULATIF' && <span className="text-color-secondary">({fmt(f.montant)})</span>}
        </span>
      ))}
    </div>
  )

  const typeBody = (m: Mandatement) => (
    <Tag severity={m.type === 'SIMPLE' ? 'info' : 'warning'}
      value={m.type === 'SIMPLE' ? 'Simple' : `Cumulatif (${m.factures.length})`} />
  )

  const avanceBody = (m: Mandatement) =>
    m.typePaiement === 'AVANCE' && m.montantAvance ? fmt(m.montantAvance) : '—'

  const reliquatBody = (m: Mandatement) => {
    if (m.typePaiement !== 'AVANCE' || !m.montantReliquat) return '—'
    return (
      <div className="flex align-items-center justify-content-end gap-2">
        <span>{fmt(m.montantReliquat)}</span>
        <Tag severity={m.reliquatPaye ? 'success' : 'warning'} value={m.reliquatPaye ? 'Payé' : 'En attente'} />
      </div>
    )
  }

  const modeBody = (m: Mandatement) => (
    <Tag severity={m.modePaiement === 'ESPECES' ? 'success' : 'warning'}
      icon={m.modePaiement === 'ESPECES' ? 'pi pi-money-bill' : 'pi pi-credit-card'}
      value={m.modePaiement === 'ESPECES' ? 'Espèces' : 'Chèque'} />
  )

  const piecesBody = (m: Mandatement) => (
    <div className="flex flex-column align-items-center gap-2">
      <Button label="Décaissement" icon="pi pi-download" size="small"
        loading={downloadingId === m.id} onClick={() => downloadDecaissement(m.id)} />
      {m.factures.map(f => (
        <div key={f.numero} className="flex gap-1 flex-wrap justify-content-center">
          {f.urlPdfFacture && (
            <a href={`${FILES_ORIGIN}${f.urlPdfFacture}`} target="_blank" rel="noreferrer" title="Facture PDF">
              <Tag severity="secondary" icon="pi pi-file-pdf" value="Facture" />
            </a>
          )}
          {f.urlPdfCheque && (
            <a href={`${FILES_ORIGIN}${f.urlPdfCheque}`} target="_blank" rel="noreferrer" title="Chèque PDF">
              <Tag severity="warning" icon="pi pi-credit-card" value="Chèque" />
            </a>
          )}
          {f.urlPdfCni && (
            <a href={`${FILES_ORIGIN}${f.urlPdfCni}`} target="_blank" rel="noreferrer" title="CNI PDF">
              <Tag severity="secondary" icon="pi pi-id-card" value="CNI" />
            </a>
          )}
        </div>
      ))}
    </div>
  )

  const dateBody = (m: Mandatement) => (
    <span className="text-color-secondary text-sm">
      {new Date(m.dateCreation).toLocaleDateString('fr-FR')}
    </span>
  )

  return (
    <div className="card">
      <Toast ref={toast} />

      {/* Header */}
      <div className="flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h3 className="m-0">Caisse d'avance</h3>
          <p className="text-color-secondary mt-1 mb-0">Gestion des mandatements et décaissements</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button label="Approvisionner" icon="pi pi-wallet" outlined onClick={() => openApprovisionnementModal()} />
          <Button label="Simple" icon="pi pi-plus" onClick={() => openModal('SIMPLE')} />
          <Button label="Cumulatif" icon="pi pi-plus" severity="help" onClick={() => openModal('CUMULATIF')} />
        </div>
      </div>

      {/* Alertes */}
      {caisseVide && (
        <Message severity="error" className="w-full mb-3" content={
          <div className="flex align-items-center justify-content-between w-full p-2">
            <div>
              <div className="font-medium">Caisse épuisée</div>
              <div className="text-sm">Approvisionnez la caisse avant tout décaissement.</div>
            </div>
            <Button label="Approvisionner" size="small" severity="danger" onClick={() => openApprovisionnementModal()} />
          </div>
        } />
      )}

      {alerteSolde && !caisseVide && (
        <Message severity="warn" className="w-full mb-3" text={`Solde faible — en dessous de ${fmt(SEUIL_ALERTE)}`} />
      )}

      {error && <Message severity="error" className="w-full mb-3" text={error} />}

      {/* KPIs */}
      <div className="grid mb-2">
        <div className="col-12 md:col-3">
          <Card>
            <span className="block text-color-secondary text-sm mb-1">Solde caisse</span>
            <span className={`text-2xl font-bold ${caisseVide ? 'text-red-500' : alerteSolde ? 'text-orange-500' : ''}`}>
              {loading ? '…' : fmt(solde)}
            </span>
            {caisse?.date && (
              <span className="block text-color-secondary text-xs mt-1">
                au {new Date(caisse.date).toLocaleDateString('fr-FR')}
              </span>
            )}
          </Card>
        </div>

        <div className="col-12 md:col-3">
          <Card>
            <span className="block text-color-secondary text-sm mb-1">Total décaissé (espèces)</span>
            <span className="text-2xl font-bold">{fmt(totalDecaisse)}</span>
            <span className="block text-color-secondary text-xs mt-1">
              {mandatements.filter(m => m.decaisse && m.modePaiement === 'ESPECES').length} opération(s)
            </span>
          </Card>
        </div>

        <div className="col-12 md:col-3">
          <Card>
            <span className="block text-color-secondary text-sm mb-1">Mandatements</span>
            <span className="text-2xl font-bold">{mandatements.length}</span>
            <span className="block text-color-secondary text-xs mt-1">
              {mandatements.filter(m => m.type === 'SIMPLE').length} simples ·{' '}
              {mandatements.filter(m => m.type === 'CUMULATIF').length} cumulatifs
            </span>
          </Card>
        </div>

        <div className="col-12 md:col-3">
          <Card>
            <span className="block text-color-secondary text-sm mb-1">Reliquats en attente</span>
            <span className={`text-2xl font-bold ${reliquatsEnAttente > 0 ? 'text-orange-500' : ''}`}>
              {reliquatsEnAttente}
            </span>
            <span className="block text-color-secondary text-xs mt-1">à payer</span>
          </Card>
        </div>
      </div>

      <TabView>
        <TabPanel header="Mandatements" leftIcon="pi pi-list mr-2">
          <DataTable value={filtered} paginator rows={10} rowsPerPageOptions={[10, 25, 50]}
            loading={loading} emptyMessage="Aucun mandatement enregistré" responsiveLayout="scroll"
            header={
              <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
                <span className="p-input-icon-left flex-1" style={{ minWidth: 220 }}>
                  <i className="pi pi-search" />
                  <InputText value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Rechercher par numéro ou motif…" className="w-full" />
                </span>
                <Dropdown value={filterType} options={TYPE_OPTIONS} onChange={e => setFilterType(e.value)} />
                <Dropdown value={filterMode} options={MODE_OPTIONS} onChange={e => setFilterMode(e.value)} />
                <Button label="Exporter" icon="pi pi-file-excel" outlined
                  loading={exportingMandatements} onClick={exportMandatements} />
              </div>
            }
          >
            <Column header="N° Facture(s)" body={facturesBody} />
            <Column header="Motif(s)" body={motifsBody} />
            <Column header="Type" body={typeBody} align="center" alignHeader="center" />
            <Column header="Total" field="montantTotal" body={(m: Mandatement) => <strong>{fmt(m.montantTotal)}</strong>} align="right" alignHeader="right" />
            <Column header="Avance" body={avanceBody} align="right" alignHeader="right" />
            <Column header="Reliquat" body={reliquatBody} align="right" alignHeader="right" />
            <Column header="Mode" body={modeBody} align="center" alignHeader="center" />
            <Column header="Pièces & PDF" body={piecesBody} align="center" alignHeader="center" />
            <Column header="Date" body={dateBody} />
          </DataTable>
        </TabPanel>

        <TabPanel header="Approvisionnements" leftIcon="pi pi-wallet mr-2">
          <div className="flex flex-wrap align-items-center justify-content-between gap-3 mb-3">
            <p className="text-color-secondary m-0">
              {approvisionnements.length} opération(s) · total approvisionné {fmt(totalApprovisionne)}
            </p>
            <Button label="Exporter" icon="pi pi-file-excel" outlined
              loading={exportingApprov} onClick={exportApprovisionnements} />
          </div>

          <DataTable value={approvisionnements} paginator rows={10} rowsPerPageOptions={[10, 25, 50]}
            emptyMessage="Aucun approvisionnement enregistré" responsiveLayout="scroll">
            <Column header="Date" body={approvDateBody} />
            <Column header="Montant ajouté" body={approvMontantBody} align="right" alignHeader="right" />
            <Column header="Solde avant" body={approvSoldeAvantBody} align="right" alignHeader="right" />
            <Column header="Solde après" body={approvSoldeApresBody} align="right" alignHeader="right" />
            <Column header="Description" field="description" body={(a: Approvisionnement) => a.description || '—'} />
            <Column header="Créé par" body={approvCreeParBody} align="center" alignHeader="center" />
          </DataTable>
        </TabPanel>

        <TabPanel header="Reliquats à payer" leftIcon="pi pi-hourglass mr-2">
          <ReliquatsTab />
        </TabPanel>

        <TabPanel header="Motifs" leftIcon="pi pi-tags mr-2">
          <MotifsTab />
        </TabPanel>
      </TabView>

      <MandatementModal />
      <CaisseGestionModal open={showApprovisionnementModal} onClose={closeApprovisionnementModal} />
    </div>
  )
}

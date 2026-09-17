'use client'
import { useEffect, useState } from 'react'
import ProtectedRoute from '@/layout/ProtectedRoute'
import axiosInstance from '@/app/api/axiosInstance'
import { Button } from 'primereact/button'
import { Dropdown } from 'primereact/dropdown'
import { InputText } from 'primereact/inputtext'
import { Message } from 'primereact/message'
import { Toast } from 'primereact/toast'
import { useRef } from 'react'
import { TOUS_ROLES, fmtTypePersonnel, type Voiture } from '../types'
import type { Personnel } from '@/app/userContext'

const civiliteOptions = [
  { label: 'M.', value: 'Mr' },
  { label: 'Mme', value: 'Mme' },
  { label: 'Mlle', value: 'Mlle' },
]

interface MeUser {
  login: string
  personnel: Personnel
}

function MonProfilContent() {
  const toast = useRef<Toast>(null)
  const [me, setMe] = useState<MeUser | null>(null)
  const [voitures, setVoitures] = useState<Voiture[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    phone: '', email: '', civilite: null as string | null,
    bank: '', code_bank: '', code_agc: '', num_compte: '', key_rib: '', voiture: null as Voiture | null,
  })

  const load = () => {
    setLoading(true)
    axiosInstance.get('profile/me')
      .then(({ data }) => {
        setMe(data)
        const p = data.personnel ?? {}
        setForm({
          phone: p.phone ?? '',
          email: p.email ?? '',
          civilite: p.civilite ?? null,
          bank: p.bank ?? '',
          code_bank: p.code_bank ?? '',
          code_agc: p.code_agc ?? '',
          num_compte: p.num_compte ?? '',
          key_rib: p.key_rib ?? '',
          voiture: p.voiture ?? null,
        })
      })
      .catch(() => setError('Erreur chargement de votre profil'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
    axiosInstance.get('personnel/voitures').then(({ data }) => setVoitures(data)).catch(() => {})
  }, [])

  const save = async () => {
    setSaving(true)
    setError(null)
    try {
      await axiosInstance.put('profile/me', form)
      toast.current?.show({ severity: 'success', summary: 'Office du Bac', detail: 'Profil mis à jour avec succès', life: 4000 })
      load()
    } catch (e: any) {
      const msg = e.response?.data?.message ?? 'Erreur lors de la mise à jour'
      setError(msg)
      toast.current?.show({ severity: 'error', summary: 'Office du Bac', detail: msg, life: 4000 })
    } finally {
      setSaving(false)
    }
  }

  if (loading || !me) return <div className="card">Chargement…</div>

  const p = me.personnel

  return (
    <div className="card">
      <Toast ref={toast} />
      <div className="mb-4">
        <h3 className="m-0">Mon profil</h3>
        <p className="text-color-secondary mt-1 mb-0">Consultez et mettez à jour vos informations personnelles</p>
      </div>

      <div className="grid formgrid mb-3">
        <div className="field col-3">
          <label className="block text-sm text-color-secondary mb-1">Nom complet</label>
          <div className="font-medium">{p.firstname} {p.lastname}</div>
        </div>
        <div className="field col-3">
          <label className="block text-sm text-color-secondary mb-1">Matricule</label>
          <div className="font-medium">{p.matricule || '—'}</div>
        </div>
        <div className="field col-3">
          <label className="block text-sm text-color-secondary mb-1">Division</label>
          <div className="font-medium">{p.division?.libelle || '—'}</div>
        </div>
        <div className="field col-3">
          <label className="block text-sm text-color-secondary mb-1">Fonction</label>
          <div className="font-medium">{p.fonction?.libelle || '—'}</div>
        </div>
      </div>

      {p.typePersonnel && (
        <div className="grid formgrid mb-3">
          <div className="field col-3">
            <label className="block text-sm text-color-secondary mb-1">Type de personnel</label>
            <div className="font-medium">{p.typePersonnel ? fmtTypePersonnel(p.typePersonnel) : '—'}</div>
          </div>
          <div className="field col-3">
            <label className="block text-sm text-color-secondary mb-1">Solde de congés disponible</label>
            <div className="font-medium">{p.soldeDisponible ?? p.soldeConges ?? '—'} jour(s)</div>
            {!!p.joursAutorisationCumules && (
              <small className="text-color-secondary">
                Dont {p.joursAutorisationCumules} j. d&apos;autorisation à régulariser au prochain congé
              </small>
            )}
          </div>
        </div>
      )}

      <div className="grid formgrid">
        <div className="field col-4">
          <label className="block text-sm font-medium mb-1">Civilité</label>
          <Dropdown value={form.civilite} onChange={e => setForm({ ...form, civilite: e.value })}
            options={civiliteOptions} placeholder="Civilité" className="w-full" />
        </div>
        <div className="field col-4">
          <label className="block text-sm font-medium mb-1">Téléphone</label>
          <InputText value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full" />
        </div>
        <div className="field col-4">
          <label className="block text-sm font-medium mb-1">Email</label>
          <InputText value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full" />
        </div>
      </div>

      <div className="grid formgrid">
        <div className="field col-3">
          <label className="block text-sm font-medium mb-1">Banque</label>
          <InputText value={form.bank} onChange={e => setForm({ ...form, bank: e.target.value })} className="w-full" />
        </div>
        <div className="field col-3">
          <label className="block text-sm font-medium mb-1">Code banque</label>
          <InputText value={form.code_bank} onChange={e => setForm({ ...form, code_bank: e.target.value })} className="w-full" />
        </div>
        <div className="field col-3">
          <label className="block text-sm font-medium mb-1">Code agence</label>
          <InputText value={form.code_agc} onChange={e => setForm({ ...form, code_agc: e.target.value })} className="w-full" />
        </div>
        <div className="field col-3">
          <label className="block text-sm font-medium mb-1">N° compte</label>
          <InputText value={form.num_compte} onChange={e => setForm({ ...form, num_compte: e.target.value })} className="w-full" />
        </div>
      </div>

      <div className="grid formgrid">
        <div className="field col-4">
          <label className="block text-sm font-medium mb-1">Clé RIB</label>
          <InputText value={form.key_rib} onChange={e => setForm({ ...form, key_rib: e.target.value })} className="w-full" />
        </div>
        <div className="field col-4">
          <label className="block text-sm font-medium mb-1">Mon véhicule</label>
          <Dropdown value={form.voiture} onChange={e => setForm({ ...form, voiture: e.value })}
            options={voitures} optionLabel="immatriculation" showClear
            placeholder="Aucun véhicule personnel" className="w-full" />
        </div>
      </div>

      {error && <Message severity="error" text={error} className="w-full mb-3" />}

      <Button label={saving ? 'Enregistrement…' : 'Enregistrer'} loading={saving} onClick={save} />
    </div>
  )
}

export default function MonProfilPage() {
  return (
    <ProtectedRoute allowedRoles={TOUS_ROLES}>
      <MonProfilContent />
    </ProtectedRoute>
  )
}

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
import { TOUS_ROLES } from '../types'

const civiliteOptions = [
  { label: 'M.', value: 'Mr' },
  { label: 'Mme', value: 'Mme' },
  { label: 'Mlle', value: 'Mlle' },
]

interface MeUser {
  firstname: string
  lastname: string
  login: string
  matricule?: string
  division?: { libelle: string } | null
  fonction?: { libelle: string } | null
  typePersonnel?: 'PERMANENT' | 'PERSONNEL_APPUI' | null
  soldeConges?: number | null
  phone?: string
  email?: string
  civilite?: string
  bank?: string
  code_bank?: string
  code_agc?: string
  num_compte?: string
  key_rib?: string
  matricule_voiture?: string
}

function MonProfilContent() {
  const toast = useRef<Toast>(null)
  const [me, setMe] = useState<MeUser | null>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    phone: '', email: '', civilite: null as string | null,
    bank: '', code_bank: '', code_agc: '', num_compte: '', key_rib: '', matricule_voiture: '',
  })

  const load = () => {
    setLoading(true)
    axiosInstance.get('profile/me')
      .then(({ data }) => {
        setMe(data)
        setForm({
          phone: data.phone ?? '',
          email: data.email ?? '',
          civilite: data.civilite ?? null,
          bank: data.bank ?? '',
          code_bank: data.code_bank ?? '',
          code_agc: data.code_agc ?? '',
          num_compte: data.num_compte ?? '',
          key_rib: data.key_rib ?? '',
          matricule_voiture: data.matricule_voiture ?? '',
        })
      })
      .catch(() => setError('Erreur chargement de votre profil'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

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
          <div className="font-medium">{me.firstname} {me.lastname}</div>
        </div>
        <div className="field col-3">
          <label className="block text-sm text-color-secondary mb-1">Matricule</label>
          <div className="font-medium">{me.matricule || '—'}</div>
        </div>
        <div className="field col-3">
          <label className="block text-sm text-color-secondary mb-1">Division</label>
          <div className="font-medium">{me.division?.libelle || '—'}</div>
        </div>
        <div className="field col-3">
          <label className="block text-sm text-color-secondary mb-1">Fonction</label>
          <div className="font-medium">{me.fonction?.libelle || '—'}</div>
        </div>
      </div>

      {me.typePersonnel && (
        <div className="grid formgrid mb-3">
          <div className="field col-3">
            <label className="block text-sm text-color-secondary mb-1">Type de personnel</label>
            <div className="font-medium">{me.typePersonnel === 'PERMANENT' ? 'Permanent' : "Personnel d'appui"}</div>
          </div>
          <div className="field col-3">
            <label className="block text-sm text-color-secondary mb-1">Solde de congés restant</label>
            <div className="font-medium">{me.soldeConges ?? '—'} jour(s)</div>
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
          <label className="block text-sm font-medium mb-1">Matricule véhicule</label>
          <InputText value={form.matricule_voiture} onChange={e => setForm({ ...form, matricule_voiture: e.target.value })} className="w-full" />
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

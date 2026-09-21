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
import { TOUS_ROLES, fmtTypePersonnel, type Banque, type Voiture } from '../types'
import { useBanqueStore } from '../useBanqueStore'
import { useBankValidation } from '../useBankValidation'
import { usePersonnelValidation } from '../usePersonnelValidation'
import { FormField, FormSection } from '../FormField'
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

function InfoTile({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="tw-rounded-xl tw-border tw-border-[var(--surface-border)] tw-bg-[var(--surface-50)] tw-px-4 tw-py-3">
      <div className="tw-text-xs tw-text-[var(--text-color-secondary)]">{label}</div>
      <div className="tw-mt-0.5 tw-font-medium">{value}</div>
    </div>
  )
}

function MonProfilContent() {
  const toast = useRef<Toast>(null)
  const [me, setMe] = useState<MeUser | null>(null)
  const [voitures, setVoitures] = useState<Voiture[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { banques, fetchBanques } = useBanqueStore()
  const { validateBankFields } = useBankValidation()
  const { sanitizePhone, formatPhone, validateField } = usePersonnelValidation()
  const [touched, setTouched] = useState<Record<string, boolean>>({})

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
          phone: sanitizePhone(p.phone ?? ''),
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
    fetchBanques()
    axiosInstance.get('personnel/voitures').then(({ data }) => setVoitures(data)).catch(() => {})
  }, [])

  // La banque doit toujours être choisie dans la liste : le code banque en est déduit et reste
  // grisé en permanence, jamais saisissable à la main.
  const selectedBanque = banques.find(b => b.name === form.bank) ?? null
  const handleBanqueChange = (selected: Banque | null) => {
    setForm({ ...form, bank: selected?.name ?? '', code_bank: selected?.codeBanque ?? '' })
  }

  // Tous les champs modifiables du profil sont obligatoires (sauf le véhicule, qui reste
  // facultatif : un agent peut ne pas avoir de véhicule personnel).
  const bankErrors: { bank?: string; code_bank?: string; code_agc?: string; num_compte?: string; key_rib?: string } = validateBankFields({
    code_bank: form.code_bank, code_agc: form.code_agc, num_compte: form.num_compte, key_rib: form.key_rib,
  })
  if (!form.bank.trim()) bankErrors.bank = 'La banque est obligatoire'
  if (!bankErrors.code_agc && !form.code_agc.trim()) bankErrors.code_agc = 'Le code agence est obligatoire'
  if (!bankErrors.num_compte && !form.num_compte.trim()) bankErrors.num_compte = 'Le numéro de compte est obligatoire'
  if (!bankErrors.key_rib && !form.key_rib.trim()) bankErrors.key_rib = 'La clé RIB est obligatoire'
  const hasBankErrors = Object.keys(bankErrors).length > 0

  const markTouched = (field: string) => setTouched(prev => ({ ...prev, [field]: true }))
  const shouldShowError = (field: string) => !!touched[field]
  const handlePhoneBlur = () => { markTouched('phone'); setForm(f => ({ ...f, phone: formatPhone(f.phone) })) }

  const fieldErrors = {
    civilite: validateField('civilite', form.civilite),
    phone: validateField('phone', form.phone),
    email: validateField('email', form.email),
  }
  const hasFieldErrors = Object.values(fieldErrors).some(Boolean)

  const save = async () => {
    if (hasBankErrors || hasFieldErrors) return
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
      <div className="tw-mb-6">
        <h3 className="tw-m-0 tw-text-xl tw-font-semibold">Mon profil</h3>
        <p className="tw-mt-1 tw-mb-0 tw-text-sm tw-text-[var(--text-color-secondary)]">Consultez et mettez à jour vos informations personnelles</p>
      </div>

      <div className="tw-mb-6 tw-grid tw-grid-cols-2 tw-gap-3 sm:tw-grid-cols-4">
        <InfoTile label="Nom complet" value={`${p.firstname} ${p.lastname}`} />
        <InfoTile label="Matricule" value={p.matricule || '—'} />
        <InfoTile label="Division" value={p.division?.libelle || '—'} />
        <InfoTile label="Fonction" value={p.fonction?.libelle || '—'} />
      </div>

      {p.typePersonnel && (
        <div className="tw-mb-6 tw-grid tw-grid-cols-1 tw-gap-3 sm:tw-grid-cols-2">
          <InfoTile label="Type de personnel" value={fmtTypePersonnel(p.typePersonnel)} />
          <InfoTile
            label="Solde de congés disponible"
            value={
              <>
                {p.soldeDisponible ?? p.soldeConges ?? '—'} jour(s)
                {!!p.joursAutorisationCumules && (
                  <div className="tw-mt-1 tw-text-xs tw-font-normal tw-text-red-600">
                    Dont {p.joursAutorisationCumules} j. d&apos;autorisation à régulariser au prochain congé
                  </div>
                )}
              </>
            }
          />
        </div>
      )}

      <div className="tw-flex tw-flex-col tw-gap-4">
        <FormSection title="Identité">
          <div className="tw-grid tw-grid-cols-1 tw-gap-4 sm:tw-grid-cols-3">
            <FormField label="Civilité" required error={shouldShowError('civilite') ? fieldErrors.civilite : undefined}>
              <Dropdown value={form.civilite} onChange={e => setForm({ ...form, civilite: e.value })} onBlur={() => markTouched('civilite')}
                options={civiliteOptions} placeholder="Civilité" className="w-full" />
            </FormField>
            <FormField label="Téléphone" required error={shouldShowError('phone') ? fieldErrors.phone : undefined}>
              <InputText value={form.phone} onChange={e => setForm({ ...form, phone: sanitizePhone(e.target.value) })} onBlur={handlePhoneBlur} keyfilter="num" className="w-full" />
            </FormField>
            <FormField label="Email" required error={shouldShowError('email') ? fieldErrors.email : undefined}>
              <InputText value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} onBlur={() => markTouched('email')} className="w-full" />
            </FormField>
          </div>
        </FormSection>

        <FormSection title="Coordonnées bancaires">
          <div className="tw-grid tw-grid-cols-1 tw-gap-4 sm:tw-grid-cols-3">
            <FormField label="Banque" required error={shouldShowError('bank') ? bankErrors.bank : undefined}>
              <Dropdown value={selectedBanque} onChange={e => handleBanqueChange(e.value)} onBlur={() => markTouched('bank')}
                options={banques} optionLabel="name" filter showClear placeholder="Choisir une banque" className="w-full" />
            </FormField>
            <FormField label="Code banque" required>
              <InputText value={form.code_bank} readOnly disabled placeholder="Déduit de la banque sélectionnée" className="w-full" />
            </FormField>
            <FormField label="Code agence" required error={shouldShowError('code_agc') ? bankErrors.code_agc : undefined}>
              <InputText value={form.code_agc} onChange={e => setForm({ ...form, code_agc: e.target.value })} onBlur={() => markTouched('code_agc')} keyfilter="num" maxLength={5} className="w-full" />
            </FormField>
            <FormField label="N° compte" required error={shouldShowError('num_compte') ? bankErrors.num_compte : undefined}>
              <InputText value={form.num_compte} onChange={e => setForm({ ...form, num_compte: e.target.value })} onBlur={() => markTouched('num_compte')} keyfilter="num" maxLength={12} className="w-full" />
            </FormField>
            <FormField label="Clé RIB" required error={shouldShowError('key_rib') ? bankErrors.key_rib : undefined}>
              <InputText value={form.key_rib} onChange={e => setForm({ ...form, key_rib: e.target.value })} onBlur={() => markTouched('key_rib')} keyfilter="num" maxLength={2} className="w-full" />
            </FormField>
          </div>
        </FormSection>

        <FormSection title="Véhicule">
          <div className="tw-grid tw-grid-cols-1 sm:tw-grid-cols-3">
            <FormField label="Mon véhicule" hint="Optionnel — laissez vide si vous n'avez pas de véhicule personnel">
              <Dropdown value={form.voiture} onChange={e => setForm({ ...form, voiture: e.value })}
                options={voitures} optionLabel="immatriculation" showClear
                placeholder="Aucun véhicule personnel" className="w-full" />
            </FormField>
          </div>
        </FormSection>
      </div>

      {error && <Message severity="error" text={error} className="w-full tw-mt-4" />}

      <Button label={saving ? 'Enregistrement…' : 'Enregistrer'} loading={saving} disabled={hasBankErrors || hasFieldErrors} onClick={save} className="tw-mt-4" />
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

'use client'
import { useState } from 'react'
import { Button } from 'primereact/button'
import { Calendar } from 'primereact/calendar'
import { Dialog } from 'primereact/dialog'
import { InputNumber } from 'primereact/inputnumber'
import { InputText } from 'primereact/inputtext'
import { Message } from 'primereact/message'
import { useCaisseStore } from './useCaisseStore'
import { fmt } from './types'

interface Props { open: boolean; onClose: () => void }

export default function CaisseGestionModal({ open, onClose }: Props) {
  const { caisse, approvisionner, loading } = useCaisseStore()
  const [montant, setMontant] = useState<number | null>(null)
  const [date, setDate]       = useState<Date>(new Date())
  const [desc, setDesc]       = useState('')
  const [err, setErr]         = useState('')

  const soldeAvant = caisse?.montant ?? 0
  const soldeApres = soldeAvant + (montant ?? 0)

  const handleSubmit = async () => {
    setErr('')
    if (!montant || montant <= 0) { setErr('Montant invalide'); return }
    try {
      await approvisionner({ montant, date: date.toISOString().slice(0, 10), description: desc })
      setMontant(null); setDesc(''); setDate(new Date())
      onClose()
    } catch { setErr('Erreur lors de l\'approvisionnement') }
  }

  const footer = (
    <div className="flex gap-2">
      <Button label="Annuler" outlined className="flex-1" onClick={onClose} disabled={loading} />
      <Button label="Approvisionner" className="flex-1" loading={loading}
        disabled={loading} onClick={handleSubmit} />
    </div>
  )

  return (
    <Dialog header="Approvisionnement de la caisse d'avance"
      visible={open} onHide={onClose} style={{ width: '30rem' }} footer={footer} draggable={false}>
      <div className="flex flex-column gap-4">
        <Message severity="info" text={<>Solde actuel : <strong>{fmt(soldeAvant)}</strong></>} className="w-full" />

        <div className="field">
          <label className="block text-sm font-medium mb-1">Montant à ajouter (FCFA)</label>
          <InputNumber value={montant} min={1} className="w-full"
            onValueChange={e => setMontant(e.value ?? null)} placeholder="ex: 500000" />
        </div>

        {montant && montant > 0 && (
          <Message severity="success" className="w-full" content={
            <div className="p-2 flex flex-column gap-1">
              <div className="flex justify-content-between text-sm">
                <span>Solde avant</span><strong>{fmt(soldeAvant)}</strong>
              </div>
              <div className="flex justify-content-between text-sm">
                <span>Montant ajouté</span><strong>+{fmt(montant)}</strong>
              </div>
              <div className="flex justify-content-between text-sm pt-1 border-top-1 surface-border">
                <span>Solde après</span><strong>{fmt(soldeApres)}</strong>
              </div>
            </div>
          } />
        )}

        <div className="field">
          <label className="block text-sm font-medium mb-1">Date</label>
          <Calendar value={date} onChange={e => e.value && setDate(e.value as Date)}
            dateFormat="dd/mm/yy" className="w-full" showIcon />
        </div>

        <div className="field">
          <label className="block text-sm font-medium mb-1">Description</label>
          <InputText value={desc} onChange={e => setDesc(e.target.value)}
            className="w-full" placeholder="ex: Approvisionnement mensuel" />
        </div>

        {err && <Message severity="error" text={err} className="w-full" />}
      </div>
    </Dialog>
  )
}

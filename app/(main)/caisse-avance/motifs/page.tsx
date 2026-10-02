'use client'
import { useEffect } from 'react'
import ProtectedRoute from '@/layout/ProtectedRoute'
import { useCaisseStore } from '../useCaisseStore'
import MotifsTab from '../MotifsTab'

function Contenu() {
  const { fetchAllMotifs } = useCaisseStore()
  useEffect(() => { fetchAllMotifs() }, [])
  return (
    <div className="card">
      <div className="mb-4">
        <h3 className="m-0">Motifs — Expression de besoin</h3>
        <p className="text-color-secondary mt-1 mb-0">Motifs proposés à la création d&apos;une expression de besoin et d&apos;un mandatement</p>
      </div>
      <MotifsTab />
    </div>
  )
}

export default function Page() {
  return (
    <ProtectedRoute allowedRoles={['ADMIN', 'CSA', 'DIRECTEUR', 'CHEF_COMPTABLE']}>
      <Contenu />
    </ProtectedRoute>
  )
}

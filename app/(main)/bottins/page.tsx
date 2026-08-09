'use client';

import Link from 'next/link';
import ProtectedRoute from '@/layout/ProtectedRoute';
import { SERIES_CONFIG } from '@/demo/service/bottins/config';

export default function BottinsPage() {
    const seriesGroupe = SERIES_CONFIG.filter((s) => !s.key.endsWith('-2eme-partie'));
    const seriesDeuxiemePartie = SERIES_CONFIG.filter((s) => s.key.endsWith('-2eme-partie'));

    return (
        <ProtectedRoute allowedRoles={['ADMIN']}>
            <div className="grid">
                <div className="col-12">
                    <div className="card">
                        <h4 className="mt-0">Espace Bottins — Relevés de notes</h4>
                        <p className="text-color-secondary mb-4">Sélectionnez une série pour saisir, modifier ou télécharger les relevés de notes.</p>

                        <h6 className="text-color-secondary uppercase text-sm mb-2">Séries</h6>
                        <div className="grid mb-4">
                            {seriesGroupe.map((s) => (
                                <div className="col-6 sm:col-4 md:col-3 lg:col-2" key={s.key}>
                                    <Link href={`/bottins/${s.key}`} className="no-underline">
                                        <div className="border-1 surface-border border-round p-3 text-center hover:surface-100 transition-colors transition-duration-150 cursor-pointer">
                                            <span className="text-xl font-bold text-primary">{s.label}</span>
                                        </div>
                                    </Link>
                                </div>
                            ))}
                        </div>

                        <h6 className="text-color-secondary uppercase text-sm mb-2">2ème partie</h6>
                        <div className="grid">
                            {seriesDeuxiemePartie.map((s) => (
                                <div className="col-6 sm:col-4 md:col-3 lg:col-2" key={s.key}>
                                    <Link href={`/bottins/${s.key}`} className="no-underline">
                                        <div className="border-1 surface-border border-round p-3 text-center hover:surface-100 transition-colors transition-duration-150 cursor-pointer">
                                            <span className="text-lg font-bold text-primary">{s.label}</span>
                                        </div>
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}

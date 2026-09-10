"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ParametrageService } from "@/demo/service/ParametrageService";
import type { SerieReleveDTO } from "@/demo/service/ParametrageService";

export default function ListeSeriesPage() {
  const [series, setSeries] = useState<SerieReleveDTO[]>([]);
  const [loading, setLoading] = useState(true);

  const charger = () => {
    setLoading(true);
    ParametrageService.fetchSeries()
      .then(setSeries)
      .finally(() => setLoading(false));
  };

  useEffect(() => { charger(); }, []);

  const handleSupprimer = async (id: string, code: string) => {
    if (!confirm(`Supprimer la série ${code} ? Cette action est irréversible.`)) return;
    await ParametrageService.supprimerSerie(id);
    charger();
  };

  return (
    <main className="max-w-3xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Séries du baccalauréat</h1>
        <Link href="/bottins/gabarit-serie-matiere" className="px-4 py-2 bg-blue-600 text-white rounded">
          + Nouvelle série
        </Link>
      </div>

      {loading ? (
        <p>Chargement...</p>
      ) : (
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-3 py-2 text-left">Code</th>
              <th className="border px-3 py-2 text-left">Libellé</th>
              <th className="border px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {series.map((s) => (
              <tr key={s.id}>
                <td className="border px-3 py-2">{s.code}</td>
                <td className="border px-3 py-2">{s.libelle}</td>
                <td className="border px-3 py-2 text-center whitespace-nowrap">
                  <Link href={`/bottins/gabarit-serie-matiere/listing/id/${s.id}`} className="text-blue-600 px-2">
                    Modifier
                  </Link>
                  <button onClick={() => handleSupprimer(s.id, s.code)} className="text-red-600 px-2">
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
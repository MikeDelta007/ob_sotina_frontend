"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ParametrageService } from "@/demo/service/ParametrageService";
import type { SerieDetailResponse } from "@/demo/service/ParametrageService";
import SerieForm from "../../../serieForm";

export default function EditionSeriePage() {
  const { id } = useParams<{ id: string }>();
  const [serie, setSerie] = useState<SerieDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ParametrageService.fetchSerieDetail(id)
      .then(setSerie)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="p-6">Chargement...</p>;
  if (!serie) return <p className="p-6 text-red-600">Série introuvable.</p>;

  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">
        Modifier la série {serie.code} — {serie.libelle}
      </h1>
      <SerieForm serieExistante={serie} />
    </main>
  );
}
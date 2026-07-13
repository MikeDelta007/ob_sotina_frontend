// components/SelecteurSerie.tsx
"use client";

import { SerieReleveDTO } from "@/demo/service/ParametrageService";
import { useEffect, useState } from "react";
import { ParametrageService } from '@/demo/service/ParametrageService';

interface Props {
  value: string | null;
  onChange: (serieId: string) => void;
}

export default function SelecteurSerie({ value, onChange }: Props) {
  const [series, setSeries] = useState<SerieReleveDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ParametrageService.fetchSeries()
      .then(setSeries)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Chargement des séries...</p>;

  return (
    <div className="mb-6">
      <label htmlFor="serie" className="block font-medium mb-1">
        Série
      </label>
      <select
        id="serie"
        className="border rounded px-3 py-2 w-full max-w-sm"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="" disabled>
          -- Choisir une série --
        </option>
        {series.map((s) => (
          <option key={s.id} value={s.id}>
            {s.code} — {s.libelle}
          </option>
        ))}
      </select>
    </div>
  );
}
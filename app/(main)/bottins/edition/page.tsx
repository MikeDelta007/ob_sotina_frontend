// app/releves/nouveau/page.tsx
"use client";

import { useState } from "react";
import SelecteurSerie from "./selecteurSerie";
import ReleveForm from "./releveForm";

export default function NouveauRelevePage() {
  const [serieId, setSerieId] = useState<string | null>(null);

  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Nouveau relevé de notes — Baccalauréat</h1>

      <SelecteurSerie value={serieId} onChange={setSerieId} />

      {serieId && <ReleveForm key={serieId} serieId={serieId} />}
    </main>
  );
}
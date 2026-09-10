"use client";

import SerieForm from "./serieForm";
export default function NouvelleSeriePage() {
  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Nouvelle série — Référentiel matières</h1>
      <SerieForm />
    </main>
  );
}
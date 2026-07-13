// components/EnteteFields.tsx
"use client";

import { UseFormRegister } from "react-hook-form";
import type { ReleveFormValues } from "@/demo/service/ParametrageService";
import { ParametrageService } from '@/demo/service/ParametrageService';

export default function EnteteFields({
  register,
}: {
  register: UseFormRegister<ReleveFormValues>;
}) {
  return (
    <fieldset className="border rounded p-4 mb-6">
      <legend className="font-medium px-2">Informations du candidat</legend>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm mb-1">Nom</label>
          <input className="border rounded px-2 py-1 w-full" {...register("nom", { required: true })} />
        </div>
        <div>
          <label className="block text-sm mb-1">Prénom(s)</label>
          <input className="border rounded px-2 py-1 w-full" {...register("prenom", { required: true })} />
        </div>
        <div>
          <label className="block text-sm mb-1">Né(e) le</label>
          <input type="date" className="border rounded px-2 py-1 w-full" {...register("dateNaissance")} />
        </div>
        <div>
          <label className="block text-sm mb-1">Lieu de naissance</label>
          <input className="border rounded px-2 py-1 w-full" {...register("lieuNaissance")} />
        </div>
        <div>
          <label className="block text-sm mb-1">Centre d'examen</label>
          <input className="border rounded px-2 py-1 w-full" {...register("centreExamen")} />
        </div>
        <div>
          <label className="block text-sm mb-1">N° de table</label>
          <input className="border rounded px-2 py-1 w-full" {...register("numeroTable")} />
        </div>
        <div>
          <label className="block text-sm mb-1">Session</label>
          <select className="border rounded px-2 py-1 w-full" {...register("session")}>
            <option value="NORMALE">Normale</option>
            <option value="REMPLACEMENT">De remplacement</option>
          </select>
        </div>
        <div>
          <label className="block text-sm mb-1">Année</label>
          <input className="border rounded px-2 py-1 w-full" {...register("annee")} />
        </div>
      </div>
    </fieldset>
  );
}
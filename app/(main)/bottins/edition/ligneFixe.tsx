"use client";

import { UseFormRegister } from "react-hook-form";
import type { MatiereReferentielDTO, ReleveFormValues } from "@/demo/service/ParametrageService";

interface Props {
  matiere: MatiereReferentielDTO;
  index: number;
  register: UseFormRegister<ReleveFormValues>;
}

export default function LigneFixe({ matiere, index, register }: Props) {
  return (
    <tr>
      <td className="border px-3 py-2">{matiere.libelle}</td>
      <td className="border px-3 py-2 text-center">{matiere.coefficient}</td>
      <td className="border px-3 py-2">
        <input
          type="number"
          step="0.25"
          min={0}
          max={20}
          className="border rounded px-2 py-1 w-24 text-center"
          {...register(`lignesGroupe1.${index}.note` as const, {
            required: true,
            valueAsNumber: true,
            min: 0,
            max: 20,
          })}
        />
      </td>
    </tr>
  );
}
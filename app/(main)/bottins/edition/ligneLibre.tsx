"use client";

import type { ReleveFormValues } from "@/demo/service/ParametrageService";
import { UseFormRegister } from "react-hook-form";

interface Props {
  index: number;
  register: UseFormRegister<ReleveFormValues>;
  onRemove: () => void;
}

export default function LigneLibre({ index, register, onRemove }: Props) {
  return (
    <tr>
      <td className="border px-2 py-1">
        <input
          className="border rounded px-2 py-1 w-full"
          placeholder="Nom de la matière"
          {...register(`lignesGroupe2.${index}.libelleMatiere` as const, { required: true })}
        />
      </td>
      <td className="border px-2 py-1">
        <input
          type="number"
          step="0.5"
          min={0.5}
          className="border rounded px-2 py-1 w-20 text-center"
          {...register(`lignesGroupe2.${index}.coefficient` as const, {
            required: true,
            valueAsNumber: true,
            min: 0.5,
          })}
        />
      </td>
      <td className="border px-2 py-1">
        <input
          type="number"
          step="0.25"
          min={0}
          max={20}
          className="border rounded px-2 py-1 w-24 text-center"
          {...register(`lignesGroupe2.${index}.note` as const, {
            required: true,
            valueAsNumber: true,
            min: 0,
            max: 20,
          })}
        />
      </td>
      <td className="border px-2 py-1 text-center">
        <button type="button" onClick={onRemove} className="text-red-600 text-sm">
          Supprimer
        </button>
      </td>
    </tr>
  );
}
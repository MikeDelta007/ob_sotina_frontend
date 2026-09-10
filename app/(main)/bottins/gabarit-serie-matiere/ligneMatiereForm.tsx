"use client";

import { UseFormRegister } from "react-hook-form";
import type { SerieFormValues } from "@/demo/service/ParametrageService";

interface Props {
  index: number;
  register: UseFormRegister<SerieFormValues>;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
}

export default function LigneMatiereForm({
  index,
  register,
  onRemove,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}: Props) {
  return (
    <tr>
      <td className="border px-2 py-1">
        <input
          className="border rounded px-2 py-1 w-full"
          placeholder="Ex: Mathématiques"
          {...register(`matieresGroupe1.${index}.libelle` as const, { required: true })}
        />
      </td>
      <td className="border px-2 py-1">
        <input
          type="number"
          step="0.5"
          min={0.5}
          className="border rounded px-2 py-1 w-20 text-center"
          {...register(`matieresGroupe1.${index}.coefficient` as const, {
            required: true,
            valueAsNumber: true,
            min: 0.5,
          })}
        />
      </td>
      <td className="border px-2 py-1">
        <input
          type="number"
          min={1}
          className="border rounded px-2 py-1 w-16 text-center"
          {...register(`matieresGroupe1.${index}.ordre` as const, {
            required: true,
            valueAsNumber: true,
            min: 1,
          })}
        />
      </td>
      <td className="border px-2 py-1 text-center whitespace-nowrap">
        <button type="button" onClick={onMoveUp} disabled={isFirst} className="px-1 disabled:opacity-30" title="Monter">
          ↑
        </button>
        <button type="button" onClick={onMoveDown} disabled={isLast} className="px-1 disabled:opacity-30" title="Descendre">
          ↓
        </button>
        <button type="button" onClick={onRemove} className="text-red-600 text-sm px-2" title="Supprimer">
          Supprimer
        </button>
      </td>
    </tr>
  );
}
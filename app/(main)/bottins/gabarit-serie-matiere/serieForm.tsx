"use client";

import { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { useRouter } from "next/navigation";
import { ParametrageService } from "@/demo/service/ParametrageService";
import type { SerieFormValues, SerieDetailResponse } from "@/demo/service/ParametrageService";
import LigneMatiereForm from "./ligneMatiereForm";

interface Props {
  // Si fourni : mode édition, pré-remplit le formulaire. Sinon : mode création.
  serieExistante?: SerieDetailResponse;
}

export default function SerieForm({ serieExistante }: Props) {
  const router = useRouter();
  const estEdition = !!serieExistante;

  const { register, control, handleSubmit, reset, formState: { isSubmitting } } = useForm<SerieFormValues>({
    defaultValues: {
      code: serieExistante?.code ?? "",
      libelle: serieExistante?.libelle ?? "",
      matieresGroupe1: serieExistante?.matieresGroupe1 ?? [],
    },
  });

  const { fields, append, remove, swap } = useFieldArray({
    control,
    name: "matieresGroupe1",
  });

  useEffect(() => {
    if (serieExistante) {
      reset({
        code: serieExistante.code,
        libelle: serieExistante.libelle,
        matieresGroupe1: serieExistante.matieresGroupe1,
      });
    }
  }, [serieExistante, reset]);

  const ajouterMatiere = () => {
    append({
      libelle: "",
      coefficient: 1,
      ordre: fields.length + 1,
    });
  };

  const onSubmit = async (values: SerieFormValues) => {
    try {
      if (estEdition && serieExistante) {
        await ParametrageService.modifierSerie(serieExistante.id, values);
        alert("Série mise à jour avec succès.");
      } else {
        await ParametrageService.creerSerie(values);
        alert("Série créée avec succès.");
        reset({ code: "", libelle: "", matieresGroupe1: [] });
      }
      router.refresh();
    } catch (e: any) {
      alert(e?.response?.data?.errorMessage ?? "Erreur lors de l'enregistrement de la série");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-3xl">
      <fieldset className="border rounded p-4 mb-6">
        <legend className="font-medium px-2">Informations de la série</legend>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1">Code série</label>
            <input
              className="border rounded px-2 py-1 w-full"
              placeholder="Ex: S1, L1, G2"
              {...register("code", { required: true })}
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Libellé</label>
            <input
              className="border rounded px-2 py-1 w-full"
              placeholder="Ex: Sciences Expérimentales"
              {...register("libelle", { required: true })}
            />
          </div>
        </div>
      </fieldset>

      <fieldset className="border rounded p-4 mb-6">
        <legend className="font-medium px-2">Matières du 1er groupe (référentiel fixe)</legend>

        {fields.length === 0 ? (
          <p className="text-sm text-gray-500 mb-3">Aucune matière ajoutée pour l'instant.</p>
        ) : (
          <table className="w-full border-collapse mb-3">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-3 py-2 text-left">Matière</th>
                <th className="border px-3 py-2">Coefficient</th>
                <th className="border px-3 py-2">Ordre</th>
                <th className="border px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {fields.map((f, i) => (
                <LigneMatiereForm
                  key={f.id}
                  index={i}
                  register={register}
                  onRemove={() => remove(i)}
                  onMoveUp={() => swap(i, i - 1)}
                  onMoveDown={() => swap(i, i + 1)}
                  isFirst={i === 0}
                  isLast={i === fields.length - 1}
                />
              ))}
            </tbody>
          </table>
        )}

        <button
          type="button"
          onClick={ajouterMatiere}
          className="px-3 py-1 border rounded text-sm"
        >
          + Ajouter une matière
        </button>
      </fieldset>

      <button
        type="submit"
        disabled={isSubmitting}
        className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
      >
        {isSubmitting ? "Enregistrement..." : estEdition ? "Mettre à jour la série" : "Créer la série"}
      </button>
    </form>
  );
}
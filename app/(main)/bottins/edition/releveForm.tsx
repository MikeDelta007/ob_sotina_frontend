"use client";

import { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import useSWR from "swr";
import { ParametrageService } from "@/demo/service/ParametrageService";
import type { GabaritDTO, ReleveFormValues } from "@/demo/service/ParametrageService";
import EnteteFields from "./enteteFields";
import LigneFixe from "./ligneFixe";
import LigneLibre from "./ligneLibre";

const fetcher = (serieId: string) => ParametrageService.fetchGabarit(serieId);

export default function ReleveForm({ serieId }: { serieId: string }) {
  const { data: gabarit, error, isLoading } = useSWR<GabaritDTO>(serieId, fetcher);

  const { register, control, handleSubmit, reset } = useForm<ReleveFormValues>({
    defaultValues: {
      serieId,
      nom: "",
      prenom: "",
      dateNaissance: "",
      lieuNaissance: "",
      centreExamen: "",
      numeroTable: "",
      session: "NORMALE",
      annee: "",
      lignesGroupe1: [],
      lignesGroupe2: [],
    },
  });

  const groupe1 = useFieldArray({ control, name: "lignesGroupe1" });
  const groupe2 = useFieldArray({ control, name: "lignesGroupe2" });

  useEffect(() => {
    if (!gabarit) return;

    // On garde uniquement "note" comme champ réellement piloté par le form pour le groupe 1
    groupe1.replace(
      gabarit.matieresGroupe1.map(() => ({
        groupe: 1 as const,
        libelleMatiere: "",
        coefficient: 0,
        note: null,
      }))
    );

    groupe2.replace([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gabarit]);

  const onSubmit = async (values: ReleveFormValues) => {
    if (!gabarit) return;

    try {
      const payload = {
        serieId: values.serieId,
        nom: values.nom,
        prenom: values.prenom,
        dateNaissance: values.dateNaissance || null,
        lieuNaissance: values.lieuNaissance,
        centreExamen: values.centreExamen,
        numeroTable: values.numeroTable,
        session: values.session,
        annee: values.annee,
        lignes: [
          // Groupe 1 : reconstruit depuis le référentiel du gabarit (source fiable),
          // on ne prend du formulaire QUE la note saisie par l'utilisateur.
          ...gabarit.matieresGroupe1.map((m, i) => ({
            groupe: 1 as const,
            matiereRefId: m.id,
            libelleMatiere: m.libelle,
            coefficient: m.coefficient,
            note: values.lignesGroupe1[i]?.note ?? null,
          })),
          // Groupe 2 : tout vient du formulaire, saisie libre
          ...values.lignesGroupe2.map((l) => ({
            groupe: 2 as const,
            matiereRefId: null,
            libelleMatiere: l.libelleMatiere,
            coefficient: l.coefficient,
            note: l.note,
          })),
        ],
      };
      const result = await ParametrageService.creerReleve(payload);
      alert(`Relevé enregistré. Moyenne : ${result.moyenneGenerale} — Mention : ${result.mention}`);
      reset();
    } catch (e) {
      alert((e as Error).message);
    }
  };

  if (isLoading) return <p>Chargement du gabarit...</p>;
  if (error) return <p className="text-red-600">Erreur de chargement du gabarit.</p>;
  if (!gabarit) return null;

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h2 className="text-xl font-semibold mb-4">
        {gabarit.code} — {gabarit.libelle}
      </h2>

      <EnteteFields register={register} />

      <fieldset className="border rounded p-4 mb-6">
        <legend className="font-medium px-2">Matières du 1er groupe</legend>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-3 py-2 text-left">Matière</th>
              <th className="border px-3 py-2">Coefficient</th>
              <th className="border px-3 py-2">Note / 20</th>
            </tr>
          </thead>
          <tbody>
            {groupe1.fields.map((f, i) => (
              <LigneFixe
                key={f.id}
                matiere={gabarit.matieresGroupe1[i]}
                index={i}
                register={register}
              />
            ))}
          </tbody>
        </table>
      </fieldset>

      <fieldset className="border rounded p-4 mb-6">
        <legend className="font-medium px-2">Matières du 2nd groupe</legend>
        <table className="w-full border-collapse mb-3">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-3 py-2 text-left">Matière</th>
              <th className="border px-3 py-2">Coefficient</th>
              <th className="border px-3 py-2">Note / 20</th>
              <th className="border px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {groupe2.fields.map((f, i) => (
              <LigneLibre
                key={f.id}
                index={i}
                register={register}
                onRemove={() => groupe2.remove(i)}
              />
            ))}
          </tbody>
        </table>
        <button
          type="button"
          onClick={() => groupe2.append({ groupe: 2, libelleMatiere: "", coefficient: 1, note: null })}
          className="px-3 py-1 border rounded text-sm"
        >
          + Ajouter une matière
        </button>
      </fieldset>

      <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
        Enregistrer le relevé
      </button>
    </form>
  );
}
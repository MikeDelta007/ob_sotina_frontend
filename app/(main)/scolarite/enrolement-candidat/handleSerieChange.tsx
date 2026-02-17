
export const handleSerieChange = (formik: any, newSerie: any) => {
     const currentSerie = formik.values.serie;

    // Si la série change et n'est pas la même qu'avant
    if (currentSerie?.code !== newSerie?.code) {
        // reset des matières dans formik
        ["matiere1", "matiere2", "matiere3"].forEach((field) => {
        formik.setFieldValue(field, null);
        localStorage.removeItem(field);
        });
    }

  // maj de la série (formik + localStorage)
  formik.setFieldValue("serie", newSerie);
  localStorage.setItem("serie", JSON.stringify(newSerie));
};

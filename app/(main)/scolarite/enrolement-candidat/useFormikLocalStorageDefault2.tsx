import { useEffect, useCallback } from 'react';

export const useFormikLocalStorageDefault2 = (formik: any, fieldName: string, dependencies: string[] = []) => {
    useEffect(() => {
        const storedValue = localStorage.getItem(fieldName);

        if (storedValue && storedValue !== "undefined" && storedValue !== "null") {
            try {
                const parsedValue = JSON.parse(storedValue);
                formik.setFieldValue(fieldName, parsedValue);
            } catch (error) {
                console.error(`Erreur parsing localStorage pour ${fieldName}:`, error);
                localStorage.removeItem(fieldName);
            }
        } else {
            localStorage.removeItem(fieldName);
        }
    }, [fieldName, formik.setFieldValue]);

    const handleChange = useCallback(
        (value: any) => {
            formik.setFieldValue(fieldName, value);

            if (value !== undefined && value !== null) {
                localStorage.setItem(fieldName, JSON.stringify(value));
            } else {
                localStorage.removeItem(fieldName);
            }
        },
        [fieldName, formik.setFieldValue]
    );

    // Nouveau : effet de nettoyage si l’une des dépendances change (ex: la série)
    useEffect(() => {
        dependencies.forEach(dep => {
            localStorage.removeItem(dep);
            formik.setFieldValue(dep, "");
        });
    }, dependencies.map(dep => formik.values[dep]));

    return handleChange;
};



import { useEffect, useCallback } from 'react';

export const useFormikLocalStorageDefault = (formik: any, fieldName: string) => {
    useEffect(() => {
        const storedValue = localStorage.getItem(fieldName);

        if (storedValue === fieldName && storedValue !== null && storedValue !== "undefined" && storedValue !== "null") {
            try {
                const parsedValue = JSON.parse(storedValue);
                formik.setFieldValue(fieldName, parsedValue);
            } 
            catch (error) 
            {
                console.error(`Erreur parsing localStorage pour ${fieldName}:`, error);
                localStorage.removeItem(fieldName); // on nettoie si valeur corrompue
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

    return handleChange;
};


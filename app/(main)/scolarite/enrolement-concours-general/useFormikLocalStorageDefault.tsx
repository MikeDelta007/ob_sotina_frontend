import { useEffect, useCallback } from 'react';

export const useFormikLocalStorageDefault = (formik: any, fieldName: string) => {
    useEffect(() => {
        const storedValue = localStorage.getItem(fieldName);
        
        // Check if the stored value is valid before parsing
        if (storedValue !== null && storedValue !== undefined) {
            try {
                const parsedValue = JSON.parse(storedValue);
                formik.setFieldValue(fieldName, parsedValue);
            } catch (error) {
                console.error(`Erreur parsing localStorage pour ${fieldName}:`, error);
            }
        }
    }, [fieldName, formik.setFieldValue]);

    const handleChange = useCallback((value: any) => {
        formik.setFieldValue(fieldName, value);
        localStorage.setItem(fieldName, JSON.stringify(value));
    }, [fieldName, formik.setFieldValue]);

    return handleChange;
};

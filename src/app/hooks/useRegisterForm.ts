import { useCallback } from 'react';
import { registerSchema } from '@/schemas/auth/register';
import { fetchCNPJData, fetchCEPData } from '@/app/utils/fetchers';
import { Field } from '@/app/auth/components/AuthForm';
import { useBaseForm } from './useBaseForm';
import { FormValues } from '@/types/form';

interface UseRegisterFormProps {
  initialValues?: FormValues;
  fields: Field[];
}

export function useRegisterForm({ initialValues, fields }: UseRegisterFormProps) {
  const {
    formValues,
    setFormValues,
    handleFormChange: baseHandleFormChange,
    validateForm,
  } = useBaseForm({
    initialValues,
    fields,
    validationSchema: registerSchema,
  });

  const handleFormChange = useCallback(
    (name: string, value: string | boolean | File | null) => {
      baseHandleFormChange(name, value);

      if (name === 'companyDocument') {
        const cnpjNumbers = String(value).replace(/\D/g, '');
        if (cnpjNumbers.length === 14) {
          fetchCNPJData(
            cnpjNumbers,
            Object.fromEntries(
              Object.entries(initialValues || {}).map(([key, value]) => [key, String(value)])
            ),
            setFormValues
          );
        }
      }

      if (name === 'addressZipCode') {
        const cepNumbers = String(value).replace(/\D/g, '');
        if (cepNumbers.length === 8) {
          fetchCEPData(cepNumbers, setFormValues);
        }
      }
    },
    [initialValues, baseHandleFormChange, setFormValues]
  );

  return {
    formValues,
    setFormValues,
    handleFormChange,
    validateForm,
  };
}

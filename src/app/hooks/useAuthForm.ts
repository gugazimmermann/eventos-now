import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { Field } from '@/app/auth/components/AuthForm';
import { useBaseForm } from './useBaseForm';
import { FormValues } from '@/types/form';
import { z } from 'zod';

interface UseAuthFormProps<T extends Record<string, string>> {
  initialValues?: FormValues;
  fields: Field[];
  validationSchema: z.ZodType<T>;
  apiEndpoint: string;
  successMessage: string;
  successRedirect: (form: T) => string;
  errorMessage: string;
}

export function useAuthForm<T extends Record<string, string>>({
  initialValues,
  fields,
  validationSchema,
  apiEndpoint,
  successMessage,
  successRedirect,
  errorMessage,
}: UseAuthFormProps<T>) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    formValues,
    setFormValues,
    handleFormChange: baseHandleFormChange,
    validateForm,
  } = useBaseForm({
    initialValues,
    fields,
    validationSchema,
  });

  const handleSubmit = useCallback(
    async (form: Record<string, string>) => {
      if (!validateForm(form)) return;

      setLoading(true);
      try {
        const res = await fetch(apiEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        const data = await res.json();

        if (data.success) {
          toast.success(successMessage);
          router.push(successRedirect(form as T));
        } else {
          toast.error(errorMessage + (data.error || 'Erro desconhecido'));
        }
      } catch {
        toast.error('Erro de rede. Tente novamente.');
      } finally {
        setLoading(false);
      }
    },
    [router, validateForm, apiEndpoint, successMessage, successRedirect, errorMessage]
  );

  return {
    formValues,
    setFormValues,
    handleFormChange: baseHandleFormChange,
    handleSubmit,
    loading,
  };
}

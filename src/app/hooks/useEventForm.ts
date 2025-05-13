import { useCallback, useState } from 'react';
import { toast } from 'react-toastify';
import slugify from 'react-slugify';
import { eventsSchema } from '@/schemas/dashboard/events';
import { fetchCEPData } from '@/app/utils/fetchers';
import { FieldConfig } from '@/app/dashboard/components/Form';
import { useBaseForm } from './useBaseForm';
import { FormValues } from '@/types/form';

interface UseEventFormProps {
  initialValues?: FormValues;
  fields: FieldConfig[];
  onSubmit: (formData: FormData, onProgress?: (progress: number) => void) => Promise<void>;
  mode: 'create' | 'edit';
  currentSlug?: string;
}

export function useEventForm({
  initialValues,
  fields,
  onSubmit,
  mode,
  currentSlug,
}: UseEventFormProps) {
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);
  const {
    formValues,
    setFormValues,
    handleFormChange: baseHandleFormChange,
    validateForm,
  } = useBaseForm({
    initialValues,
    fields,
    validationSchema: eventsSchema,
  });

  const verifySlug = useCallback(
    async (slug: string) => {
      if (mode === 'edit' && currentSlug === slug) return;

      try {
        const response = await fetch('/api/dashboard/verify-slug', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-cognito-id': 'your-cognito-id',
          },
          body: JSON.stringify({ slug }),
        });

        const data = await response.json();

        if (data.exists) {
          toast.error('Esta URL já está sendo usada por outro evento. Escolha outra URL.');
        }
      } catch {
        toast.error('Erro ao verificar URL do evento. Tente novamente.');
      }
    },
    [mode, currentSlug]
  );

  const handleFormChange = useCallback(
    async (name: string, value: string | boolean | File | null) => {
      baseHandleFormChange(name, value);

      if (name === 'addressZipCode') {
        const cepNumbers = String(value).replace(/\D/g, '');
        if (cepNumbers.length === 8) {
          fetchCEPData(cepNumbers, setFormValues);
        }
      }

      if (name === 'name') {
        const newSlug = slugify(String(value));
        setFormValues(prev => ({ ...prev, slug: newSlug }));

        if (debounceTimer) {
          clearTimeout(debounceTimer);
        }

        const timer = setTimeout(() => {
          verifySlug(newSlug);
        }, 1000);

        setDebounceTimer(timer);
      }

      if (name === 'slug') {
        if (debounceTimer) {
          clearTimeout(debounceTimer);
        }

        const timer = setTimeout(() => {
          verifySlug(String(value));
        }, 1000);

        setDebounceTimer(timer);
      }
    },
    [debounceTimer, verifySlug, baseHandleFormChange, setFormValues]
  );

  const handleSubmit = useCallback(
    async (form: FormValues, onProgress?: (progress: number) => void) => {
      if (!validateForm(form)) {
        onProgress?.(0);
        return;
      }

      if (mode === 'edit' && currentSlug !== form.slug) {
        try {
          const response = await fetch('/api/dashboard/verify-slug', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-cognito-id': 'your-cognito-id',
            },
            body: JSON.stringify({ slug: form.slug }),
          });

          const data = await response.json();

          if (data.exists) {
            toast.error(
              'Esta URL já está sendo usada por outro evento. Por favor, escolha outra URL antes de enviar o formulário.'
            );
            onProgress?.(0);
            return;
          }
        } catch {
          toast.error('Erro ao verificar URL do evento. Tente novamente.');
          onProgress?.(0);
          return;
        }
      }

      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (value instanceof File) {
          formData.append(key, value);
        } else if (value !== null) {
          if (key === 'hasGift' || key === 'hasPrize') {
            formData.append(key, String(Boolean(value)));
          } else {
            formData.append(key, String(value));
          }
        }
      });

      try {
        await onSubmit(formData, onProgress);
      } catch {
        toast.error(`Erro ao ${mode === 'create' ? 'cadastrar' : 'atualizar'} evento`);
        onProgress?.(0);
      }
    },
    [mode, onSubmit, validateForm]
  );

  return {
    formValues,
    setFormValues,
    handleFormChange,
    handleSubmit,
  };
}

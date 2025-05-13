import { FormValues, UseBaseFormProps } from '@/types/form';
import { useState, useCallback } from 'react';
import { toast } from 'react-toastify';

export function useBaseForm<T extends FormValues>({
  initialValues,
  fields,
  validationSchema,
}: UseBaseFormProps<T>) {
  const [formValues, setFormValues] = useState<FormValues>(
    initialValues ||
      Object.fromEntries(fields.map(field => [field.name, field.type === 'checkbox' ? false : '']))
  );

  const handleFormChange = useCallback((name: string, value: string | boolean | File | null) => {
    setFormValues(prev => ({ ...prev, [name]: value }));
  }, []);

  const validateForm = useCallback(
    (form: FormValues) => {
      if (!validationSchema) return true;

      const result = validationSchema.safeParse(form);
      if (!result.success) {
        result.error.errors.forEach(err => {
          toast.error(err.message);
        });
        return false;
      }
      return true;
    },
    [validationSchema]
  );

  return {
    formValues,
    setFormValues,
    handleFormChange,
    validateForm,
  };
}

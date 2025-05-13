'use client';

import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import AuthForm from '@/app/auth/components/AuthForm';
import { confirmSchema } from '@/schemas/auth/confirm';
import { fields as baseFields } from './fields';
import { useAuthForm } from '@/app/hooks/useAuthForm';
import { formValuesToString } from '@/app/utils/formatters';

export default function ConfirmPage() {
  const searchParams = useSearchParams();
  const emailFromQuery = searchParams.get('email');

  const computedFields = useMemo(() => {
    return baseFields.map(field =>
      field.name === 'email' && emailFromQuery ? { ...field, disabled: true } : field
    );
  }, [emailFromQuery]);

  const { formValues, handleFormChange, handleSubmit, loading } = useAuthForm({
    fields: computedFields,
    validationSchema: confirmSchema,
    apiEndpoint: '/api/auth/confirm',
    successMessage: 'Registro confirmado com sucesso!',
    successRedirect: form => `/auth/login?email=${encodeURIComponent(form.email)}`,
    errorMessage: 'Erro ao confirmar o registro: ',
    initialValues: computedFields.reduce(
      (acc, field) => ({
        ...acc,
        [field.name]: field.name === 'email' ? emailFromQuery || '' : '',
      }),
      {}
    ),
  });

  return (
    <AuthForm
      title="Confirmar registro"
      submitLabel={loading ? 'Confirmando...' : 'Confirmar'}
      fields={computedFields}
      onSubmit={handleSubmit}
      values={formValuesToString(formValues)}
      onChange={handleFormChange}
      loading={loading}
    />
  );
}

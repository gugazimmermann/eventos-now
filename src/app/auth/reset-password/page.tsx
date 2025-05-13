'use client';

import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import AuthForm from '@/app/auth/components/AuthForm';
import { resetPasswordSchema } from '@/schemas/auth/reset-password';
import { fields as baseFields } from './fields';
import { useAuthForm } from '@/app/hooks/useAuthForm';
import { formValuesToString } from '@/app/utils/formatters';

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const emailFromQuery = searchParams.get('email');

  const computedFields = useMemo(() => {
    return baseFields.map(field =>
      field.name === 'email' && emailFromQuery ? { ...field, disabled: true } : field
    );
  }, [emailFromQuery]);

  const { formValues, handleFormChange, handleSubmit, loading } = useAuthForm({
    fields: computedFields,
    validationSchema: resetPasswordSchema,
    apiEndpoint: '/api/auth/reset-password',
    successMessage: 'Senha alterada com sucesso!',
    successRedirect: form => `/auth/login?email=${encodeURIComponent(form.email)}`,
    errorMessage: 'Erro: ',
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
      title="Alterar Senha"
      submitLabel={loading ? 'Aguarde...' : 'Alterar'}
      fields={computedFields}
      onSubmit={handleSubmit}
      values={formValuesToString(formValues)}
      onChange={handleFormChange}
      loading={loading}
      links={[{ text: 'Voltar', href: '/auth/login' }]}
    />
  );
}

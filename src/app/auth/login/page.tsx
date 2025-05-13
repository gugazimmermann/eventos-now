'use client';

import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuthForm } from '@/app/hooks/useAuthForm';
import AuthForm from '@/app/auth/components/AuthForm';
import { formValuesToString } from '@/app/utils/formatters';
import { loginSchema } from '@/schemas/auth/login';
import { fields as baseFields } from './fields';

export default function LoginPage() {
  const searchParams = useSearchParams();
  const emailFromQuery = searchParams.get('email');

  const computedFields = useMemo(() => {
    return baseFields.map(field =>
      field.name === 'email' && emailFromQuery ? { ...field, disabled: true } : field
    );
  }, [emailFromQuery]);

  const { formValues, handleFormChange, handleSubmit, loading } = useAuthForm({
    fields: computedFields,
    validationSchema: loginSchema,
    apiEndpoint: '/api/auth/login',
    successMessage: 'Login realizado com sucesso!',
    successRedirect: () => '/dashboard',
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
      title="Entrar"
      submitLabel={loading ? 'Aguarde...' : 'Entrar'}
      fields={computedFields}
      onSubmit={handleSubmit}
      values={formValuesToString(formValues)}
      onChange={handleFormChange}
      loading={loading}
      links={[
        { text: 'Esqueceu sua senha?', href: '/auth/forgot-password' },
        { text: 'Não tem cadastro? Clique aqui!', href: '/auth/register' },
      ]}
    />
  );
}

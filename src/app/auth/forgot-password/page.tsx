'use client';

import AuthForm from '@/app/auth/components/AuthForm';
import { forgotPasswordSchema } from '@/schemas/auth/forgot-password';
import { fields } from './fields';
import { useAuthForm } from '@/app/hooks/useAuthForm';
import { formValuesToString } from '@/app/utils/formatters';

export default function ForgotPasswordPage() {
  const { formValues, handleFormChange, handleSubmit, loading } = useAuthForm({
    fields,
    validationSchema: forgotPasswordSchema,
    apiEndpoint: '/api/auth/forgot-password',
    successMessage: 'Email de redefinição de senha enviado com sucesso!',
    successRedirect: form => `/auth/reset-password?email=${encodeURIComponent(form.email)}`,
    errorMessage: 'Erro: ',
  });

  return (
    <AuthForm
      title="Esqueceu sua senha?"
      submitLabel={loading ? 'Aguarde...' : 'Enviar'}
      fields={fields}
      onSubmit={handleSubmit}
      values={formValuesToString(formValues)}
      onChange={handleFormChange}
      loading={loading}
      links={[{ text: 'Voltar', href: '/auth/login' }]}
    />
  );
}

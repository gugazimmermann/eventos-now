'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import AuthForm from '@/app/auth/components/AuthForm';
import { fields } from './fields';
import { maskers } from './maskers';
import { useRegisterForm } from '@/app/hooks/useRegisterForm';
import { formValuesToString } from '@/app/utils/formatters';

export default function RegisterPage() {
  const router = useRouter();
  const { formValues, handleFormChange, validateForm } = useRegisterForm({
    fields,
  });

  const handleSubmit = useCallback(
    async (form: Record<string, string>) => {
      if (!validateForm(form)) return;

      try {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        const data = await res.json();

        if (data.success) {
          toast.success('Registro realizado com sucesso!');
          router.push(`/auth/confirm?email=${encodeURIComponent(form.email)}`);
        } else {
          toast.error('Erro ao registrar: ' + (data.error || 'Erro desconhecido'));
        }
      } catch {
        toast.error('Erro ao registrar. Tente novamente.');
      }
    },
    [router, validateForm]
  );

  return (
    <AuthForm
      title="Registro"
      submitLabel="Registrar"
      columns={2}
      maxWidth="max-w-4xl"
      fields={fields}
      onSubmit={handleSubmit}
      maskers={maskers}
      values={formValuesToString(formValues)}
      onChange={handleFormChange}
      links={[{ text: 'Já tem uma conta? Entrar', href: '/auth/login' }]}
    />
  );
}

'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import DashboardLayout from '@/app/dashboard/layout/DashboardLayout';
import Form from '@/app/dashboard/components/Form';
import { fields } from './fields';
import { maskers } from './maskers';
import { useEventForm } from '@/app/hooks/useEventForm';

export default function EventsPage() {
  const router = useRouter();

  const handleSubmit = useCallback(
    async (formData: FormData, onProgress?: (progress: number) => void) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', '/api/dashboard/event');
      xhr.setRequestHeader('x-cognito-id', 'your-cognito-id');

      xhr.upload.onprogress = event => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded * 100) / event.total);
          onProgress?.(progress);
        }
      };

      xhr.onload = function () {
        if (xhr.status === 200) {
          const data = JSON.parse(xhr.responseText);
          if (!data.success) {
            toast.error(data.error || 'Erro ao cadastrar evento');
            onProgress?.(0);
            return;
          }
          toast.success('Evento cadastrado com sucesso!');
          onProgress?.(100);
          router.push(`/dashboard/event/${encodeURIComponent(data.event.slug)}`);
        } else {
          toast.error('Erro ao cadastrar evento');
          onProgress?.(0);
        }
      };

      xhr.onerror = function () {
        toast.error('Erro ao cadastrar evento');
        onProgress?.(0);
      };

      xhr.send(formData);
    },
    [router]
  );

  const {
    formValues,
    handleFormChange,
    handleSubmit: handleFormSubmit,
  } = useEventForm({
    fields,
    onSubmit: handleSubmit,
    mode: 'create',
  });

  return (
    <DashboardLayout>
      <Form
        title="Cadastrar Evento"
        submitLabel="Cadastrar Evento"
        columns={2}
        maxWidth="max-w-4xl"
        values={formValues}
        fields={fields}
        maskers={maskers}
        onChange={handleFormChange}
        onSubmit={handleFormSubmit}
      />
    </DashboardLayout>
  );
}

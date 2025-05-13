'use client';

import { useEffect, useState, useCallback } from 'react';
import DashboardLayout from '@/app/dashboard/layout/DashboardLayout';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import ErrorComponent from '@/app/dashboard/components/Error';
import Loading from '../../components/Loading';
import EventStatusLabel from '../../components/EventStatusLabel';
import Drawer from '../../components/Drawer';
import Form from '@/app/dashboard/components/Form';
import { fields } from '../fields';
import { maskers } from '../maskers';
import { toast } from 'react-toastify';
import EventDateTime from '../../components/EventDateTime';
import EventAddress from '../../components/EventAddress';
import EventConfig from '../../components/EventConfig';
import { useEventForm } from '@/app/hooks/useEventForm';
import { AppError } from '@/lib/errors';
import { Event } from '@/types/event';

export default function EventPage() {
  const params = useParams();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleSubmit = useCallback(
    async (formData: FormData, onProgress?: (progress: number) => void) => {
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', `/api/dashboard/event/${event?.id}`);
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
            toast.error(data.error || 'Erro ao atualizar evento');
            onProgress?.(0);
            return;
          }
          toast.success('Evento atualizado com sucesso!');
          onProgress?.(100);
          setIsDrawerOpen(false);
          window.location.reload();
        } else {
          toast.error('Erro ao atualizar evento');
          onProgress?.(0);
        }
      };

      xhr.onerror = function () {
        toast.error('Erro ao atualizar evento');
        onProgress?.(0);
      };

      xhr.send(formData);
    },
    [event?.id]
  );

  const {
    formValues,
    setFormValues,
    handleFormChange,
    handleSubmit: handleFormSubmit,
  } = useEventForm({
    fields,
    onSubmit: handleSubmit,
    mode: 'edit',
    currentSlug: event?.slug as string,
  });

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await fetch(`/api/dashboard/event/${params.slug}`);
        const data = await response.json();
        if (!data.success) {
          throw new AppError(data.error || 'Erro ao carregar evento');
        }
        setEvent(data.event);
      } catch (err) {
        setError(err instanceof AppError ? err.message : 'Erro ao carregar evento');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [params.slug]);

  useEffect(() => {
    if (event) {
      const values: Record<string, string | boolean | File | null> = {
        name: event.name,
        description: event.description,
        slug: params.slug as string,
        addressZipCode: event.Address.zipCode,
        addressStreet: event.Address.street,
        addressNumber: event.Address.number || '',
        addressComplement: event.Address.complement || '',
        addressNeighborhood: event.Address.neighborhood,
        addressCity: event.Address.city,
        addressState: event.Address.state,
        addressCountry: event.Address.country,
        startDate: new Date(event.startDate).toISOString().slice(0, 16),
        endDate: new Date(event.endDate).toISOString().slice(0, 16),
        confirmationType: event.EventConfig[0]?.confirmationType || '',
        hasGift: event.EventConfig[0]?.hasGift || false,
        giftDescription: event.EventConfig[0]?.giftDescription || '',
        hasPrize: event.EventConfig[0]?.hasPrize || false,
        prizeDescription: event.EventConfig[0]?.prizeDescription || '',
      };
      setFormValues(values);
    }
  }, [event, params.slug, setFormValues]);

  if (loading)
    return (
      <DashboardLayout>
        <Loading size="xl" color="#2ad352" />
      </DashboardLayout>
    );
  if (error)
    return (
      <DashboardLayout>
        <ErrorComponent
          type="error"
          message={error || 'Erro ao carregar evento'}
          onClose={() => setError(null)}
        />
      </DashboardLayout>
    );

  if (!event) {
    return (
      <DashboardLayout>
        <ErrorComponent type="error" message="Evento não encontrado" />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col w-full max-w-[2000px] p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="w-full md:w-1/2 bg-white rounded-lg shadow-lg p-4 relative overflow-hidden">
            <div className="flex justify-between items-start mb-4">
              <EventStatusLabel
                startDate={new Date(event.startDate)}
                endDate={new Date(event.endDate)}
              />
            </div>

            <div className="flex flex-col gap-4">
              <div className="w-full">
                <Image
                  src={event.imageUrl}
                  alt={event.name}
                  width={800}
                  height={400}
                  className="w-full h-64 object-contain rounded-lg"
                />
              </div>
              <div className="w-full">
                <h1 className="text-3xl font-bold mb-4 text-center">{event.name}</h1>
                <p className="text-gray-600 text-xl mb-4 text-center">{event.description}</p>

                <EventDateTime startDate={event.startDate} endDate={event.endDate} />

                <EventAddress address={event.Address} />

                {event.EventConfig[0] && <EventConfig config={event.EventConfig[0]} />}

                <div className="mt-6 flex justify-center">
                  <Drawer
                    title="Editar Evento"
                    isOpen={isDrawerOpen}
                    onClose={() => setIsDrawerOpen(false)}
                    position="right"
                    size="lg"
                    trigger={
                      <button
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                        onClick={() => setIsDrawerOpen(true)}
                      >
                        Editar Evento
                      </button>
                    }
                  >
                    <Form
                      fields={fields}
                      mode="drawer"
                      onSubmit={handleFormSubmit}
                      maskers={maskers}
                      submitLabel="Salvar Alterações"
                      columns={2}
                      maxWidth="max-w-4xl"
                      values={formValues}
                      onChange={handleFormChange}
                      currentImageUrl={event?.imageUrl}
                    />
                  </Drawer>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full md:w-1/2 bg-white rounded-lg shadow-lg p-6">
            {/* Empty card content will go here */}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

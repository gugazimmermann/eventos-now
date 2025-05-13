'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Event } from '@/generated/prisma';
import DashboardLayout from '@/app/dashboard/layout/DashboardLayout';
import EventsCard from '@/app/dashboard/components/EventsCard';

export default function Dashboard() {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch('/api/dashboard/events');
        const data = await response.json();

        if (data.success) {
          setEvents(data.events);
          if (data.events.length === 0) {
            router.push('/dashboard/event');
          }
        } else {
          setError('Erro ao carregar eventos');
        }
      } catch {
        setError('Erro ao carregar eventos');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [router]);

  return (
    <DashboardLayout>
      <div className="flex flex-col w-full max-w-[2000px] p-4">
        {loading && (
          <div className="text-center">
            <p>Carregando eventos...</p>
          </div>
        )}

        {error && (
          <div className="text-center text-red-500">
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {events.map(event => (
              <EventsCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

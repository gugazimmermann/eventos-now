import { Event } from '@/generated/prisma';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import EventStatusLabel from './EventStatusLabel';
import { formatDate } from '@/app/utils/converters';

interface EventsCardProps {
  event: Event;
}

export default function EventsCard({ event }: EventsCardProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/dashboard/event/${event.slug}`);
  };

  return (
    <div
      key={event.id}
      className="relative bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
      onClick={handleClick}
    >
      <EventStatusLabel startDate={event.startDate} endDate={event.endDate} />
      {event.imageUrl && (
        <div className="relative h-48 w-full mt-2">
          <Image
            src={event.imageUrl}
            alt={event.name}
            fill
            priority
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-contain"
          />
        </div>
      )}
      <div className="p-4">
        <h2 className="text-xl font-semibold">{event.name}</h2>
        <p className="text-gray-600 mb-2 line-clamp-2">{event.description}</p>
        <div className="text-sm text-gray-500 text-center">
          <p>
            {formatDate({
              date: event.startDate,
              day: true,
            })}
            {' - '}
            {formatDate({
              date: event.endDate,
              day: true,
            })}
          </p>
        </div>
      </div>
    </div>
  );
}

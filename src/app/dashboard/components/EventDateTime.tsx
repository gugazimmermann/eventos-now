import { formatDate } from '@/app/utils/converters';

interface EventDateTimeProps {
  startDate: Date;
  endDate: Date;
}

export default function EventDateTime({ startDate, endDate }: EventDateTimeProps) {
  return (
    <div className="mb-4">
      <h2 className="text-xl font-semibold mb-2">Data e Hora</h2>
      <p>
        {formatDate({
          date: startDate,
          day: true,
          time: true,
        })}{' '}
        até{' '}
        {formatDate({
          date: endDate,
          day: true,
          time: true,
        })}
      </p>
    </div>
  );
}

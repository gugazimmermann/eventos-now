import { differenceInDays, isAfter, parseISO } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';

interface EventStatusLabelProps {
  startDate: Date;
  endDate: Date;
}

const getEventStatus = (startDate: Date, endDate: Date) => {
  const now = new Date();
  const start = parseISO(formatInTimeZone(startDate, 'UTC', "yyyy-MM-dd'T'HH:mm:ss'Z'"));
  const end = parseISO(formatInTimeZone(endDate, 'UTC', "yyyy-MM-dd'T'HH:mm:ss'Z'"));
  const daysUntilStart = differenceInDays(start, now);

  if (isAfter(now, end)) {
    return { text: 'Finalizado', color: 'bg-gray-500' };
  } else if (isAfter(now, start)) {
    return { text: 'Em andamento', color: 'bg-green-500' };
  } else if (daysUntilStart <= 7) {
    return { text: 'Em breve', color: 'bg-blue-500' };
  } else {
    return { text: 'Aguardando', color: 'bg-yellow-500' };
  }
};

export default function EventStatusLabel({ startDate, endDate }: EventStatusLabelProps) {
  const status = getEventStatus(startDate, endDate);

  return (
    <div
      className={`z-10 absolute top-0 right-0 rounded-lg ${status.color} px-4 py-1 mt-2 mr-2 shadow-md`}
    >
      <div className="text-center text-sm font-semibold whitespace-nowrap text-white">
        {status.text}
      </div>
    </div>
  );
}

import { parseISO } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';

export function toTitleCase(str: string) {
  return str.toLowerCase().replace(/(?:^|\s|["'([{])+\S/g, match => match.toUpperCase());
}

export function formatDate({
  date,
  day = false,
  time = false,
}: {
  date: Date;
  day?: boolean;
  time?: boolean;
}): string {
  const parsedDate = parseISO(date.toString());

  if (day && !time) {
    return formatInTimeZone(parsedDate, 'UTC', 'dd/MM/yyyy');
  }

  if (day && time) {
    return formatInTimeZone(parsedDate, 'UTC', 'dd/MM/yyyy, HH:mm') + 'hs';
  }

  if (time) {
    return formatInTimeZone(parsedDate, 'UTC', 'HH:mm');
  }

  return date.toString();
}
